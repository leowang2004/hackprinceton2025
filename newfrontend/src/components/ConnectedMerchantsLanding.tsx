import { Store, ShoppingBag, CheckCircle2, ArrowRight } from 'lucide-react';

interface ConnectedMerchantsLandingProps {
  onMerchantSelect: (merchant: string) => void;
}

export function ConnectedMerchantsLanding({ onMerchantSelect }: ConnectedMerchantsLandingProps) {
  const merchants = [
    {
      id: 'amazon',
      name: 'Amazon',
      category: 'Everything Store',
      color: 'from-orange-500 to-amber-500',
      icon: '🛒',
    },
    {
      id: 'wayfair',
      name: 'Wayfair',
      category: 'Home & Furniture',
      color: 'from-purple-500 to-pink-500',
      icon: '🏠',
    },
    {
      id: 'bestbuy',
      name: 'Best Buy',
      category: 'Electronics',
      color: 'from-blue-500 to-indigo-500',
      icon: '💻',
    },
    {
      id: 'target',
      name: 'Target',
      category: 'Retail & Grocery',
      color: 'from-red-500 to-rose-500',
      icon: '🎯',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <span className="text-xl">✦</span>
            </div>
            <span className="text-xl tracking-tight">WingsPay</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-600">Dashboard</span>
            <span className="text-slate-600">Activity</span>
            <div className="h-8 w-8 rounded-full bg-slate-200" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">All Merchants Connected</span>
          </div>
          <h1 className="text-4xl mb-3">Your Connected Merchants</h1>
          <p className="text-xl text-slate-600">
            Shop seamlessly with flexible payment options powered by WingsPay
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="text-3xl mb-1">4</div>
            <div className="text-slate-600">Connected Stores</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="text-3xl mb-1">$5,000</div>
            <div className="text-slate-600">Available Credit</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="text-3xl mb-1">0%</div>
            <div className="text-slate-600">Interest Rate</div>
          </div>
        </div>

        {/* Merchant Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {merchants.map((merchant) => (
            <button
              key={merchant.id}
              onClick={() => onMerchantSelect(merchant.id)}
              className="group bg-white rounded-2xl p-8 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 text-left"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${merchant.color} flex items-center justify-center text-3xl`}>
                  {merchant.icon}
                </div>
                <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-2xl mb-2">{merchant.name}</h3>
              <p className="text-slate-600 mb-4">{merchant.category}</p>
              <div className="flex items-center gap-2 text-sm text-indigo-600">
                <ShoppingBag className="h-4 w-4" />
                <span>Start Shopping</span>
              </div>
            </button>
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl mb-2">How WingsPay Works</h3>
              <p className="text-slate-700 leading-relaxed">
                Shop at any connected merchant and choose WingsPay at checkout. Split your purchase into flexible installments with 0% interest. 
                No hidden fees, just transparent and simple payments.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
