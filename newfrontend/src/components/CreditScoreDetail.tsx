import { ArrowLeft, TrendingUp, Database, DollarSign, ShoppingBag, CreditCard, Sparkles, Info } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface CreditScoreDetailProps {
  onBack: () => void;
}

export function CreditScoreDetail({ onBack }: CreditScoreDetailProps) {
  const chartData = [
    { month: 'Aug', score: 712, limit: 4200, past: true },
    { month: 'Sep', score: 724, limit: 4500, past: true },
    { month: 'Oct', score: 736, limit: 4800, past: true },
    { month: 'Nov', score: 748, limit: 5000, current: true },
    { month: 'Dec', score: 762, limit: 5400, future: true },
    { month: 'Jan', score: 778, limit: 5900, future: true },
    { month: 'Feb', score: 793, limit: 6500, future: true },
  ];

  const [selectedBarIndex, setSelectedBarIndex] = useState(3); // Nov is index 3 (current month)

  const selectedData = chartData[selectedBarIndex];
  const projectedData = chartData[Math.min(selectedBarIndex + 3, chartData.length - 1)];
  
  // Calculate monthly growth based on previous months
  const calculateMonthlyGrowth = (index: number) => {
    if (index === 0) return 12; // default for first month
    const avgGrowth = chartData
      .slice(Math.max(0, index - 2), index + 1)
      .reduce((acc, item, idx, arr) => {
        if (idx === 0) return 0;
        return acc + (item.score - arr[idx - 1].score);
      }, 0) / Math.max(1, index);
    return Math.round(avgGrowth);
  };

  const monthlyGrowth = calculateMonthlyGrowth(selectedBarIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl">Your Wings Score</h1>
              <p className="text-slate-600">Alternative credit scoring powered by your financial data</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Score Display */}
          <div className="lg:col-span-2 space-y-8">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-sky-600 to-blue-600 rounded-3xl p-8 text-white">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="text-sm opacity-90 mb-2">Your Current Score</div>
                  <div className="text-7xl mb-3">748</div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-5 w-5" />
                    <span>+12 points this month</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-2">
                    <span className="text-sm">Excellent</span>
                  </div>
                  <div className="text-sm opacity-90">Top 15%</div>
                </div>
              </div>

              {/* Score Range */}
              <div className="relative">
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '74.8%' }} />
                </div>
                <div className="flex justify-between mt-2 text-sm opacity-75">
                  <span>300</span>
                  <span>550</span>
                  <span>700</span>
                  <span>850</span>
                </div>
              </div>
            </div>

            {/* How It's Calculated */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <h2 className="text-2xl mb-6">How Your Score is Calculated</h2>
              
              <div className="space-y-6">
                {/* Capital One Banking Data */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Database className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="mb-1">Banking Data</h3>
                        <p className="text-sm text-slate-600">Capital One Nessie API</p>
                      </div>
                    </div>
                    <span className="text-2xl">60%</span>
                  </div>
                  <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="absolute h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <div className="mt-3 pl-15 space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>• Average account balance</span>
                      <span className="text-green-600">Excellent</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Transaction consistency</span>
                      <span className="text-green-600">Strong</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Deposit frequency</span>
                      <span className="text-green-600">Regular</span>
                    </div>
                  </div>
                </div>

                {/* Knot Merchant Data */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="mb-1">Spending Behavior</h3>
                        <p className="text-sm text-slate-600">Knot API (Amazon, Target, etc.)</p>
                      </div>
                    </div>
                    <span className="text-2xl">40%</span>
                  </div>
                  <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="absolute h-full bg-purple-500 rounded-full" style={{ width: '40%' }} />
                  </div>
                  <div className="mt-3 pl-15 space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>• Payment reliability</span>
                      <span className="text-green-600">98% on-time</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Purchase patterns</span>
                      <span className="text-green-600">Stable</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Credit utilization</span>
                      <span className="text-green-600">32%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-sky-50 rounded-xl border border-sky-100 flex gap-3">
                <Info className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-sky-900">
                  <strong>Alternative Credit Scoring:</strong> Unlike traditional credit bureaus, we analyze your real financial behavior 
                  from banking and merchant data to provide a more accurate and fair credit assessment.
                </div>
              </div>
            </div>

            {/* Score Projection */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <h2 className="text-2xl mb-6">Score Projection</h2>
              
              {/* Chart Visualization */}
              <div className="mb-6">
                <div className="relative h-64 flex items-end gap-2">
                  {/* Simplified bar chart */}
                  {chartData.map((data, index) => {
                    const isSelected = selectedBarIndex === index;
                    return (
                      <button
                        key={index}
                        className="flex-1 flex flex-col items-center focus:outline-none group"
                        onClick={() => setSelectedBarIndex(index)}
                      >
                        <div className="w-full flex flex-col justify-end h-56 mb-2 relative">
                          <div
                            className={`w-full rounded-t-lg transition-all cursor-pointer ${
                              isSelected
                                ? 'ring-4 ring-sky-400 ring-offset-2'
                                : ''
                            } ${
                              data.current
                                ? 'bg-gradient-to-t from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500'
                              : data.future
                                ? 'bg-gradient-to-t from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500'
                                : 'bg-slate-300 hover:bg-slate-400'
                            }`}
                            style={{ height: `${((data.score - 600) / 250) * 100}%` }}
                          />
                          {isSelected && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-sky-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              ${(data.limit / 1000).toFixed(1)}k
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className={`text-sm mb-1 transition-all ${
                            isSelected 
                              ? 'text-sky-600' 
                              : data.current 
                              ? 'text-slate-900' 
                              : 'text-slate-600'
                          }`}>
                            {data.score}
                          </div>
                            <div className={`text-xs ${isSelected ? 'text-sky-600' : 'text-slate-500'}`}>
                            {data.month}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Projection Info */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className={`rounded-xl p-4 transition-all ${
                  selectedBarIndex === 3 ? 'bg-green-50 border-2 border-green-300' : 'bg-slate-50'
                }`}>
                  <div className="text-sm text-slate-600 mb-1">
                    {selectedData.current ? 'Your Current Credit Limit' : selectedData.future ? 'Future Credit Limit' : 'Past Credit Limit'}
                  </div>
                  <div className={`text-2xl mb-1 ${selectedBarIndex === 3 ? 'text-green-600' : 'text-slate-900'}`}>
                    ${selectedData.limit.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-600">Score: {selectedData.score} ({selectedData.month})</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-sm text-slate-600 mb-1">Projected Limit (3 months)</div>
                  <div className="text-2xl text-sky-600 mb-1">
                    ${projectedData.limit.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-600">Score: {projectedData.score} ({projectedData.month})</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-sm text-slate-600 mb-1">Monthly Growth</div>
                  <div className="text-2xl mb-1">
                    {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth}
                  </div>
                  <div className="text-xs text-slate-600">Average score increase</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Data Sources */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="mb-4">Connected Data Sources</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm mb-1">Capital One</div>
                    <div className="text-xs text-slate-600">Bank Account</div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                    🛒
                  </div>
                  <div className="flex-1">
                    <div className="text-sm mb-1">Amazon</div>
                    <div className="text-xs text-slate-600">Purchase History</div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center text-white">
                    🎯
                  </div>
                  <div className="flex-1">
                    <div className="text-sm mb-1">Target</div>
                    <div className="text-xs text-slate-600">Purchase History</div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                    💻
                  </div>
                  <div className="flex-1">
                    <div className="text-sm mb-1">Best Buy</div>
                    <div className="text-xs text-slate-600">Purchase History</div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>
            </div>

            {/* Improvement Tips */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="mb-4 text-green-900">Ways to Improve</h3>
              
              <div className="space-y-3 text-sm text-green-800">
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Maintain consistent on-time payments (+5-10 points)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Keep account balances stable (+3-7 points)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Reduce credit utilization below 30% (+8-12 points)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Connect more data sources (+5-8 points)</span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="mb-4">Your Benefits</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>$5,000 credit limit</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>0% APR on all purchases</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <span>Premium merchant access</span>
                </div>
              </div>

              <Button className="w-full mt-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white">
                Request Credit Increase
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}