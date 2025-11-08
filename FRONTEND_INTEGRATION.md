# Frontend Integration Guide - WingsPay

## Overview
The new credit scoring algorithm is now integrated with the frontend. This guide explains how to use the system and how the components work together.

## System Architecture

```
┌─────────────────────┐
│   Frontend (HTML)   │
│  - amazon-checkout  │
│  - test-backend     │
└──────────┬──────────┘
           │ HTTP Requests
           │ (fetch API)
           ▼
┌─────────────────────┐
│  Backend (Node.js)  │
│   Express Server    │
│   Port 3000         │
└──────────┬──────────┘
           │ Read JSON Files
           ▼
┌─────────────────────┐
│   Data Sources      │
│  - dummydata.json   │ (transactions)
│  - dummybill.json   │ (bills)
│  - dummydeposit.json│ (deposits)
│  - dummyloan.json   │ (loans)
└─────────────────────┘
```

## Quick Start

### 1. Start the Backend Server

```powershell
# Navigate to project directory
cd C:\Users\leowh\Desktop\Desktop\hackprinceton2025

# Start the server
npm start
```

**Expected output:**
```
Server running at http://localhost:3000
Ready to calculate credit scores using comprehensive bank data.
Test endpoint: http://localhost:3000/api/get-credit-score
```

### 2. Access the Frontend

You have **THREE** ways to test the integration:

#### Option A: Test Backend Page (Recommended for Testing)
**URL:** http://localhost:3000/test-backend.html

This page provides:
- ✅ Simple "Fetch Credit Score" button
- ✅ Real-time display of credit score (should be 650-750)
- ✅ Loan details (amount, term, interest rate)
- ✅ Financial metrics breakdown
- ✅ Raw JSON response viewer

**How to use:**
1. Open http://localhost:3000/test-backend.html in your browser
2. Click "Fetch Credit Score from Backend"
3. Verify the credit score is in the 650-750 range
4. Check that loan amount is approximately $2500-$4000

#### Option B: Full Amazon Checkout Flow
**URL:** http://localhost:3000/src/amazon-checkout.html

This is the full demo with:
- ✅ Amazon-style checkout page
- ✅ WingsPay payment option
- ✅ API linking modal (simulated)
- ✅ Payment plan selection
- ✅ Order completion

**How to use:**
1. Open http://localhost:3000/src/amazon-checkout.html
2. Click on "WingsPay" payment button
3. The system automatically fetches credit score from backend
4. If approved, you'll see the API linking modal
5. Link 2+ accounts to continue
6. Choose a payment plan
7. Complete the order

#### Option C: Merchant Selection Hub
**URL:** http://localhost:3000/src/merchant-selection.html

Full demo starting from merchant selection page.

## API Endpoint

### GET /api/get-credit-score

**Request:**
```javascript
fetch('http://localhost:3000/api/get-credit-score')
```

**Response Structure:**
```json
{
  "creditScore": 683,
  "lendingOffer": {
    "status": "Approved",
    "maxAmount": 3847,
    "interestRate": "12.3% APR",
    "message": "FlexPay approved! You qualify for up to $3,847.",
    "termMonths": 9,
    "recommendedMonthlyPayment": 427.44,
    "metrics": {
      "creditScore": 683,
      "avgMonthlySpend": 947.60,
      "avgMonthlyIncome": 195.00,
      "monthlyDebtObligation": 1650.00,
      "volatility": 0.234,
      "purchaseFreqPerMonth": 1.00,
      "maxSinglePurchase": 1399.99,
      "overdueDebt": 3300,
      "currentBalance": 1950.00,
      "depositCount": 4,
      "billCount": 6,
      "scoreNormalized": 0.610,
      "spendingMultiplier": 0.95,
      "balanceMultiplier": 1.15
    }
  },
  "analysis": {
    "accountBalance": 1950.00,
    "totalTransactionsAnalyzed": 5,
    "totalBillsOwed": 1650.00,
    "totalLoansOwed": 1650.00,
    "totalOverdueDebt": 3300.00,
    "monthlyDeposits": 4,
    "totalDepositAmount": 780.00,
    "source": "Comprehensive bank data (transactions, bills, deposits, loans)"
  }
}
```

## Credit Scoring Algorithm (v3 - Current)

### Score Range: 500-800 (Realistic Range)
- **Target:** 650-750 (good credit)
- **Minimum for approval:** 500
- **Maximum achievable:** 800

