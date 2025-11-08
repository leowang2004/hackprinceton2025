import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { usePayment } from '../contexts/PaymentContext';
import { formatCurrency } from '../services/api';

interface ShoppingCartProps {
  onProceedToCheckout: () => void;
  onBack: () => void;
}

export function ShoppingCart({ onProceedToCheckout, onBack }: ShoppingCartProps) {
  const { cartTotal, cartItems, paymentPlans, approved, updateQuantity, removeItem } = usePayment();
  const monthlyPayment = approved && paymentPlans.length > 0 ? paymentPlans[0].monthly : 0;
  
  // Calculate subtotal (before tax)
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = cartTotal - subtotal; // Tax is the difference

  const handleIncreaseQuantity = (itemId: string, currentQty: number) => {
    updateQuantity(itemId, currentQty + 1);
  };

  const handleDecreaseQuantity = (itemId: string, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity(itemId, currentQty - 1);
    }
  };

  const handleRemove = (itemId: string) => {
    removeItem(itemId);
  };

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
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2">{item.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">Qty: {item.quantity} | In Stock</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 border border-slate-300 rounded-lg">
                        <button 
                          onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                          className="px-3 py-2 hover:bg-slate-50 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                          className="px-3 py-2 hover:bg-slate-50 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl mb-1">{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-slate-200 sticky top-24">
              <h2 className="text-xl mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-xl">Total</span>
                <span className="text-2xl">{formatCurrency(cartTotal)}</span>
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
                  Split into 4 payments of <span className="font-medium">{approved && monthlyPayment > 0 ? formatCurrency(monthlyPayment) : 'checking...'}</span>
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
