import { useState } from 'react';
import { X, CheckCircle2, ExternalLink, Lock, Plus, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface AddConnectionDialogProps {
  open: boolean;
  onClose: () => void;
}

type ConnectionType = 'merchant' | 'bank';

export function AddConnectionDialog({ open, onClose }: AddConnectionDialogProps) {
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [merchantTokens, setMerchantTokens] = useState<Record<string, string>>({});
  const [bankData, setBankData] = useState({
    accountName: '',
    routingNumber: '',
    accountNumber: '',
  });

  const merchants = [
    { id: 'amazon', name: 'Amazon', icon: '🛒', color: 'from-orange-500 to-amber-500' },
    { id: 'wayfair', name: 'Wayfair', icon: '🏠', color: 'from-purple-500 to-pink-500' },
    { id: 'bestbuy', name: 'Best Buy', icon: '💻', color: 'from-blue-500 to-indigo-500' },
    { id: 'target', name: 'Target', icon: '🎯', color: 'from-red-500 to-rose-500' },
    { id: 'doordash', name: 'DoorDash', icon: '🍔', color: 'from-red-600 to-pink-600' },
    { id: 'uber', name: 'Uber', icon: '🚗', color: 'from-slate-900 to-slate-700' },
    { id: 'walmart', name: 'Walmart', icon: '🏪', color: 'from-blue-600 to-yellow-500' },
    { id: 'instacart', name: 'Instacart', icon: '🥕', color: 'from-green-500 to-emerald-500' },
  ];

  const handleMerchantToggle = (merchantId: string) => {
    if (selectedMerchants.includes(merchantId)) {
      setSelectedMerchants(selectedMerchants.filter(id => id !== merchantId));
      const newTokens = { ...merchantTokens };
      delete newTokens[merchantId];
      setMerchantTokens(newTokens);
    } else {
      setSelectedMerchants([...selectedMerchants, merchantId]);
    }
  };

  const handleMerchantRedirect = (merchantId: string) => {
    const token = `${merchantId}_token_${Math.random().toString(36).substring(7)}`;
    setMerchantTokens({ ...merchantTokens, [merchantId]: token });
  };

  const handleComplete = () => {
    // Reset state and close
    setConnectionType(null);
    setSelectedMerchants([]);
    setMerchantTokens({});
    setBankData({ accountName: '', routingNumber: '', accountNumber: '' });
    onClose();
  };

  const canCompleteMerchants = selectedMerchants.length > 0 && selectedMerchants.every(id => merchantTokens[id]);
  const canCompleteBank = bankData.accountName && bankData.routingNumber && bankData.accountNumber;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Connection</DialogTitle>
        </DialogHeader>

        {/* Connection Type Selection */}
        {!connectionType && (
          <div className="space-y-4 py-4">
            <p className="text-slate-600">What would you like to connect?</p>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Merchant Option */}
              <button
                onClick={() => setConnectionType('merchant')}
                className="group border-2 border-slate-200 rounded-2xl p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl mb-4">
                  🔗
                </div>
                <h3 className="text-lg mb-2">Merchant Accounts</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Connect shopping platforms via Knot API
                </p>
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <Plus className="h-4 w-4" />
                  <span>Add Merchants</span>
                </div>
              </button>

              {/* Bank Option */}
              <button
                onClick={() => setConnectionType('bank')}
                className="group border-2 border-slate-200 rounded-2xl p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center text-2xl mb-4">
                  🏦
                </div>
                <h3 className="text-lg mb-2">Bank Account</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Link additional accounts via Capital One Nessie
                </p>
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <Plus className="h-4 w-4" />
                  <span>Add Bank</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Merchant Connection */}
        {connectionType === 'merchant' && (
          <div className="py-4">
            <div className="mb-6">
              <button
                onClick={() => setConnectionType(null)}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="text-sm underline decoration-transparent group-hover:decoration-slate-400">
                  Back to options
                </span>
              </button>
              
              {/* Knot API Badge */}
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <span className="text-white text-lg">🔗</span>
                </div>
                <div>
                  <div className="text-sm text-emerald-900 flex items-center gap-2">
                    <span>Powered by</span>
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Knot API</span>
                  </div>
                  <div className="text-xs text-emerald-700">Secure merchant connectivity</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 max-h-96 overflow-y-auto">
              {merchants.map((merchant) => {
                const isSelected = selectedMerchants.includes(merchant.id);
                const hasToken = merchantTokens[merchant.id];

                return (
                  <div
                    key={merchant.id}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${merchant.color} flex items-center justify-center text-xl`}>
                        {merchant.icon}
                      </div>
                      <button
                        onClick={() => handleMerchantToggle(merchant.id)}
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </button>
                    </div>

                    <h3 className="text-sm mb-3">{merchant.name}</h3>

                    {isSelected && !hasToken && (
                      <Button
                        onClick={() => handleMerchantRedirect(merchant.id)}
                        variant="outline"
                        size="sm"
                        className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                    )}

                    {hasToken && (
                      <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Connected</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200 mb-4">
              <Lock className="h-4 w-4 text-indigo-600 flex-shrink-0" />
              <p className="text-xs text-slate-700">
                Your data is encrypted and secure. We only access transaction data.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!canCompleteMerchants}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </div>
          </div>
        )}

        {/* Bank Connection */}
        {connectionType === 'bank' && (
          <div className="py-4">
            <div className="mb-6">
              <button
                onClick={() => setConnectionType(null)}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="text-sm underline decoration-transparent group-hover:decoration-slate-400">
                  Back to options
                </span>
              </button>

              {/* Capital One Nessie Badge */}
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-50 to-blue-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-lg">🏦</span>
                </div>
                <div>
                  <div className="text-sm text-red-900 flex items-center gap-2">
                    <span>Powered by</span>
                    <span className="bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">Capital One Nessie</span>
                  </div>
                  <div className="text-xs text-red-700">Enterprise banking API</div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="add-accountName">Name on Account</Label>
                <Input
                  id="add-accountName"
                  value={bankData.accountName}
                  onChange={(e) => setBankData({ ...bankData, accountName: e.target.value })}
                  placeholder="John Doe"
                  className="h-11"
                />
              </div>

              <div>
                <Label htmlFor="add-routingNumber">Routing Number</Label>
                <Input
                  id="add-routingNumber"
                  value={bankData.routingNumber}
                  onChange={(e) => setBankData({ ...bankData, routingNumber: e.target.value })}
                  placeholder="123456789"
                  maxLength={9}
                  className="h-11"
                />
                <p className="text-xs text-slate-500 mt-1">9-digit routing number</p>
              </div>

              <div>
                <Label htmlFor="add-accountNumber">Account Number</Label>
                <Input
                  id="add-accountNumber"
                  value={bankData.accountNumber}
                  onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                  placeholder="1234567890"
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200 mb-4">
              <Lock className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700">
                <p className="mb-1">
                  <strong>Bank-level security.</strong> We use encryption and never store full account details.
                </p>
                <p className="text-xs text-slate-600">SOC 2 Type II Certified</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!canCompleteBank}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
