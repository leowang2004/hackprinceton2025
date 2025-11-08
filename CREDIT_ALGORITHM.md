# Comprehensive Credit Scoring Algorithm

## Overview

The credit scoring algorithm has been updated to incorporate **four data sources** from the user's bank:

1. **Transaction History** (`dummydata.json`) - Merchant purchases
2. **Bill Payment History** (`dummybill.json`) - Credit cards, utilities, recurring payments
3. **Deposit History** (`dummydeposit.json`) - Income, paychecks, deposits
4. **Loan Obligations** (`dummyloan.json`) - Existing debt payments

## Credit Score Calculation (300-850)

### Score Components (Weighted)

#### 1. Transaction Spending Analysis (25% weight)
- **Average Monthly Spend**: Lower spending = higher capacity
- **Spending Volatility**: Consistent spending patterns = more predictable
- **Purchase Frequency**: Moderate frequency is optimal
- **Maximum Single Purchase**: Large one-time purchases penalized

**Formula**:
```
spendScore = (1 - avgSpend/4000) * 0.6 + (1 - volatility) * 0.4
```

#### 2. Income Analysis (30% weight)
- **Average Monthly Income**: Calculated from deposit history
- **Income-to-Spend Ratio**: Higher income relative to spending = better capacity
- **Deposit Consistency**: 3+ deposits = stable income indicator

**Formula**:
```
incomeToSpendRatio = avgIncome / avgSpend (capped at 3x)
depositConsistency = min(depositCount / 3, 1.0)
incomeScore = incomeToSpendRatio * 0.7 + depositConsistency * 0.3
```

#### 3. Bill Payment Reliability (20% weight)
- **Payment Ratio**: Paid bills / Total bills
- **Pending Bills**: >3 pending bills = penalty
- **Status Tracking**: "completed" or "paid" = positive

**Formula**:
```
billPaymentRatio = paidBills / totalBills
pendingPenalty = pendingBills > 3 ? 0.7 : 1.0
billScore = billPaymentRatio * pendingPenalty
```

#### 4. Debt-to-Income Ratio (15% weight)
- **Monthly Obligations**: Sum of all bill + loan payments
- **DTI Calculation**: Obligations / Income
- Lower DTI = better score

**Formula**:
```
monthlyDebt = totalBillPayments + totalLoanPayments
dtiRatio = monthlyDebt / avgIncome
dtiScore = 1 - dtiRatio (clamped 0-1)
```

#### 5. Liquidity/Balance (10% weight)
- **Balance-to-Spend Ratio**: currentBalance / avgMonthlySpend
- **Optimal Ratio**: 3 months of spending = perfect score

**Formula**:
```
balanceRatio = currentBalance / avgMonthlySpend
liquidityScore = min(balanceRatio / 3, 1.0)
```

### Composite Score
```javascript
compositeScore = 
  spendScore * 0.25 +
  incomeScore * 0.30 +
  billScore * 0.20 +
  dtiScore * 0.15 +
  liquidityScore * 0.10

baseScore = 300 + (compositeScore * 550)
```

### Bonus Adjustments
- **+30 points**: Balance > $5,000
- **+20 points**: 4+ deposits (consistent income)
- **+10 points**: < 10 purchases/month (controlled spending)

### Final Score
```
finalScore = min(max(baseScore + bonuses, 300), 850)
```

---

## Lending Decision Engine

### Maximum Loan Amount Calculation

#### Method 1: Income-Based (Preferred when deposits available)
```javascript
avgMonthlyIncome = totalDeposits / depositCount
monthlyDebtObligation = totalBills + totalLoans
disposableIncome = avgIncome - avgSpend - monthlyDebt
affordablePayment = disposableIncome * 0.28  // 28% rule

maxLoanAmount = affordablePayment * termMonths
maxLoanAmount = min(maxLoanAmount, avgIncome * 12 * 0.40)  // Cap at 40% annual income
```

#### Method 2: Spending-Based (Fallback when no income data)
```javascript
affordablePayment = capacityScore * 0.12 * avgMonthlySpend
maxLoanAmount = affordablePayment * termMonths
```

#### Debt Reduction
```javascript
finalMaxAmount = maxLoanAmount - overdueDebt
```

### Term Length Determination

Terms range from **3 to 12 months** based on:

| Capacity Score | Volatility | Income Stability | Term    |
|----------------|------------|------------------|---------|
| ≥ 0.75         | ≤ 0.3      | Yes (3+ deposits, income > 1.5x spend) | 12 months |
| ≥ 0.55         | ≤ 0.6      | Any              | 9 months  |
| 0.40 - 0.54    | Any        | Any              | 6 months  |
| < 0.35         | > 1.0      | Any              | 3 months  |

### Interest Rate Calculation

Base rate formula:
```javascript
baseRate = 24% - (capacityScore * 17%)  // Range: 7-24%

// Discount for high income
incomeDiscount = avgIncome > avgSpend * 2 ? 2% : 0%

finalRate = max(7%, baseRate - incomeDiscount)
```

