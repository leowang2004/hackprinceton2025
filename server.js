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

// Serve static files for the demo checkout pages (both old and new frontend)
app.use(express.static(path.join(__dirname, 'newfrontend')));
// Serve built React app if it exists
const buildPath = path.join(__dirname, 'newfrontend', 'build');
const distPath = path.join(__dirname, 'newfrontend', 'dist');
try {
  if (require('fs').existsSync(distPath)) {
    app.use(express.static(distPath));
  } else if (require('fs').existsSync(buildPath)) {
    app.use(express.static(buildPath));
  }
} catch (e) {
  console.log('No built frontend found, serving source files');
}

// API Routes come before catch-all route

// --- Initialize Knot API Client (Structure - commented) ---
// Keep this block for future implementation; currently unused while simulating from dummydata.json
// const knot = new Knot({
//   clientId: process.env.KNOT_CLIENT_ID,
//   clientSecret: process.env.KNOT_CLIENT_SECRET,
//   environment: process.env.KNOT_ENVIRONMENT || 'development',
// });

// --- Knot API Configuration ---
const KNOT_API_BASE_URL = process.env.KNOT_ENVIRONMENT === 'production'
  ? 'https://production.knotapi.com'
  : 'https://development.knotapi.com';

const KNOT_CLIENT_ID = process.env.KNOT_CLIENT_ID;
const KNOT_CLIENT_SECRET = process.env.KNOT_CLIENT_SECRET;

/**
 * Helper function to make authenticated requests to Knot API
 * Uses HTTP Basic Authentication
 */
async function callKnotAPI(endpoint, method = 'POST', body = null) {
  const authString = Buffer.from(`${KNOT_CLIENT_ID}:${KNOT_CLIENT_SECRET}`).toString('base64');

  const options = {
    method,
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json',
      'Knot-Version': '2.0'
    }
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }
  console.log(`Calling Knot API: ${KNOT_API_BASE_URL}${endpoint} with method ${method}`);
  const response = await fetch(`${KNOT_API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Knot API Error: ${response.status} - ${errorData.error_message || response.statusText}`);
  }

  return await response.json();
}

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


    // --- COMPREHENSIVE BANK DATA SIMULATION ---
    console.log("Loading comprehensive bank data: transactions, bills, deposits, and loans...");

    // 1. Load merchant transaction data
    const transactionsPath = path.join(__dirname, 'dummydata.json');
    const transactionsFile = await fs.readFile(transactionsPath, 'utf8');
    const transactionsRaw = JSON.parse(transactionsFile);

    const transactions = (transactionsRaw.transactions || []).map(order => ({
      amount: Number(order?.price?.total) || 0,
      description: `${order.order_status || 'ORDER'} ${order.id}`,
      datetime: order?.datetime,
      type: 'merchant_purchase'
    }));

    // 2. Load bill payment data (credit cards, utilities, etc.)
    const billsPath = path.join(__dirname, 'dummybill.json');
    const billsFile = await fs.readFile(billsPath, 'utf8');
    const bills = JSON.parse(billsFile);

    // 3. Load deposit data (income, paychecks)
    const depositsPath = path.join(__dirname, 'dummydeposit.json');
    const depositsFile = await fs.readFile(depositsPath, 'utf8');
    const deposits = JSON.parse(depositsFile);

    // 4. Load loan data (existing debt obligations)
    const loansPath = path.join(__dirname, 'dummyloan.json');
    const loansFile = await fs.readFile(loansPath, 'utf8');
    const loans = JSON.parse(loansFile);

    // Calculate current balance based on deposits
    const totalDeposits = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const currentBalance = totalDeposits * 2.5; // Estimate: deposits represent ~40% of balance

    // Calculate overdue debt from pending bills and loans
    const pendingBills = bills.filter(b => b.status === 'pending');
    const totalBillsOwed = pendingBills.reduce((sum, b) => sum + Number(b.payment_amount || 0), 0);
    const totalLoansOwed = loans.reduce((sum, l) => sum + Number(l.payment_amount || 0), 0);
    const overdueDebt = totalBillsOwed + totalLoansOwed;

    // --- END COMPREHENSIVE BANK DATA SIMULATION ---


    // 4. Calculate Comprehensive Credit Score
    const score = calculateCreditScore(transactions, currentBalance, bills, deposits, loans);

    // 5. Determine Lending Offer (considers all financial factors)
    const lendingOffer = getLendingOffer(transactions, currentBalance, overdueDebt, deposits, bills);

    // 6. Return the result
    res.json({
      creditScore: score,
      lendingOffer,
      analysis: {
        accountBalance: currentBalance,
        totalTransactionsAnalyzed: transactions.length,
        totalBillsOwed: totalBillsOwed,
        totalLoansOwed: totalLoansOwed,
        totalOverdueDebt: overdueDebt,
        monthlyDeposits: deposits.length,
        totalDepositAmount: totalDeposits,
        source: 'Comprehensive bank data (transactions, bills, deposits, loans)',
        metrics: lendingOffer.metrics,
      },
    });

  } catch (error) {
    console.error('Error getting credit score:', error.message);
    if (error.code === 'ENOENT') {
      res.status(500).json({ error: "Failed to read bank data files. Make sure all dummy files exist." });
    } else {
      res.status(500).json({ error: 'Failed to process financial data.' });
    }
  }
});

