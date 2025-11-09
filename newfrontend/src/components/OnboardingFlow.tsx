import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2, User, ShoppingBag, Building2, Lock, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import KnotapiJS from 'knotapi-js';

interface OnboardingFlowProps {
  onComplete: () => void;
}

type OnboardingStep = 'profile' | 'merchants' | 'bank';

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [merchantTokens, setMerchantTokens] = useState<Record<string, string>>({});
  const [bankData, setBankData] = useState({
    accountName: '',
    routingNumber: '',
    accountNumber: '',
  });

  const merchants = [
    { id: 'amazon', name: 'Amazon', logo: '/merchants/amazon.svg', color: 'from-orange-500 to-amber-500' },
    { id: 'wayfair', name: 'Wayfair', logo: '/merchants/wayfair.svg', color: 'from-purple-500 to-pink-500' },
    { id: 'bestbuy', name: 'Best Buy', logo: '/merchants/bestbuy.svg', color: 'from-blue-500 to-indigo-500' },
    { id: 'target', name: 'Target', logo: '/merchants/target.svg', color: 'from-red-500 to-rose-500' },
    { id: 'doordash', name: 'DoorDash', logo: '/merchants/doordash.svg', color: 'from-red-600 to-pink-600' },
    { id: 'uber', name: 'Uber', logo: '/merchants/uber.svg', color: 'from-slate-900 to-slate-700' },
  ];

  // ⚡ Skip for Demo Efficiency
  const handleSkipStep = () => {
    if (currentStep === 'profile') {
      setProfileData({
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 234-5678',
      });
      setTimeout(() => setCurrentStep('merchants'), 500);
    } else if (currentStep === 'merchants') {
      const demoMerchants = ['amazon', 'doordash', 'bestbuy'];
      setSelectedMerchants(demoMerchants);
      const tokens: Record<string, string> = {};
      demoMerchants.forEach(id => {
        tokens[id] = `${id}_demo_token_verified`;
      });
      setMerchantTokens(tokens);
      setTimeout(() => setCurrentStep('bank'), 500);
    } else if (currentStep === 'bank') {
      setBankData({
        accountName: 'Sarah Johnson',
        routingNumber: '021000021',
        accountNumber: '1234567890',
      });
      setTimeout(() => onComplete(), 500);
    }
  };

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

  const handleMerchantRedirect = async (merchantId: string) => {
    // Immediately mark as connected for demo purposes
    const token = `${merchantId}_connected_${Date.now()}`;
    setMerchantTokens(prev => ({ ...prev, [merchantId]: token }));
    
    try {
      // Call backend API to create a session
      const response = await fetch('http://localhost:3000/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({  
          external_user_id: profileData.email || `user_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const sessionData = await response.json();
      const { session } = sessionData;

      // Get client_id and environment from environment variables
      const clientId = import.meta.env.VITE_KNOT_CLIENT_ID;
      const environment = import.meta.env.VITE_KNOT_ENVIRONMENT as 'development' | 'production';

      if (!clientId) {
        throw new Error('VITE_KNOT_CLIENT_ID is not configured');
      }

      // Initialize Knot SDK
      const knotapi = new KnotapiJS();

      // Open Knot SDK with merchant connection flow
      knotapi.open({
        sessionId: session,
        clientId: clientId,
        environment: environment || 'development',
        product: 'transaction_link',
        merchantIds: [Number(merchantId)],
        entryPoint: 'onboarding',
        onSuccess: (product, details) => {
          console.log('Successfully connected to merchant:', details);
        },
        onError: (product, errorCode, message) => {
          console.error('Error connecting merchant:', errorCode, message);
          // Remove the token if connection failed
          setMerchantTokens(prev => {
            const updated = { ...prev };
            delete updated[merchantId];
            return updated;
          });
          alert(`Failed to connect: ${message}`);
        },
        onExit: async (product) => {
          console.log('User exited merchant connection flow');
          // Fetch transactions after user exits
          try {
            const transactionResponse = await fetch('http://localhost:3000/api/transactions/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                external_user_id: profileData.email || `user_${Date.now()}`,
                merchant_id: 44,
                limit: 100,
              }),
            });

            if (transactionResponse.ok) {
              const transactionData = await transactionResponse.json();
              console.log('Transactions fetched:', transactionData);
              // You can store or process transaction data here
            } else {
              console.error('Failed to fetch transactions');
            }
          } catch (error) {
            console.error('Error fetching transactions:', error);
          }
        },
        onEvent: (product, event, merchant, merchantId, payload, taskId) => {
          console.log('Knot event:', event, merchant, payload);
        },
      });
    } catch (error) {
      console.error('Error initializing Knot SDK:', error);
      // Remove the token if initialization failed
      setMerchantTokens(prev => {
        const updated = { ...prev };
        delete updated[merchantId];
        return updated;
      });
      alert('Failed to connect merchant. Please try again.');
    }
  };

  const canProceedProfile = profileData.firstName && profileData.lastName && profileData.email;
  // Changed: Allow proceeding if at least one merchant is selected, regardless of token status
  const canProceedMerchants = selectedMerchants.length > 0;
  const canProceedBank = bankData.accountName && bankData.routingNumber && bankData.accountNumber;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-600 to-blue-600 flex items-center justify-center">
              <span className="text-xl">✦</span>
            </div>
            <span className="text-xl tracking-tight">Wings</span>
          </div>
          {/* ⚡ Skip Button with effects */}
          <div className="ml-auto relative">
            <motion.div
              className="absolute inset-0 rounded-xl"
              animate={{ boxShadow: ['0 0 0 0 rgba(2,132,199,0.35)','0 0 0 8px rgba(2,132,199,0)','0 0 0 0 rgba(2,132,199,0)'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-xl"
              animate={{ boxShadow: ['0 0 0 0 rgba(37,99,235,0.35)','0 0 0 8px rgba(37,99,235,0)','0 0 0 0 rgba(37,99,235,0)'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1 }}
            />
            <motion.div
              className="absolute -top-2 -right-2 text-yellow-400"
              animate={{ y: [-2,-8,-2], rotate: [0,180,360], scale: [1,1.2,1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSkipStep}
                className="relative overflow-hidden h-11 px-6 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-200%','200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: [0, 20, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    ⚡
                  </motion.span>
                  <span>Skip for Demo Efficiency</span>
                </span>
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-12">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'merchants', label: 'Merchants', icon: ShoppingBag },
            { id: 'bank', label: 'Bank', icon: Building2 },
          ].map((step, index, array) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                    currentStep === step.id
                      ? 'bg-gradient-to-br from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-200'
                      : (currentStep === 'merchants' && step.id === 'profile') ||
                        (currentStep === 'bank' && (step.id === 'profile' || step.id === 'merchants'))
                      ? 'bg-sky-100 text-sky-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {(currentStep === 'merchants' && step.id === 'profile') ||
                  (currentStep === 'bank' && (step.id === 'profile' || step.id === 'merchants')) ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    currentStep === step.id ? 'text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < array.length - 1 && (
                <div className="flex-1 h-0.5 bg-slate-200 mx-4 mb-8">
                  <div
                    className={`h-full bg-gradient-to-r from-sky-600 to-blue-600 transition-all duration-500 ${
                      (currentStep === 'merchants' && step.id === 'profile') ||
                      (currentStep === 'bank' && step.id !== 'bank')
                        ? 'w-full'
                        : 'w-0'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
          {/* Profile Step */}
          {currentStep === 'profile' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl mb-3">Let's build your profile</h2>
                <p className="text-slate-600 text-lg">
                  Tell us a bit about yourself to get started
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      placeholder="John"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      placeholder="Doe"
                      className="h-12"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setCurrentStep('merchants')}
                  disabled={!canProceedProfile}
                  className="h-12 px-8 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white"
                >
                  <span className="mr-2">Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Merchants Step */}
          {currentStep === 'merchants' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl mb-3">Connect your merchants</h2>
                <p className="text-slate-600 text-lg mb-4">
                  Link your shopping accounts to unlock your credit potential
                </p>
                {/* Knot API Badge - Full Width */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-6 py-4 w-full">
                  <div className="h-16 w-16 rounded-lg bg-white border border-emerald-200 flex items-center justify-center p-2">
                    <img 
                      src="/knot.svg" 
                      alt="Knot API"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-base text-emerald-900 flex items-center gap-2">
                      <span>Powered by</span>
                      <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-semibold">Knot API</span>
                    </div>
                    <div className="text-sm text-emerald-700">Secure merchant connectivity platform</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {merchants.map((merchant) => {
                  const isSelected = selectedMerchants.includes(merchant.id);
                  const hasToken = merchantTokens[merchant.id];

                  return (
                    <div
                      key={merchant.id}
                      className={`relative border-2 rounded-xl p-4 transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-2 flex-shrink-0">
                          <img 
                            src={merchant.logo} 
                            alt={merchant.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium mb-2">{merchant.name}</h3>
                          
                          {isSelected && !hasToken && (
                            <Button
                              onClick={() => handleMerchantRedirect(merchant.id)}
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Connect
                            </Button>
                          )}

                          {hasToken && (
                            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md w-fit">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Connected</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleMerchantToggle(merchant.id)}
                          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            isSelected
                              ? 'border-sky-600 bg-sky-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 p-4 bg-sky-50 rounded-xl border border-sky-200 mb-8">
                <Lock className="h-5 w-5 text-sky-600 flex-shrink-0" />
                <p className="text-sm text-slate-700">
                  Your data is encrypted and secure. We only access transaction data to calculate your credit score.
                </p>
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={() => setCurrentStep('profile')}
                  variant="outline"
                  className="h-12 px-8"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  <span>Back</span>
                </Button>
                <Button
                  onClick={() => setCurrentStep('bank')}
                  disabled={!canProceedMerchants}
                  className="h-12 px-8 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white"
                >
                  <span className="mr-2">Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Bank Step */}
          {currentStep === 'bank' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl mb-3">Link your bank account</h2>
                <p className="text-slate-600 text-lg mb-4">
                  Connect your financial profile securely
                </p>
                {/* Capital One Nessie Badge - Full Width */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-red-50 to-blue-50 border border-red-200 rounded-xl px-6 py-4 w-full">
                  <div className="h-16 w-16 rounded-lg bg-white border border-red-200 flex items-center justify-center p-2">
                    <img 
                      src="/capitalone.svg" 
                      alt="Capital One"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-base text-red-900 flex items-center gap-2">
                      <span>Powered by</span>
                      <span className="bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent font-semibold">Capital One Nessie</span>
                    </div>
                    <div className="text-sm text-red-700">Enterprise-grade banking API</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <Label htmlFor="accountName">Name on Account</Label>
                  <Input
                    id="accountName"
                    value={bankData.accountName}
                    onChange={(e) => setBankData({ ...bankData, accountName: e.target.value })}
                    placeholder="John Doe"
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    value={bankData.routingNumber}
                    onChange={(e) => setBankData({ ...bankData, routingNumber: e.target.value })}
                    placeholder="123456789"
                    maxLength={9}
                    className="h-12"
                  />
                  <p className="text-xs text-slate-500 mt-1">9-digit routing number</p>
                </div>

                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={bankData.accountNumber}
                    onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                    placeholder="1234567890"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl border border-sky-200 mb-8">
                <Lock className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700">
                  <p className="mb-2">
                    <strong>Your security is our priority.</strong> We use bank-level encryption and never store your full account details.
                  </p>
                  <p className="text-xs text-slate-600">
                    Powered by Capital One Nessie API • SOC 2 Type II Certified
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={() => setCurrentStep('merchants')}
                  variant="outline"
                  className="h-12 px-8"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  <span>Back</span>
                </Button>
                <Button
                  onClick={onComplete}
                  disabled={!canProceedBank}
                  className="h-12 px-8 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white"
                >
                  <span className="mr-2">Complete Setup</span>
                  <CheckCircle2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Need help? <a href="#" className="text-indigo-600 hover:text-indigo-700">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}