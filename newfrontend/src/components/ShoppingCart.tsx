import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ShoppingCartProps {
  onProceedToCheckout: () => void;
  onBack: () => void;
}

export function ShoppingCart({ onProceedToCheckout, onBack }: ShoppingCartProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="text-3xl">Shopping Cart</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Item 1 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex gap-6">
                <div className="w-32 h-32 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1604780032295-9f8186eede96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb255JTIwd2lyZWxlc3MlMjBoZWFkcGhvbmVzJTIwYmxhY2t8ZW58MXx8fHwxNzYyNjIyNzUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Sony Headphones"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2">Sony WH-1000XM5 Wireless Noise Canceling Headphones</h3>
                  <p className="text-sm text-slate-600 mb-3">Color: Black | In Stock</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 border border-slate-300 rounded-lg">
                      <button className="px-3 py-2 hover:bg-slate-50 transition-colors">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm">1</span>
                      <button className="px-3 py-2 hover:bg-slate-50 transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl mb-1">$348.00</div>
                  <div className="text-sm text-slate-500 line-through">$399.99</div>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex gap-6">
                <div className="w-32 h-32 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1668760180303-fcfe2b899e20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMHdhdGNoJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjI1OTA3NjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Smart Watch"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2">Apple Watch Series 9 GPS + Cellular 45mm</h3>
                  <p className="text-sm text-slate-600 mb-3">Color: Midnight | In Stock</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 border border-slate-300 rounded-lg">
                      <button className="px-3 py-2 hover:bg-slate-50 transition-colors">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm">1</span>
                      <button className="px-3 py-2 hover:bg-slate-50 transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl mb-1">$429.00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-slate-200 sticky top-24">
              <h2 className="text-xl mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (2 items)</span>
                  <span>$777.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax</span>
                  <span>$62.16</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-xl">Total</span>
                <span className="text-2xl">$839.16</span>
              </div>

              <Button
                onClick={onProceedToCheckout}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 rounded-xl"
              >
                Proceed to Checkout
              </Button>

              <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="text-sm text-indigo-900 mb-1">💳 Pay with WingsPay</div>
                <div className="text-sm text-indigo-700">
                  Split into 4 payments of <span className="font-medium">$209.79</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    ✓
                  </div>
                  <span>Free shipping on all orders</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    🔒
                  </div>
                  <span>Secure encrypted checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    ↩
                  </div>
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