/**
 * GET CONNECTED MERCHANTS
 * Returns the list of available merchants from Knot API
 */
app.get('/api/get-merchants', async (req, res) => {
  try {
    console.log('Fetching merchants from Knot API...');

    // Call Knot API to get list of merchants
    const requestBody = {
      type: 'transaction_link',
      // platform: 'ios'
    };

    const merchantData = await callKnotAPI('/merchant/list', 'POST', requestBody);

    // Transform the response to match our expected format
    const merchants = Array.isArray(merchantData) ? merchantData : [merchantData];

    res.json({
      merchants: merchants.map(merchant => ({
        id: merchant.id,
        name: merchant.name,
        category: merchant.category,
        logo: merchant.logo,
        min_sdk_version: merchant.min_sdk_version,
        connected: false // Default to not connected, would need separate API call to check
      })),
      totalConnected: 0, // Would need to fetch user's connected accounts separately
      source: 'Knot API'
    });

    console.log(`Successfully fetched ${merchants.length} merchants from Knot API`);

  } catch (error) {
    console.error('Error getting merchants:', error.message);
    res.status(500).json({
      error: 'Failed to load merchant data from Knot API.',
      details: error.message
    });
  }
});


/**
 * GET CONNECTED MERCHANTS
 * Returns the list of available merchants from Knot API
 */
app.post('/api/session', async (req, res) => {
  try {
    console.log('Creating session...');
    console.log('Request body:', req.body);

    // Call Knot API to create a session
    const requestBody = {
      type: 'transaction_link',
      external_user_id: req.body.external_user_id || `user_${Date.now()}`,
    };

    console.log('Sending to Knot API:', requestBody);
    const sessionData = await callKnotAPI('/session/create', 'POST', requestBody);
    console.log('Session created:', sessionData);

    return res.json(sessionData);

  } catch (error) {
    console.error('Error creating session:', error.message);
    res.status(500).json({ error: 'Failed to create session.' });
  }
});

/**
 * GET TRANSACTIONS
 * Fetches transaction data from Knot API for a specific user and merchant
 */
app.post('/api/transactions/sync', async (req, res) => {
  try {
    console.log('Syncing transactions...');
    console.log('Request body:', req.body);

    const { external_user_id, merchant_id, cursor, limit = 100 } = req.body;

    if (!external_user_id || !merchant_id) {
      return res.status(400).json({ 
        error: 'Missing required parameters: external_user_id and merchant_id are required' 
      });
    }

    // Call Knot API to sync transactions
    const requestBody = {
      merchant_id,
      external_user_id,
      cursor: cursor || undefined,
      limit,
    };

    console.log('Sending to Knot API:', requestBody);
    const transactionData = await callKnotAPI('/transactions/sync', 'POST', requestBody);
    console.log('Transactions synced:', transactionData);

    return res.json(transactionData);

  } catch (error) {
    console.error('Error syncing transactions:', error.message);
    res.status(500).json({ error: 'Failed to sync transactions.' });
  }
});

// Catch-all route for React app (must be after API routes)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Try to serve the React app
  const distIndexPath = path.join(__dirname, 'newfrontend', 'dist', 'index.html');
  const buildIndexPath = path.join(__dirname, 'newfrontend', 'build', 'index.html');
  const srcIndexPath = path.join(__dirname, 'newfrontend', 'src', 'index.html');

  if (require('fs').existsSync(distIndexPath)) {
    res.sendFile(distIndexPath);
  } else if (require('fs').existsSync(buildIndexPath)) {
    res.sendFile(buildIndexPath);
  } else if (require('fs').existsSync(srcIndexPath)) {
    res.sendFile(srcIndexPath);
  } else {
    res.status(404).send('Frontend not found. Please build the React app first.');
  }
});

// --- Start Server ---
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Ready to calculate credit scores using comprehensive bank data.');
    console.log(`Test endpoint: http://localhost:${PORT}/api/get-credit-score`);
  });
}

// Export for Vercel serverless
export default app;