**Examples**:
- Perfect capacity (1.0) + high income: **5-7% APR**
- Good capacity (0.7) + normal income: **12% APR**
- Fair capacity (0.5): **15.5% APR**
- Poor capacity (0.3): **19% APR**

### Approval Criteria

All three conditions must be met:

1. **Capacity Score ≥ 0.4**
   - Ensures minimum financial stability

2. **Overdue Debt < 25% of Max Amount**
   - Existing debt can't dominate new loan

3. **Debt-to-Income Ratio < 0.5** (when income data available)
   - Total monthly debt (including new loan) < 50% of income

```javascript
approved = 
  capacityScore >= 0.4 && 
  overdueDebt <= maxAmount * 0.25 &&
  (noIncomeData || debtToIncomeRatio < 0.5)
```

---

## Data File Formats

### dummybill.json
```json
[
  {
    "_id": "690f959608f7513c4ad89fe6",
    "status": "pending",           // "pending", "paid", "completed"
    "payee": "string",
    "nickname": "credit card payment",
    "payment_date": "2025-11-08",
    "recurring_date": 1,
    "payment_amount": 200,
    "creation_date": "2025-11-08",
    "account_id": "690f8d1708f7513c4ad89fda"
  }
]
```

### dummydeposit.json
```json
[
  {
    "_id": "690f8ef508f7513c4ad89fdb",
    "medium": "balance",
    "amount": 200,
    "transaction_date": "2025-11-08",
    "status": "cancelled",          // Status may vary
    "description": "string",
    "payee_id": "690f8d1708f7513c4ad89fda",
    "type": "deposit"
  }
]
```

### dummyloan.json
(Same structure as bills - represents debt obligations)

---

## API Response Format

### Success Response
```json
{
  "creditScore": 720,
  "lendingOffer": {
    "status": "Approved",
    "maxAmount": 2400,
    "interestRate": "12.5% APR",
    "termMonths": 9,
    "recommendedMonthlyPayment": 266.67,
    "message": "FlexPay approved based on your spending stability.",
    "metrics": {
      "avgMonthlySpend": 947.60,
      "avgMonthlyIncome": 195.00,
      "disposableIncome": -752.60,
      "monthlyDebtObligation": 275.00,
      "debtToIncomeRatio": 2.778,
      "monthlyStdDev": 421.35,
      "volatility": 0.445,
      "purchaseFreqPerMonth": 1.25,
      "maxSinglePurchase": 1500.00,
      "overdueDebt": 1650,
      "capacityScore": 0.523,
      "depositCount": 4,
      "billCount": 6,
      "hasStableIncome": false
    }
  },
  "analysis": {
    "accountBalance": 487.50,
    "totalTransactionsAnalyzed": 5,
    "totalBillsOwed": 1650,
    "totalLoansOwed": 1650,
    "totalOverdueDebt": 3300,
    "monthlyDeposits": 4,
    "totalDepositAmount": 780,
    "source": "Comprehensive bank data (transactions, bills, deposits, loans)",
    "metrics": { ... }
  }
}
```

### Decline Response
```json
{
  "creditScore": 450,
  "lendingOffer": {
    "status": "Declined",
    "maxAmount": 0,
    "interestRate": "N/A",
    "termMonths": 0,
    "recommendedMonthlyPayment": 0,
    "message": "FlexPay declined due to existing overdue balance. Please resolve it and try again."
  }
}
```

---

## Testing

### Start Server
```powershell
npm start
```

### Test Endpoint
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/get-credit-score"
```

### Expected Behavior

With the current dummy data:
- **Transactions**: 5 Amazon orders (~$4,738 total)
- **Bills**: 6 pending credit card payments ($1,650 total)
- **Deposits**: 4 deposits ($780 total)
- **Loans**: 6 loan payments ($1,650 total)

**Calculated Values**:
- Average monthly spend: ~$947
- Average monthly income: ~$195 (low)
- Current balance: ~$487 (2.5x deposits)
- Overdue debt: $3,300 (bills + loans)
- Debt-to-income ratio: 2.78 (very high)

**Expected Result**: 
- Credit Score: **~450-550** (below average due to high DTI and low income)
- Loan Offer: **Likely DECLINED** due to high debt-to-income ratio and significant overdue debt

To improve the score, the dummy data would need:
- Higher deposit amounts (more income)
- More "paid" status bills (better payment history)
- Lower pending debt amounts

---

## Key Improvements Over Previous Algorithm

1. **Income Consideration**: Now factors in actual income from deposits (30% weight)
2. **Payment History**: Tracks bill payment reliability (20% weight)
3. **Debt Obligations**: Accounts for existing loans and bills
4. **Debt-to-Income Ratio**: Prevents over-lending to users with high existing debt
5. **Income-Based Lending**: Loan amounts based on disposable income, not just spending
6. **Realistic Cap**: Max loan = 40% of annual income
7. **Comprehensive Metrics**: Returns detailed financial picture in response

This creates a more **holistic, responsible lending decision** that considers the full financial picture.
