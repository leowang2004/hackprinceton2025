import { ArrowLeft, Star, ShoppingCart, Truck, Shield, Package } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WalmartProductPageProps {
  onAddToCart: () => void;
  onBuyNow: () => void;
  onBack: () => void;
}

export function WalmartProductPage({ onAddToCart, onBuyNow, onBack }: WalmartProductPageProps) {
  const price = 448.0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-700 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏪</span>
              <span>Walmart</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-600">Hello, Guest</span>
            <ShoppingCart className="h-6 w-6 text-slate-700" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-2xl p-12 shadow-lg">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1585128792020-803d29415281?w=1200&auto=format&fit=crop&q=80"
              alt='Samsung 55" 4K Smart TV'
              className="w-full h-auto"
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="mb-3">Samsung 55" 4K Smart TV</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <span className="text-slate-600 text-sm">4.0 • 2,184 reviews</span>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-slate-600">Price</span>
                <span className="text-3xl">${price.toFixed(2)}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-8">
              <li className="flex items-center gap-2 text-slate-700">
                <Truck className="h-5 w-5 text-blue-600" />
                Free 2‑day shipping or store pickup
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <Shield className="h-5 w-5 text-blue-600" />
                1‑year limited warranty
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <Package className="h-5 w-5 text-blue-600" />
                Easy returns at any Walmart store
              </li>
            </ul>

            <div className="flex items-center gap-3 mb-8">
              <Button
                onClick={onAddToCart}
                className="flex-1 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl"
              >
                Add to Cart
              </Button>
              <Button
                onClick={onBuyNow}
                variant="outline"
                className="h-14 border-2 border-indigo-600 text-indigo-600 rounded-xl"
              >
                Buy Now
              </Button>
            </div>

            {/* Wings payment preview */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center">
                  ⚡
                </div>
                <div>
                  <div className="text-slate-900">Pay with Wings - Split into 4 interest‑free payments</div>
                  <div className="text-slate-600 text-sm">4 × ${(price / 4).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

