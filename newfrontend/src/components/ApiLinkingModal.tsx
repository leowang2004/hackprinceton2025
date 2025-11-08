import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Check, ChevronRight, ShoppingBag, Package, Tv, Coffee, Utensils, ShoppingCart } from 'lucide-react';
import { Card } from './ui/card';
import { ApiLoginModal } from './ApiLoginModal';

interface ApiLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (linkedApis: string[]) => void;
}

const API_OPTIONS = [
  {
    id: 'amazon',
    name: 'Amazon',
    description: 'Link your Amazon account to verify spending',
    icon: ShoppingBag,
    color: 'from-orange-500 to-orange-600',
    recommended: true,
  },
  {
    id: 'doordash',
    name: 'DoorDash',
    description: 'Connect DoorDash to verify activity',
    icon: Utensils,
    color: 'from-red-500 to-red-600',
    recommended: true,
  },
  {
    id: 'instacart',
    name: 'Instacart',
    description: 'Link Instacart for payment verification',
    icon: ShoppingCart,
    color: 'from-green-500 to-green-600',
    recommended: false,
  },
  {
    id: 'uber',
    name: 'Uber',
    description: 'Connect your Uber account',
    icon: Package,
    color: 'from-slate-800 to-slate-900',
    recommended: false,
  },
  {
    id: 'target',
    name: 'Target',
    description: 'Link Target shopping history',
    icon: ShoppingCart,
    color: 'from-red-600 to-red-700',
    recommended: false,
  },
  {
    id: 'starbucks',
    name: 'Starbucks',
    description: 'Connect Starbucks Rewards',
    icon: Coffee,
    color: 'from-green-600 to-green-700',
    recommended: false,
  },
];

export function ApiLinkingModal({ isOpen, onClose, onContinue }: ApiLinkingModalProps) {
  const [linkedApis, setLinkedApis] = useState<string[]>([]);
  const [linkingInProgress, setLinkingInProgress] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState<typeof API_OPTIONS[0] | null>(null);

  const handleLinkApi = (api: typeof API_OPTIONS[0]) => {
    setSelectedApi(api);
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    if (selectedApi) {
      setLinkingInProgress(selectedApi.id);
      
      // Simulate API linking process
      setTimeout(() => {
        setLinkedApis(prev => [...prev, selectedApi.id]);
        setLinkingInProgress(null);
        setSelectedApi(null);
      }, 500);
    }
  };

  const handleUnlinkApi = (apiId: string) => {
    setLinkedApis(prev => prev.filter(id => id !== apiId));
  };

  const handleContinue = () => {
    onContinue(linkedApis);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-center">Link Your Accounts</DialogTitle>
            <DialogDescription className="text-center text-slate-600">
              Connect your accounts to verify your spending patterns and unlock better payment terms
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-3">
            {API_OPTIONS.map((api) => {
              const Icon = api.icon;
              const isLinked = linkedApis.includes(api.id);
              const isLinking = linkingInProgress === api.id;

              return (
                <Card 
                  key={api.id}
                  className={`p-4 transition-all ${
                    isLinked 
                      ? 'border-emerald-500 bg-emerald-50/50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${api.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span>{api.name}</span>
                        {api.recommended && (
                          <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600">{api.description}</div>
                      <div className="text-xs text-slate-400 mt-1">Connect to Knot API</div>
                    </div>

                    {isLinked ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Check className="h-5 w-5" />
                          <span>Linked</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnlinkApi(api.id)}
                        >
                          Unlink
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleLinkApi(api)}
                        disabled={isLinking}
                        className="bg-indigo-600 hover:bg-indigo-700"
                        size="sm"
                      >
                        {isLinking ? (
                          'Linking...'
                        ) : (
                          <>
                            Link
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-white" />
              </div>
              <div>
                <div>Why link accounts?</div>
                <div className="text-slate-600">
                  Linking accounts helps us verify your identity and spending patterns, which allows us to offer you better payment terms and higher limits.
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Skip for now
            </Button>
            <Button
              onClick={handleContinue}
              disabled={linkedApis.length === 0}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              Continue ({linkedApis.length} linked)
            </Button>
          </div>

          <p className="text-xs text-center text-slate-500 mt-4">
            Your data is encrypted and secure. We never share your information without permission.
          </p>
        </DialogContent>
      </Dialog>

      <ApiLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        api={selectedApi}
      />
    </>
  );
}