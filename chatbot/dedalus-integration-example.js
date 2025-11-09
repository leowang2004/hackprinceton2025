// dedalus-integration-example.js
// Example of how to integrate Dedalus Labs into your chatbot

import { DedalusLabs } from '@dedalus-labs/client';
import "dotenv/config";

// Initialize Dedalus Labs client
const dedalus = new DedalusLabs(process.env.DEDALUS_API_KEY);

/**
 * Example 1: Replace OpenAI chat completion with Dedalus
 * This can be used for LLM-based query interpretation
 */
export async function interpretQueryWithDedalus(message) {
  try {
    const response = await dedalus.run({
      input: message,
      model: "openai/gpt-5-mini", // or "openai/gpt-4.1" for better tool calling
      systemPrompt: `You are a router for a financial wellness assistant chatbot.
        Analyze the user's question and return JSON with intent classification.`
    });

    return JSON.parse(response.final_output);
  } catch (error) {
    console.error("[DEDALUS] Error:", error);
    return null;
  }
}

/**
 * Example 2: Use Dedalus with MCP servers for enhanced capabilities
 * This adds web search capabilities to your chatbot
 */
export async function answerWithWebSearch(userQuery) {
  try {
    const response = await dedalus.run({
      input: userQuery,
      model: "openai/gpt-5",
      mcpServers: ["windsor/exa-search-mcp"], // Web search MCP server
      systemPrompt: "You are a financial assistant. Use web search when needed to provide up-to-date information."
    });

    return response.final_output;
  } catch (error) {
    console.error("[DEDALUS] Error with web search:", error);
    return null;
  }
}

/**
 * Example 3: Use Dedalus for SQL generation with tool chaining
 * This could replace or enhance your Cortex SQL generation
 */
export async function generateSQLWithDedalus(naturalLanguageQuery, schemaContext) {
  try {
    // Define SQL generation as a tool
    const sqlGenerationTool = {
      name: "generateSQL",
      description: "Generate Snowflake SQL query from natural language",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The SQL query to generate"
          }
        },
        required: ["query"]
      }
    };

    const response = await dedalus.run({
      input: `Generate a SQL query for: ${naturalLanguageQuery}\n\nSchema: ${schemaContext}`,
      model: "openai/gpt-5", // Better for tool calling
      tools: [sqlGenerationTool],
      systemPrompt: "You are a SQL expert. Generate valid Snowflake SQL queries."
    });

    // Extract SQL from tool call if used
    if (response.toolCalls && response.toolCalls.length > 0) {
      return response.toolCalls[0].parameters.query;
    }
    
    return response.final_output;
  } catch (error) {
    console.error("[DEDALUS] SQL generation error:", error);
    return null;
  }
}

/**
 * Example 4: Use Dedalus for result formatting with model handoff
 * This could replace your ChatGPT formatting layer
 */
export async function formatResultsWithDedalus(results, userQuery, sqlQuery) {
  try {
    const response = await dedalus.run({
      input: `Format these SQL results into a natural response:\n\nQuery: ${userQuery}\nResults: ${JSON.stringify(results.slice(0, 20))}`,
      model: "openai/gpt-5-mini",
      systemPrompt: "You are a helpful financial assistant. Format SQL results into conversational, human-readable responses."
    });

    return response.final_output;
  } catch (error) {
    console.error("[DEDALUS] Formatting error:", error);
    return null;
  }
}

/**
 * Example 5: Shopping recommendations with Dedalus
 * Enhanced version with web search for product information
 */
export async function generateShoppingRecommendationsWithDedalus(category, purchaseHistory) {
  try {
    const response = await dedalus.run({
      input: `Based on this purchase history, recommend 3 products for ${category || 'general shopping'}:\n\n${JSON.stringify(purchaseHistory.slice(0, 20))}`,
      model: "openai/gpt-5",
      mcpServers: ["windsor/exa-search-mcp"], // Optional: search for real product info
      systemPrompt: "You are a shopping assistant. Generate realistic product recommendations based on purchase history."
    });

    return response.final_output;
  } catch (error) {
    console.error("[DEDALUS] Recommendations error:", error);
    return null;
  }
}