// --- Business Logic Functions ---

/**
 * Computes a comprehensive credit score based on:
 * - Transaction history (merchant purchases)
 * - Bill payment history and obligations
 * - Deposit history (income indicators)
 * - Loan/debt obligations
 * - Current account balance
 * 
 * More generous scoring that rewards transaction history and forgives debt.
 * 
 * @param {Array} transactions - Merchant purchase transactions
 * @param {number} currentBalance - Current account balance
 * @param {Array} bills - Bill payment data
 * @param {Array} deposits - Deposit/income data
 * @param {Array} loans - Loan/debt data
 * @returns {number} A score between 300 and 850
 */
function calculateCreditScore(transactions, currentBalance, bills = [], deposits = [], loans = []) {
  if (!transactions || transactions.length === 0) return 300;

  // 1. TRANSACTION SPENDING ANALYSIS (30% weight)
  const monthly = aggregateMonthly(transactions);
  const avgMonthlySpend = monthly.avg;
  const spendVolatility = monthly.volatility;
  const freqPerMonth = monthly.avgCount;
  const maxSingle = monthly.maxSingle;

  // Moderate scoring - reward activity but don't over-reward
  const spendActivityScore = clamp(avgMonthlySpend / 1500, 0, 1); // Cap at $1500/mo
  const volatilityPenalty = spendVolatility > 0.5 ? 0.7 : spendVolatility > 0.3 ? 0.85 : 1.0;
  const spendScore = spendActivityScore * volatilityPenalty;

  // 2. INCOME ANALYSIS from deposits (25% weight)
  const totalDeposits = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const avgMonthlyIncome = totalDeposits / Math.max(1, deposits.length);
  const depositConsistency = deposits.length >= 3 ? 0.9 : deposits.length >= 2 ? 0.7 : 0.5;

  // Realistic income scoring
  const incomeBoost = avgMonthlyIncome > 0 ? clamp(avgMonthlyIncome / 800, 0, 0.8) : 0.2;
  const incomeScore = incomeBoost * 0.5 + depositConsistency * 0.5;

  // 3. BILL PAYMENT RELIABILITY (20% weight)
  const totalBills = bills.length;
  const pendingBills = bills.filter(b => b.status === 'pending').length;
  const paidBills = bills.filter(b => b.status === 'completed' || b.status === 'paid').length;

  // Realistic bill scoring - pending bills do matter
  const billPaymentRatio = totalBills > 0 ? paidBills / totalBills : 0.6; // Default to 0.6 if no data
  const pendingBillPenalty = pendingBills > 4 ? 0.7 : pendingBills > 2 ? 0.85 : 1.0;
  const billScore = billPaymentRatio * pendingBillPenalty;

  // 4. DEBT BURDEN (15% weight)
  const totalLoanPayments = loans.reduce((sum, l) => sum + Number(l.payment_amount || 0), 0);
  const totalBillPayments = bills.reduce((sum, b) => sum + Number(b.payment_amount || 0), 0);
  const monthlyDebtObligation = totalLoanPayments + totalBillPayments;

  // Realistic debt scoring - high debt is concerning
  const debtScore = monthlyDebtObligation < 1000 ? 0.9 :
    monthlyDebtObligation < 2000 ? 0.7 :
      monthlyDebtObligation < 3500 ? 0.5 : 0.3;

  // 5. BALANCE CHECK (10% weight)
  const balanceScore = currentBalance > 500 ? clamp(currentBalance / 1500, 0, 0.8) :
    currentBalance > 200 ? 0.5 : 0.3;

  // WEIGHTED COMPOSITE SCORE
  const compositeScore =
    spendScore * 0.30 +
    incomeScore * 0.25 +
    billScore * 0.20 +
    debtScore * 0.15 +
    balanceScore * 0.10;

  // Map to 500-800 range (more realistic)
  const baseScore = 500 + compositeScore * 300;

  // Moderate bonuses (reduced from before)
  let bonuses = 0;
  if (transactions.length >= 5) bonuses += 15; // Reward significant history
  if (currentBalance > 800) bonuses += 12;
  if (deposits.length >= 3) bonuses += 10;
  if (avgMonthlySpend > 800 && spendVolatility < 0.4) bonuses += 8; // Reward stable high spending

  // Penalties for concerning factors
  let penalties = 0;
  if (pendingBills > 5) penalties += 20;
  if (monthlyDebtObligation > 3000) penalties += 15;
  if (avgMonthlyIncome > 0 && monthlyDebtObligation > avgMonthlyIncome * 2) penalties += 25;

  const finalScore = Math.min(Math.max(Math.round(baseScore + bonuses - penalties), 500), 800);

  return finalScore;
}

