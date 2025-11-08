// Test script to check backend credit score calculation
import fetch from 'node-fetch';

async function testBackend() {
  try {
    console.log('Testing backend API...\n');
    
    const response = await fetch('http://localhost:3000/api/get-credit-score');
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    
    console.log('=== BACKEND RESPONSE ===\n');
    console.log('Credit Score:', data.creditScore);
    console.log('Lending Offer Status:', data.lendingOffer.status);
    console.log('Max Amount:', data.lendingOffer.maxAmount);
    console.log('Interest Rate:', data.lendingOffer.interestRate);
    console.log('Term Months:', data.lendingOffer.termMonths);
    console.log('Message:', data.lendingOffer.message);
    console.log('\n=== ANALYSIS ===\n');
    console.log('Account Balance:', data.analysis.accountBalance);
    console.log('Total Transactions:', data.analysis.totalTransactionsAnalyzed);
    console.log('Total Bills Owed:', data.analysis.totalBillsOwed);
    console.log('Total Loans Owed:', data.analysis.totalLoansOwed);
    console.log('Total Overdue Debt:', data.analysis.totalOverdueDebt);
    console.log('Monthly Deposits:', data.analysis.monthlyDeposits);
    console.log('Total Deposit Amount:', data.analysis.totalDepositAmount);
    
    console.log('\n=== DETAILED METRICS ===\n');
    console.log('Avg Monthly Spend:', data.lendingOffer.metrics.avgMonthlySpend);
    console.log('Avg Monthly Income:', data.lendingOffer.metrics.avgMonthlyIncome);
    console.log('Monthly Debt Obligation:', data.lendingOffer.metrics.monthlyDebtObligation);
    console.log('Volatility:', data.lendingOffer.metrics.volatility);
    console.log('Purchase Freq/Month:', data.lendingOffer.metrics.purchaseFreqPerMonth);
    console.log('Current Balance:', data.lendingOffer.metrics.currentBalance);
    console.log('Deposit Count:', data.lendingOffer.metrics.depositCount);
    console.log('Bill Count:', data.lendingOffer.metrics.billCount);
    
    console.log('\n=== RECOMMENDATION ===\n');
    
    const cartTotal = 839.16;
    
    if (data.lendingOffer.status === 'Declined') {
      console.log('❌ DECLINED');
      console.log('Reason:', data.lendingOffer.message);
    } else if (cartTotal > data.lendingOffer.maxAmount) {
      console.log('❌ DECLINED - Cart exceeds credit limit');
      console.log(`Cart Total: $${cartTotal}`);
      console.log(`Max Credit: $${data.lendingOffer.maxAmount}`);
      console.log(`Difference: $${(cartTotal - data.lendingOffer.maxAmount).toFixed(2)}`);
    } else {
      console.log('✅ APPROVED');
      console.log(`Cart Total: $${cartTotal}`);
      console.log(`Max Credit: $${data.lendingOffer.maxAmount}`);
      console.log(`Available Credit: $${(data.lendingOffer.maxAmount - cartTotal).toFixed(2)}`);
      console.log(`Monthly Payment (4 months): $${(cartTotal / 4).toFixed(2)}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBackend();
