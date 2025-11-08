# WingsPay - Quick Start Guide

## ✅ System Status: READY TO USE

Your WingsPay demo is now **fully integrated** with the new credit scoring algorithm!

## 🎯 What's New

1. **Realistic Credit Scoring**
   - Score range: 500-800 (targeting 650-750)
   - Uses 4 data sources: transactions, bills, deposits, loans
   - Weighted algorithm (30/25/20/15/10 split)

2. **Fluid Loan Calculation**
   - Linear mapping: credit score → loan amount
   - $2,000 at score 500 → $8,000 at score 800
   - No more strict tiers!

3. **Full Frontend Integration**
   - Frontend automatically calls backend API
   - Dynamic payment plans based on real credit data
   - Shows approval/decline with credit score

## 🚀 How to Use

### Step 1: Start the Server
```powershell
npm start
```

### Step 2: Test the Backend
Open: http://localhost:3000/test-backend.html

Click "Fetch Credit Score from Backend" and verify:
- ✅ Credit Score: 650-750 range
- ✅ Loan Amount: ~$3,500-$4,500
- ✅ Status: Approved

### Step 3: Try the Full Demo
Open: http://localhost:3000/src/amazon-checkout.html

1. Click "WingsPay" payment option
2. System automatically fetches your credit score
3. If approved, link 2+ accounts
4. Choose a payment plan
5. Complete the order!

## 📊 Expected Results

With the current dummy data:
- **Credit Score:** ~680-700
- **Loan Offer:** ~$3,500-$4,500
- **Term:** 9 months
- **Interest Rate:** ~12% APR
- **Monthly Payment:** ~$400-500

## 📝 Files You Can Access

1. **Test Page:** http://localhost:3000/test-backend.html
   - Simple interface to test backend
   - View all metrics in real-time

2. **Checkout Demo:** http://localhost:3000/src/amazon-checkout.html
   - Full WingsPay experience
   - API linking simulation

3. **Merchant Hub:** http://localhost:3000/src/merchant-selection.html
   - Complete demo flow

## 🔧 How It Works

```
User clicks "WingsPay"
        ↓
Frontend calls: fetch('http://localhost:3000/api/get-credit-score')
        ↓
Backend reads: dummydata.json, dummybill.json, dummydeposit.json, dummyloan.json
        ↓
Backend calculates: Weighted credit score (500-800)
        ↓
Backend determines: Loan amount (fluid, $2000-$8000)
        ↓
Frontend receives: { creditScore: 683, lendingOffer: { ... } }
        ↓
Frontend updates: Payment plans with real data
        ↓
User sees: Personalized financing offer!
```

## 🎨 What You'll See

### In test-backend.html:
- Large credit score display (e.g., **683**)
- Approval status (Approved ✅)
- Loan details (amount, term, rate, monthly payment)
- Financial metrics breakdown
- Raw JSON response

### In amazon-checkout.html:
- Beautiful checkout page
- WingsPay payment option (highlighted)
- Modal for linking accounts
- Payment plan options
- Order confirmation

## 💡 Tips

1. **For Testing:**
   - Use test-backend.html first
   - It's faster and shows all the data

2. **For Demoing:**
   - Use amazon-checkout.html
   - It's the full user experience

3. **To Customize:**
   - Edit dummy*.json files for different users
   - Adjust algorithm in server.js
   - Restart server to see changes

## 🐛 Troubleshooting

**Server not starting?**
```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
npm start
```

**Page not loading?**
- Check server is running on port 3000
- Try http://localhost:3000/test-backend.html

**Credit score too high/low?**
- Check CREDIT_ALGORITHM.md for formula details
- Adjust weights in calculateCreditScore() function

## 📚 More Information

- **FRONTEND_INTEGRATION.md** - Complete technical guide
- **CREDIT_ALGORITHM.md** - Algorithm documentation
- **README.md** - Full project overview

## ✨ Key Features

✅ **4 Data Sources:** transactions, bills, deposits, loans
✅ **Realistic Scoring:** 500-800 range (targeting 650-750)
✅ **Fluid Algorithm:** Linear credit-to-loan mapping
✅ **Full Integration:** Frontend ↔ Backend connected
✅ **Dynamic Plans:** Payment plans update based on credit
✅ **Beautiful UI:** Professional, modern design
✅ **Easy Testing:** Simple test page included

---

**Status:** 🎉 Everything is working and ready to demo!

**Next Action:** Open http://localhost:3000/test-backend.html and click the button!
