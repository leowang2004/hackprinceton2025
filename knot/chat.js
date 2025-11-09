// chat.js
// Financial Wellness Chatbot - Combines Knot TransactionLink, Nessie API, and Snowflake Cortex
// Provides natural language interface for financial data analysis and insights

import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import snowflake from "snowflake-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- CONFIG ----------
const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"; // adjust as needed

// Nessie API (Capital One) configuration
const NESSIE_API_KEY = process.env.NESSIE_API_KEY || "cae10384de09c187245926bab130cd0c";
const NESSIE_ACCOUNT_ID = process.env.NESSIE_ACCOUNT_ID || "690f8d1708f7513c4ad89fda";
const NESSIE_BASE_URL = "http://api.nessieisreal.com";

// Snowflake configuration
const SNOWFLAKE_ACCOUNT = process.env.SNOWFLAKE_ACCOUNT;
const SNOWFLAKE_USER = process.env.SNOWFLAKE_USER;
const SNOWFLAKE_PASSWORD = process.env.SNOWFLAKE_PASSWORD;
const SNOWFLAKE_WAREHOUSE = process.env.SNOWFLAKE_WAREHOUSE;
const SNOWFLAKE_DATABASE = process.env.SNOWFLAKE_DATABASE;
const SNOWFLAKE_SCHEMA = process.env.SNOWFLAKE_SCHEMA || "PUBLIC";
const USE_SNOWFLAKE = process.env.USE_SNOWFLAKE === "true" || !!SNOWFLAKE_ACCOUNT;

// Log environment configuration (without exposing sensitive keys)
console.log(`[CONFIG] Port: ${PORT}`);
console.log(`[CONFIG] Model: ${MODEL}`);
console.log(`[CONFIG] Nessie API: Account ${NESSIE_ACCOUNT_ID.substring(0, 8)}... (${NESSIE_API_KEY ? 'configured' : 'not configured'})`);
console.log(`[CONFIG] Snowflake: ${USE_SNOWFLAKE ? 'enabled' : 'disabled (using dummy_data.json)'}`);
if (process.env.OPENAI_API_KEY) {
  const apiKey = process.env.OPENAI_API_KEY.trim(); // Remove any whitespace
  const keyLength = apiKey.length;
  const keyPrefix = apiKey.substring(0, 7);
  
  // Validate API key format
  if (!apiKey.startsWith('sk-')) {
    console.error(`[ERROR] Invalid API key format. Key should start with 'sk-' but starts with '${keyPrefix}'`);
    console.error(`[ERROR] Key length: ${keyLength} characters`);
    console.error(`[ERROR] First 20 chars: ${apiKey.substring(0, 20)}...`);
  } else {
    console.log(`[CONFIG] OpenAI API Key: ${keyPrefix}... (loaded, ${keyLength} chars)`);
  }
  
  // Update the environment variable with trimmed version
  process.env.OPENAI_API_KEY = apiKey;
} else {
  console.warn(
    "[WARN] OPENAI_API_KEY is not set. Set it in .env to enable LLM-based query parsing."
  );
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------- SNOWFLAKE CONNECTION ----------

function createSnowflakeConnection() {
  return new Promise((resolve, reject) => {
    const connection = snowflake.createConnection({
      account: SNOWFLAKE_ACCOUNT,
      username: SNOWFLAKE_USER,
      password: SNOWFLAKE_PASSWORD,
      warehouse: SNOWFLAKE_WAREHOUSE,
      database: SNOWFLAKE_DATABASE,
      schema: SNOWFLAKE_SCHEMA,
    });

    connection.connect((err, conn) => {
      if (err) {
        reject(err);
      } else {
        resolve(conn);
      }
    });
  });
}

function executeQuery(connection, query) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: query,
      complete: (err, stmt, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      },
    });
  });
}

// ---------- SNOWFLAKE CORTEX NLP QUERIES ----------

/**
 * Use Snowflake Cortex to generate SQL from natural language
 * Note: This uses a prompt-based approach to generate SQL
 */
