import { useState } from 'react';
import { WelcomePage } from './components/WelcomePage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { ConnectedMerchantsLanding } from './components/ConnectedMerchantsLanding';
import { AmazonProductPage } from './components/AmazonProductPage';
import { WayfairProductPage } from './components/WayfairProductPage';
import { BestBuyProductPage } from './components/BestBuyProductPage';
import { TargetProductPage } from './components/TargetProductPage';
import { ShoppingCart } from './components/ShoppingCart';
import { ModernCheckout } from './components/ModernCheckout';
import { PaymentPlanSelection } from './components/PaymentPlanSelection';
import { OrderConfirmation } from './components/OrderConfirmation';
import { CreditScoreDetail } from './components/CreditScoreDetail';

type FlowStep = 
  | 'welcome'
  | 'onboarding'
  | 'landing' 
  | 'credit-score'
  | 'product' 
  | 'cart' 
  | 'checkout' 
  | 'payment-plan' 
  | 'confirmation';

export default function App() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('welcome');
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);

  const handleGetStarted = () => {
    setCurrentStep('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCurrentStep('landing');
  };

  const handleMerchantSelect = (merchant: string) => {
    setSelectedMerchant(merchant);
    setCurrentStep('product');
  };

  const handleBackToLanding = () => {
    setCurrentStep('landing');
    setSelectedMerchant(null);
  };

  const handleAddToCart = () => {
    setCurrentStep('cart');
  };

  const handleBuyNow = () => {
    setCurrentStep('checkout');
  };

  const handleBackToProduct = () => {
    setCurrentStep('product');
  };

  const handleProceedToCheckout = () => {
    setCurrentStep('checkout');
  };

  const handleBackToCart = () => {
    setCurrentStep('cart');
  };

  const handleSelectWingsPay = () => {
    setCurrentStep('payment-plan');
  };

  const handleBackToCheckout = () => {
    setCurrentStep('checkout');
  };

  const handleSelectPlan = () => {
    setCurrentStep('confirmation');
  };

  const handleStartOver = () => {
    setCurrentStep('landing');
    setSelectedMerchant(null);
  };

  const handleViewCreditScore = () => {
    setCurrentStep('credit-score');
  };

  const handleBackFromCreditScore = () => {
    setCurrentStep('landing');
  };

  return (
    <div className="min-h-screen">
      {currentStep === 'welcome' && (
        <WelcomePage onGetStarted={handleGetStarted} />
      )}

      {currentStep === 'onboarding' && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}

      {currentStep === 'landing' && (
        <ConnectedMerchantsLanding 
          onMerchantSelect={handleMerchantSelect}
          onViewCreditScore={handleViewCreditScore}
        />
      )}

      {currentStep === 'credit-score' && (
        <CreditScoreDetail onBack={handleBackFromCreditScore} />
      )}

      {currentStep === 'product' && selectedMerchant === 'amazon' && (
        <AmazonProductPage 
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onBack={handleBackToLanding}
        />
      )}

      {currentStep === 'product' && selectedMerchant === 'wayfair' && (
        <WayfairProductPage 
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onBack={handleBackToLanding}
        />
      )}

      {currentStep === 'product' && selectedMerchant === 'bestbuy' && (
        <BestBuyProductPage 
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onBack={handleBackToLanding}
        />
      )}

      {currentStep === 'product' && selectedMerchant === 'target' && (
        <TargetProductPage 
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onBack={handleBackToLanding}
        />
      )}

      {currentStep === 'cart' && (
        <ShoppingCart
          onProceedToCheckout={handleProceedToCheckout}
          onBack={handleBackToProduct}
        />
      )}

      {currentStep === 'checkout' && (
        <ModernCheckout
          onSelectWingsPay={handleSelectWingsPay}
          onBack={handleBackToCart}
        />
      )}

      {currentStep === 'payment-plan' && (
        <PaymentPlanSelection
          onSelectPlan={handleSelectPlan}
          onBack={handleBackToCheckout}
        />
      )}

      {currentStep === 'confirmation' && (
        <OrderConfirmation onStartOver={handleStartOver} />
      )}
    </div>
  );
}