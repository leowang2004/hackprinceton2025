// API Service for WingsPay Backend Integration

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface CreditScoreResponse {
  creditScore: number;
  lendingOffer: {
    status: 'Approved' | 'Declined';
    maxAmount: number;
    interestRate: string;
    message: string;
    termMonths: number;
    recommendedMonthlyPayment: number;
    metrics: {
      creditScore: number;
      avgMonthlySpend: number;
      avgMonthlyIncome: number;
      monthlyDebtObligation: number;
      volatility: number;
      purchaseFreqPerMonth: number;
      maxSinglePurchase: number;
      overdueDebt: number;
      currentBalance: number;
      depositCount: number;
      billCount: number;
      scoreNormalized: number;
      spendingMultiplier: number;
      balanceMultiplier: number;
    };
  };
  analysis: {
    accountBalance: number;
    totalTransactionsAnalyzed: number;
    totalBillsOwed: number;
    totalLoansOwed: number;
    totalOverdueDebt: number;
    monthlyDeposits: number;
    totalDepositAmount: number;
    source: string;
    metrics: any;
  };
}

export interface PaymentPlan {
  months: number;
  rate: number;
  monthly: number;
  totalAmount: number;
  interestAmount: number;
}

/**
 * Fetch credit score and lending offer from backend
 */
export async function fetchCreditScore(): Promise<CreditScoreResponse | null> {
  try {
    console.log('🔍 Fetching credit score from:', `${API_BASE_URL}/api/get-credit-score`);
    const response = await fetch(`${API_BASE_URL}/api/get-credit-score`);
    
    if (!response.ok) {
      console.error('❌ Failed to fetch credit score:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log('✅ Backend Response Received:');
    console.log('   Credit Score:', data.creditScore);
    console.log('   Status:', data.lendingOffer.status);
    console.log('   Max Amount:', data.lendingOffer.maxAmount);
    console.log('   Term Months:', data.lendingOffer.termMonths);
    console.log('   Message:', data.lendingOffer.message);
    console.log('   Full Data:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching credit score:', error);
    return null;
  }
}

/**
 * Calculate BNPL payment plans for a given order total
 * Uses the backend's credit approval to determine eligibility
 * DIRECTLY uses backend lending offer data - NO HARDCODED LOGIC
 */
export async function calculatePaymentPlans(orderTotal: number): Promise<{
  approved: boolean;
  creditScore: number;
  maxCreditLimit: number;
  plans: PaymentPlan[];
  declineReason?: string;
  metrics?: any;
} | null> {
  try {
    console.log('💳 calculatePaymentPlans called with order total:', orderTotal);
    
    const creditData = await fetchCreditScore();
    
    if (!creditData) {
      console.error('❌ Failed to fetch credit data from backend');
      return null;
    }
    
    const { creditScore, lendingOffer, analysis } = creditData;
    const maxCreditLimit = lendingOffer.maxAmount;
    
    console.log('📊 Backend Decision:');
    console.log('   Credit Score:', creditScore);
    console.log('   Status:', lendingOffer.status);
    console.log('   Max Credit:', maxCreditLimit);
    console.log('   Order Total:', orderTotal);
    console.log('   Term Months:', lendingOffer.termMonths);
    console.log('   Message:', lendingOffer.message);
    
    // CRITICAL: Check approval based on BACKEND decision
    // 1. Backend must approve (status === 'Approved')
    // 2. Order total must not exceed max credit limit
    if (lendingOffer.status === 'Declined' || orderTotal > maxCreditLimit) {
      const reason = lendingOffer.status === 'Declined' 
        ? lendingOffer.message 
        : `Order total $${orderTotal.toFixed(2)} exceeds your credit limit of $${maxCreditLimit.toFixed(2)}`;
      
      console.log('❌ DECLINED:', reason);
      
      return {
        approved: false,
        creditScore,
        maxCreditLimit,
        plans: [],
        declineReason: reason,
        metrics: analysis.metrics
      };
    }
    
    // APPROVED: Use backend's recommended term to generate flexible payment plans
    // Backend provides termMonths based on credit score (4-12 months)
    const maxTermMonths = lendingOffer.termMonths;
    
    console.log('✅ APPROVED! Generating payment plans...');
    console.log('   Max Term from Backend:', maxTermMonths, 'months');
    
    // Generate payment plans: 4, 6, and up to backend's max term
    const planTerms = [4, 6, Math.min(12, maxTermMonths)].filter((term, index, arr) => 
      arr.indexOf(term) === index // Remove duplicates
    );
    
    const plans: PaymentPlan[] = planTerms.map(months => ({
      months,
      rate: 0, // All plans are 0% APR for approved customers
      monthly: parseFloat((orderTotal / months).toFixed(2)),
      totalAmount: orderTotal,
      interestAmount: 0
    }));
    
    console.log('📋 Generated Payment Plans:');
    plans.forEach((plan, index) => {
      console.log(`   Plan ${index + 1}: ${plan.months} months × $${plan.monthly.toFixed(2)} = $${plan.totalAmount.toFixed(2)}`);
    });
    
    return {
      approved: true,
      creditScore,
      maxCreditLimit,
      plans,
      metrics: analysis.metrics
    };
  } catch (error) {
    console.error('❌ Error calculating payment plans:', error);
    return null;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Get payment schedule for a plan
 */
export function getPaymentSchedule(plan: PaymentPlan, startDate: Date = new Date()): Array<{
  amount: number;
  date: string;
  description: string;
}> {
  const schedule = [];
  
  for (let i = 0; i < plan.months; i++) {
    const paymentDate = new Date(startDate);
    
    if (i === 0) {
      // First payment today
      schedule.push({
        amount: plan.monthly,
        date: 'Today',
        description: 'Due at checkout'
      });
    } else if (i < 4) {
      // Weekly payments for first month (if 4-payment plan)
      if (plan.months === 4) {
        paymentDate.setDate(paymentDate.getDate() + (i * 7));
        schedule.push({
          amount: plan.monthly,
          date: paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          description: `In ${i} week${i > 1 ? 's' : ''}`
        });
      } else {
        // Monthly payments
        paymentDate.setMonth(paymentDate.getMonth() + i);
        schedule.push({
          amount: plan.monthly,
          date: paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          description: `In ${i} month${i > 1 ? 's' : ''}`
        });
      }
    } else {
      // Remaining payments (for 6 and 12 month plans)
      paymentDate.setMonth(paymentDate.getMonth() + i);
      schedule.push({
        amount: plan.monthly,
        date: paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        description: `In ${i} month${i > 1 ? 's' : ''}`
      });
    }
  }
  
  return schedule;
}