async function generateSQLFromNaturalLanguage(naturalLanguageQuery) {
  if (!USE_SNOWFLAKE) return null;

  try {
    const connection = await createSnowflakeConnection();
    
    // Create a prompt for Cortex to generate SQL
    // We'll use Cortex's text completion capabilities
    const schemaContext = `
      Tables available:
      - transactions: transaction_id, external_id, merchant_id, merchant_name, datetime, url, order_status, 
        payment_method_external_id, payment_method_type, payment_method_brand, payment_method_last_four,
        payment_method_transaction_amount, price_sub_total, price_total, price_currency,
        total_discount, total_fee, total_tax, total_tip, adjustments_json
      - products: transaction_id, merchant_id, merchant_name, product_external_id, product_name, product_url,
        quantity, product_sub_total, product_total, product_unit_price, eligibility
      - NESSIE_BILL: _ID, ACCOUNT_ID, CREATION_DATE, NICKNAME, PAYEE, PAYMENT_AMOUNT, PAYMENT_DATE, RECURRING_DATE
      - NESSIE_DEPOSIT: _ID, AMOUNT, DESCRIPTION, MEDIUM, PAYEE_ID, TRANSACTION_DATE, TYPE
      - NESSIE_LOAN: _ID, ACCOUNT_ID, AMOUNT, CREATION_DATE, CREDIT_SCORE, DESCRIPTION, MONTHLY_PAYMENT, TYPE
      
      Relationships: 
      - products.transaction_id = transactions.transaction_id
      - NESSIE_BILL, NESSIE_DEPOSIT, and NESSIE_LOAN are independent tables (no direct foreign keys)
      
      Important: 
      - merchant_name values are case-sensitive. Use exact case: 'Amazon', 'Costco', 'Doordash', 'Instacart', 'Target', 'Ubereats', 'Walmart'
      - When filtering by merchant_name, use UPPER() or LOWER() functions for case-insensitive matching, or use the exact case as shown above.
      - For Nessie tables, use the exact table names: NESSIE_BILL, NESSIE_DEPOSIT, NESSIE_LOAN (all uppercase)
    `;
    
    const prompt = `
      You are a SQL expert. Given the following database schema and a natural language question, 
      generate a valid Snowflake SQL query.
      
      ${schemaContext}
      
      User question: "${naturalLanguageQuery}"
      
      Generate ONLY the SQL query, no explanations. Use proper Snowflake SQL syntax.
      Return results in a readable format.
    `;
    
    console.log("\n" + "=".repeat(80));
    console.log("[CORTEX DEBUG] Natural Language Query:");
    console.log("=".repeat(80));
    console.log(naturalLanguageQuery);
    console.log("\n[CORTEX DEBUG] Prompt being sent to Cortex:");
    console.log("-".repeat(80));
    console.log(prompt);
    console.log("-".repeat(80));
    
    // Use Snowflake Cortex to generate SQL
    // Note: This is a simplified approach - in production, you might use Cortex's 
    // text-to-SQL capabilities or a more sophisticated prompt
    const cortexQuery = `
      SELECT SNOWFLAKE.CORTEX.COMPLETE(
        'mistral-large',
        '${prompt.replace(/'/g, "''")}'
      ) as generated_sql
    `;
    
    console.log("\n[CORTEX DEBUG] SQL Query sent to Snowflake:");
    console.log("-".repeat(80));
    console.log(cortexQuery);
    console.log("-".repeat(80));
    
    try {
      const result = await executeQuery(connection, cortexQuery);
      
      console.log("\n[CORTEX DEBUG] Raw response from Snowflake:");
      console.log("-".repeat(80));
      console.log(JSON.stringify(result, null, 2));
      console.log("-".repeat(80));
      
      const generatedSQL = result[0]?.GENERATED_SQL;
      
      console.log("\n[CORTEX DEBUG] Extracted generated_sql field:");
      console.log("-".repeat(80));
      console.log(generatedSQL);
      console.log("-".repeat(80));
      
      if (generatedSQL) {
        // Extract SQL from the response (might be wrapped in markdown or text)
        let finalSQL = null;
        
        // Clean up the SQL string first
        const cleanedSQL = generatedSQL.trim();
        
        // Try to extract SQL from markdown code blocks
        const markdownMatch = cleanedSQL.match(/```sql\s*([\s\S]*?)\s*```/i);
        if (markdownMatch && markdownMatch[1]) {
          finalSQL = markdownMatch[1].trim();
        } else {
          // Try to extract SQL directly (look for SELECT...FROM pattern, including multi-line)
          // Match SELECT through the end of the statement (semicolon or end of string)
          const selectMatch = cleanedSQL.match(/(SELECT[\s\S]*?FROM[\s\S]*?)(?:;|\n\n|$)/i);
          if (selectMatch && selectMatch[1]) {
            finalSQL = selectMatch[1].trim();
          } else {
            // Try without semicolon requirement
            const selectMatch2 = cleanedSQL.match(/(SELECT[\s\S]+?FROM[\s\S]+)/i);
            if (selectMatch2 && selectMatch2[1]) {
              finalSQL = selectMatch2[1].trim();
            } else {
              // Use the whole string if it looks like SQL
              if (cleanedSQL.toUpperCase().includes('SELECT') && cleanedSQL.toUpperCase().includes('FROM')) {
                finalSQL = cleanedSQL;
              }
            }
          }
        }
        
        if (finalSQL) {
          // Clean up the SQL - normalize whitespace but preserve SQL structure
          // First, normalize all whitespace (newlines, tabs, multiple spaces) to single spaces
          finalSQL = finalSQL.replace(/\s+/g, ' ').trim();
          
          // Add spaces before SQL keywords if they're missing (fixes cases like "price_total)FROM" -> "price_total) FROM")
          // We need to be careful not to match keywords inside identifiers (e.g., "transaction_id" should not become "transacti on_id")
          // Match keywords only when they're actual SQL keywords, not part of identifiers
          
          // Handle multi-word keywords first (GROUP BY, ORDER BY)
          // Match only when preceded by non-word characters (not letters/underscores) or at start
          finalSQL = finalSQL.replace(/([^\w\s]|^)(GROUP\s+BY)(?=\s|$|[^\w])/gi, '$1 $2');
          finalSQL = finalSQL.replace(/([^\w\s]|^)(ORDER\s+BY)(?=\s|$|[^\w])/gi, '$1 $2');
          
          // Then handle single-word keywords - be very careful with short keywords like "ON", "AS", "OR"
          // Only match if preceded by non-word characters (not letters/underscores/digits) or at start
          // and followed by whitespace or non-word characters
          const sqlKeywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'HAVING', 'AND', 
                               'INNER', 'LEFT', 'RIGHT', 'OUTER', 'INTO', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
                               'UNION', 'INTERSECT', 'EXCEPT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'];
          
          for (const keyword of sqlKeywords) {
            // Match keyword only when it's a standalone word, not part of an identifier
            // Preceded by: start of string, whitespace, or non-word char (but not underscore/letter/digit)
            // Followed by: whitespace, end of string, or non-word char
            const regex = new RegExp(`([^\\w]|^)(${keyword})(?=\\s|$|[^\\w])`, 'gi');
            finalSQL = finalSQL.replace(regex, `$1 $2`);
          }
          
          // Handle short keywords that might appear in identifiers more carefully
          // "ON" - only match when it's the JOIN ON clause (after JOIN)
          finalSQL = finalSQL.replace(/(JOIN)\s*(ON)(?=\s)/gi, '$1 $2');
          // "AS" - only match when it's an alias (after column/table name, before alias)
          finalSQL = finalSQL.replace(/([^\w]|^)(AS)(?=\s+\w)/gi, '$1 $2');
          // "OR" - only match when it's a logical operator (between conditions)
          finalSQL = finalSQL.replace(/([^\w]|^)(OR)(?=\s+[^\w])/gi, '$1 $2');
          
          // Clean up: normalize spaces again, handle punctuation
          finalSQL = finalSQL
            .replace(/\s+/g, ' ')  // Multiple spaces to single space
            .replace(/\s*([,;])\s*/g, '$1 ')  // Space after commas and semicolons
            .replace(/\(\s+/g, '(')  // Remove space after opening paren
            .replace(/\s+\)/g, ')')  // Remove space before closing paren
            .replace(/;+\s*$/, '')  // Remove trailing semicolons
            .trim();
          
          // Fix merchant_name comparisons to be case-insensitive
          // Replace patterns like: merchant_name = 'costco' or merchant_name = 'Costco'
          // With: UPPER(merchant_name) = UPPER('Costco')
          // This handles any case variation (costco, Costco, COSTCO) and converts to case-insensitive matching
          const merchantNames = ['Amazon', 'Costco', 'Doordash', 'Instacart', 'Target', 'Ubereats', 'Walmart'];
          for (const merchant of merchantNames) {
            // Match merchant_name = 'merchant' (any case) and convert to case-insensitive
            finalSQL = finalSQL.replace(
              new RegExp(`(merchant_name\\s*=\\s*)'${merchant}'`, 'gi'),
              `UPPER(merchant_name) = UPPER('${merchant}')`
            );
            finalSQL = finalSQL.replace(
              new RegExp(`(merchant_name\\s*=\\s*)"${merchant}"`, 'gi'),
              `UPPER(merchant_name) = UPPER('${merchant}')`
            );
            finalSQL = finalSQL.replace(
              new RegExp(`(merchant_name\\s*LIKE\\s*)'${merchant}'`, 'gi'),
              `UPPER(merchant_name) LIKE UPPER('${merchant}')`
            );
          }
          
          console.log("\n[CORTEX DEBUG] Final extracted SQL:");
          console.log("-".repeat(80));
          console.log(finalSQL);
          console.log("-".repeat(80));
          console.log("=".repeat(80) + "\n");
          
          return finalSQL;
        } else {
          console.log("\n[CORTEX DEBUG] Could not extract valid SQL from response");
          console.log("Raw response:", generatedSQL);
          console.log("=".repeat(80) + "\n");
        }
      } else {
        console.log("\n[CORTEX DEBUG] No generated_sql found in response");
        console.log("=".repeat(80) + "\n");
      }
    } catch (cortexError) {
      console.error("\n[CORTEX DEBUG] Cortex SQL generation failed:");
      console.error("-".repeat(80));
      console.error("Error:", cortexError.message);
      console.error("Stack:", cortexError.stack);
      console.error("-".repeat(80));
      console.log("=".repeat(80) + "\n");
      console.warn("[WARN] Cortex SQL generation failed, using fallback:", cortexError.message);
    }
    
    // Fallback: Use OpenAI to generate SQL if Cortex is not available
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log("\n[CORTEX DEBUG] Falling back to OpenAI for SQL generation");
        console.log("-".repeat(80));
        
        const completion = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: `You are a SQL expert. Generate valid Snowflake SQL queries based on natural language questions.
              
${schemaContext}

Rules:
- Always use proper Snowflake SQL syntax
- Use UPPERCASE for SQL keywords
- Return only the SQL query, no explanations
- Use proper table and column names as shown in the schema
- When filtering by merchant_name, use UPPER(merchant_name) = UPPER('merchantname') for case-insensitive matching, or use exact case: 'Amazon', 'Costco', 'Doordash', 'Instacart', 'Target', 'Ubereats', 'Walmart'
- For Nessie tables (NESSIE_BILL, NESSIE_DEPOSIT, NESSIE_LOAN), use the exact uppercase table names
- When querying bills, deposits, or loans, use the appropriate Nessie table`
            },
            {
              role: "user",
              content: naturalLanguageQuery
            }
          ],
          temperature: 0,
        });
        
        const sqlResponse = completion.choices[0].message.content;
        
        console.log("[CORTEX DEBUG] OpenAI response:");
        console.log("-".repeat(80));
        console.log(sqlResponse);
        console.log("-".repeat(80));
        
        let finalSQL = null;
        
        // Clean up the SQL string first
        const cleanedSQL = sqlResponse.trim();
        
        // Try to extract SQL from markdown code blocks
        const markdownMatch = cleanedSQL.match(/```sql\s*([\s\S]*?)\s*```/i);
        if (markdownMatch && markdownMatch[1]) {
          finalSQL = markdownMatch[1].trim();
        } else {
          // Try to extract SQL directly (look for SELECT...FROM pattern, including multi-line)
          const selectMatch = cleanedSQL.match(/(SELECT[\s\S]*?FROM[\s\S]*?)(?:;|\n\n|$)/i);
          if (selectMatch && selectMatch[1]) {
            finalSQL = selectMatch[1].trim();
          } else {
            // Try without semicolon requirement
            const selectMatch2 = cleanedSQL.match(/(SELECT[\s\S]+?FROM[\s\S]+)/i);
            if (selectMatch2 && selectMatch2[1]) {
              finalSQL = selectMatch2[1].trim();
            } else {
              // Use the whole string if it looks like SQL
              if (cleanedSQL.toUpperCase().includes('SELECT') && cleanedSQL.toUpperCase().includes('FROM')) {
                finalSQL = cleanedSQL;
              }
            }
          }
        }
        
        if (finalSQL) {
          // Clean up the SQL - normalize whitespace but preserve SQL structure
          // First, normalize all whitespace (newlines, tabs, multiple spaces) to single spaces
          finalSQL = finalSQL.replace(/\s+/g, ' ').trim();
          
          // Add spaces before SQL keywords if they're missing (fixes cases like "price_total)FROM" -> "price_total) FROM")
          // We need to be careful not to match keywords inside identifiers (e.g., "transaction_id" should not become "transacti on_id")
          // Match keywords only when they're actual SQL keywords, not part of identifiers
          
          // Handle multi-word keywords first (GROUP BY, ORDER BY)
          // Match only when preceded by non-word characters (not letters/underscores) or at start
          finalSQL = finalSQL.replace(/([^\w\s]|^)(GROUP\s+BY)(?=\s|$|[^\w])/gi, '$1 $2');
          finalSQL = finalSQL.replace(/([^\w\s]|^)(ORDER\s+BY)(?=\s|$|[^\w])/gi, '$1 $2');
          
          // Then handle single-word keywords - be very careful with short keywords like "ON", "AS", "OR"
          // Only match if preceded by non-word characters (not letters/underscores/digits) or at start
          // and followed by whitespace or non-word characters
          const sqlKeywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'HAVING', 'AND', 
                               'INNER', 'LEFT', 'RIGHT', 'OUTER', 'INTO', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
                               'UNION', 'INTERSECT', 'EXCEPT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'];
          
          for (const keyword of sqlKeywords) {
            // Match keyword only when it's a standalone word, not part of an identifier
            // Preceded by: start of string, whitespace, or non-word char (but not underscore/letter/digit)
            // Followed by: whitespace, end of string, or non-word char
            const regex = new RegExp(`([^\\w]|^)(${keyword})(?=\\s|$|[^\\w])`, 'gi');
            finalSQL = finalSQL.replace(regex, `$1 $2`);
          }
          
          // Handle short keywords that might appear in identifiers more carefully
          // "ON" - only match when it's the JOIN ON clause (after JOIN)
          finalSQL = finalSQL.replace(/(JOIN)\s*(ON)(?=\s)/gi, '$1 $2');
          // "AS" - only match when it's an alias (after column/table name, before alias)
          finalSQL = finalSQL.replace(/([^\w]|^)(AS)(?=\s+\w)/gi, '$1 $2');
          // "OR" - only match when it's a logical operator (between conditions)
          finalSQL = finalSQL.replace(/([^\w]|^)(OR)(?=\s+[^\w])/gi, '$1 $2');
          
          // Clean up: normalize spaces again, handle punctuation
          finalSQL = finalSQL
            .replace(/\s+/g, ' ')  // Multiple spaces to single space
            .replace(/\s*([,;])\s*/g, '$1 ')  // Space after commas and semicolons
            .replace(/\(\s+/g, '(')  // Remove space after opening paren
            .replace(/\s+\)/g, ')')  // Remove space before closing paren
            .replace(/;+\s*$/, '')  // Remove trailing semicolons
            .trim();
          
          // Fix merchant_name comparisons to be case-insensitive
          // Replace patterns like: merchant_name = 'costco' or merchant_name = 'Costco'
          // With: UPPER(merchant_name) = UPPER('Costco')
          // This handles any case variation (costco, Costco, COSTCO) and converts to case-insensitive matching
          const merchantNames = ['Amazon', 'Costco', 'Doordash', 'Instacart', 'Target', 'Ubereats', 'Walmart'];
          for (const merchant of merchantNames) {
            // Match merchant_name = 'merchant' (any case) and convert to case-insensitive
            finalSQL = finalSQL.replace(
              new RegExp(`(merchant_name\\s*=\\s*)'${merchant}'`, 'gi'),
              `UPPER(merchant_name) = UPPER('${merchant}')`
            );
            finalSQL = finalSQL.replace(
              new RegExp(`(merchant_name\\s*=\\s*)"${merchant}"`, 'gi'),
              `UPPER(merchant_name) = UPPER('${merchant}')`
            );
            finalSQL = finalSQL.replace(
              new RegExp(`(merchant_name\\s*LIKE\\s*)'${merchant}'`, 'gi'),
              `UPPER(merchant_name) LIKE UPPER('${merchant}')`
            );
          }
          
          console.log("[CORTEX DEBUG] Final extracted SQL from OpenAI:");
          console.log("-".repeat(80));
          console.log(finalSQL);
          console.log("-".repeat(80));
          console.log("=".repeat(80) + "\n");
          
          return finalSQL;
        } else {
          console.log("[CORTEX DEBUG] Could not extract valid SQL from OpenAI response");
          console.log("Raw response:", sqlResponse);
          console.log("=".repeat(80) + "\n");
        }
      } catch (openaiError) {
        console.error("[ERROR] OpenAI SQL generation failed:", openaiError.message);
        console.error("Stack:", openaiError.stack);
      }
    }
    
    connection.destroy();
    return null;
  } catch (error) {
    console.error("[ERROR] Failed to generate SQL from natural language:", error.message);
    return null;
  }
}

/**
 * Execute a natural language query using Snowflake Cortex
 */
async function executeNaturalLanguageQuery(naturalLanguageQuery) {
  if (!USE_SNOWFLAKE) {
    return { error: "Snowflake is not configured" };
  }

  try {
    // First, try to generate SQL from natural language
    const generatedSQL = await generateSQLFromNaturalLanguage(naturalLanguageQuery);
    
    if (!generatedSQL) {
      return { error: "Could not generate SQL from your query" };
    }
    
    // Validate SQL (basic check - in production, use more robust validation)
    if (!generatedSQL.toUpperCase().includes('SELECT')) {
      console.error("\n[CORTEX DEBUG] Generated SQL validation failed - not a SELECT statement");
      console.error("Generated SQL:", generatedSQL);
      return { error: "Generated query is not a SELECT statement" };
    }
    
    console.log("\n[CORTEX DEBUG] Executing generated SQL query:");
    console.log("=".repeat(80));
    console.log(generatedSQL);
    console.log("=".repeat(80));
    
    // Execute the generated SQL
    const connection = await createSnowflakeConnection();
    const results = await executeQuery(connection, generatedSQL);
    connection.destroy();
    
    console.log("\n[CORTEX DEBUG] Query execution results:");
    console.log("-".repeat(80));
    console.log(`Rows returned: ${results.length}`);
    if (results.length > 0) {
      console.log("First row sample:", JSON.stringify(results[0], null, 2));
    }
    console.log("-".repeat(80));
    console.log("=".repeat(80) + "\n");
    
    return {
      query: generatedSQL,
      results: results,
      rowCount: results.length
    };
  } catch (error) {
    console.error("\n[CORTEX DEBUG] Error executing natural language query:");
    console.error("=".repeat(80));
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=".repeat(80) + "\n");
    return { 
      error: error.message,
      suggestion: "Try rephrasing your question or be more specific about what data you want to see."
    };
  }
}

