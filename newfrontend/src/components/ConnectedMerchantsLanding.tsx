import { Store, ShoppingBag, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { usePayment } from '../contexts/PaymentContext';
import { formatCurrency } from '../services/api';

interface ConnectedMerchantsLandingProps {
  onMerchantSelect: (merchant: string) => void;
  onViewCreditScore: () => void;
}

export function ConnectedMerchantsLanding({ onMerchantSelect, onViewCreditScore }: ConnectedMerchantsLandingProps) {
  const { creditScore, maxCreditLimit, loading, connectedMerchantsCount } = usePayment();

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
      id: 'doordash',
      name: 'DoorDash',
      category: 'Food Delivery',
      color: 'from-red-600 to-pink-600',
      icon: '🍔',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-600 to-blue-600 flex items-center justify-center">
              <span className="text-xl">✦</span>
            </div>
            <span className="text-xl tracking-tight">Wings</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-600">Dashboard</span>
            <span className="text-slate-600">Activity</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-600 to-blue-600 flex items-center justify-center">
              <span className="text-white text-sm">✦</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl mb-3">Your Merchants</h1>
          <p className="text-xl text-slate-600">
            Shop seamlessly with flexible payment options powered by Wings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-stretch">
          {/* Credit Score Card - Featured */}
          <button
            onClick={onViewCreditScore}
            className="bg-gradient-to-br from-sky-600 to-blue-600 rounded-2xl p-6 border border-sky-500 text-white hover:shadow-2xl hover:shadow-sky-200 transition-all duration-300 group cursor-pointer h-full min-h-[180px] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm opacity-90">Wings Score</span>
              </div>
              <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-5xl mb-2">{loading ? '...' : creditScore}</div>
            <div className="text-sm opacity-90 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>+12 this month</span>
            </div>
          </button>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 h-full min-h-[180px]">
            <div className="text-3xl mb-1">{loading ? '...' : formatCurrency(maxCreditLimit)}</div>
            <div className="text-slate-600">Available Credit</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 h-full min-h-[180px]">
            <div className="text-3xl mb-1">0%</div>
            <div className="text-slate-600">Interest Rate</div>
          </div>
        </div>

        {/* Merchant Grid */}
        <div className="grid grid-cols-4 gap-6">
          {merchants.map((merchant) => (
            <button
              key={merchant.id}
              onClick={() => onMerchantSelect(merchant.id)}
              className="group bg-white rounded-xl p-4 border border-slate-200 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50 transition-all duration-300 text-center aspect-square flex flex-col items-center justify-center"
            >
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${merchant.color} flex items-center justify-center text-3xl mb-3`}>
                {merchant.icon}
              </div>
              <h3 className="text-base mb-1">{merchant.name}</h3>
              <p className="text-xs text-slate-600 mb-2">{merchant.category}</p>
              <div className="flex items-center gap-1 text-xs text-sky-600">
                <ShoppingBag className="h-3 w-3" />
                <span>Start Shopping</span>
              </div>
            </button>
          ))}
        </div>

        {/* Add Connection actions removed per requirements */}

        {/* Info Banner */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl mb-2">How Wings Works</h3>
              <p className="text-slate-700 leading-relaxed">
                Shop at any connected merchant and choose Wings at checkout. Split your purchase into flexible installments with 0% interest. 
                No hidden fees, just transparent and simple payments.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}