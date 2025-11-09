import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface GenericProductPageProps {
  merchantName: string;
  product: {
    name: string;
    price: number;
    image: string;
  };
  onAddToCart: () => void;
  onBuyNow: () => void;
  onBack: () => void;
}

export function GenericProductPage({
  merchantName,
  product,
  onAddToCart,
  onBuyNow,
  onBack,
}: GenericProductPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple brand header */}
      <header className="bg-slate-900 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={onBack} className="text-white hover:text-slate-300 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{merchantName}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm">Hello, Guest</span>
            <ShoppingCart className="h-6 w-6" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product image */}
          <div className="bg-slate-50 rounded-lg p-12">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-auto"
            />
          </div>

          {/* Product details */}
          <div>
            <h1 className="text-3xl mb-4">{product.name}</h1>
            <div className="border-t border-slate-200 pt-4 mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-sm text-slate-600">Price:</span>
                <span className="text-3xl text-slate-900">${product.price.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <Button
                onClick={onAddToCart}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-full"
              >
                Add to Cart
              </Button>
              <Button
                onClick={onBuyNow}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-full"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