async function fetchTransactionsFromSnowflake() {
  if (!USE_SNOWFLAKE) return null;

  try {
    const connection = await createSnowflakeConnection();
    
    // Fetch transactions
    const transactionsQuery = `
      SELECT 
        transaction_id, external_id, merchant_id, merchant_name,
        datetime, url, order_status,
        payment_method_external_id, payment_method_type, payment_method_brand,
        payment_method_last_four, payment_method_transaction_amount,
        price_sub_total, price_total, price_currency,
        total_discount, total_fee, total_tax, total_tip, adjustments_json
      FROM transactions
      ORDER BY datetime DESC
    `;
    
    const transactions = await executeQuery(connection, transactionsQuery);
    
    // Fetch products
    const productsQuery = `
      SELECT 
        transaction_id, merchant_id, merchant_name,
        product_external_id, product_name, product_url,
        quantity, product_sub_total, product_total, product_unit_price,
        eligibility
      FROM products
      ORDER BY transaction_id
    `;
    
    const products = await executeQuery(connection, productsQuery);
    
    connection.destroy();
    
    // Transform flat data into nested structure
    const transactionsMap = new Map();
    const merchants = new Set();
    
    // Group products by transaction_id
    const productsByTransaction = new Map();
    for (const product of products) {
      if (!productsByTransaction.has(product.TRANSACTION_ID)) {
        productsByTransaction.set(product.TRANSACTION_ID, []);
      }
      productsByTransaction.get(product.TRANSACTION_ID).push({
        external_id: product.PRODUCT_EXTERNAL_ID,
        name: product.PRODUCT_NAME,
        url: product.PRODUCT_URL,
        quantity: product.QUANTITY,
        price: {
          sub_total: product.PRODUCT_SUB_TOTAL,
          total: product.PRODUCT_TOTAL,
          unit_price: product.PRODUCT_UNIT_PRICE,
        },
        eligibility: product.ELIGIBILITY ? product.ELIGIBILITY.split(',').filter(e => e.trim()) : [],
      });
    }
    
    // Transform transactions
    for (const tx of transactions) {
      merchants.add(tx.MERCHANT_NAME);
      
      let adjustments = [];
      if (tx.ADJUSTMENTS_JSON) {
        try {
          adjustments = JSON.parse(tx.ADJUSTMENTS_JSON);
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      transactionsMap.set(tx.TRANSACTION_ID, {
        id: tx.TRANSACTION_ID,
        external_id: tx.EXTERNAL_ID,
        datetime: tx.DATETIME,
        url: tx.URL,
        order_status: tx.ORDER_STATUS,
        payment_methods: tx.PAYMENT_METHOD_EXTERNAL_ID ? [{
          external_id: tx.PAYMENT_METHOD_EXTERNAL_ID,
          type: tx.PAYMENT_METHOD_TYPE,
          brand: tx.PAYMENT_METHOD_BRAND,
          last_four: tx.PAYMENT_METHOD_LAST_FOUR,
          transaction_amount: tx.PAYMENT_METHOD_TRANSACTION_AMOUNT,
        }] : [],
        price: {
          sub_total: tx.PRICE_SUB_TOTAL,
          total: tx.PRICE_TOTAL,
          currency: tx.PRICE_CURRENCY,
          adjustments: adjustments,
        },
        products: productsByTransaction.get(tx.TRANSACTION_ID) || [],
      });
    }
    
    // Get first merchant (or use a default)
    const merchantName = Array.from(merchants)[0] || "Unknown";
    const firstTx = transactions[0];
    
    return {
      merchant: {
        id: firstTx?.MERCHANT_ID || 0,
        name: merchantName,
      },
      transactions: Array.from(transactionsMap.values()),
    };
  } catch (error) {
    console.error("[ERROR] Failed to fetch from Snowflake:", error.message);
    throw error;
  }
}

// ---------- LOAD DATA ----------

let knotData = { transactions: [], merchant: { id: 0, name: "Unknown" } };

async function loadData() {
  if (USE_SNOWFLAKE) {
    try {
      console.log("[CONFIG] Loading data from Snowflake...");
      knotData = await fetchTransactionsFromSnowflake();
      console.log(`[CONFIG] Loaded ${knotData.transactions?.length || 0} transactions from Snowflake`);
    } catch (err) {
      console.error(`[ERROR] Failed to load from Snowflake:`, err.message);
      console.log("[FALLBACK] Attempting to load from dummy_data.json...");
      
      // Fallback to dummy_data.json
const dummyDataPath = path.join(__dirname, "dummy_data.json");
      try {
        const raw = fs.readFileSync(dummyDataPath, "utf8");
        knotData = JSON.parse(raw);
        console.log(`[CONFIG] Loaded dummy_data.json with ${knotData.transactions?.length || 0} transactions`);
      } catch (fallbackErr) {
        console.error(`[ERROR] Failed to load dummy_data.json:`, fallbackErr.message);
        // Continue with empty data
      }
    }
  } else {
    // Load from dummy_data.json
    const dummyDataPath = path.join(__dirname, "dummy_data.json");
try {
  const raw = fs.readFileSync(dummyDataPath, "utf8");
  knotData = JSON.parse(raw);
  console.log(`[CONFIG] Loaded dummy_data.json with ${knotData.transactions?.length || 0} transactions`);
} catch (err) {
  console.error(`[ERROR] Failed to load dummy_data.json from ${dummyDataPath}:`, err.message);
      console.warn("[WARN] Continuing with empty data. Some features may not work.");
    }
  }
}

// Load data on startup
await loadData();

// Flatten helpers
function parseAmount(x) {
  return typeof x === "string" ? parseFloat(x) : Number(x || 0);
}

function getAllTransactions() {
  return knotData.transactions || [];
}

function getAllLineItems() {
  const txs = getAllTransactions();
  const items = [];
  for (const tx of txs) {
    const base = {
      order_id: tx.id,
      datetime: tx.datetime,
      merchant_id: knotData.merchant?.id,
      merchant_name: knotData.merchant?.name,
    };
    for (const p of tx.products || []) {
      items.push({
        ...base,
        external_id: p.external_id,
        name: p.name,
        quantity: p.quantity,
        total: parseAmount(p.price?.total),
        eligibility: p.eligibility || [],
      });
    }
  }
  return items;
}

// ---------- CORE ANALYTICS ----------

function computeTotalSpend({ startDate, endDate } = {}) {
  const txs = getAllTransactions();
  let total = 0;
  for (const tx of txs) {
    const t = new Date(tx.datetime);
    if (startDate && t < startDate) continue;
    if (endDate && t > endDate) continue;
    total += parseAmount(tx.price?.total);
  }
  return total;
}

function computeFsaSpend({ startDate, endDate } = {}) {
  const items = getAllLineItems();
  let total = 0;
  const samples = [];
  for (const item of items) {
    const t = new Date(item.datetime);
    if (startDate && t < startDate) continue;
    if (endDate && t > endDate) continue;
    if ((item.eligibility || []).includes("FSA_HSA")) {
      total += item.total;
      if (samples.length < 5) samples.push(item.name);
    }
  }
  return { total, samples };
}

function listRecentOrders({ limit = 3 } = {}) {
  const txs = [...getAllTransactions()].sort(
    (a, b) => new Date(b.datetime) - new Date(a.datetime)
  );
  return txs.slice(0, limit).map((tx) => ({
    order_id: tx.id,
    datetime: tx.datetime,
    total: parseAmount(tx.price?.total),
    status: tx.order_status,
    url: tx.url,
  }));
}

function topProducts({ limit = 5 } = {}) {
  const items = getAllLineItems();
  const agg = new Map();
  for (const item of items) {
    const key = item.name;
    if (!agg.has(key)) {
      agg.set(key, {
        name: item.name,
        qty: 0,
        spend: 0,
      });
    }
    const row = agg.get(key);
    row.qty += item.quantity || 0;
    row.spend += item.total || 0;
  }
  return [...agg.values()]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, limit);
}

// ---------- NESSIE API FUNCTIONS ----------

async function fetchBills() {
  try {
    const url = `${NESSIE_BASE_URL}/accounts/${NESSIE_ACCOUNT_ID}/bills?key=${NESSIE_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Nessie API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch bills:", error.message);
    return [];
  }
}

async function fetchLoans() {
  try {
    const url = `${NESSIE_BASE_URL}/accounts/${NESSIE_ACCOUNT_ID}/loans?key=${NESSIE_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Nessie API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch loans:", error.message);
    return [];
  }
}

async function fetchDeposits() {
  try {
    const url = `${NESSIE_BASE_URL}/accounts/${NESSIE_ACCOUNT_ID}/deposits?key=${NESSIE_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Nessie API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch deposits:", error.message);
    return [];
  }
}

// ---------- NESSIE DATA ANALYSIS FUNCTIONS ----------

async function analyzeBills() {
  const bills = await fetchBills();
  
  const totalAmount = bills.reduce((sum, bill) => sum + (bill.payment_amount || 0), 0);
  const upcoming = bills
    .filter(bill => {
      const paymentDate = new Date(bill.payment_date);
      return paymentDate >= new Date();
    })
    .sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date));
  
  return {
    total: bills.length,
    totalAmount,
    upcoming: upcoming.slice(0, 10),
    allBills: bills
  };
}

async function analyzeLoans() {
  const loans = await fetchLoans();
  
  const totalAmount = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const totalMonthlyPayment = loans.reduce((sum, loan) => sum + (loan.monthly_payment || 0), 0);
  const avgCreditScore = loans.length > 0 
    ? loans.reduce((sum, loan) => sum + (loan.credit_score || 0), 0) / loans.length 
    : 0;
  
  const byType = {};
  for (const loan of loans) {
    const type = loan.type || "unknown";
    if (!byType[type]) {
      byType[type] = { count: 0, totalAmount: 0, totalMonthly: 0 };
    }
    byType[type].count++;
    byType[type].totalAmount += loan.amount || 0;
    byType[type].totalMonthly += loan.monthly_payment || 0;
  }
  
  return {
    total: loans.length,
    totalAmount,
    totalMonthlyPayment,
    avgCreditScore: Math.round(avgCreditScore),
    byType,
    allLoans: loans
  };
}

async function analyzeDeposits({ startDate, endDate } = {}) {
  const deposits = await fetchDeposits();
  
  let filtered = deposits;
  if (startDate || endDate) {
    filtered = deposits.filter(deposit => {
      const depositDate = new Date(deposit.transaction_date);
      if (startDate && depositDate < startDate) return false;
      if (endDate && depositDate > endDate) return false;
      return true;
    });
  }
  
  const totalAmount = filtered.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
  
  return {
    total: filtered.length,
    totalAmount,
    allDeposits: filtered.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
  };
}

// ---------- MONTHLY BREAKDOWN FUNCTIONS ----------

function getMonthlyBreakdown(data, dateField, amountField) {
  const monthly = {};
  for (const item of data) {
    const date = new Date(item[dateField]);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthly[monthKey]) {
      monthly[monthKey] = {
        month: monthKey,
        count: 0,
        total: 0,
        items: []
      };
    }
    monthly[monthKey].count++;
    const amount = typeof amountField === 'function' ? amountField(item) : (item[amountField] || 0);
    monthly[monthKey].total += amount;
    monthly[monthKey].items.push(item);
  }
  return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
}

async function getMonthlyPurchases({ startDate, endDate } = {}) {
  const transactions = getAllTransactions();
  let filtered = transactions;
  
  if (startDate || endDate) {
    filtered = transactions.filter(tx => {
      const txDate = new Date(tx.datetime);
      if (startDate && txDate < startDate) return false;
      if (endDate && txDate > endDate) return false;
      return true;
    });
  }
  
  return getMonthlyBreakdown(filtered, 'datetime', (tx) => parseAmount(tx.price?.total));
}

async function getMonthlyBills() {
  const bills = await fetchBills();
  return getMonthlyBreakdown(bills, 'payment_date', 'payment_amount');
}

async function getMonthlyLoans() {
  const loans = await fetchLoans();
  // Loans don't have a date field for monthly breakdown, but we can group by creation_date
  return getMonthlyBreakdown(loans, 'creation_date', 'amount');
}

async function getMonthlyDeposits({ startDate, endDate } = {}) {
  const deposits = await fetchDeposits();
  let filtered = deposits;
  
  if (startDate || endDate) {
    filtered = deposits.filter(deposit => {
      const depositDate = new Date(deposit.transaction_date);
      if (startDate && depositDate < startDate) return false;
      if (endDate && depositDate > endDate) return false;
      return true;
    });
  }
  
  return getMonthlyBreakdown(filtered, 'transaction_date', 'amount');
}

async function getMonthlyFinancialSummary({ startDate, endDate } = {}) {
  const [purchases, bills, loans, deposits] = await Promise.all([
    getMonthlyPurchases({ startDate, endDate }),
    getMonthlyBills(),
    getMonthlyLoans(),
    getMonthlyDeposits({ startDate, endDate })
  ]);
  
  // Combine all months
  const allMonths = new Set();
  purchases.forEach(p => allMonths.add(p.month));
  bills.forEach(b => allMonths.add(b.month));
  loans.forEach(l => allMonths.add(l.month));
  deposits.forEach(d => allMonths.add(d.month));
  
  const monthlySummary = [];
  for (const month of Array.from(allMonths).sort()) {
    const purchaseData = purchases.find(p => p.month === month) || { count: 0, total: 0 };
    const billData = bills.find(b => b.month === month) || { count: 0, total: 0 };
    const loanData = loans.find(l => l.month === month) || { count: 0, total: 0 };
    const depositData = deposits.find(d => d.month === month) || { count: 0, total: 0 };
    
    monthlySummary.push({
      month,
      purchases: purchaseData.total,
      purchasesCount: purchaseData.count,
      bills: billData.total,
      billsCount: billData.count,
      loans: loanData.total,
      loansCount: loanData.count,
      deposits: depositData.total,
      depositsCount: depositData.count,
      netFlow: depositData.total - (billData.total + loanData.total + purchaseData.total)
    });
  }
  
  return monthlySummary;
}

// ---------- FINANCIAL WELLNESS ANALYSIS FUNCTIONS ----------

async function analyzeFinancialHealth({ startDate, endDate } = {}) {
  // Get all financial data
  const [bills, loans, deposits] = await Promise.all([
    analyzeBills(),
    analyzeLoans(),
    analyzeDeposits({ startDate, endDate })
  ]);
  
  const monthlySpend = computeTotalSpend({ startDate, endDate });
  const monthlyBills = bills.totalAmount;
  const monthlyLoanPayments = loans.totalMonthlyPayment;
  const totalDebt = loans.totalAmount;
  const totalDeposits = deposits.totalAmount;
  
  // Calculate monthly obligations
  const monthlyObligations = monthlyBills + monthlyLoanPayments;
  const monthlyIncome = totalDeposits; // Approximate from deposits
  const debtToIncomeRatio = monthlyIncome > 0 ? (totalDebt / (monthlyIncome * 12)) * 100 : 0;
  
  // Financial health score (0-100)
  let healthScore = 100;
  const issues = [];
  const recommendations = [];
  
  // Check debt-to-income ratio
  if (debtToIncomeRatio > 40) {
    healthScore -= 30;
    issues.push(`High debt-to-income ratio: ${debtToIncomeRatio.toFixed(1)}%`);
    recommendations.push("Consider debt consolidation or increasing income");
  } else if (debtToIncomeRatio > 30) {
    healthScore -= 15;
    issues.push(`Moderate debt-to-income ratio: ${debtToIncomeRatio.toFixed(1)}%`);
    recommendations.push("Monitor debt levels and avoid taking on new debt");
  }
  
  // Check spending vs income
  const spendingRatio = monthlyIncome > 0 ? (monthlySpend / monthlyIncome) * 100 : 0;
  if (spendingRatio > 90) {
    healthScore -= 25;
    issues.push(`High spending ratio: ${spendingRatio.toFixed(1)}% of income`);
    recommendations.push("Reduce discretionary spending to build savings");
  } else if (spendingRatio > 80) {
    healthScore -= 10;
    issues.push(`Moderate spending ratio: ${spendingRatio.toFixed(1)}% of income`);
    recommendations.push("Consider reducing non-essential purchases");
  }
  
  // Check emergency fund (rough estimate)
  const monthlyExpenses = monthlyObligations + (monthlySpend / 3); // Approximate monthly expenses
  const emergencyFundMonths = monthlyExpenses > 0 ? totalDeposits / monthlyExpenses : 0;
  if (emergencyFundMonths < 3) {
    healthScore -= 20;
    issues.push(`Low emergency fund: ~${emergencyFundMonths.toFixed(1)} months of expenses`);
    recommendations.push("Build emergency fund to cover 3-6 months of expenses");
  } else if (emergencyFundMonths < 6) {
    healthScore -= 5;
    recommendations.push("Continue building emergency fund to 6 months");
  }
  
  // Check if bills are manageable
  if (monthlyBills > monthlyIncome * 0.5) {
    healthScore -= 15;
    issues.push("Bills exceed 50% of income");
    recommendations.push("Review bills for opportunities to reduce costs");
  }
  
  return {
    healthScore: Math.max(0, Math.min(100, healthScore)),
    monthlyIncome,
    monthlySpend,
    monthlyBills,
    monthlyLoanPayments,
    monthlyObligations,
    totalDebt,
    debtToIncomeRatio: debtToIncomeRatio.toFixed(1),
    spendingRatio: spendingRatio.toFixed(1),
    emergencyFundMonths: emergencyFundMonths.toFixed(1),
    issues,
    recommendations
  };
}

async function analyzeCashFlow({ startDate, endDate } = {}) {
  const [bills, loans, deposits] = await Promise.all([
    analyzeBills(),
    analyzeLoans(),
    analyzeDeposits({ startDate, endDate })
  ]);
  
  const monthlySpend = computeTotalSpend({ startDate, endDate });
  const monthlyIncome = deposits.totalAmount;
  const monthlyOutflows = bills.totalAmount + loans.totalMonthlyPayment + monthlySpend;
  const netCashFlow = monthlyIncome - monthlyOutflows;
  
  // Identify cash flow patterns
  const insights = [];
  const suggestions = [];
  
  if (netCashFlow < 0) {
    insights.push(`Negative cash flow: -$${Math.abs(netCashFlow).toFixed(2)}/month`);
    suggestions.push("Reduce spending or increase income to achieve positive cash flow");
    const biggestExpense = Math.max(bills.totalAmount, loans.totalMonthlyPayment, monthlySpend);
    if (biggestExpense === monthlySpend) {
      suggestions.push("Focus on reducing discretionary purchases");
    } else if (biggestExpense === bills.totalAmount) {
      suggestions.push("Review bills for cost-saving opportunities");
    } else {
      suggestions.push("Consider debt consolidation to reduce monthly loan payments");
    }
  } else if (netCashFlow < 200) {
    insights.push(`Tight cash flow: $${netCashFlow.toFixed(2)}/month surplus`);
    suggestions.push("Build a buffer by reducing non-essential spending");
  } else {
    insights.push(`Positive cash flow: $${netCashFlow.toFixed(2)}/month`);
    suggestions.push("Consider increasing savings or investments");
  }
  
  return {
    monthlyIncome,
    monthlyOutflows,
    netCashFlow,
    breakdown: {
      bills: bills.totalAmount,
      loans: loans.totalMonthlyPayment,
      purchases: monthlySpend
    },
    insights,
    suggestions
  };
}

async function analyzeSavingsOpportunities({ startDate, endDate } = {}) {
  const [bills, loans] = await Promise.all([
    analyzeBills(),
    analyzeLoans()
  ]);
  
  const monthlySpend = computeTotalSpend({ startDate, endDate });
  const items = getAllLineItems();
  
  // Find high unit price items (opportunity to buy in bulk)
  const unitPriceItems = analyzeUnitPriceOptimization({ startDate, endDate });
  const highUnitPrice = unitPriceItems.slice(0, 5);
  
  // Find recurring purchases that could be optimized
  const recurring = topProducts({ limit: 10 });
  
  // Calculate potential savings
  const opportunities = [];
  let totalPotentialSavings = 0;
  
  // Unit price optimization
  if (highUnitPrice.length > 0) {
    const avgSavings = highUnitPrice.reduce((sum, item) => sum + item.unitPrice * 0.2, 0) / highUnitPrice.length;
    opportunities.push({
      category: "Bulk Buying",
      description: "Buy frequently purchased items in bulk",
      potentialSavings: avgSavings * 2, // Estimate 20% savings on 2 items/month
      items: highUnitPrice.slice(0, 3).map(i => i.name)
    });
    totalPotentialSavings += avgSavings * 2;
  }
  
  // Bill optimization
  if (bills.totalAmount > 0) {
    opportunities.push({
      category: "Bill Review",
      description: "Review bills for subscription cancellations or better rates",
      potentialSavings: bills.totalAmount * 0.1, // Estimate 10% savings
      items: [`${bills.total} bills to review`]
    });
    totalPotentialSavings += bills.totalAmount * 0.1;
  }
  
  // Debt consolidation opportunity
  if (loans.total > 1 && loans.totalMonthlyPayment > 0) {
    const consolidationSavings = loans.totalMonthlyPayment * 0.05; // Estimate 5% savings
    opportunities.push({
      category: "Debt Consolidation",
      description: "Consolidate multiple loans to reduce interest",
      potentialSavings: consolidationSavings * 12, // Annual savings
      items: [`${loans.total} loans totaling $${loans.totalAmount.toFixed(2)}`]
    });
    totalPotentialSavings += consolidationSavings * 12;
  }
  
  return {
    opportunities,
    totalPotentialSavings: totalPotentialSavings.toFixed(2),
    monthlyPotentialSavings: (totalPotentialSavings / 12).toFixed(2)
  };
}

async function analyzeSpendingPatterns({ startDate, endDate } = {}) {
  const items = getAllLineItems();
  const transactions = getAllTransactions();
  
  // Analyze spending by category (rough categorization)
  const categories = {
    "Electronics": ["phone", "laptop", "tablet", "camera", "headphone", "speaker", "monitor", "keyboard", "mouse"],
    "Home & Kitchen": ["pot", "blender", "thermometer", "yoga mat", "bottle", "tumbler"],
    "Health & Personal Care": ["toothbrush", "shampoo", "vitamin", "thermometer", "eye drop", "dental"],
    "Clothing & Accessories": ["sunglass", "sock", "shirt", "pant", "shoe"],
    "Food & Groceries": ["almond", "water", "detergent", "pod"],
    "Other": []
  };
  
  const categorySpending = {};
  for (const [category, keywords] of Object.entries(categories)) {
    categorySpending[category] = 0;
    for (const item of items) {
      const name = item.name.toLowerCase();
      if (keywords.some(kw => name.includes(kw)) || category === "Other") {
        const itemDate = new Date(item.datetime);
        if (startDate && itemDate < startDate) continue;
        if (endDate && itemDate > endDate) continue;
        categorySpending[category] += item.total;
      }
    }
  }
  
  // Find top spending categories
  const sortedCategories = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, amount]) => amount > 0);
  
  // Analyze spending trends
  const monthlySpending = {};
  for (const tx of transactions) {
    const date = new Date(tx.datetime);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlySpending[monthKey]) {
      monthlySpending[monthKey] = 0;
    }
    monthlySpending[monthKey] += parseAmount(tx.price?.total);
  }
  
  const monthlyTrends = Object.entries(monthlySpending)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-3); // Last 3 months
  
  const insights = [];
  if (monthlyTrends.length >= 2) {
    const recent = monthlyTrends[monthlyTrends.length - 1][1];
    const previous = monthlyTrends[monthlyTrends.length - 2][1];
    const change = ((recent - previous) / previous) * 100;
    if (change > 20) {
      insights.push(`Spending increased ${change.toFixed(1)}% month-over-month`);
    } else if (change < -10) {
      insights.push(`Spending decreased ${Math.abs(change).toFixed(1)}% month-over-month`);
    }
  }
  
  return {
    categorySpending: sortedCategories.slice(0, 5),
    monthlyTrends,
    insights,
    topCategory: sortedCategories[0]?.[0] || "N/A",
    topCategoryAmount: sortedCategories[0]?.[1] || 0
  };
}

// ---------- EXPANDED ANALYTICS FUNCTIONS ----------

function analyzePriceDrops({ startDate, endDate, days = 60 } = {}) {
  // Note: This would require external price tracking API
  // For now, return structure showing what we'd analyze
  const recentItems = getAllLineItems()
    .filter(item => {
      const itemDate = new Date(item.datetime);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return itemDate >= cutoff;
    })
    .slice(0, 5);
  
  return {
    items: recentItems.map(item => ({
      name: item.name,
      purchaseDate: item.datetime,
      purchasePrice: item.total,
      orderId: item.order_id
    })),
    note: "Price drop monitoring requires external price tracking API"
  };
}

function analyzeUnitPriceOptimization({ startDate, endDate } = {}) {
  const items = getAllLineItems();
  const unitPriceItems = items
    .filter(item => {
      const itemDate = new Date(item.datetime);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    })
    .map(item => {
      // Extract size/quantity info from name if possible
      const name = item.name;
      const unitPrice = item.total / (item.quantity || 1);
      return {
        name,
        quantity: item.quantity || 1,
        totalPrice: item.total,
        unitPrice,
        purchaseDate: item.datetime
      };
    })
    .sort((a, b) => b.unitPrice - a.unitPrice)
    .slice(0, 10);
  
  return unitPriceItems;
}

function analyzeInventory({ itemName } = {}) {
  // Estimate usage patterns from purchase frequency
  const items = getAllLineItems()
    .filter(item => !itemName || item.name.toLowerCase().includes(itemName.toLowerCase()))
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  
  if (items.length < 2) return null;
  
  // Calculate average days between purchases
  const dates = items.map(item => new Date(item.datetime)).sort((a, b) => a - b);
  const intervals = [];
  for (let i = 1; i < dates.length; i++) {
    intervals.push((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24));
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  
  const lastPurchase = new Date(dates[dates.length - 1]);
  const nextExpected = new Date(lastPurchase);
  nextExpected.setDate(nextExpected.getDate() + avgInterval);
  
  return {
    itemName: items[0]?.name || itemName,
    avgDaysBetween: Math.round(avgInterval),
    lastPurchaseDate: lastPurchase.toISOString().split('T')[0],
    nextExpectedDate: nextExpected.toISOString().split('T')[0],
    totalPurchases: items.length
  };
}

function analyzeSpoilageRisk({ startDate, endDate } = {}) {
  // Look for rapid repeat purchases of perishables
  const items = getAllLineItems()
    .filter(item => {
      const itemDate = new Date(item.datetime);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  
  // Group by product name
  const byProduct = new Map();
  for (const item of items) {
    const key = item.name.toLowerCase();
    if (!byProduct.has(key)) {
      byProduct.set(key, []);
    }
    byProduct.get(key).push({
      date: new Date(item.datetime),
      quantity: item.quantity || 1,
      total: item.total
    });
  }
  
  const risks = [];
  for (const [name, purchases] of byProduct.entries()) {
    if (purchases.length < 2) continue;
    purchases.sort((a, b) => a.date - b.date);
    
    // Check for purchases within 10 days
    for (let i = 1; i < purchases.length; i++) {
      const daysBetween = (purchases[i].date - purchases[i-1].date) / (1000 * 60 * 60 * 24);
      if (daysBetween < 10) {
        risks.push({
          name,
          firstPurchase: purchases[i-1].date.toISOString().split('T')[0],
          secondPurchase: purchases[i].date.toISOString().split('T')[0],
          daysBetween: Math.round(daysBetween),
          estimatedWaste: purchases[i-1].total
        });
        break;
      }
    }
  }
  
  return risks;
}

function analyzeHealthNutrition({ startDate, endDate } = {}) {
  // Identify high-sugar, high-calorie items (would need nutrition API)
  const items = getAllLineItems()
    .filter(item => {
      const itemDate = new Date(item.datetime);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  
  // Look for common high-sugar keywords
  const highSugarKeywords = ['latte', 'soda', 'candy', 'chocolate', 'ice cream', 'energy drink', 'juice'];
  const flagged = items.filter(item => {
    const name = item.name.toLowerCase();
    return highSugarKeywords.some(keyword => name.includes(keyword));
  });
  
  return {
    flaggedItems: flagged.slice(0, 10).map(item => ({
      name: item.name,
      purchaseDate: item.datetime,
      total: item.total
    })),
    note: "Full nutrition analysis requires external nutrition database"
  };
}

function analyzeAllergyRisk({ allergy, startDate, endDate } = {}) {
  if (!allergy) return null;
  
  const items = getAllLineItems()
    .filter(item => {
      const itemDate = new Date(item.datetime);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  
  const allergyLower = allergy.toLowerCase();
  const risks = items.filter(item => {
    const name = item.name.toLowerCase();
    return name.includes(allergyLower);
  });
  
  return {
    allergy,
    risks: risks.map(item => ({
      name: item.name,
      purchaseDate: item.datetime,
      orderId: item.order_id
    })),
    note: "Full ingredient analysis requires product database"
  };
}

function analyzeReturnsWindow({ daysWindow = 30 } = {}) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysWindow);
  
  const recentOrders = getAllTransactions()
    .filter(tx => new Date(tx.datetime) >= cutoff)
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  
  const returnableItems = [];
  for (const tx of recentOrders) {
    const orderDate = new Date(tx.datetime);
    const daysSince = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = daysWindow - daysSince;
    
    if (daysRemaining > 0 && daysRemaining <= 7) {
      for (const product of tx.products || []) {
        returnableItems.push({
          name: product.name,
          orderId: tx.id,
          orderDate: tx.datetime,
          daysRemaining,
          total: parseAmount(product.price?.total)
        });
      }
    }
  }
  
  return returnableItems.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

function analyzeTaxDeductible({ startDate, endDate } = {}) {
  // Common deductible categories
  const deductibleKeywords = ['monitor', 'keyboard', 'mouse', 'chair', 'desk', 'printer', 'paper', 'ink', 'software', 'zoom', 'webcam', 'microphone'];
  const items = getAllLineItems()
    .filter(item => {
      const itemDate = new Date(item.datetime);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  
  const deductible = [];
  const notDeductible = [];
  
  for (const item of items) {
    const name = item.name.toLowerCase();
    const isDeductible = deductibleKeywords.some(keyword => name.includes(keyword));
    
    if (isDeductible) {
      deductible.push({
        name: item.name,
        total: item.total,
        date: item.datetime,
        category: "Office Equipment/Supplies"
      });
    } else {
      notDeductible.push({
        name: item.name,
        total: item.total
      });
    }
  }
  
  const deductibleTotal = deductible.reduce((sum, item) => sum + item.total, 0);
  
  return {
    deductible,
    deductibleTotal,
    notDeductible: notDeductible.slice(0, 10),
    note: "Consult tax professional for accurate categorization"
  };
}

function analyzeFsaAutoFile({ startDate, endDate } = {}) {
  const items = getAllLineItems()
    .filter(item => {
      const itemDate = new Date(item.datetime);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return (item.eligibility || []).includes("FSA_HSA");
    });
  
  return {
    eligibleItems: items.map(item => ({
      name: item.name,
      total: item.total,
      purchaseDate: item.datetime,
      orderId: item.order_id,
      status: "Ready to file"
    })),
    totalEligible: items.reduce((sum, item) => sum + item.total, 0),
    note: "Auto-filing requires FSA/HSA provider API integration"
  };
}

function analyzeRefillReminders({ itemName } = {}) {
  const inventory = analyzeInventory({ itemName });
  if (!inventory) return null;
  
  const items = getAllLineItems()
    .filter(item => !itemName || item.name.toLowerCase().includes(itemName.toLowerCase()))
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  
  if (items.length === 0) return null;
  
  const lastPurchase = new Date(items[0].datetime);
  const nextExpected = new Date(lastPurchase);
  nextExpected.setDate(nextExpected.getDate() + inventory.avgDaysBetween);
  const daysUntil = Math.ceil((nextExpected - new Date()) / (1000 * 60 * 60 * 24));
  
  return {
    itemName: items[0].name,
    lastPurchaseDate: lastPurchase.toISOString().split('T')[0],
    daysUntilRefill: daysUntil,
    recommendedAction: daysUntil <= 3 ? "Order now" : daysUntil <= 7 ? "Order soon" : "Monitor"
  };
}

function analyzeAffordability({ targetAmount, startDate, endDate } = {}) {
  if (!targetAmount) return null;
  
  const monthlySpend = computeTotalSpend({ startDate, endDate });
  const recentNonEssential = getAllLineItems()
    .filter(item => {
      const itemDate = new Date(item.datetime);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      // Exclude FSA items, basic necessities
      return !(item.eligibility || []).includes("FSA_HSA");
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  
  const nonEssentialTotal = recentNonEssential.reduce((sum, item) => sum + item.total, 0);
  const canAfford = monthlySpend - nonEssentialTotal >= targetAmount;
  
  return {
    targetAmount,
    monthlySpend,
    canAfford,
    suggestedDelays: canAfford ? [] : recentNonEssential.map(item => ({
      name: item.name,
      amount: item.total,
      savings: item.total
    })),
    remainingAfter: canAfford ? monthlySpend - targetAmount : null
  };
}

// ---------- LLM INTERPRETER ----------

/**
 * Use ChatGPT to convert a natural language question into
 * a structured query our code understands.
 *
 * We keep the schema intentionally small for hackathon use:
 * {
 *   "intent": "total_spend" | "fsa_spend" | "recent_orders" | "top_products" | "fallback",
 *   "time_range": {
 *      "start": "YYYY-MM-DD" | null,
 *      "end": "YYYY-MM-DD" | null
 *   },
 *   "limit": number | null
 * }
 */
async function interpretQueryWithLLM(message) {
  if (!process.env.OPENAI_API_KEY) {
    // fallback if no key configured
    return { intent: "fallback" };
  }

  try {
    const prompt = `
You are a router for a financial wellness assistant chatbot.
User questions are about improving their financial health, analyzing spending patterns, managing bills/loans/deposits, and finding savings opportunities.
The chatbot combines data from purchases (Knot TransactionLink), bills, loans, and deposits to provide actionable financial insights.

Return ONLY a compact JSON object (no prose) with:
- "intent": one of the following intents
- "time_range": {"start": "YYYY-MM-DD" or null, "end": "YYYY-MM-DD" or null}
- "limit": integer or null
- "params": object with any additional parameters (e.g., {"item_name": "..."}, {"allergy": "..."})

Available intents:
["total_spend", "fsa_spend", "recent_orders", "top_products",
 "price_drop", "unit_price", "inventory", "spoilage", "health_nutrition",
 "cashback", "coupons", "recalls", "allergy", "sustainability",
 "household_split", "returns", "warranty", "travel", "fraud",
 "tax_deduction", "fsa_auto", "refill", "meal_planning", "price_benchmark",
 "store_substitution", "gifting", "affordability", "counterfeit",
 "habit_coaching", "price_per_use", "bundle_optimizer", "channel_check",
 "event_list", "ethical_constraints", "bills", "loans", "deposits",
 "financial_health", "cash_flow", "savings_opportunities", "spending_patterns",
 "budget_recommendation", "debt_analysis", "monthly_breakdown", "fallback"]

Examples:
Q: "How much have I spent in total?"
-> {"intent":"total_spend","time_range":{"start":null,"end":null},"limit":null,"params":{}}

Q: "Did any items I recently bought drop in price?"
-> {"intent":"price_drop","time_range":{"start":null,"end":null},"limit":null,"params":{}}

Q: "Where am I overpaying by unit price?"
-> {"intent":"unit_price","time_range":{"start":null,"end":null},"limit":null,"params":{}}

Q: "I'm avoiding peanuts—any risks in my usual snacks?"
-> {"intent":"allergy","time_range":{"start":null,"end":null},"limit":null,"params":{"allergy":"peanuts"}}

Q: "Show my bills" or "What bills do I have?"
-> {"intent":"bills","time_range":{"start":null,"end":null},"limit":null,"params":{}}

Q: "What are my loans?" or "Show my loans"
-> {"intent":"loans","time_range":{"start":null,"end":null},"limit":null,"params":{}}

Q: "Show my deposits" or "What deposits do I have?"
-> {"intent":"deposits","time_range":{"start":null,"end":null},"limit":null,"params":{}}

Q: "How is my financial health?" or "What's my financial wellness score?"
-> {"intent":"financial_health","time_range":{"start":null,"end":null},"limit":null,"params":{}}

Q: "What's my cash flow?" or "How is my cash flow?"
-> {"intent":"cash_flow","time_range":{"start":null,"end":null},"limit":null,"params":{}}

Q: "How can I save money?" or "What are savings opportunities?"
-> {"intent":"savings_opportunities","time_range":{"start":null,"end":null},"limit":null,"params":{}}

Q: "What are my spending patterns?" or "How do I spend my money?"
-> {"intent":"spending_patterns","time_range":{"start":null,"end":null},"limit":null,"params":{}}

Q: "Show me monthly breakdown" or "Breakdown by month"
-> {"intent":"monthly_breakdown","time_range":{"start":null,"end":null},"limit":null,"params":{}}
`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message },
      ],
      temperature: 0,
    });

    const raw = completion.choices[0].message.content || "{}";

    try {
      const parsed = JSON.parse(raw);
      // Ensure params exists
      if (!parsed.params) parsed.params = {};
      // Ensure time_range exists
      if (!parsed.time_range) parsed.time_range = { start: null, end: null };
      return parsed;
    } catch (e) {
      console.error("Failed to parse LLM JSON:", raw);
      return { intent: "fallback", time_range: { start: null, end: null }, limit: null, params: {} };
    }
  } catch (error) {
    console.error("OpenAI API error:", error.message);
    // Fallback to a simple keyword-based parser if API fails
    const lowerMessage = message.toLowerCase();
    const params = {};
    
    if (lowerMessage.includes("total") && lowerMessage.includes("spend")) {
      return { intent: "total_spend", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("fsa") || lowerMessage.includes("hsa")) {
      if (lowerMessage.includes("auto") || lowerMessage.includes("file")) {
        return { intent: "fsa_auto", time_range: { start: null, end: null }, limit: null, params };
      }
      return { intent: "fsa_spend", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("recent") || lowerMessage.includes("last") || lowerMessage.includes("order")) {
      const limitMatch = message.match(/\d+/);
      return { intent: "recent_orders", time_range: { start: null, end: null }, limit: limitMatch ? parseInt(limitMatch[0]) : 3, params };
    }
    if (lowerMessage.includes("top") || lowerMessage.includes("product")) {
      return { intent: "top_products", time_range: { start: null, end: null }, limit: 5, params };
    }
    if (lowerMessage.includes("price") && (lowerMessage.includes("drop") || lowerMessage.includes("protection"))) {
      return { intent: "price_drop", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("unit") && lowerMessage.includes("price")) {
      return { intent: "unit_price", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("inventory") || lowerMessage.includes("run out")) {
      return { intent: "inventory", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("spoilage") || lowerMessage.includes("waste")) {
      return { intent: "spoilage", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("allergy") || lowerMessage.includes("avoiding")) {
      const allergyMatch = message.match(/(?:avoiding|allergy|allergic to)\s+(\w+)/i);
      if (allergyMatch) params.allergy = allergyMatch[1];
      return { intent: "allergy", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("return") && lowerMessage.includes("window")) {
      return { intent: "returns", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("tax") && (lowerMessage.includes("deduct") || lowerMessage.includes("deduction"))) {
      return { intent: "tax_deduction", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("afford") || lowerMessage.includes("can i buy")) {
      const amountMatch = message.match(/\$?(\d+(?:\.\d+)?)/);
      if (amountMatch) params.target_amount = parseFloat(amountMatch[1]);
      return { intent: "affordability", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("bill")) {
      return { intent: "bills", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("loan")) {
      return { intent: "loans", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("deposit")) {
      return { intent: "deposits", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("financial") && (lowerMessage.includes("health") || lowerMessage.includes("wellness"))) {
      return { intent: "financial_health", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("cash") && lowerMessage.includes("flow")) {
      return { intent: "cash_flow", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("save") || lowerMessage.includes("savings") || lowerMessage.includes("opportunit")) {
      return { intent: "savings_opportunities", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("spending") && lowerMessage.includes("pattern")) {
      return { intent: "spending_patterns", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("budget")) {
      return { intent: "budget_recommendation", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("debt")) {
      return { intent: "debt_analysis", time_range: { start: null, end: null }, limit: null, params };
    }
    if (lowerMessage.includes("monthly") && (lowerMessage.includes("breakdown") || lowerMessage.includes("break down"))) {
      return { intent: "monthly_breakdown", time_range: { start: null, end: null }, limit: null, params };
    }
    
    return { intent: "fallback", time_range: { start: null, end: null }, limit: null, params };
  }
}

// ---------- ANSWER BUILDER ----------

async function answerFromQuery(query) {
  // parse time range
  let startDate = null;
  let endDate = null;
  if (query.time_range) {
    if (query.time_range.start) startDate = new Date(query.time_range.start);
    if (query.time_range.end) endDate = new Date(query.time_range.end);
  }

  switch (query.intent) {
    case "total_spend": {
      const total = computeTotalSpend({ startDate, endDate });
      if (startDate || endDate) {
        return `Your total Amazon spend in the selected period is $${total.toFixed(
          2
        )}.`;
      }
      return `Your total Amazon spend in this dataset is $${total.toFixed(2)}.`;
    }

    case "fsa_spend": {
      const { total, samples } = computeFsaSpend({ startDate, endDate });
      if (total === 0) {
        return `You don't have any FSA/HSA-eligible purchases in this dataset.`;
      }
      const sampleText =
        samples.length > 0 ? ` Examples: ${samples.join(", ")}.` : "";
      return `You've spent $${total.toFixed(
        2
      )} on FSA/HSA-eligible items in this dataset.${sampleText}`;
    }

    case "recent_orders": {
      const limit = query.limit || 3;
      const orders = listRecentOrders({ limit });
      if (!orders.length) return "I couldn't find any orders.";
      const lines = orders
        .map(
          (o) =>
            `• ${o.order_id} on ${o.datetime.slice(
              0,
              10
            )} — $${o.total.toFixed(2)} (${o.status})`
        )
        .join("\n");
      return `Here are your latest ${orders.length} Amazon orders:\n${lines}`;
    }

    case "top_products": {
      const limit = query.limit || 5;
      const tops = topProducts({ limit });
      if (!tops.length) return "I couldn't find any products.";
      const lines = tops
        .map(
          (p) =>
            `• ${p.name}: ${p.qty} items, $${p.spend.toFixed(2)} total spend`
        )
        .join("\n");
      return `Your top ${tops.length} products by spend:\n${lines}`;
    }

    case "price_drop": {
      const result = analyzePriceDrops({ startDate, endDate });
      if (result.items.length === 0) {
        return "I couldn't find any recent purchases to monitor for price drops.";
      }
      const items = result.items.slice(0, 3).map(item => 
        `• ${item.name} (purchased ${item.purchaseDate.slice(0, 10)} for $${item.purchasePrice.toFixed(2)})`
      ).join("\n");
      return `I'm monitoring these recent purchases for price drops:\n${items}\n\n${result.note}`;
    }

    case "unit_price": {
      const result = analyzeUnitPriceOptimization({ startDate, endDate });
      if (result.length === 0) return "I couldn't find any items to analyze.";
      const top = result.slice(0, 5).map(item => 
        `• ${item.name}: $${item.unitPrice.toFixed(2)} per unit (${item.quantity} units, $${item.totalPrice.toFixed(2)} total)`
      ).join("\n");
      return `Items with highest unit prices (consider bulk buying):\n${top}`;
    }

    case "inventory": {
      const itemName = query.params?.item_name;
      const result = analyzeInventory({ itemName });
      if (!result) {
        return itemName 
          ? `I don't have enough purchase history for "${itemName}" to estimate inventory.`
          : "Which item would you like me to track? Try: 'When will I run out of [item name]?'";
      }
      return `Based on your purchase history:\n• ${result.itemName}\n• Average days between purchases: ${result.avgDaysBetween}\n• Last purchase: ${result.lastPurchaseDate}\n• Next expected purchase: ${result.nextExpectedDate}\n• Total purchases tracked: ${result.totalPurchases}`;
    }

    case "spoilage": {
      const result = analyzeSpoilageRisk({ startDate, endDate });
      if (result.length === 0) {
        return "Great! I don't see any obvious spoilage risks in your recent purchases.";
      }
      const risks = result.map(r => 
        `• ${r.name}: Bought twice within ${r.daysBetween} days (${r.firstPurchase} and ${r.secondPurchase}). Estimated waste: $${r.estimatedWaste.toFixed(2)}`
      ).join("\n");
      const totalWaste = result.reduce((sum, r) => sum + r.estimatedWaste, 0);
      return `Potential spoilage risks detected:\n${risks}\n\nEstimated total waste: $${totalWaste.toFixed(2)}`;
    }

    case "health_nutrition": {
      const result = analyzeHealthNutrition({ startDate, endDate });
      if (result.flaggedItems.length === 0) {
        return "I didn't find any obvious high-sugar items in your recent purchases.";
      }
      const items = result.flaggedItems.map(item => 
        `• ${item.name} (purchased ${item.purchaseDate.slice(0, 10)})`
      ).join("\n");
      return `Items that may be high in sugar:\n${items}\n\n${result.note}`;
    }

    case "allergy": {
      const allergy = query.params?.allergy;
      if (!allergy) {
        return "What allergen are you avoiding? Try: 'I'm avoiding [allergen]'";
      }
      const result = analyzeAllergyRisk({ allergy, startDate, endDate });
      if (!result || result.risks.length === 0) {
        return `Good news! I didn't find any items containing "${allergy}" in your purchase history.`;
      }
      const risks = result.risks.map(r => 
        `• ${r.name} (purchased ${r.purchaseDate.slice(0, 10)}, order ${r.orderId})`
      ).join("\n");
      return `⚠️ Found ${result.risks.length} item(s) that may contain ${allergy}:\n${risks}\n\n${result.note}`;
    }

    case "returns": {
      const result = analyzeReturnsWindow({ daysWindow: 30 });
      if (result.length === 0) {
        return "You don't have any items approaching their return deadline.";
      }
      const items = result.map(item => 
        `• ${item.name} (order ${item.orderId}, ${item.daysRemaining} days remaining, $${item.total.toFixed(2)})`
      ).join("\n");
      return `Items approaching return deadline (within 7 days):\n${items}`;
    }

    case "tax_deduction": {
      const result = analyzeTaxDeductible({ startDate, endDate });
      const deductibleList = result.deductible.slice(0, 10).map(item => 
        `• ${item.name}: $${item.total.toFixed(2)} (${item.date.slice(0, 10)})`
      ).join("\n");
      return `Tax-deductible items (potentially):\n${deductibleList}\n\nTotal potentially deductible: $${result.deductibleTotal.toFixed(2)}\n\n${result.note}`;
    }

    case "fsa_auto": {
      const result = analyzeFsaAutoFile({ startDate, endDate });
      if (result.eligibleItems.length === 0) {
        return "You don't have any FSA/HSA-eligible items ready to file.";
      }
      const items = result.eligibleItems.map(item => 
        `• ${item.name}: $${item.total.toFixed(2)} (${item.purchaseDate.slice(0, 10)})`
      ).join("\n");
      return `FSA/HSA-eligible items ready to file:\n${items}\n\nTotal eligible: $${result.totalEligible.toFixed(2)}\n\n${result.note}`;
    }

    case "refill": {
      const itemName = query.params?.item_name;
      const result = analyzeRefillReminders({ itemName });
      if (!result) {
        return itemName 
          ? `I don't have enough purchase history for "${itemName}" to estimate refill timing.`
          : "Which item would you like refill reminders for? Try: 'When should I restock [item name]?'";
      }
      return `Refill reminder for ${result.itemName}:\n• Last purchase: ${result.lastPurchaseDate}\n• Days until refill: ${result.daysUntilRefill}\n• Recommendation: ${result.recommendedAction}`;
    }

    case "affordability": {
      const targetAmount = query.params?.target_amount || parseFloat(query.params?.amount) || null;
      if (!targetAmount) {
        return "How much are you considering spending? Try: 'Can I afford $1200 this month?'";
      }
      const result = analyzeAffordability({ targetAmount, startDate, endDate });
      if (result.canAfford) {
        return `Yes! You can afford $${targetAmount.toFixed(2)}. After this purchase, you'd have approximately $${result.remainingAfter.toFixed(2)} remaining in your budget.`;
      } else {
        const delays = result.suggestedDelays.map(d => 
          `• Delay ${d.name}: Save $${d.savings.toFixed(2)}`
        ).join("\n");
        return `To afford $${targetAmount.toFixed(2)}, consider delaying these purchases:\n${delays}\n\nThis would free up approximately $${result.suggestedDelays.reduce((sum, d) => sum + d.savings, 0).toFixed(2)}.`;
      }
    }

    case "bills": {
      const result = await analyzeBills();
      if (result.total === 0) {
        return "You don't have any bills in your account.";
      }
      const upcomingList = result.upcoming.slice(0, 5).map(bill => 
        `• ${bill.nickname || bill.payee}: $${bill.payment_amount.toFixed(2)} due ${bill.payment_date}`
      ).join("\n");
      return `Bills Summary:\n• Total bills: ${result.total}\n• Total amount: $${result.totalAmount.toFixed(2)}\n\nUpcoming bills:\n${upcomingList}`;
    }

    case "loans": {
      const result = await analyzeLoans();
      if (result.total === 0) {
        return "You don't have any loans in your account.";
      }
      const typeSummary = Object.entries(result.byType).map(([type, data]) => 
        `• ${type}: ${data.count} loan(s), $${data.totalAmount.toFixed(2)} total, $${data.totalMonthly.toFixed(2)}/month`
      ).join("\n");
      return `Loans Summary:\n• Total loans: ${result.total}\n• Total amount: $${result.totalAmount.toFixed(2)}\n• Total monthly payment: $${result.totalMonthlyPayment.toFixed(2)}\n• Average credit score: ${result.avgCreditScore}\n\nBy type:\n${typeSummary}`;
    }

    case "deposits": {
      const result = await analyzeDeposits({ startDate, endDate });
      if (result.total === 0) {
        return "You don't have any deposits in your account.";
      }
      const recentDeposits = result.allDeposits.slice(0, 5).map(deposit => 
        `• $${deposit.amount.toFixed(2)} on ${deposit.transaction_date}`
      ).join("\n");
      return `Deposits Summary:\n• Total deposits: ${result.total}\n• Total amount: $${result.totalAmount.toFixed(2)}\n\nRecent deposits:\n${recentDeposits}`;
    }

    case "financial_health": {
      const result = await analyzeFinancialHealth({ startDate, endDate });
      const scoreEmoji = result.healthScore >= 80 ? "🟢" : result.healthScore >= 60 ? "🟡" : "🔴";
      const issuesText = result.issues.length > 0 
        ? `\n\n⚠️ Areas of concern:\n${result.issues.map(i => `• ${i}`).join("\n")}`
        : "\n\n✅ No major issues detected!";
      const recommendationsText = result.recommendations.length > 0
        ? `\n\n💡 Recommendations:\n${result.recommendations.map(r => `• ${r}`).join("\n")}`
        : "";
      return `${scoreEmoji} Financial Health Score: ${result.healthScore}/100\n\n` +
        `📊 Overview:\n` +
        `• Monthly income: $${result.monthlyIncome.toFixed(2)}\n` +
        `• Monthly spending: $${result.monthlySpend.toFixed(2)}\n` +
        `• Monthly obligations: $${result.monthlyObligations.toFixed(2)}\n` +
        `• Total debt: $${result.totalDebt.toFixed(2)}\n` +
        `• Debt-to-income ratio: ${result.debtToIncomeRatio}%\n` +
        `• Spending ratio: ${result.spendingRatio}% of income\n` +
        `• Emergency fund: ~${result.emergencyFundMonths} months${issuesText}${recommendationsText}`;
    }

    case "cash_flow": {
      const result = await analyzeCashFlow({ startDate, endDate });
      const flowEmoji = result.netCashFlow >= 0 ? "✅" : "⚠️";
      const insightsText = result.insights.map(i => `• ${i}`).join("\n");
      const suggestionsText = result.suggestions.map(s => `• ${s}`).join("\n");
      return `${flowEmoji} Cash Flow Analysis\n\n` +
        `📈 Monthly Income: $${result.monthlyIncome.toFixed(2)}\n` +
        `📉 Monthly Outflows: $${result.monthlyOutflows.toFixed(2)}\n` +
        `💰 Net Cash Flow: $${result.netCashFlow.toFixed(2)}/month\n\n` +
        `Breakdown:\n` +
        `• Bills: $${result.breakdown.bills.toFixed(2)}\n` +
        `• Loan payments: $${result.breakdown.loans.toFixed(2)}\n` +
        `• Purchases: $${result.breakdown.purchases.toFixed(2)}\n\n` +
        `💡 Insights:\n${insightsText}\n\n` +
        `🎯 Suggestions:\n${suggestionsText}`;
    }

    case "savings_opportunities": {
      const result = await analyzeSavingsOpportunities({ startDate, endDate });
      if (result.opportunities.length === 0) {
        return "I couldn't find specific savings opportunities at this time. Keep tracking your spending for personalized recommendations!";
      }
      const opportunitiesText = result.opportunities.map(opp => 
        `• ${opp.category}: ${opp.description}\n  Potential savings: $${opp.potentialSavings.toFixed(2)}/year\n  Items: ${opp.items.join(", ")}`
      ).join("\n\n");
      return `💰 Savings Opportunities\n\n` +
        `I found ${result.opportunities.length} ways you could save money:\n\n${opportunitiesText}\n\n` +
        `📊 Total potential savings: $${result.totalPotentialSavings}/year ($${result.monthlyPotentialSavings}/month)`;
    }

    case "spending_patterns": {
      const result = await analyzeSpendingPatterns({ startDate, endDate });
      const categoryText = result.categorySpending.map(([cat, amount]) => 
        `• ${cat}: $${amount.toFixed(2)}`
      ).join("\n");
      const insightsText = result.insights.length > 0 
        ? `\n\n📈 Trends:\n${result.insights.map(i => `• ${i}`).join("\n")}`
        : "";
      return `📊 Spending Patterns Analysis\n\n` +
        `Top spending categories:\n${categoryText}\n\n` +
        `🎯 Top category: ${result.topCategory} ($${result.topCategoryAmount.toFixed(2)})${insightsText}`;
    }

    case "budget_recommendation": {
      const [health, cashFlow, patterns] = await Promise.all([
        analyzeFinancialHealth({ startDate, endDate }),
        analyzeCashFlow({ startDate, endDate }),
        analyzeSpendingPatterns({ startDate, endDate })
      ]);
      
      const recommendedBudget = {
        essentials: health.monthlyObligations,
        discretionary: health.monthlySpend * 0.3, // 30% of current spending
        savings: Math.max(0, cashFlow.netCashFlow * 0.2) // 20% of positive cash flow
      };
      
      return `💵 Budget Recommendation\n\n` +
        `Based on your financial profile:\n\n` +
        `📋 Recommended monthly budget:\n` +
        `• Essentials (bills + loans): $${recommendedBudget.essentials.toFixed(2)}\n` +
        `• Discretionary spending: $${recommendedBudget.discretionary.toFixed(2)}\n` +
        `• Savings goal: $${recommendedBudget.savings.toFixed(2)}\n\n` +
        `💡 Tips:\n` +
        `• Aim to save 20% of your income\n` +
        `• Keep discretionary spending under 30% of total expenses\n` +
        `• Build emergency fund to cover 3-6 months of expenses`;
    }

    case "debt_analysis": {
      const [loans, health] = await Promise.all([
        analyzeLoans(),
        analyzeFinancialHealth({ startDate, endDate })
      ]);
      
      if (loans.total === 0) {
        return "Great news! You don't have any loans in your account.";
      }
      
      const typeSummary = Object.entries(loans.byType).map(([type, data]) => 
        `• ${type}: $${data.totalAmount.toFixed(2)} total, $${data.totalMonthly.toFixed(2)}/month`
      ).join("\n");
      
      const recommendations = [];
      if (parseFloat(health.debtToIncomeRatio) > 40) {
        recommendations.push("Consider debt consolidation to lower monthly payments");
        recommendations.push("Focus on paying off highest interest loans first");
      } else if (loans.total > 1) {
        recommendations.push("Consider consolidating multiple loans for better rates");
      }
      
      const recText = recommendations.length > 0 
        ? `\n\n💡 Recommendations:\n${recommendations.map(r => `• ${r}`).join("\n")}`
        : "";
      
      return `📊 Debt Analysis\n\n` +
        `Total debt: $${loans.totalAmount.toFixed(2)}\n` +
        `Monthly payments: $${loans.totalMonthlyPayment.toFixed(2)}\n` +
        `Debt-to-income ratio: ${health.debtToIncomeRatio}%\n` +
        `Average credit score: ${loans.avgCreditScore}\n\n` +
        `By type:\n${typeSummary}${recText}`;
    }

    case "monthly_breakdown": {
      const summary = await getMonthlyFinancialSummary({ startDate, endDate });
      if (summary.length === 0) {
        return "I couldn't find any financial data to break down by month.";
      }
      
      const monthNames = {
        '01': 'January', '02': 'February', '03': 'March', '04': 'April',
        '05': 'May', '06': 'June', '07': 'July', '08': 'August',
        '09': 'September', '10': 'October', '11': 'November', '12': 'December'
      };
      
      const formatMonth = (monthKey) => {
        const [year, month] = monthKey.split('-');
        return `${monthNames[month]} ${year}`;
      };
      
      const breakdown = summary.map(m => {
        const monthName = formatMonth(m.month);
        const netEmoji = m.netFlow >= 0 ? '✅' : '⚠️';
        return `${monthName}:\n` +
          `  💰 Deposits: $${m.deposits.toFixed(2)} (${m.depositsCount} transactions)\n` +
          `  🛒 Purchases: $${m.purchases.toFixed(2)} (${m.purchasesCount} orders)\n` +
          `  💳 Bills: $${m.bills.toFixed(2)} (${m.billsCount} bills)\n` +
          `  🏦 Loans: $${m.loans.toFixed(2)} (${m.loansCount} loans)\n` +
          `  ${netEmoji} Net Flow: $${m.netFlow.toFixed(2)}`;
      }).join('\n\n');
      
      return `📅 Monthly Financial Breakdown\n\n${breakdown}`;
    }

    case "cashback":
    case "coupons":
    case "recalls":
    case "sustainability":
    case "household_split":
    case "warranty":
    case "travel":
    case "fraud":
    case "price_benchmark":
    case "store_substitution":
    case "gifting":
    case "counterfeit":
    case "habit_coaching":
    case "price_per_use":
    case "bundle_optimizer":
    case "channel_check":
    case "event_list":
    case "meal_planning":
    case "ethical_constraints": {
      // These require external APIs or more complex data
      return `I understand you're asking about ${query.intent.replace(/_/g, ' ')}. This feature requires additional data sources (price tracking APIs, product databases, etc.) that aren't currently integrated. The foundation is in place - would you like me to prioritize implementing this feature?`;
    }

    case "fallback":
    default: {
      // Generic helpful summary focused on financial wellness
      return (
        `💚 I'm your Financial Wellness Assistant! I help you improve your financial health by analyzing your purchases, bills, loans, and deposits.\n\n` +
        `📊 Financial Health:\n` +
        `• "How is my financial health?" - Get your wellness score\n` +
        `• "What's my cash flow?" - See income vs expenses\n` +
        `• "Analyze my debt" - Understand your debt situation\n\n` +
        `💰 Savings & Budget:\n` +
        `• "How can I save money?" - Find savings opportunities\n` +
        `• "What are my spending patterns?" - See where your money goes\n` +
        `• "Give me a budget recommendation" - Get personalized budget advice\n\n` +
        `💳 Account Overview:\n` +
        `• "Show my bills" - View upcoming bills\n` +
        `• "What are my loans?" - See loan details\n` +
        `• "Show my deposits" - Check deposit history\n` +
        `• "Show me monthly breakdown" - See purchases, bills, loans, and deposits by month\n\n` +
        `🛒 Purchase Insights:\n` +
        `• "How much did I spend in total?"\n` +
        `• "Show my recent orders"\n` +
        `• "Where am I overpaying?"\n\n` +
        `Ask me anything about your finances, and I'll provide actionable insights to help you improve your financial wellness!`
      );
    }
  }
}

