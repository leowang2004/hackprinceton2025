import { CheckCircle2, Calendar, Package, Mail, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { usePayment } from '../contexts/PaymentContext';
import { formatCurrency } from '../services/api';

interface OrderConfirmationProps {
  onStartOver: () => void;
}

export function OrderConfirmation({ onStartOver }: OrderConfirmationProps) {
  const { cartTotal, selectedPlan } = usePayment();
  
  // Calculate payment amounts
  const monthlyPayment = selectedPlan ? selectedPlan.monthly : 0;
  const numPayments = selectedPlan ? selectedPlan.termMonths : 4;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <span className="text-xl">✦</span>
            </div>
            <span className="text-xl tracking-tight">WingsPay</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>Payment Confirmed</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl mb-3">Order Confirmed!</h1>
          <p className="text-xl text-slate-600 mb-2">
            Your order has been successfully placed
          </p>
          <p className="text-slate-500">
            Order #WP-2024-11-08-9847
          </p>
        </div>

        {/* Payment Plan Summary */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl">Your Payment Plan</h2>
              <p className="text-slate-600">{numPayments} interest-free payments</p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="text-sm text-green-700 mb-1">✓ Paid Today</div>
              <div className="text-2xl mb-1">{formatCurrency(monthlyPayment)}</div>
              <div className="text-sm text-slate-600">Nov 8, 2024</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Payment 2</div>
              <div className="text-2xl mb-1">{formatCurrency(monthlyPayment)}</div>
              <div className="text-sm text-slate-600">Nov 15, 2024</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Payment 3</div>
              <div className="text-2xl mb-1">{formatCurrency(monthlyPayment)}</div>
              <div className="text-sm text-slate-600">Nov 22, 2024</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Payment 4</div>
              <div className="text-2xl mb-1">{formatCurrency(monthlyPayment)}</div>
              <div className="text-sm text-slate-600">Nov 29, 2024</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-3">
            <Mail className="h-5 w-5 text-indigo-600" />
            <span className="text-sm text-indigo-900">
              Payment reminders will be sent to your email 2 days before each payment
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 mb-8">
          <h2 className="text-xl mb-6">Order Items</h2>
          
          <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1604780032295-9f8186eede96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb255JTIwd2lyZWxlc3MlMjBoZWFkcGhvbmVzJTIwYmxhY2t8ZW58MXx8fHwxNzYyNjIyNzUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Sony Headphones"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">Sony WH-1000XM5 Wireless Noise Canceling Headphones</h3>
                <p className="text-sm text-slate-600 mb-2">Color: Black | Qty: 1</p>
                <div className="text-lg">$348.00</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1668760180303-fcfe2b899e20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMHdhdGNoJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjI1OTA3NjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Smart Watch"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">Apple Watch Series 9 GPS + Cellular 45mm</h3>
                <p className="text-sm text-slate-600 mb-2">Color: Midnight | Qty: 1</p>
                <div className="text-lg">$429.00</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>$777.00</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax</span>
              <span>$62.16</span>
            </div>
            <div className="h-px bg-slate-200 my-4" />
            <div className="flex justify-between text-xl">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl">Delivery Information</h2>
              <p className="text-slate-600">Estimated arrival: Nov 10-12, 2024</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6">
            <div className="space-y-2 text-slate-700">
              <div>John Smith</div>
              <div>123 Market Street, Apt 4B</div>
              <div>San Francisco, CA 94103</div>
              <div>United States</div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-blue-600">
            <span>Track your order</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <Button
            onClick={onStartOver}
            className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl"
          >
            Continue Shopping
          </Button>
          <Button
            variant="outline"
            className="w-full py-6 border-2 border-slate-200 hover:border-slate-300 rounded-xl"
          >
            View Order Details
          </Button>
        </div>
      </main>
    </div>
  );
}
