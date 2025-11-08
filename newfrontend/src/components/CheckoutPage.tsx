import { Package, CreditCard, Smartphone, Wallet, Zap, ArrowLeft } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface CheckoutPageProps {
  onPaymentSelect: () => void;
  isModalOpen: boolean;
  onBack?: () => void;
}

export function CheckoutPage({ onPaymentSelect, isModalOpen, onBack }: CheckoutPageProps) {
  return (
    <div className={`mx-auto max-w-3xl p-6 transition-opacity duration-200 ${isModalOpen ? 'opacity-50' : 'opacity-100'}`}>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Merchants</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Encrypted</span>
          </div>
        </div>
        <h1>Secure Checkout</h1>
      </div>

      {/* Delivery Section */}
      <Card className="mb-6 p-6">
        <h3 className="mb-4">Delivery & Services</h3>
        <div className="flex items-start gap-4">
          <Package className="h-5 w-5 text-slate-600 mt-1" />
          <div>
            <div>Get it Tomorrow</div>
            <div className="text-slate-600">Next-day Delivery</div>
          </div>
        </div>
      </Card>

      {/* Payment Info Section */}
      <Card className="p-6">
        <h3 className="mb-6">Payment Info</h3>
        
        <div className="space-y-3">
          {/* Credit Card */}
          <button className="w-full flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div>Credit or Debit Card</div>
              <div className="text-slate-600">Use any qualifying card</div>
            </div>
          </button>

          {/* WingsPay - Our Custom Solution */}
          <button 
            onClick={onPaymentSelect}
            className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-colors text-left group"
          >
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>WingsPay</span>
                <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Recommended</span>
              </div>
              <div className="text-slate-600">Pay in 4, interest-free payments</div>
            </div>
            <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
          </button>

          {/* Apple Pay */}
          <button className="w-full flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left">
            <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div>Apple Pay</div>
              <div className="text-slate-600">Fast and secure</div>
            </div>
          </button>

          {/* PayPal */}
          <button className="w-full flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div>PayPal</div>
              <div className="text-slate-600">Connect your account</div>
            </div>
          </button>
        </div>
      </Card>

      {/* Order Summary */}
      <div className="mt-6 p-6 bg-white rounded-lg border border-slate-200">
        <div className="flex justify-between mb-2">
          <span className="text-slate-600">Subtotal</span>
          <span>$624.99</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-slate-600">Shipping</span>
          <span>$0.00</span>
        </div>
        <div className="h-px bg-slate-200 my-4" />
        <div className="flex justify-between">
          <span>Total</span>
          <span>$624.99</span>
        </div>
      </div>
    </div>
  );
}