import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Loads .env file
// import { Knot } from '@knotapi/node'; // Placeholder for future live integration
import fs from 'fs/promises'; // Import File System module
import path from 'path';
import { fileURLToPath } from 'url';

// --- Initialize Express App ---
const app = express();
const PORT = process.env.PORT || 3000;

// Helper for ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Middleware to parse JSON bodies
// Serve static files for the demo checkout pages
app.use(express.static(path.join(__dirname, 'newfrontend')));

// --- Initialize Knot API Client (Structure - commented) ---
// Keep this block for future implementation; currently unused while simulating from dummydata.json
// const knot = new Knot({
//   clientId: process.env.KNOT_CLIENT_ID,
//   clientSecret: process.env.KNOT_CLIENT_SECRET,
//   environment: process.env.KNOT_ENVIRONMENT || 'development',
// });

// --- API Endpoints ---

/**
 * 3. GET CREDIT SCORE
 * This is the core logic you requested.
 * It uses the stored access_token to fetch data, compute a score, and return an offer.
 *
 * *** MODIFIED AS REQUESTED ***
 * This endpoint now reads from 'dummydata.json' instead of calling the Knot API.
 */
app.get('/api/get-credit-score', async (req, res) => {
  // In a real app, you'd get this from your database for a specific user.
  // const userAccessToken = 'access-token-from-your-db';

  try {
    
    // --- KNOT API CALLS (Commented for future use) ---
    // To enable live data later, uncomment this block and remove the simulation below.
    //
    // console.log('Calling Knot API for live data...');
    // // 1. Fetch account data
    // const accountsResponse = await knot.api.v1.accounts.get({ 
    //   access_token: userAccessToken 
    // });
    // const accounts = accountsResponse.data.accounts;
    //
    // // 2. Fetch transaction data (last 90 days)
    // const endDate = new Date().toISOString().split('T')[0];
    // const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    //
    // const transactionsResponse = await knot.api.v1.transactions.get({
    //   access_token: userAccessToken,
    //   startDate,
    //   endDate,
    // });
    // const transactions = transactionsResponse.data.transactions;
    // --- END KNOT API CALLS ---


    // --- SIMULATION (Reading from file as requested) ---
    console.log("Simulating API call by reading from 'dummydata.json'...");
    const dummyDataPath = path.join(__dirname, 'dummydata.json');
    const fileData = await fs.readFile(dummyDataPath, 'utf8');
    const raw = JSON.parse(fileData);

    // The dummy file structure contains { merchant, transactions, ... } but NOT bank-style accounts.
    // We adapt it to the shape expected by the scoring logic.
    const transactions = (raw.transactions || []).map(order => {
      const total = Number(order?.price?.total) || 0;
      // Scoring logic treats positive amounts as spending; negative as income.
      return {
        amount: total, // treat all orders as spending (positive)
        description: `${order.order_status || 'ORDER'} ${order.id}`,
        datetime: order?.datetime
      };
    });

    // Synthesize a single account so downstream logic doesn't fail.
    // You can later replace this with real account data from Knot.
    const accounts = [
      {
        subtype: 'checking',
        name: 'Simulated Account',
        balance: { current: 5000 } // arbitrary current balance for scoring context
      }
    ];
    
    // Optional: include total overdue debt in dummydata.json as { "overdueDebt": 250 }
    const overdueDebt = Number(raw.overdueDebt) || 0;
    // --- END SIMULATION ---


    // 3. Process Data (This logic is the same as before)
    const primaryAccount = accounts.find(a => a.subtype === 'checking') || accounts[0];
    const currentBalance = primaryAccount.balance.current;
    
  // 4. Calculate Score (spending-only heuristic)
  const score = calculateCreditScore(transactions, currentBalance);

  // 5. Determine Lending Offer (liquid, spending-only, considers overdue debt if provided)
  const lendingOffer = getLendingOffer(transactions, currentBalance, overdueDebt);

    // 6. Return the result
    res.json({
      creditScore: score,
      lendingOffer,
      analysis: {
        accountName: primaryAccount.name,
        currentBalance,
        totalTransactionsAnalyzed: transactions.length,
        source: 'dummydata.json (simulation)',
        metrics: lendingOffer.metrics,
      },
    });

  } catch (error) {
    console.error('Error getting credit score:', error.message);
    if (error.code === 'ENOENT') {
      res.status(500).json({ error: "Failed to read 'dummydata.json'. Make sure the file exists." });
    } else {
      res.status(500).json({ error: 'Failed to process financial data.' });
    }
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Ready to calculate credit scores from dummydata.json.');
  console.log(`Test endpoint: http://localhost:${PORT}/api/get-credit-score`);
});


// --- Business Logic Functions (Unchanged) ---

/**
 * Computes a custom credit score based on transaction history.
 * This is a simplified model. You can make this as complex as you need.
 * * @param {Array} transactions - Array of transaction objects from Knot API.
 * @param {number} currentBalance - The user's current account balance.
 * @returns {number} A score between 300 and 850.
 */
function calculateCreditScore(transactions, currentBalance) {
  if (!transactions || transactions.length === 0) return 300;

  const monthly = aggregateMonthly(transactions);
  const avgMonthlySpend = monthly.avg;
  const vol = monthly.volatility; // coefficient of variation (sd/avg)
  const freqPerMonth = monthly.avgCount;
  const maxSingle = monthly.maxSingle;

  // Capacity proxy: lower spend, lower volatility, reasonable frequency, smaller max single purchase
  const spendScale = 4000;
  const base = clamp(1 - (avgMonthlySpend / spendScale), 0, 1);
  const volatilityScore = clamp(1 - vol, 0, 1);
  const freqScore = clamp(freqPerMonth / 40, 0, 1); // cap at ~40 orders/mo
  const singlePurchasePenalty = clamp(1 - (maxSingle / Math.max(100, avgMonthlySpend * 0.8)), 0, 1);

  const capacityScore = clamp(0.45 * base + 0.30 * volatilityScore + 0.15 * freqScore + 0.10 * singlePurchasePenalty, 0, 1);

  const baseScore = 300 + capacityScore * 550;
  // Bonus for having some cash balance
  const balanceBonus = currentBalance > 1000 ? (currentBalance > 5000 ? 40 : 20) : 0;
  return Math.min(Math.max(Math.round(baseScore + balanceBonus), 300), 850);
}

/**
 * Determines a maximum lending amount based on the computed score.
 * * @param {number} score - The custom credit score.
 * @returns {object} An object describing the lending offer.
 */
function getLendingOffer(transactions, currentBalance, overdueDebt = 0) {
  const monthly = aggregateMonthly(transactions);
  const avgMonthlySpend = monthly.avg;
  const vol = monthly.volatility;
  const freqPerMonth = monthly.avgCount;
  const maxSingle = monthly.maxSingle;

  const spendScale = 4000;
  const base = clamp(1 - (avgMonthlySpend / spendScale), 0, 1);
  const volatilityScore = clamp(1 - vol, 0, 1);
  const freqScore = clamp(freqPerMonth / 40, 0, 1);
  const singlePurchasePenalty = clamp(1 - (maxSingle / Math.max(100, avgMonthlySpend * 0.8)), 0, 1);
  const capacityScore = clamp(0.5 * base + 0.3 * volatilityScore + 0.15 * freqScore + 0.05 * singlePurchasePenalty, 0, 1);
  const recommendedMonthlyPayment = roundToTwo(Math.max(0, capacityScore) * 0.12 * avgMonthlySpend);

  // Term based on volatility and capacity
  let termMonths = 6;
  if (capacityScore >= 0.75 && vol <= 0.3) termMonths = 12;
  else if (capacityScore >= 0.55 && vol <= 0.6) termMonths = 9;
  else if (capacityScore < 0.35 || vol > 1.0) termMonths = 3;

  let maxAmount = roundToTwo(recommendedMonthlyPayment * termMonths);
  // Overdue debt directly reduces available amount
  maxAmount = Math.max(0, maxAmount - overdueDebt);

  // Interest rate inversely proportional to capacityScore (range ~7%..24%)
  const interestRatePct = roundToOne(24 - capacityScore * 17);

  // Decision: require minimum capacity and that overdueDebt is not dominant
  const approved = capacityScore >= 0.4 && overdueDebt <= maxAmount * 0.25;

  const offer = approved
    ? {
        status: 'Approved',
        maxAmount: Math.round(maxAmount),
        interestRate: `${interestRatePct}% APR`,
        message: 'FlexPay approved based on your spending stability.',
        termMonths,
        recommendedMonthlyPayment,
      }
    : {
        status: 'Declined',
        maxAmount: 0,
        interestRate: 'N/A',
        message: overdueDebt > 0
          ? 'FlexPay declined due to existing overdue balance. Please resolve it and try again.'
          : 'FlexPay declined based on recent spending patterns. Try again later.',
        termMonths: 0,
        recommendedMonthlyPayment: 0,
      };

  return {
    ...offer,
    metrics: {
      avgMonthlySpend: roundToTwo(avgMonthlySpend),
      monthlyStdDev: roundToTwo(monthly.sd),
      volatility: roundToThree(vol),
      purchaseFreqPerMonth: roundToTwo(freqPerMonth),
      maxSinglePurchase: roundToTwo(maxSingle),
      overdueDebt,
      capacityScore: roundToThree(capacityScore),
    }
  };
}

function aggregateMonthly(transactions) {
  const buckets = new Map();
  let maxSingle = 0;
  for (const t of transactions) {
    const amt = Number(t.amount) || 0;
    if (amt > maxSingle) maxSingle = amt;
    const dt = new Date(t.datetime || t.date || t.time || Date.now());
    const key = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}`;
    const bucket = buckets.get(key) || { sum: 0, count: 0 };
    bucket.sum += Math.max(0, amt); // spending only (positive)
    bucket.count += 1;
    buckets.set(key, bucket);
  }
  const months = Array.from(buckets.values());
  const n = Math.max(1, months.length);
  const sums = months.map(b => b.sum);
  const counts = months.map(b => b.count);
  const total = sums.reduce((a, b) => a + b, 0);
  const avg = total / n;
  const variance = sums.reduce((acc, s) => acc + Math.pow(s - avg, 2), 0) / n;
  const sd = Math.sqrt(variance);
  const volatility = avg > 0 ? sd / avg : 1;
  const avgCount = counts.reduce((a, b) => a + b, 0) / n;
  return { avg, sd, volatility, avgCount, maxSingle };
}

function clamp(x, min, max) { return Math.max(min, Math.min(max, x)); }
function roundToTwo(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }
function roundToThree(x) { return Math.round((x + Number.EPSILON) * 1000) / 1000; }
function roundToOne(x) { return Math.round((x + Number.EPSILON) * 10) / 10; }