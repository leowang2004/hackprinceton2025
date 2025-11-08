import { ArrowLeft, Star, Truck, Shield, Heart, Share2, ChevronRight, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BestBuyProductPageProps {
  onAddToCart: () => void;
  onBuyNow: () => void;
  onBack: () => void;
}

export function BestBuyProductPage({ onAddToCart, onBuyNow, onBack }: BestBuyProductPageProps) {
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
              <span className="text-2xl">Best</span>
              <span className="text-2xl text-yellow-500">Buy</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-white rounded-2xl mb-4 overflow-hidden border border-slate-200 flex items-center justify-center p-8">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80"
                alt="Sony WH-1000XM5 Headphones"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-white rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer flex items-center justify-center p-2"
                >
                  <ImageWithFallback
                    src={`https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=200&q=80&crop=entropy&cs=tinysrgb&fit=max&${i}`}
                    alt={`View ${i}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  Best Seller
                </div>
                <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                  <Zap className="h-3 w-3" />
                  Deal of the Day
                </div>
              </div>
              <div className="text-sm text-blue-600 mb-2">SONY</div>
              <h1 className="text-4xl mb-3">
                WH-1000XM5 Wireless Noise-Canceling Headphones
              </h1>
              <p className="text-slate-600 mb-4">
                Industry-leading noise cancellation with Premium Sound Quality - Black
              </p>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-slate-600">4.9 (8,234 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-200">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl">$349.99</span>
                <span className="text-xl text-slate-500 line-through">$399.99</span>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                  Save $50
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Zap className="h-4 w-4" />
                <span>Deal ends in 6 hours</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg">Key Features</h3>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="mb-1">Industry-Leading Noise Cancellation</div>
                    <div className="text-sm text-slate-600">
                      Advanced ANC with 8 microphones for superior sound isolation
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="mb-1">30-Hour Battery Life</div>
                    <div className="text-sm text-slate-600">
                      All-day power with quick charging (3 min = 3 hours)
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="mb-1">Premium Sound Quality</div>
                    <div className="text-sm text-slate-600">
                      LDAC audio codec and DSEE Extreme upscaling
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
                  { name: 'Black', color: 'bg-black' },
                  { name: 'Silver', color: 'bg-slate-300' },
                  { name: 'Midnight Blue', color: 'bg-blue-900' },
                ].map((option) => (
                  <button
                    key={option.name}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      option.name === 'Black'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full ${option.color} border border-slate-300`} />
                    <span className="text-sm">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Store Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                <Truck className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="text-sm mb-1">Free Shipping</div>
                  <div className="text-xs text-slate-600">Arrives tomorrow</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                <Shield className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="text-sm mb-1">In Stock</div>
                  <div className="text-xs text-slate-600">Ready to ship</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={onBuyNow}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg"
              >
                Buy Now with WingsPay
              </Button>
              <Button 
                onClick={onAddToCart}
                className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-lg"
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
                    $87.50/month with WingsPay
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-indigo-600" />
              </div>
            </div>

            {/* Best Buy Protection */}
            <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">Best Buy Protection Plan</span>
                </div>
                <span className="text-sm">+$49.99</span>
              </div>
              <p className="text-xs text-slate-600">
                2-year protection with 24/7 support and free replacement
              </p>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 max-w-4xl bg-white rounded-2xl p-8 border border-slate-200">
          <h2 className="text-2xl mb-6">Product Description</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-4">
              The Sony WH-1000XM5 headphones set a new standard for premium audio with industry-leading 
              noise cancellation. Featuring two processors controlling 8 microphones, these headphones 
              deliver unprecedented noise cancelling quality, automatically optimizing based on your environment.
            </p>
            <p className="text-slate-600 mb-4">
              Experience exceptional sound quality with the newly developed 30mm driver unit and Integrated 
              Processor V1. LDAC support transmits approximately three times more data than conventional 
              Bluetooth audio, while DSEE Extreme upscales compressed digital music files in real time.
            </p>
            <p className="text-slate-600">
              With up to 30 hours of battery life and quick charging capabilities, these headphones are 
              built for all-day use. The redesigned lightweight design with soft fit leather ensures 
              superior comfort, while multipoint connection allows seamless switching between devices.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}