/**
 * Determines maximum lending amount and terms based on comprehensive financial profile.
 * FLUID ALGORITHM - loan amount directly proportional to credit score.
 * Score 500-550: ~$2500, Score 650-750: ~$4000-6000, Score 700+: ~$7000+
 */
function getLendingOffer(transactions, currentBalance, overdueDebt = 0, deposits = [], bills = []) {
  // First calculate the credit score to use as basis
  const creditScore = calculateCreditScore(transactions, currentBalance, bills, deposits, []);

  const monthly = aggregateMonthly(transactions);
  const avgMonthlySpend = monthly.avg;
  const vol = monthly.volatility;

  // Calculate income metrics
  const totalDeposits = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const avgMonthlyIncome = totalDeposits / Math.max(1, deposits.length);
  const totalBillPayments = bills.reduce((sum, b) => sum + Number(b.payment_amount || 0), 0);

  // FLUID LOAN AMOUNT CALCULATION
  // Map credit score (500-800) to loan amount ($2000-$8000)
  // Formula: Linear interpolation with floor at 500 and cap at 800
  const scoreNormalized = clamp((creditScore - 500) / 300, 0, 1); // 0 at 500, 1 at 800

  // Base loan amount: $2000 at score 500, up to $8000 at score 800
  const baseLoanAmount = 2000 + (scoreNormalized * 6000);

  // Apply spending multiplier (reward active spenders)
  const spendingMultiplier = clamp(avgMonthlySpend / 1200, 0.9, 1.2); // 0.9x to 1.2x

  // Apply balance multiplier (reward higher balances)
  const balanceMultiplier = currentBalance > 1000 ? 1.15 :
    currentBalance > 500 ? 1.08 :
      currentBalance > 300 ? 1.02 : 1.0;

  // Calculate final max amount
  let maxAmount = baseLoanAmount * spendingMultiplier * balanceMultiplier;

  // Subtract overdue debt (but don't be too harsh)
  maxAmount = Math.max(0, maxAmount - (overdueDebt * 0.4)); // 40% penalty for debt

  // Round to nearest 100
  maxAmount = Math.round(maxAmount / 100) * 100;

  // FLUID TERM CALCULATION (4-12 months based on score)
  // Higher score = longer terms available
  let termMonths;
  if (creditScore >= 750) {
    termMonths = 12;
  } else if (creditScore >= 700) {
    termMonths = 10;
  } else if (creditScore >= 650) {
    termMonths = 9;
  } else if (creditScore >= 600) {
    termMonths = 7;
  } else if (creditScore >= 550) {
    termMonths = 6;
  } else {
    termMonths = 4;
  }

  // Adjust term for volatility
  if (vol > 0.8) termMonths = Math.max(4, termMonths - 2);

  // Calculate monthly payment
  const recommendedMonthlyPayment = roundToTwo(maxAmount / termMonths);

  // FLUID INTEREST RATE (5% - 18% based on score)
  // Score 800: 5%, Score 500: 18%
  const interestRatePct = roundToOne(18 - (scoreNormalized * 13));

  // APPROVAL DECISION
  // Approve if: score >= 500 AND maxAmount >= 1500 (after debt penalty)
  const approved = creditScore >= 500 && maxAmount >= 1500;

  const offer = approved
    ? {
      status: 'Approved',
      maxAmount: Math.round(maxAmount),
      interestRate: `${interestRatePct}% APR`,
      message: `WingsPay approved! You qualify for up to $${Math.round(maxAmount).toLocaleString()}.`,
      termMonths,
      recommendedMonthlyPayment,
    }
    : {
      status: 'Declined',
      maxAmount: 0,
      interestRate: 'N/A',
      message: creditScore < 500
        ? 'Credit score below minimum threshold. Build transaction history and try again.'
        : 'Unable to approve at this time. Please reduce outstanding debt.',
      termMonths: 0,
      recommendedMonthlyPayment: 0,
    };

  return {
    ...offer,
    metrics: {
      creditScore,
      avgMonthlySpend: roundToTwo(avgMonthlySpend),
      avgMonthlyIncome: roundToTwo(avgMonthlyIncome),
      monthlyDebtObligation: roundToTwo(totalBillPayments),
      volatility: roundToThree(vol),
      purchaseFreqPerMonth: roundToTwo(monthly.avgCount),
      maxSinglePurchase: roundToTwo(monthly.maxSingle),
      overdueDebt,
      currentBalance,
      depositCount: deposits.length,
      billCount: bills.length,
      scoreNormalized: roundToThree(scoreNormalized),
      spendingMultiplier: roundToTwo(spendingMultiplier),
      balanceMultiplier: roundToTwo(balanceMultiplier)
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