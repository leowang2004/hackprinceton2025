# WingsPay - Intelligent Financing Demo

A complete BNPL (Buy Now Pay Later) demo system with intelligent credit scoring and flexible payment plans.

## 🚀 Quick Start

### 1. Start the Backend Server
```powershell
npm start
```

**Server runs on:** http://localhost:3000

### 2. Access the Frontend

Choose one of these options:

#### Option A: Test Backend (Recommended First)
**URL:** http://localhost:3000/test-backend.html
- Simple testing interface
- View credit score calculation in real-time
- See all financial metrics
- Perfect for verifying the algorithm

#### Option B: Full Amazon Checkout Demo
**URL:** http://localhost:3000/src/amazon-checkout.html
- Complete checkout experience
- WingsPay integration
- API linking simulation
- Payment plan selection

#### Option C: Merchant Selection Hub
**URL:** http://localhost:3000/src/merchant-selection.html
- Full demo from merchant selection
- Multiple merchant options
- Complete user flow

## 📊 System Overview

This project demonstrates:
- ✅ Comprehensive credit scoring using 4 data sources
- ✅ Intelligent loan calculations (fluid algorithm)
- ✅ Realistic credit scores (500-800 range, targeting 650-750)
- ✅ Dynamic payment plans based on creditworthiness
- ✅ Full frontend-backend integration
- ✅ Beautiful, modern UI with Tailwind CSS

## 📁 Project Structure

```
hackprinceton2025/
├── server.js                    # Backend with credit scoring algorithm
├── dummydata.json              # Transaction data (5 purchases)
├── dummybill.json              # Bill payment data (6 bills)
├── dummydeposit.json           # Income/deposit data (4 deposits)
├── dummyloan.json              # Loan/debt data (6 loans)
├── newfrontend/
│   ├── test-backend.html       # Testing interface
│   └── src/
│       ├── amazon-checkout.html    # Full checkout page
│       ├── amazon-checkout.js      # Checkout logic + API calls
│       └── merchant-selection.html # Merchant hub
├── FRONTEND_INTEGRATION.md     # Complete integration guide
├── CREDIT_ALGORITHM.md         # Algorithm documentation
└── README.md                   # This file
```

## 🧮 Credit Scoring Algorithm

**Version:** v3 (Realistic Range)
**Score Range:** 500-800
**Target:** 650-750 (good credit)

### Weighted Components:
- **30%** - Transaction Spending Analysis
- **25%** - Income from Deposits
- **20%** - Bill Payment Reliability
- **15%** - Debt Burden
- **10%** - Account Balance

### Loan Calculation (Fluid):
- **Score 500:** ~$2,000 loan
- **Score 650:** ~$5,000 loan (target)
- **Score 750:** ~$7,000 loan (target)
- **Score 800:** ~$8,000 loan

## 🎯 Expected Results (with dummy data)

Based on current dummy data files:
- **Credit Score:** ~680-700 ✅
- **Loan Amount:** ~$3,500-$4,500
- **Term:** 9 months
- **Interest Rate:** ~12% APR
- **Status:** Approved

## 📖 Documentation

- **[FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)** - Complete guide to using the system
- **[CREDIT_ALGORITHM.md](./CREDIT_ALGORITHM.md)** - Detailed algorithm documentation
- **[APP_FLOW.md](./APP_FLOW.md)** - Application flow diagram
- **[KNOT_INTEGRATION.md](./KNOT_INTEGRATION.md)** - Knot API integration guide

## 🛠 Technologies

- **Backend:** Node.js, Express
- **Frontend:** Vanilla JavaScript, Tailwind CSS
- **Data:** JSON files (simulated bank data)
- **API:** RESTful endpoints

## 🔧 Troubleshooting

### Server won't start?
```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
npm start
```

### Can't see updates?
- Restart the server after changing server.js
- Hard refresh browser (Ctrl+Shift+R) after changing frontend files

### Credit score not in expected range?
- Check dummy*.json files
- Review CREDIT_ALGORITHM.md
- Adjust weights in calculateCreditScore() function

## 🎉 Demo Highlights

1. **Comprehensive Financial Analysis**
   - Transactions, bills, deposits, and loans all considered
   - Realistic credit scoring (not too strict, not too generous)

2. **Fluid Loan Algorithm**
   - Linear score-to-loan mapping (not tiered)
   - Proportional to creditworthiness

3. **Beautiful UI**
   - Amazon-style checkout
   - Smooth animations
   - Responsive design

4. **Full Integration**
   - Frontend calls backend API
   - Dynamic payment plans
   - Real-time credit decisions

## 🚀 Next Steps

1. **Test the backend:**
   - Open http://localhost:3000/test-backend.html
   - Click "Fetch Credit Score from Backend"

2. **Try the full flow:**
   - Open http://localhost:3000/src/amazon-checkout.html
   - Click "WingsPay" payment option

3. **Customize:**
   - Modify dummy*.json files for different scenarios
   - Adjust algorithm in server.js

---

**Status:** ✅ Fully functional and ready to demo!
**Created for:** HackPrinceton 2025
**Version:** 3.0 (Realistic Scoring)

npm start


You should see messages:

Server running at http://localhost:3000
Ready to calculate credit scores from dummydata.json.
Test endpoint: http://localhost:3000/api/get-credit-score


4. How to Use

Since the account linking frontend is not included in this version, you can test the logic directly using your browser or a tool like curl.

Option 1: In your browser
Simply visit: http://localhost:3000/api/get-credit-score

Option 2: In your terminal (using curl)

curl http://localhost:3000/api/get-credit-score


Example Output:

You will get a JSON response based on the logic in server.js and the data in dummydata.json.

(Based on the included dummy data, the user has one overdraft, so their score will be penalized).

{
  "creditScore": 625,
  "lendingOffer": {
    "status": "Approved",
    "maxAmount": 2000,
    "interestRate": "18.0%",
    "message": "You qualify for a small starter loan."
  },
  "analysis": {
    "accountName": "Main Checking",
    "currentBalance": 2500.77,
    "totalTransactionsAnalyzed": 10,
    "source": "dummydata.json (simulation)"
  }
}


Now you can modify dummydata.json and server.js to test all your different scoring scenarios!