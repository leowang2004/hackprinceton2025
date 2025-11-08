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
        description: `${order.order_status || 'ORDER'} ${order.id}`
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
    // --- END SIMULATION ---


    // 3. Process Data (This logic is the same as before)
    const primaryAccount = accounts.find(a => a.subtype === 'checking') || accounts[0];
    const currentBalance = primaryAccount.balance.current;
    
    // 4. Calculate Score
    const score = calculateCreditScore(transactions, currentBalance);

    // 5. Determine Lending Amount
    const lendingOffer = getLendingAmount(score);

    // 6. Return the result
    res.json({
      creditScore: score,
      lendingOffer,
      analysis: {
        accountName: primaryAccount.name,
        currentBalance,
        totalTransactionsAnalyzed: transactions.length,
        source: 'dummydata.json (simulation)',
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
  let score = 300; // FICO-like base score
  let totalIncome = 0;
  let totalSpending = 0;
  let overdrafts = 0;

  for (const t of transactions) {
    const amt = Number(t.amount) || 0;
    if (amt < 0) totalIncome += Math.abs(amt); else totalSpending += amt;

    const desc = (t.description || '').toLowerCase();
    if (desc.includes('overdraft') || desc.includes('nsf')) overdrafts++;
  }

  const netFlow = totalIncome - totalSpending;
  if (netFlow > 0) score += 150;
  if (netFlow > totalIncome * 0.1) score += 50;

  if (currentBalance > 1000) score += 50;
  if (currentBalance > 5000) score += 75;

  if (overdrafts === 0) score += 100; else score -= overdrafts * 50;

  if (transactions.length > 50) score += 25;

  return Math.min(Math.max(score, 300), 850);
}

/**
 * Determines a maximum lending amount based on the computed score.
 * * @param {number} score - The custom credit score.
 * @returns {object} An object describing the lending offer.
 */
function getLendingAmount(score) {
  if (score >= 750) {
    return {
      status: 'Approved',
      maxAmount: 25000,
      interestRate: '5.0%',
      message: 'Excellent! You qualify for our best rates.'
    };
  } else if (score >= 650) {
    return {
      status: 'Approved',
      maxAmount: 10000,
      interestRate: '9.5%',
      message: 'Good. You qualify for a standard loan.'
    };
  } else if (score >= 550) {
    return {
      status: 'Approved',
      maxAmount: 2000,
      interestRate: '18.0%',
      message: 'You qualify for a small starter loan.'
    };
  } else {
    return {
      status: 'Declined',
      maxAmount: 0,
      interestRate: 'N/A',
      message: 'Unfortunately, we cannot offer you a loan at this time.'
    };
  }
}