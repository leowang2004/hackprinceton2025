import { ArrowLeft, Calendar, CheckCircle2, Zap, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { usePayment } from '../contexts/PaymentContext';
import { getPaymentSchedule, formatCurrency } from '../services/api';

interface PaymentPlanSelectionProps {
  onSelectPlan: () => void;
  onBack: () => void;
}

export function PaymentPlanSelection({ onSelectPlan, onBack }: PaymentPlanSelectionProps) {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null);
  const { 
    cartTotal,
    creditScore, 
    maxCreditLimit, 
    approved, 
    loading,
    paymentPlans,
    declineReason,
    setSelectedPlan 
  } = usePayment();

  const handleSelectPlan = (index: number) => {
    setSelectedPlanIndex(index);
    setSelectedPlan(paymentPlans[index]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h2 className="text-xl mb-2">Analyzing your credit...</h2>
          <p className="text-slate-600">Please wait while we calculate your payment options</p>
        </div>
      </div>
    );
  }

  if (!approved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl mb-4">Unable to Approve</h2>
          <p className="text-slate-600 mb-3">
            {declineReason}
          </p>
          {creditScore > 0 && (
            <div className="bg-slate-100 rounded-lg p-4 mb-3">
              <div className="text-sm text-slate-600 mb-1">Your Credit Score</div>
              <div className="text-2xl font-semibold">{creditScore}</div>
              {maxCreditLimit > 0 && (
                <>
                  <div className="text-sm text-slate-600 mt-2 mb-1">Maximum Credit Available</div>
                  <div className="text-xl">${maxCreditLimit.toFixed(2)}</div>
                  <div className="text-sm text-slate-600 mt-2">Cart Total: ${cartTotal.toFixed(2)}</div>
                </>
              )}
            </div>
          )}
          <p className="text-sm text-slate-500 mb-6">
            {maxCreditLimit > 0 && cartTotal > maxCreditLimit
              ? `Try reducing your cart total to ${formatCurrency(maxCreditLimit)} or less.`
              : 'Build your credit history by making regular purchases and try again later.'}
          </p>
          <Button onClick={onBack} variant="outline">
            Back to Payment Options
          </Button>
        </div>
      </div>
    );
  }

  // Transform backend plans into UI format
  const plans = paymentPlans.map((plan, index) => {
    const schedule = getPaymentSchedule(plan);
    return {
      id: index + 1,
      name: `Pay in ${plan.months}`,
      recommended: index === 0, // First plan (4 payments) is recommended
      payments: schedule,
      features: [
        plan.rate === 0 ? '0% interest' : `${plan.rate.toFixed(1)}% APR`,
        plan.months === 4 ? 'Most popular' : plan.months === 6 ? 'Lower payments' : 'Lowest monthly payment',
        'Instant approval'
      ],
      monthlyAmount: plan.monthly,
      totalAmount: plan.totalAmount,
      months: plan.months
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Payment Options</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl">Choose Your Payment Plan</h1>
              <p className="text-slate-600">Select a plan that works best for you</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Order Summary Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">Order Total</div>
              <div className="text-3xl">{formatCurrency(cartTotal)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 mb-1">Credit Score</div>
              <div className={`text-2xl ${creditScore >= 700 ? 'text-green-600' : creditScore >= 600 ? 'text-yellow-600' : 'text-orange-600'}`}>
                {creditScore}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Max Credit: {formatCurrency(maxCreditLimit)}
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-sm text-green-900">
            ✓ You're approved for interest-free financing up to {formatCurrency(maxCreditLimit)}
          </div>
        </div>

        {/* Payment Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id - 1)}
              className={`text-left transition-all duration-300 ${
                selectedPlanIndex === (plan.id - 1)
                  ? 'scale-105'
                  : 'hover:scale-102'
              }`}
            >
              <div className={`relative bg-white rounded-2xl p-6 border-2 h-full ${
                selectedPlanIndex === (plan.id - 1)
                  ? 'border-indigo-600 shadow-xl shadow-indigo-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}>
                {plan.recommended && (
                  <div className="absolute -top-3 left-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full">
                    ⭐ Recommended
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl mb-2">{plan.name}</h3>
                  <div className="text-3xl mb-1">
                    {formatCurrency(plan.monthlyAmount)}
                    <span className="text-sm text-slate-600">/payment</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {plan.months} payments • Total: {formatCurrency(plan.totalAmount)}
                  </div>
                </div>

                {/* Payment Schedule Preview */}
                <div className="space-y-2 mb-6 pb-6 border-b border-slate-200">
                  {plan.payments.slice(0, plan.months > 6 ? 2 : plan.payments.length).map((payment, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">{payment.date}</span>
                      </div>
                      <span>{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                  {plan.months > 6 && (
                    <div className="text-xs text-slate-500 text-center pt-2">
                      + {plan.months - 2} more monthly payments
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                {selectedPlanIndex === (plan.id - 1) && (
                  <div className="flex items-center justify-center gap-2 text-indigo-600 py-2 bg-indigo-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Selected</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Info Boxes */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="mb-2">Secure & Transparent</h3>
                <p className="text-sm text-slate-600">
                  No hidden fees, no surprises. What you see is what you pay. Your information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="mb-2">Instant Approval</h3>
                <p className="text-sm text-slate-600">
                  You're pre-approved! Complete your purchase now and your first payment will be processed immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <Button
            onClick={onSelectPlan}
            disabled={selectedPlanIndex === null}
            className={`w-full py-6 rounded-xl text-lg ${
              selectedPlanIndex !== null
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {selectedPlanIndex !== null ? 'Continue to Confirmation' : 'Select a Payment Plan'}
          </Button>
          {selectedPlanIndex !== null && (
            <p className="text-center text-sm text-slate-600 mt-4">
              Your first payment of {formatCurrency(plans[selectedPlanIndex + 1].payments[0].amount)} will be processed today
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
