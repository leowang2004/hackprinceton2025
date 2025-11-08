# Backend-Frontend Integration Guide

## Overview
This document explains how the frontend React app integrates with the backend Node.js server to calculate credit scores and approve/decline BNPL (Buy Now Pay Later) payment plans.

## Architecture

```
Frontend (React + TypeScript)
    ↓
API Service (services/api.ts)
    ↓
Backend Server (server.js)
    ↓
Dummy Data Files (JSON)
    ↓
Credit Score Calculation
    ↓
Lending Offer Decision
    ↓
Response to Frontend
```

## Backend Logic (server.js)

### Credit Score Calculation Algorithm
The backend calculates credit scores (500-800 range) based on:

1. **Transaction History (30% weight)**
   - Average monthly spending
   - Spending volatility
   - Purchase frequency
   - Maximum single purchase

2. **Income Analysis (25% weight)**
   - Total deposits from `dummydeposit.json`
   - Average monthly income
   - Deposit consistency

3. **Bill Payment Reliability (20% weight)**
   - Total bills from `dummybill.json`
   - Pending vs. paid bills ratio
   - Pending bill penalty

4. **Debt Burden (15% weight)**
   - Total loan payments from `dummyloan.json`
   - Total bill payments
   - Monthly debt obligation

5. **Balance Check (10% weight)**
   - Current account balance

### Approval/Decline Logic

**APPROVED if:**
- Credit score >= 500 AND
- Maximum loan amount >= $1500 (after debt penalty)

**DECLINED if:**
- Credit score < 500 OR
- Maximum loan amount < $1500

### Loan Amount Calculation (FLUID ALGORITHM)

**Formula:**
```
scoreNormalized = (creditScore - 500) / 300
baseLoanAmount = $2000 + (scoreNormalized × $6000)
spendingMultiplier = clamp(avgMonthlySpend / 1200, 0.9, 1.2)
balanceMultiplier = currentBalance > 1000 ? 1.15 : currentBalance > 500 ? 1.08 : currentBalance > 300 ? 1.02 : 1.0
maxAmount = baseLoanAmount × spendingMultiplier × balanceMultiplier - (overdueDebt × 0.4)
```

**Examples:**
- Score 500: ~$2000-2500 max loan
- Score 650: ~$4000-5000 max loan
- Score 750: ~$6000-7500 max loan
- Score 800: ~$7500-8000 max loan

### Term Length Calculation

Backend determines maximum term months based on credit score:
- Score >= 750: 12 months
- Score >= 700: 10 months
- Score >= 650: 9 months
- Score >= 600: 7 months
- Score >= 550: 6 months
- Score < 550: 4 months

### Interest Rate (Not Currently Used)
Backend calculates APR (5%-18%) but frontend offers 0% APR for all approved customers.

## Frontend Logic

### API Service (services/api.ts)

#### `fetchCreditScore()` Function
Calls `GET /api/get-credit-score` and returns:
```typescript
{
  creditScore: number,
  lendingOffer: {
    status: 'Approved' | 'Declined',
    maxAmount: number,
    interestRate: string,
    message: string,
    termMonths: number,
    recommendedMonthlyPayment: number
  },
  analysis: { /* detailed metrics */ }
}
```

#### `calculatePaymentPlans()` Function
**Critical Logic:**

1. Fetches credit data from backend
2. Checks approval status:
   ```typescript
   if (lendingOffer.status === 'Declined' || orderTotal > maxCreditLimit) {
     return { approved: false, declineReason: ... }
   }
   ```
3. If approved, generates 3 payment plans:
   - 4 payments (most popular)
   - 6 payments
   - Backend's max term (up to 12 months)
4. All plans are 0% APR for approved customers
5. Returns payment plans with monthly amounts

### ModernCheckout Component

**Flow:**
1. On mount, calls `calculatePaymentPlans(CART_TOTAL)`
2. If approved: Shows "4 interest-free payments of $X.XX"
3. If declined: Shows decline reason and credit info
4. Displays loading state during API call

**Key State:**
```typescript
{
  monthlyPayment: number,
  approved: boolean,
  loading: boolean,
  declineReason?: string,
  creditScore?: number,
  maxCredit?: number
}
```

### PaymentPlanSelection Component

**Flow:**
1. On mount, calls `calculatePaymentPlans(CART_TOTAL)`
2. If approved: Displays 3 payment plan options
3. If declined: Shows decline screen with:
   - Credit score
   - Maximum credit available
   - Decline reason
   - Cart total vs. max credit comparison
4. Displays loading screen during API call

**Decline Screen Logic:**
- Shows credit score and max credit limit
- If `orderTotal > maxCreditLimit`: Suggests reducing cart
- If `creditScore < 500`: Suggests building credit history

## Data Flow Example

### Scenario 1: APPROVED Order