### Weighted Scoring Components:

1. **Transaction Spending (30% weight)**
   - Activity level (avg monthly spend vs $1500 cap)
   - Volatility penalty for inconsistent spending
   - Rewards: Stable, moderate spending patterns

2. **Income Analysis (25% weight)**
   - Average monthly income from deposits
   - Deposit consistency (3+ deposits = best)
   - Realistic income-to-credit mapping

3. **Bill Payment Reliability (20% weight)**
   - Payment ratio (paid vs total bills)
   - Pending bill penalty (4+ pending = concern)
   - Rewards consistent bill payment

4. **Debt Burden (15% weight)**
   - Monthly debt obligations (bills + loans)
   - High debt (>$3000) reduces score
   - Debt-to-income ratio matters

5. **Account Balance (10% weight)**
   - Current balance vs thresholds
   - $500+ = good, $1500+ = excellent
   - But not over-weighted

### Bonuses (Moderate):
- +15 points: 5+ transaction history
- +12 points: Balance > $800
- +10 points: 3+ deposits
- +8 points: Stable high spending

### Penalties (Realistic):
- -20 points: >5 pending bills
- -15 points: >$3000 debt
- -25 points: High debt-to-income ratio

## Loan Calculation (Fluid Algorithm)

### Formula:
```
scoreNormalized = (creditScore - 500) / 300  // 0 to 1
baseLoanAmount = $2000 + (scoreNormalized × $6000)
finalAmount = baseLoanAmount × spendingMultiplier × balanceMultiplier - (debt × 0.4)
```

### Score-to-Loan Mapping:
- **500 (minimum):** ~$2,000 loan
- **550:** ~$3,000 loan
- **600:** ~$4,000 loan
- **650:** ~$5,000 loan (target for demo)
- **700:** ~$6,000 loan
- **750:** ~$7,000 loan (target for demo)
- **800 (maximum):** ~$8,000 loan

### Term Lengths:
- 750+ score: 12 months
- 700+ score: 10 months
- 650+ score: 9 months
- 600+ score: 7 months
- 550+ score: 6 months
- 500+ score: 4 months

### Interest Rates:
- Linear mapping: 18% APR at 500 → 5% APR at 800
- Formula: `18 - (scoreNormalized × 13)`

### Approval Criteria:
1. Credit score ≥ 500
2. Final loan amount ≥ $1,500 (after debt penalties)

## Frontend Integration Code

### In amazon-checkout.js (Lines 52-85):

```javascript
// Backend API Configuration
const BACKEND_API_URL = 'http://localhost:3000';

// Fetch credit score and lending offer from backend
async function fetchCreditScore() {
    try {
        const response = await fetch(`${BACKEND_API_URL}/api/get-credit-score`);
        if (!response.ok) {
            console.error('Failed to fetch credit score:', response.statusText);
            return null;
        }
        const data = await response.json();
        console.log('Credit Score Data:', data);
        
        // Update payment plans based on backend offer
        if (data.lendingOffer && data.lendingOffer.status === 'Approved') {
            const maxAmount = data.lendingOffer.maxAmount;
            const termMonths = data.lendingOffer.termMonths;
            const monthlyPayment = data.lendingOffer.recommendedMonthlyPayment;
            const interestRate = data.lendingOffer.interestRate;
            
            // Update the payment plans with real data
            PAYMENT_PLANS = [
                { 
                    months: Math.min(4, termMonths), 
                    rate: parseFloat(interestRate), 
                    monthly: maxAmount / Math.min(4, termMonths) 
                },
                { 
                    months: Math.min(Math.ceil(termMonths * 0.7), termMonths), 
                    rate: parseFloat(interestRate) * 0.7, 
                    monthly: maxAmount / Math.min(Math.ceil(termMonths * 0.7), termMonths)
                },
                { 
                    months: termMonths, 
                    rate: parseFloat(interestRate), 
                    monthly: monthlyPayment 
                }
            ];
            
            return data;
        } else {
            console.log('Credit not approved:', data.lendingOffer?.message);
            return data;
        }
    } catch (error) {
        console.error('Error fetching credit score:', error);
        return null;
    }
}
```

### Payment Selection Handler (Lines 592-609):

