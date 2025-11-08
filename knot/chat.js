// server.js
// Simple Knot + ChatGPT-powered transaction chatbot using dummy_data.json

import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- CONFIG ----------
const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"; // adjust as needed

// Log environment configuration (without exposing sensitive keys)
console.log(`[CONFIG] Port: ${PORT}`);
console.log(`[CONFIG] Model: ${MODEL}`);
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

// ---------- LOAD DUMMY DATA ----------
/**
 * Expected dummy_data.json = the exact JSON you pasted from Knot:
 * {
 *   "merchant": {...},
 *   "transactions": [...],
 *   "next_cursor": "...",
 *   "limit": 5
 * }
 */
const dummyDataPath = path.join(__dirname, "dummy_data.json");
let knotData;
try {
  const raw = fs.readFileSync(dummyDataPath, "utf8");
  knotData = JSON.parse(raw);
  console.log(`[CONFIG] Loaded dummy_data.json with ${knotData.transactions?.length || 0} transactions`);
} catch (err) {
  console.error(`[ERROR] Failed to load dummy_data.json from ${dummyDataPath}:`, err.message);
  process.exit(1);
}

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
You are a router for an item-level finance helper chatbot.
User questions are about their purchase history from Knot TransactionLink data.

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
 "event_list", "ethical_constraints", "fallback"]

Examples:
Q: "How much have I spent in total?"
-> {"intent":"total_spend","time_range":{"start":null,"end":null},"limit":null,"params":{}}

Q: "Did any items I recently bought drop in price?"
-> {"intent":"price_drop","time_range":{"start":null,"end":null},"limit":null,"params":{}}

Q: "Where am I overpaying by unit price?"
-> {"intent":"unit_price","time_range":{"start":null,"end":null},"limit":null,"params":{}}

Q: "I'm avoiding peanuts—any risks in my usual snacks?"
-> {"intent":"allergy","time_range":{"start":null,"end":null},"limit":null,"params":{"allergy":"peanuts"}}
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
    
    return { intent: "fallback", time_range: { start: null, end: null }, limit: null, params };
  }
}

// ---------- ANSWER BUILDER ----------

function answerFromQuery(query) {
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
      // Generic helpful summary
      const total = computeTotalSpend({});
      const { total: fsaTotal } = computeFsaSpend({});
      const orders = listRecentOrders({ limit: 3 });
      return (
        `I'm your item-level finance helper! I can help with:\n\n` +
        `💰 Spending Analysis:\n` +
        `• "How much did I spend in total?"\n` +
        `• "Show my last 3 orders"\n` +
        `• "Where am I overpaying by unit price?"\n\n` +
        `🏥 Health & Benefits:\n` +
        `• "How much on FSA-eligible items?"\n` +
        `• "Can you auto-file my FSA claims?"\n` +
        `• "I'm avoiding peanuts—any risks?"\n\n` +
        `📊 Smart Insights:\n` +
        `• "Did any items I bought drop in price?"\n` +
        `• "When will I run out of [item]?"\n` +
        `• "What should I return before the window closes?"\n` +
        `• "Which purchases are tax-deductible?"\n\n` +
        `Current summary:\n` +
        `• Total spend: $${total.toFixed(2)}\n` +
        `• FSA/HSA-eligible: $${fsaTotal.toFixed(2)}\n` +
        `• Latest orders: ${orders
          .map((o) => `${o.order_id} ($${o.total.toFixed(2)})`)
          .join(", ")}`
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

// Main chat endpoint
// Body: { message: string, userId?: string }
// In future, map userId/imessage handle -> external_user_id.
app.post("/chat", async (req, res) => {
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Missing 'message' in body." });
  }

  try {
    const query = await interpretQueryWithLLM(message);
    const answer = answerFromQuery(query);

    return res.json({
      query,
      answer,
    });
  } catch (err) {
    console.error("Error processing chat request:", err);
    console.error("Stack trace:", err.stack);
    return res.status(500).json({
      error: "Failed to process message.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot server listening on port ${PORT}`);
});