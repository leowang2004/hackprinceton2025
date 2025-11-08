import { ArrowLeft, CreditCard, Wallet, Zap, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { usePayment } from '../contexts/PaymentContext';
import { formatCurrency } from '../services/api';

interface ModernCheckoutProps {
  onSelectWingsPay: () => void;
  onBack: () => void;
}

export function ModernCheckout({ onSelectWingsPay, onBack }: ModernCheckoutProps) {
  const { 
    cartTotal,
    cartItems,
    creditScore, 
    maxCreditLimit, 
    approved, 
    loading,
    paymentPlans,
    declineReason 
  } = usePayment();

  const monthlyPayment = approved && paymentPlans.length > 0 ? paymentPlans[0].monthly : 0;
  
  // Calculate subtotal (before tax)
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = cartTotal - subtotal; // Tax is the difference

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Cart</span>
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl">Checkout</h1>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Lock className="h-4 w-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl">Shipping Address</h2>
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-2 text-slate-700">
                <div>John Smith</div>
                <div>123 Market Street, Apt 4B</div>
                <div>San Francisco, CA 94103</div>
                <div>United States</div>
              </div>
              <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-700">
                Change address
              </button>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <h2 className="text-xl mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                {/* WingsPay - Featured */}
                <button
                  onClick={onSelectWingsPay}
                  className="w-full group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-75 group-hover:opacity-100 blur transition-all duration-300" />
                  <div className="relative bg-white rounded-2xl p-6 border-2 border-transparent">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">WingsPay</span>
                          <span className="text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-1 rounded-full">
                            Recommended
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          {loading ? (
                            'Loading payment options...'
                          ) : approved ? (
                            `4 interest-free payments of ${formatCurrency(monthlyPayment)}`
                          ) : (
                            <span className="text-amber-600">
                              {declineReason || 'Not eligible at this time'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-indigo-600 mt-1">
                          ✦ {approved ? 'Pre-approved' : 'Check eligibility'} • 0% APR • No hidden fees
                          {!loading && !approved && maxCreditLimit > 0 && (
                            <div className="text-xs text-slate-500 mt-1">
                              Max credit: ${maxCreditLimit.toFixed(2)} (Cart: ${cartTotal.toFixed(2)})
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </div>
                  </div>
                </button>

                {/* Credit Card */}
                <button className="w-full flex items-center gap-4 p-6 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">Credit or Debit Card</div>
                    <div className="text-sm text-slate-600">Visa, Mastercard, Amex</div>
                  </div>
                </button>

                {/* PayPal */}
                <button className="w-full flex items-center gap-4 p-6 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left">
                  <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">PayPal</div>
                    <div className="text-sm text-slate-600">Fast checkout</div>
                  </div>
                </button>
              </div>

              {/* WingsPay Benefits */}
              <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="text-sm text-indigo-900 mb-3">Why choose WingsPay?</div>
                <div className="space-y-2 text-sm text-indigo-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Split into 4 payments, 0% interest</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>No credit check, instant approval</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Flexible payment schedule</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 sticky top-24">
              <h2 className="text-xl mb-6">Order Summary</h2>

              {/* Items Preview */}
              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="mb-1">{item.name}</div>
                      <div className="text-slate-600">{formatCurrency(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-xl">Total</span>
                <span className="text-3xl">{formatCurrency(cartTotal)}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl text-center text-sm text-slate-600">
                Select a payment method to continue
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
