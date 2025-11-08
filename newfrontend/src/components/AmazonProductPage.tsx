import { Star, ShoppingCart, ArrowLeft, Shield, Truck, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AmazonProductPageProps {
  onAddToCart: () => void;
  onBack: () => void;
}

export function AmazonProductPage({ onAddToCart, onBack }: AmazonProductPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Amazon-style Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={onBack} className="text-white hover:text-slate-300 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">amazon</span>
            </div>
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Amazon"
                  className="w-full px-4 py-2 rounded-md text-slate-900"
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm">Hello, Guest</span>
            <ShoppingCart className="h-6 w-6" />
          </div>
        </div>
      </header>

      {/* Product Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-slate-50 rounded-lg p-12 mb-4">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1604780032295-9f8186eede96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb255JTIwd2lyZWxlc3MlMjBoZWFkcGhvbmVzJTIwYmxhY2t8ZW58MXx8fHwxNzYyNjIyNzUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Sony WH-1000XM5 Headphones"
                className="w-full h-auto"
              />
            </div>
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-slate-100 rounded border-2 border-slate-200 p-2 cursor-pointer hover:border-orange-500 transition-colors">
                  <div className="aspect-square bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-4">
              <span className="text-sm text-orange-600">Visit the Sony Store</span>
            </div>
            
            <h1 className="text-3xl mb-4">
              Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones with Auto Noise Canceling Optimizer, Crystal Clear Hands-Free Calling, and Alexa Voice Control, Black
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <span className="text-orange-500">4.6</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-4 w-4 ${star <= 4 ? 'fill-orange-400 text-orange-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <span className="text-sm text-blue-600 hover:text-orange-600 cursor-pointer">32,847 ratings</span>
            </div>

            <div className="border-t border-slate-200 pt-4 mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-sm text-slate-600">Price:</span>
                <span className="text-3xl text-red-700">$348.00</span>
              </div>
              <div className="text-sm text-slate-600 mb-4">
                FREE Returns
              </div>
            </div>

            {/* Features */}
            <div className="mb-6 space-y-2">
              <div className="text-sm">✓ Industry-leading noise cancellation</div>
              <div className="text-sm">✓ Up to 30-hour battery life</div>
              <div className="text-sm">✓ Crystal clear hands-free calling</div>
              <div className="text-sm">✓ Alexa & Google Assistant support</div>
              <div className="text-sm">✓ Premium sound quality with LDAC</div>
            </div>

            {/* Delivery Info */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Truck className="h-5 w-5 text-teal-600" />
                <div>
                  <div className="text-sm">Free delivery <span>Tomorrow, Nov 9</span></div>
                  <div className="text-sm text-slate-600">Order within 2 hrs 15 mins</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <RotateCcw className="h-5 w-5" />
                <span>Free 30-day returns</span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              <Button
                onClick={onAddToCart}
                className="w-full bg-orange-400 hover:bg-orange-500 text-black py-6 rounded-full"
              >
                Add to Cart
              </Button>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-black py-6 rounded-full"
              >
                Buy Now
              </Button>
            </div>

            {/* Security */}
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-600">
              <Shield className="h-4 w-4" />
              <span>Secure transaction</span>
            </div>
          </div>
        </div>

        {/* Additional Product Info */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <h2 className="text-2xl mb-6">Product Details</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="mb-3">Technical Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex"><span className="text-slate-600 w-40">Brand</span><span>Sony</span></div>
                <div className="flex"><span className="text-slate-600 w-40">Model Name</span><span>WH-1000XM5</span></div>
                <div className="flex"><span className="text-slate-600 w-40">Color</span><span>Black</span></div>
                <div className="flex"><span className="text-slate-600 w-40">Connectivity</span><span>Wireless, Bluetooth</span></div>
              </div>
            </div>
            <div>
              <h3 className="mb-3">About this item</h3>
              <ul className="space-y-2 text-sm">
                <li>• Industry-leading noise cancellation with two processors</li>
                <li>• Magnificent sound quality with DSEE Extreme</li>
                <li>• Crystal clear hands-free calling with 4 beamforming mics</li>
                <li>• Up to 30-hour battery life with quick charging</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