// ---------- EXPRESS APP ----------

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get("/", (req, res) => {
  res.send("Knot Transaction Chatbot is running.");
});

// Direct Snowflake Cortex endpoint (for testing/debugging)
// Body: { query: string } - natural language query
// Returns: { answer: string, query?: string, results?: array, rowCount?: number, error?: string }
app.post("/cortex", async (req, res) => {
  const { query } = req.body || {};
  
  if (!query || !query.trim()) {
    return res.status(400).json({ 
      error: "Missing or empty 'query' in body.",
      answer: "Please provide a query to process."
    });
  }

  if (!USE_SNOWFLAKE) {
    return res.status(400).json({ 
      error: "Snowflake is not configured.",
      answer: "Snowflake is not configured. Please set up Snowflake connection."
    });
  }

  try {
    const result = await executeNaturalLanguageQuery(query.trim());
    
    if (result.error) {
      return res.status(400).json({
        ...result,
        answer: result.error || "Query execution failed."
      });
    }
    
    const formattedResults = formatSQLResults(result.results);
    
    // Use ChatGPT to format results into human-readable response
    console.log(`[CORTEX] Formatting results with ChatGPT...`);
    const answer = await formatResultsWithChatGPT(
      result.results,
      query.trim(),
      result.query
    );
    
    return res.json({
      query: result.query,
      results: formattedResults,
      rowCount: result.rowCount,
      answer: answer
    });
  } catch (err) {
    console.error("[ERROR] Error processing Cortex query:", err);
    return res.status(500).json({
      error: "Failed to process Cortex query.",
      answer: "Sorry, I'm having trouble processing your query right now. Please try again.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Main chat endpoint
// Body: { message: string, userId?: string, useCortex?: boolean }
// Returns: { answer: string, source?: string, query?: object, error?: string }
// In future, map userId/imessage handle -> external_user_id.
app.post("/chat", async (req, res) => {
  const { message, userId, useCortex } = req.body || {};
  
  if (!message || !message.trim()) {
    return res.status(400).json({ 
      error: "Missing or empty 'message' in body.",
      answer: "Please provide a message to process."
    });
  }

  const userMessage = message.trim();
  console.log(`[CHAT] Received message from ${userId || 'unknown'}: ${userMessage}`);

  try {
    // Auto-detect if query might benefit from Cortex (SQL-like queries)
    // Or if useCortex is explicitly set, or if Snowflake is enabled and query seems data-focused
    const shouldTryCortex = useCortex || (USE_SNOWFLAKE && (
      userMessage.toLowerCase().includes('show me') ||
      userMessage.toLowerCase().includes('list') ||
      userMessage.toLowerCase().includes('what are') ||
      userMessage.toLowerCase().includes('how many') ||
      userMessage.toLowerCase().includes('how much') ||
      userMessage.toLowerCase().includes('find') ||
      userMessage.toLowerCase().includes('get') ||
      userMessage.toLowerCase().includes('display') ||
      userMessage.toLowerCase().includes('spent') ||
      userMessage.toLowerCase().includes('spending') ||
      userMessage.toLowerCase().includes('bill') ||
      userMessage.toLowerCase().includes('bills') ||
      userMessage.toLowerCase().includes('deposit') ||
      userMessage.toLowerCase().includes('deposits') ||
      userMessage.toLowerCase().includes('loan') ||
      userMessage.toLowerCase().includes('loans') ||
      userMessage.toLowerCase().includes('debt') ||
      userMessage.toLowerCase().includes('payment')
    ));
    
    // If should try Cortex and Snowflake is configured, try Cortex first
    if (shouldTryCortex && USE_SNOWFLAKE) {
      try {
        const cortexResult = await executeNaturalLanguageQuery(userMessage);
        
        if (!cortexResult.error && cortexResult.results) {
          // Format the results for display
          const formattedResults = formatSQLResults(cortexResult.results);
          
          // Use ChatGPT to format results into human-readable response
          console.log(`[CHAT] Cortex query successful: ${cortexResult.rowCount} results`);
          console.log(`[CHAT] Formatting results with ChatGPT...`);
          
          const answer = await formatResultsWithChatGPT(
            cortexResult.results,
            userMessage,
            cortexResult.query
          );
          
          return res.json({
            source: "snowflake_cortex",
            query: cortexResult.query,
            results: formattedResults,
            rowCount: cortexResult.rowCount,
            answer: answer
          });
        }
        
        // If Cortex fails but returns an error, log it and fall through
        if (cortexResult.error) {
          console.log("[INFO] Cortex query failed:", cortexResult.error);
          console.log("[INFO] Falling back to regular processing");
        }
      } catch (cortexErr) {
        console.error("[ERROR] Cortex query threw exception:", cortexErr.message);
        console.log("[INFO] Falling back to regular processing");
        // Fall through to regular processing
      }
    }
    
    // Regular processing using the existing LLM interpreter
    const query = await interpretQueryWithLLM(userMessage);
    const answer = await answerFromQuery(query);

    console.log(`[CHAT] LLM interpreter response generated`);

    return res.json({
      source: "llm_interpreter",
      query,
      answer,
    });
  } catch (err) {
    console.error("[ERROR] Error processing chat request:", err);
    console.error("[ERROR] Stack trace:", err.stack);
    
    // Always return an answer field for imessage-bot.js compatibility
    return res.status(500).json({
      error: "Failed to process message.",
      answer: "Sorry, I'm having trouble processing your request right now. Please try again.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Helper function to format SQL results
function formatSQLResults(results) {
  if (!results || results.length === 0) {
    return [];
  }
  
  // Convert Snowflake result objects to arrays
  return results.map(row => {
    const formatted = {};
    for (const [key, value] of Object.entries(row)) {
      formatted[key.toLowerCase()] = value;
    }
    return formatted;
  });
}

// Helper function to format results as readable text (basic formatting)
function formatResultsAsText(results, query) {
  if (!results || results.length === 0) {
    return "No results found for your query.";
  }
  
  const columns = Object.keys(results[0] || {});
  let text = `Found ${results.length} result(s):\n\n`;
  
  // Show first 10 results
  const displayResults = results.slice(0, 10);
  
  for (let i = 0; i < displayResults.length; i++) {
    const row = displayResults[i];
    text += `Result ${i + 1}:\n`;
    for (const col of columns) {
      // Handle both uppercase and lowercase column names from Snowflake
      const value = row[col.toUpperCase()] || row[col.toLowerCase()] || row[col];
      if (value !== null && value !== undefined) {
        // Format numbers with commas
        const formattedValue = typeof value === 'number' && value % 1 !== 0 
          ? value.toFixed(2) 
          : typeof value === 'number' 
          ? value.toLocaleString() 
          : value;
        text += `  ${col}: ${formattedValue}\n`;
      }
    }
    text += "\n";
  }
  
  if (results.length > 10) {
    text += `... and ${results.length - 10} more result(s).\n`;
  }
  
  return text;
}

/**
 * Use ChatGPT to format SQL query results into a natural, human-readable response
 * @param {Array} results - The raw SQL query results
 * @param {string} userQuery - The original user question
 * @param {string} sqlQuery - The SQL query that was executed
 * @returns {Promise<string>} - A human-readable formatted response
 */
async function formatResultsWithChatGPT(results, userQuery, sqlQuery) {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback to basic formatting if OpenAI is not available
    console.log("[INFO] OpenAI not available, using basic formatting");
    return formatResultsAsText(results, sqlQuery);
  }

  if (!results || results.length === 0) {
    return "I couldn't find any data matching your query.";
  }

  try {
    // Prepare the data for ChatGPT
    const dataSummary = {
      rowCount: results.length,
      columns: Object.keys(results[0] || {}),
      sampleRows: results.slice(0, 20).map(row => {
        const formatted = {};
        for (const [key, value] of Object.entries(row)) {
          // Convert keys to lowercase for consistency
          formatted[key.toLowerCase()] = value;
        }
        return formatted;
      })
    };

    const prompt = `You are a helpful financial assistant. A user asked: "${userQuery}"

I executed a SQL query and got ${dataSummary.rowCount} result(s). Here's the data:

${JSON.stringify(dataSummary.sampleRows, null, 2)}

${dataSummary.rowCount > 20 ? `(Showing first 20 of ${dataSummary.rowCount} results)` : ''}

Please provide a natural, conversational response that:
1. Directly answers the user's question
2. Highlights key insights or numbers
3. Is concise and easy to read (2-4 sentences for simple queries, slightly longer for complex ones)
4. Uses natural language (e.g., "You've spent $1,234.56" instead of "Result 1: price_total: 1234.56")
5. Formats numbers nicely with commas and currency symbols where appropriate
6. If there are multiple results, summarize the key findings

Do NOT include the raw data or technical details. Just provide a friendly, human-readable answer.`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful financial assistant that explains data in a clear, conversational way. Always format numbers nicely and use natural language."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent, factual responses
      max_tokens: 500, // Limit response length for concise answers
    });

    const formattedAnswer = completion.choices[0].message.content.trim();
    console.log("[CHATGPT] Formatted response generated");
    
    return formattedAnswer;
  } catch (error) {
    console.error("[ERROR] Failed to format results with ChatGPT:", error.message);
    console.log("[INFO] Falling back to basic formatting");
    // Fallback to basic formatting if ChatGPT fails
    return formatResultsAsText(results, sqlQuery);
  }
}

app.listen(PORT, async () => {
  console.log(`Chatbot server listening on port ${PORT}`);
  // Reload data periodically (every 5 minutes) if using Snowflake
  if (USE_SNOWFLAKE) {
    setInterval(async () => {
      try {
        await loadData();
        console.log(`[RELOAD] Refreshed data from Snowflake: ${knotData.transactions?.length || 0} transactions`);
      } catch (err) {
        console.error(`[ERROR] Failed to reload data:`, err.message);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
});