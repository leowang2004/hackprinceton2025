import { ArrowLeft, Calendar, CheckCircle2, Zap, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface PaymentPlanSelectionProps {
  onSelectPlan: () => void;
  onBack: () => void;
}

export function PaymentPlanSelection({ onSelectPlan, onBack }: PaymentPlanSelectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const plans = [
    {
      id: 1,
      name: 'Pay in 4',
      recommended: true,
      payments: [
        { amount: 209.79, date: 'Today', description: 'Due at checkout' },
        { amount: 209.79, date: 'Nov 15', description: 'In 1 week' },
        { amount: 209.79, date: 'Nov 22', description: 'In 2 weeks' },
        { amount: 209.79, date: 'Nov 29', description: 'In 3 weeks' },
      ],
      features: ['0% interest', 'No credit check', 'Instant approval'],
    },
    {
      id: 2,
      name: 'Pay in 6',
      recommended: false,
      payments: [
        { amount: 139.86, date: 'Today', description: 'Due at checkout' },
        { amount: 139.86, date: 'Dec 8', description: 'In 1 month' },
        { amount: 139.86, date: 'Jan 8', description: 'In 2 months' },
        { amount: 139.86, date: 'Feb 8', description: 'In 3 months' },
        { amount: 139.86, date: 'Mar 8', description: 'In 4 months' },
        { amount: 139.86, date: 'Apr 8', description: 'In 5 months' },
      ],
      features: ['0% interest', 'Lower payments', 'Flexible schedule'],
    },
    {
      id: 3,
      name: 'Pay in 12',
      recommended: false,
      payments: [
        { amount: 69.93, date: 'Today', description: 'Due at checkout' },
        { amount: 69.93, date: 'Monthly', description: '11 more payments' },
      ],
      features: ['3.9% APR', 'Lowest monthly payment', 'Extended term'],
    },
  ];

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
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-600 mb-1">Order Total</div>
            <div className="text-3xl">$839.16</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600 mb-1">Items</div>
            <div>2 products</div>
          </div>
        </div>

        {/* Payment Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`text-left transition-all duration-300 ${
                selectedPlan === plan.id
                  ? 'scale-105'
                  : 'hover:scale-102'
              }`}
            >
              <div className={`relative bg-white rounded-2xl p-6 border-2 h-full ${
                selectedPlan === plan.id
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
                    ${plan.payments[0].amount}
                    <span className="text-sm text-slate-600">/payment</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {plan.payments.length} payments
                  </div>
                </div>

                {/* Payment Schedule Preview */}
                <div className="space-y-2 mb-6 pb-6 border-b border-slate-200">
                  {plan.payments.slice(0, plan.id === 3 ? 2 : plan.payments.length).map((payment, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">{payment.date}</span>
                      </div>
                      <span>${payment.amount}</span>
                    </div>
                  ))}
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
                {selectedPlan === plan.id && (
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
            disabled={!selectedPlan}
            className={`w-full py-6 rounded-xl text-lg ${
              selectedPlan
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {selectedPlan ? 'Continue to Confirmation' : 'Select a Payment Plan'}
          </Button>
          {selectedPlan && (
            <p className="text-center text-sm text-slate-600 mt-4">
              Your first payment of ${plans.find(p => p.id === selectedPlan)?.payments[0].amount} will be processed today
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