```javascript
async function handlePaymentSelect() {
    // Fetch credit score from backend before showing API linking
    console.log('Fetching credit score from backend...');
    const creditData = await fetchCreditScore();
    
    if (creditData) {
        console.log('Credit Score:', creditData.creditScore);
        console.log('Lending Offer:', creditData.lendingOffer);
        
        if (creditData.lendingOffer && creditData.lendingOffer.status === 'Declined') {
            alert(`Sorry, FlexPay not available at this time.\n\n${creditData.lendingOffer.message}\n\nCredit Score: ${creditData.creditScore}`);
            return;
        }
    }
    
    // Show API linking modal
    showModal('apiLinking');
}
```

## Testing Checklist

### ✅ Backend Tests:
1. Server starts without errors
2. GET /api/get-credit-score returns 200 OK
3. Credit score is in 650-750 range
4. Loan amount is approximately $2500-$4000
5. Status is "Approved" for dummy data

### ✅ Frontend Tests:
1. test-backend.html loads correctly
2. "Fetch Credit Score" button works
3. Credit score displays (650-750)
4. Loan details populate correctly
5. Raw JSON response is visible

### ✅ Full Flow Tests:
1. amazon-checkout.html loads
2. Clicking WingsPay triggers API call
3. If approved, API linking modal appears
4. Payment plans update with real data
5. Order can be completed

## Expected Results with Dummy Data

Based on the current dummy data files:

- **Transactions:** 5 Amazon purchases (~$4,738 total)
- **Bills:** 6 bills ($1,650 total, some pending)
- **Deposits:** 4 deposits ($780 total)
- **Loans:** 6 loan payments ($1,650 total)

**Expected Output:**
- Credit Score: **~680-700** (good credit range)
- Loan Amount: **~$3,500-$4,500**
- Term: **9 months**
- Interest Rate: **~12% APR**
- Monthly Payment: **~$400-500**
- Status: **Approved** ✅

## Troubleshooting

### Server won't start
```powershell
# Kill any existing Node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Start fresh
npm start
```

### Frontend can't connect to backend
1. Verify server is running on port 3000
2. Check browser console for CORS errors
3. Ensure BACKEND_API_URL is set to 'http://localhost:3000'
4. Try opening test-backend.html first

### Credit score too high/low
1. Check dummy data files (dummydata.json, etc.)
2. Review calculateCreditScore() function in server.js
3. Adjust weights/bonuses/penalties as needed
4. Restart server after changes

### CORS errors
The server already has CORS enabled:
```javascript
app.use(cors()); // Enable Cross-Origin Resource Sharing
```

## File Structure

```
hackprinceton2025/
├── server.js                    # Backend server with credit algorithm
├── package.json                 # Node.js dependencies
├── dummydata.json              # Transaction data
├── dummybill.json              # Bill payment data
├── dummydeposit.json           # Deposit/income data
├── dummyloan.json              # Loan/debt data
├── newfrontend/
│   ├── test-backend.html       # Testing page (NEW!)
│   └── src/
│       ├── amazon-checkout.html    # Full checkout page
│       ├── amazon-checkout.js      # Checkout logic + API calls
│       ├── merchant-selection.html # Merchant hub
│       └── index.html              # Landing page
├── FRONTEND_INTEGRATION.md     # This file
├── CREDIT_ALGORITHM.md         # Algorithm documentation
└── README.md                   # Project overview
```

## Next Steps

1. **Test the System:**
   - Open http://localhost:3000/test-backend.html
   - Click "Fetch Credit Score from Backend"
   - Verify credit score is 650-750 range

2. **Try Full Flow:**
   - Open http://localhost:3000/src/amazon-checkout.html
   - Click "WingsPay" payment option
   - Complete the checkout flow

3. **Customize Data:**
   - Modify dummy*.json files to test different scenarios
   - Restart server to see changes

4. **Fine-tune Algorithm:**
   - Edit calculateCreditScore() in server.js
   - Adjust weights, bonuses, penalties
   - Test until desired score range achieved

## Support

If you encounter issues:
1. Check that all dummy*.json files exist
2. Verify Node.js is installed (node --version)
3. Ensure port 3000 is not in use
4. Review browser console for JavaScript errors
5. Check server terminal for backend errors

---

**Status:** ✅ Backend and frontend are fully integrated and ready to use!
**Algorithm Version:** v3 (Realistic 500-800 range, targeting 650-750)
**Last Updated:** November 2025
