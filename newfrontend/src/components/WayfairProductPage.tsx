import { ArrowLeft, Star, Truck, Shield, Heart, Share2, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WayfairProductPageProps {
  onAddToCart: () => void;
  onBuyNow: () => void;
  onBack: () => void;
}

export function WayfairProductPage({ onAddToCart, onBuyNow, onBack }: WayfairProductPageProps) {
  return (
    <div className="min-h-screen bg-white">
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
              <span className="text-2xl text-purple-600">wayfair</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-slate-50 rounded-2xl mb-4 overflow-hidden border border-slate-200">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80"
                alt="Luxury Memory Foam Mattress"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-slate-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all cursor-pointer"
                >
                  <ImageWithFallback
                    src={`https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&q=80&crop=entropy&cs=tinysrgb&fit=max&${i}`}
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
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm mb-3">
                Wayfair Exclusive
              </div>
              <h1 className="text-4xl mb-3">
                Sealy Premium Memory Foam Mattress
              </h1>
              <p className="text-slate-600 mb-4">
                12-Inch Cooling Gel Memory Foam with Adaptive Support - Queen Size
              </p>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-purple-500 text-purple-500" />
                  ))}
                </div>
                <span className="text-slate-600">4.8 (2,847 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-purple-50 rounded-2xl p-6 mb-6 border border-purple-200">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl">$799.99</span>
                <span className="text-xl text-slate-500 line-through">$1,299.99</span>
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                  38% OFF
                </span>
              </div>
              <p className="text-sm text-purple-700">
                Limited time offer - Free white glove delivery included
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg">Key Features</h3>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="mb-1">Cooling Gel Technology</div>
                    <div className="text-sm text-slate-600">
                      Advanced gel-infused memory foam keeps you cool all night
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="mb-1">Adaptive Support System</div>
                    <div className="text-sm text-slate-600">
                      Contours to your body for personalized comfort
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="mb-1">CertiPUR-US Certified</div>
                    <div className="text-sm text-slate-600">
                      Made without harmful chemicals, safe for your family
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="text-lg mb-3">Select Size</h3>
              <div className="grid grid-cols-3 gap-3">
                {['Twin', 'Full', 'Queen', 'King', 'Cal King'].map((size) => (
                  <button
                    key={size}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      size === 'Queen'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-sm">{size}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Truck className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="text-sm mb-1">Free Delivery</div>
                  <div className="text-xs text-slate-600">Ships in 3-5 days</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Shield className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="text-sm mb-1">100-Night Trial</div>
                  <div className="text-xs text-slate-600">Risk-free returns</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={onBuyNow}
                className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white text-lg"
              >
                Buy Now with WingsPay
              </Button>
              <Button 
                onClick={onAddToCart}
                variant="outline"
                className="w-full h-14 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-lg"
              >
                Add to Cart
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-slate-300">
                  <Heart className="h-5 w-5 mr-2" />
                  Save
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
                    $200/month with WingsPay
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 max-w-4xl">
          <h2 className="text-2xl mb-6">Product Description</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-4">
              Experience the ultimate in sleep comfort with the Sealy Premium Memory Foam Mattress. 
              This 12-inch mattress features advanced cooling gel technology that actively regulates 
              temperature throughout the night, ensuring you stay comfortable in any season.
            </p>
            <p className="text-slate-600 mb-4">
              The adaptive support system responds to your unique body shape and sleeping position, 
              providing targeted pressure relief where you need it most. Multiple layers of high-density 
              foam work together to minimize motion transfer, so you won't be disturbed by your partner's movements.
            </p>
            <p className="text-slate-600">
              Made in the USA and CertiPUR-US certified, this mattress is manufactured without harmful 
              chemicals and meets the highest standards for performance, emissions, and durability. 
              Backed by a 100-night risk-free trial and 10-year warranty.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}