**Backend Response:**
```json
{
  "creditScore": 720,
  "lendingOffer": {
    "status": "Approved",
    "maxAmount": 5500,
    "termMonths": 10,
    "message": "FlexPay approved! You qualify for up to $5,500."
  }
}
```

**Frontend Calculation:**
- Cart total: $839.16
- $839.16 < $5500 ✓ (within credit limit)
- Generate plans:
  - 4 payments: $209.79/payment
  - 6 payments: $139.86/payment
  - 10 payments: $83.92/payment (backend's max)

**UI Display:**
- ModernCheckout: "4 interest-free payments of $209.79"
- PaymentPlanSelection: Shows all 3 plans, credit score 720

### Scenario 2: DECLINED - Low Credit Score

**Backend Response:**
```json
{
  "creditScore": 480,
  "lendingOffer": {
    "status": "Declined",
    "maxAmount": 0,
    "message": "Credit score below minimum threshold."
  }
}
```

**Frontend Display:**
- ModernCheckout: Shows decline reason
- PaymentPlanSelection: Shows decline screen with score and suggestion to build credit

### Scenario 3: DECLINED - Cart Exceeds Credit

**Backend Response:**
```json
{
  "creditScore": 650,
  "lendingOffer": {
    "status": "Approved",
    "maxAmount": 600,
    "termMonths": 9
  }
}
```

**Frontend Calculation:**
- Cart total: $839.16
- $839.16 > $600 ✗ (exceeds credit limit)
- Return: `{ approved: false, declineReason: "Order total $839.16 exceeds your credit limit of $600.00" }`

**UI Display:**
- ModernCheckout: Shows decline message with credit info
- PaymentPlanSelection: Shows decline screen suggesting to reduce cart to $600

## Testing the Integration

### 1. Start Backend Server
```bash
cd C:\Users\leowh\Desktop\Desktop\hackprinceton2025
npm start
# or
node server.js
```

Verify: `http://localhost:3000/api/get-credit-score` returns JSON

### 2. Start Frontend Dev Server
```bash
cd newfrontend
npm run dev
```

Verify: Opens `http://localhost:5173`

### 3. Test Approval Flow
1. Navigate to checkout
2. Click "WingsPay" button
3. Should see loading state
4. If approved: See payment plans
5. Select plan → Complete order

### 4. Test Decline Scenarios

**Modify dummy data to simulate decline:**

Edit `dummydeposit.json` - reduce deposits to simulate low income
Edit `dummybill.json` - add many pending bills
Edit `dummyloan.json` - add high debt

Restart backend and test again.

### 5. Check Browser Console
Look for:
```
ModernCheckout: Loading payment data for cart total: 839.16
ModernCheckout: Backend result: { approved: true, creditScore: 720, ... }
PaymentPlanSelection: Fetching plans for cart total: 839.16
PaymentPlanSelection: Backend result: { approved: true, plans: [...] }
```

### 6. Check Network Tab
Verify API call:
- URL: `http://localhost:3000/api/get-credit-score`
- Method: GET
- Status: 200
- Response: JSON with creditScore and lendingOffer

## Key Integration Points

✅ **NO HARDCODED VALUES:** All calculations come from backend
✅ **Proper Error Handling:** Frontend handles null responses and API errors
✅ **Clear Approval Logic:** Frontend checks both status and credit limit
✅ **Informative Declines:** Shows specific reasons and credit info
✅ **Real-time Calculation:** Fetches fresh data on every page load
✅ **Consistent Cart Total:** $839.16 used throughout (can be made dynamic later)

## Future Enhancements

1. **Dynamic Cart Total:** Pass actual cart data from ShoppingCart component
2. **User Authentication:** Link credit scores to specific user accounts
3. **Live Knot API:** Replace dummy data with real bank data via Knot API
4. **Credit Building:** Track payment history to improve scores
5. **Multiple Cards:** Support different cards with different credit limits
6. **Real-time Updates:** WebSocket for instant credit score updates

## Common Issues

### Issue: Frontend shows "Credit check required" but backend approved
**Cause:** Frontend not receiving response
**Fix:** Check CORS settings, verify API endpoint URL

### Issue: All orders declined
**Cause:** Dummy data too pessimistic or cart exceeds limit
**Fix:** Review dummy JSON files, ensure reasonable data

### Issue: TypeScript errors in api.ts
**Cause:** Missing type definitions
**Fix:** Ensure `vite-env.d.ts` exists with ImportMetaEnv interface

### Issue: Backend returns 500 error
**Cause:** Missing dummy data files
**Fix:** Verify all JSON files exist (dummydata.json, dummybill.json, etc.)

## Summary

The integration is **FULLY BACKEND-DRIVEN**:
- Backend analyzes comprehensive financial data
- Backend calculates credit score (500-800)
- Backend determines approval/decline
- Backend sets credit limit
- Backend recommends term length
- Frontend **ONLY displays** backend decisions
- Frontend validates cart total against backend credit limit

No hardcoded approvals or rejections in frontend!
