import { Store, ShoppingBag, CheckCircle2, ArrowRight, TrendingUp, Sparkles, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AddConnectionDialog } from './AddConnectionDialog';
import { usePayment } from '../contexts/PaymentContext';
import { formatCurrency } from '../services/api';

interface ConnectedMerchantsLandingProps {
  onMerchantSelect: (merchant: string) => void;
  onViewCreditScore: () => void;
  onViewCart?: (merchant: string) => void;
}

export function ConnectedMerchantsLanding({ onMerchantSelect, onViewCreditScore, onViewCart }: ConnectedMerchantsLandingProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllMerchants, setShowAllMerchants] = useState(false);
  const { creditScore, maxCreditLimit, loading, cartItems } = usePayment();

  // Helper: infer cart count by merchant from item id prefix
  const getCartCount = (merchantId: string) => {
    const prefixMap: Record<string, string> = {
      amazon: 'amz-',
      wayfair: 'wf-',
      bestbuy: 'bb-',
      target: 'tgt-',
    };
    const prefix = prefixMap[merchantId];
    if (!prefix) return 0;
    return cartItems
      .filter(item => item.id.startsWith(prefix))
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const connectedMerchants = [
    {
      id: 'amazon',
      name: 'Amazon',
      category: 'Everything Store',
      color: 'from-orange-500 to-amber-500',
      icon: '🛒',
      connected: true,
    },
    {
      id: 'wayfair',
      name: 'Wayfair',
      category: 'Home & Furniture',
      color: 'from-purple-500 to-pink-500',
      icon: '🏠',
      connected: true,
    },
    {
      id: 'bestbuy',
      name: 'Best Buy',
      category: 'Electronics',
      color: 'from-blue-500 to-indigo-500',
      icon: '💻',
      connected: true,
    },
    {
      id: 'target',
      name: 'Target',
      category: 'Retail & Grocery',
      color: 'from-red-500 to-rose-500',
      icon: '🎯',
      connected: true,
    },
  ];

  const exploreMerchants = [
    { id: 'instacart', name: 'Instacart', category: 'Grocery Delivery', color: 'from-green-500 to-emerald-500', icon: '🥬', connected: false },
    { id: 'sephora', name: 'Sephora', category: 'Beauty & Cosmetics', color: 'from-black to-slate-800', icon: '💄', connected: false },
    { id: 'zara', name: 'Zara', category: 'Fashion & Apparel', color: 'from-slate-700 to-slate-900', icon: '👗', connected: false },
    { id: 'lululemon', name: 'Lululemon', category: 'Athletic Wear', color: 'from-red-600 to-rose-700', icon: '🧘', connected: false },
    { id: 'alo', name: 'Alo Yoga', category: 'Yoga & Wellness', color: 'from-slate-600 to-gray-700', icon: '🕉️', connected: false },
    { id: 'baccarat', name: 'Baccarat', category: 'Luxury Crystal', color: 'from-red-700 to-red-900', icon: '💎', connected: false },
    { id: 'nike', name: 'Nike', category: 'Athletic & Sportswear', color: 'from-slate-900 to-black', icon: '👟', connected: false },
    { id: 'walmart', name: 'Walmart', category: 'General Retail', color: 'from-blue-500 to-blue-600', icon: '🏪', connected: false },
    { id: 'homedepot', name: 'Home Depot', category: 'Home Improvement', color: 'from-orange-500 to-orange-600', icon: '🔨', connected: false },
    { id: 'petco', name: 'Petco', category: 'Pet Supplies', color: 'from-blue-400 to-red-500', icon: '🐾', connected: false },
    { id: 'cvs', name: 'CVS Pharmacy', category: 'Health & Wellness', color: 'from-red-500 to-red-600', icon: '💊', connected: false },
    { id: 'gamestop', name: 'GameStop', category: 'Gaming', color: 'from-slate-700 to-slate-900', icon: '🎮', connected: false },
  ];

  const filteredExploreMerchants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return exploreMerchants;
    return exploreMerchants.filter(m =>
      m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const displayedExploreMerchants = showAllMerchants
    ? filteredExploreMerchants
    : filteredExploreMerchants.slice(0, 4);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">
          {/* Credit Score Card - Featured */}
          <button
            onClick={onViewCreditScore}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 border border-indigo-500 text-white hover:shadow-2xl hover:shadow-indigo-200 transition-all duration-300 group cursor-pointer h-full min-h-[160px] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm opacity-90">WingsPay Score</span>
              </div>
              <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-5xl mb-2">{loading ? '...' : creditScore}</div>
            <div className="text-sm opacity-90 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>+12 this month</span>
            </div>
          </button>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 h-full min-h-[160px]">
            <div className="text-3xl mb-1">{loading ? '...' : formatCurrency(maxCreditLimit)}</div>
            <div className="text-slate-600">Available Credit</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 h-full min-h-[160px]">
            <div className="text-3xl mb-1">0%</div>
            <div className="text-slate-600">Interest Rate</div>
          </div>
        </div>

        {/* Add Connection Button (moved above sections) */}
        <div className="mb-12">
          <Button
            onClick={() => setShowAddDialog(true)}
            className="h-14 px-8 text-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-indigo-200 transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-6 w-6 mr-2" />
            Add Connection
          </Button>
        </div>

        {/* Merchant Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {connectedMerchants.map((merchant) => {
            const cartCount = getCartCount(merchant.id);
            return (
            <button
              key={merchant.id}
              onClick={() => onMerchantSelect(merchant.id)}
              className="group bg-white rounded-2xl p-8 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 text-left"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="relative">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${merchant.color} flex items-center justify-center text-3xl`}>
                  {merchant.icon}
                  </div>
                  {cartCount > 0 && (
                    <div className="absolute -top-2 -right-2 h-7 w-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm">
                      {cartCount}
                    </div>
                  )}
                </div>
                <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-2xl mb-2">{merchant.name}</h3>
              <p className="text-slate-600 mb-4">{merchant.category}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onMerchantSelect(merchant.id)}
                  className="flex-1 flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors py-2 px-4 border border-indigo-200 rounded-lg hover:bg-indigo-50"
                >
                <ShoppingBag className="h-4 w-4" />
                  <span>Shop Now</span>
                </button>
                {cartCount > 0 && (
                  <button
                    onClick={() => onViewCart && onViewCart(merchant.id)}
                    className="flex items-center justify-center gap-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors py-2 px-4 rounded-lg"
                  >
                    View Cart ({cartCount})
                  </button>
                )}
              </div>
            </button>
          )})}
        </div>

        {/* Explore More Merchants */}
        <div className="mt-12 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl">Explore More Merchants</h2>
          </div>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search merchants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-xl"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {displayedExploreMerchants.map((merchant) => {
              const cartCount = getCartCount(merchant.id);
              return (
                <div
                  key={merchant.id}
                  className="group bg-white rounded-2xl p-8 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                      <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${merchant.color} flex items-center justify-center text-3xl`}>
                        {merchant.icon}
                      </div>
                      {cartCount > 0 && (
                        <div className="absolute -top-2 -right-2 h-7 w-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm">
                          {cartCount}
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-2xl mb-2">{merchant.name}</h3>
                  <p className="text-slate-600 mb-4">{merchant.category}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onMerchantSelect(merchant.id)}
                      className="flex-1 flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors py-2 px-4 border border-indigo-200 rounded-lg hover:bg-indigo-50"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Shop Now</span>
                    </button>
                    {cartCount > 0 && (
                      <button
                        onClick={() => onViewCart && onViewCart(merchant.id)}
                        className="flex items-center justify-center gap-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors py-2 px-4 rounded-lg"
                      >
                        View Cart ({cartCount})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {filteredExploreMerchants.length > 4 && (
            <div className="text-center">
              <Button
                onClick={() => setShowAllMerchants(!showAllMerchants)}
                variant="outline"
                className="h-12 px-8 border-slate-300 hover:border-indigo-500 hover:bg-indigo-50"
              >
                {showAllMerchants ? 'Show Less' : 'Load More Merchants'}
              </Button>
            </div>
          )}
        </div>

        {/* Add Connection Dialog */}
        <AddConnectionDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
        />

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