import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Check, Zap, TrendingUp } from 'lucide-react';

interface PaymentPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: () => void;
  linkedApis: string[];
}

export function PaymentPlansModal({ isOpen, onClose, onSelectPlan, linkedApis }: PaymentPlansModalProps) {
  const hasLinkedAccounts = linkedApis.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check className="h-6 w-6 text-emerald-600" />
          </div>
          <DialogTitle className="text-center">Select Your Plan</DialogTitle>
          <DialogDescription asChild>
            <div className="text-center">
              {hasLinkedAccounts && (
                <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Better rates unlocked!</span>
                </div>
              )}
              <p className="text-slate-600">
                Purchase amount: <span>$624.99</span>
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {/* Monthly Plan */}
          <Card className="p-4 border-2 border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span>Pay Monthly</span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    12 months
                  </span>
                </div>
                <div className="text-slate-600 mb-2">
                  From <span>$52.08/month</span>
                </div>
                <div className="text-slate-500">
                  {hasLinkedAccounts ? '0% APR for qualified users' : 'Subject to credit approval'}
                </div>
              </div>
              <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
            </div>
          </Card>

          {/* Pay in 4 Plan - Recommended */}
          <Card className="p-4 border-2 border-indigo-500 bg-indigo-50/30 cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded-bl-lg">
              Recommended
            </div>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span>Pay in 4</span>
                  <Zap className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="mb-2">
                  <span>$156.25</span> every 2 weeks
                </div>
                <div className="text-emerald-600">
                  Interest-free • No fees
                </div>
              </div>
              <div className="h-5 w-5 rounded-full border-2 border-indigo-600 bg-indigo-600 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>
          </Card>

          {hasLinkedAccounts && (
            <Card className="p-4 border-2 border-emerald-200 bg-emerald-50/30">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-emerald-900 mb-1">
                    Enhanced limit available
                  </div>
                  <div className="text-emerald-700">
                    Based on your linked accounts, you qualify for up to $5,000 in WingsPay credit
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <Button 
          onClick={onSelectPlan}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
        >
          Continue with Pay in 4
        </Button>

        <p className="text-xs text-center text-slate-500 mt-4">
          By selecting a plan, you agree to WingsPay's payment terms. Your first payment is due in 2 weeks.
        </p>
      </DialogContent>
    </Dialog>
  );
}