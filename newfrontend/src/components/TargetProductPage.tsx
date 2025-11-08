import { ArrowLeft, Star, Truck, Shield, Heart, Share2, ChevronRight, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TargetProductPageProps {
  onAddToCart: () => void;
  onBuyNow: () => void;
  onBack: () => void;
}

export function TargetProductPage({ onAddToCart, onBuyNow, onBack }: TargetProductPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-white" />
              </div>
              <span className="text-2xl">Target</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-white rounded-2xl mb-4 overflow-hidden border border-slate-200">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80"
                alt="Nespresso Vertuo Coffee Maker"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-white rounded-lg overflow-hidden border-2 border-transparent hover:border-red-600 transition-all cursor-pointer"
                >
                  <ImageWithFallback
                    src={`https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80&crop=entropy&cs=tinysrgb&fit=max&${i}`}
                    alt={`View ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                  <Tag className="h-3 w-3" />
                  Circle Exclusive
                </div>
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                  Limited Time
                </div>
              </div>
              <div className="text-sm text-slate-600 mb-2">NESPRESSO</div>
              <h1 className="text-4xl mb-3">
                Vertuo Next Coffee and Espresso Maker
              </h1>
              <p className="text-slate-600 mb-4">
                Premium Coffee Machine with Aeroccino Milk Frother - Graphite Grey
              </p>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-red-500 text-red-500" />
                  ))}
                  <Star className="h-5 w-5 fill-red-200 text-red-200" />
                </div>
                <span className="text-slate-600">4.6 (1,523 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-red-50 rounded-2xl p-6 mb-6 border border-red-200">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-4xl">$179.99</span>
                <span className="text-xl text-slate-500 line-through">$229.99</span>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                  22% OFF
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-white" />
                </div>
                <div>
                  <div className="text-sm">RedCard saves an extra 5%</div>
                  <div className="text-xs text-slate-600">Final price: $170.99</div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg">Key Features</h3>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="mb-1">One-Touch Brewing</div>
                    <div className="text-sm text-slate-600">
                      Barista-grade coffee at the touch of a button
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="mb-1">Aeroccino Milk Frother Included</div>
                    <div className="text-sm text-slate-600">
                      Create perfect lattes and cappuccinos
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="mb-1">5 Cup Sizes Available</div>
                    <div className="text-sm text-slate-600">
                      From espresso to alto, perfectly brewed every time
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <h3 className="text-lg mb-3">Select Color</h3>
              <div className="flex gap-3">
                {[
                  { name: 'Graphite', color: 'bg-slate-700' },
                  { name: 'Red', color: 'bg-red-600' },
                  { name: 'White', color: 'bg-white border-slate-300' },
                ].map((option) => (
                  <button
                    key={option.name}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      option.name === 'Graphite'
                        ? 'border-red-600 bg-red-50'
                        : 'border-slate-200 hover:border-red-300'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full ${option.color} border`} />
                    <span className="text-sm">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                <Truck className="h-6 w-6 text-red-600" />
                <div>
                  <div className="text-sm mb-1">Free Shipping</div>
                  <div className="text-xs text-slate-600">Or pickup today</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                <Shield className="h-6 w-6 text-red-600" />
                <div>
                  <div className="text-sm mb-1">90-Day Returns</div>
                  <div className="text-xs text-slate-600">With receipt</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={onBuyNow}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white text-lg"
              >
                Buy Now with WingsPay
              </Button>
              <Button 
                onClick={onAddToCart}
                variant="outline"
                className="w-full h-14 border-2 border-red-600 text-red-600 hover:bg-red-50 text-lg"
              >
                Add to Cart
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-slate-300">
                  <Heart className="h-5 w-5 mr-2" />
                  Add to Lists
                </Button>
                <Button variant="outline" className="flex-1 border-slate-300">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* WingsPay Promotion */}
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="mb-1">Pay in 4 interest-free payments</div>
                  <div className="text-sm text-slate-600">
                    $45/month with WingsPay
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-indigo-600" />
              </div>
            </div>

            {/* Target Circle */}
            <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-white" />
                  </div>
                  <span className="text-sm">Earn 1% with Target Circle</span>
                </div>
                <span className="text-sm text-red-600">+$1.80</span>
              </div>
              <p className="text-xs text-slate-600">
                Free to join - get deals, rewards, and more
              </p>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 max-w-4xl bg-white rounded-2xl p-8 border border-slate-200">
          <h2 className="text-2xl mb-6">Product Description</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-4">
              Discover the perfect cup of coffee with the Nespresso Vertuo Next Coffee and Espresso Maker. 
              This premium machine uses Centrifusion technology to gently blend ground coffee with water and 
              produce the perfect crema for a smooth, rich cup every time.
            </p>
            <p className="text-slate-600 mb-4">
              The included Aeroccino milk frother makes it easy to create café-style beverages at home. 
              With one-touch operation, you can brew five different cup sizes from espresso to alto. 
              The machine automatically reads each capsule's barcode to optimize brewing parameters.
            </p>
            <p className="text-slate-600">
              Made with 54% recycled materials and featuring an energy-saving automatic shut-off, this 
              machine combines sustainability with convenience. Compatible with the full range of Vertuo 
              capsules for endless variety.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}