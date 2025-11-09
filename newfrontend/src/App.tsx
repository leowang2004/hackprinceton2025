import { useState, useEffect } from 'react';
import { PaymentProvider, usePayment } from './contexts/PaymentContext';
import { WelcomePage } from './components/WelcomePage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { ConnectedMerchantsLanding } from './components/ConnectedMerchantsLanding';
import { AmazonProductPage } from './components/AmazonProductPage';
import { WayfairProductPage } from './components/WayfairProductPage';
import { BestBuyProductPage } from './components/BestBuyProductPage';
import { TargetProductPage } from './components/TargetProductPage';
import { GenericProductPage } from './components/GenericProductPage';
import { WalmartProductPage } from './components/WalmartProductPage';
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

  return (
    <PaymentProvider>
      <AppContent 
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        selectedMerchant={selectedMerchant}
        setSelectedMerchant={setSelectedMerchant}
      />
    </PaymentProvider>
  );
}

function AppContent({ 
  currentStep, 
  setCurrentStep, 
  selectedMerchant, 
  setSelectedMerchant 
}: {
  currentStep: FlowStep;
  setCurrentStep: (step: FlowStep) => void;
  selectedMerchant: string | null;
  setSelectedMerchant: (merchant: string | null) => void;
}) {
  const { setCartItems } = usePayment();

  // Define merchant-specific products
  const loadMerchantProduct = (merchantId: string) => {
    const merchantProducts: Record<string, any> = {
      amazon: [{
        id: 'amz-1',
        name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        price: 348.00, // Current price on Amazon
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1604780032295-9f8186eede96?w=400'
      }],
      wayfair: [{
        id: 'wf-1',
        name: 'Sealy Premium Memory Foam Mattress - 12-Inch Cooling Gel Memory Foam - Queen Size',
        price: 799.99, // Sale price (38% OFF from $1,299.99)
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'
      }],
      bestbuy: [{
        id: 'bb-1',
        name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
        price: 349.99, // Sale price (Save $50 from $399.99)
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1604780032295-9f8186eede96?w=400'
      }],
      target: [{
        id: 'tgt-1',
        name: 'Nespresso Vertuo Next Coffee and Espresso Maker with Aeroccino',
        price: 170.99, // RedCard price (5% off $179.99, which is 22% off $229.99)
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400'
      }],
      walmart: [{
        id: 'wm-1',
        name: 'Samsung 55" 4K Smart TV',
        price: 448.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=1200&auto=format&fit=crop&q=80'
      }],
      // Fallback demo items for explore merchants
      instacart: [{
        id: 'exp-instacart-1',
        name: 'Weekly Grocery Bundle',
        price: 89.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400'
      }],
      sephora: [{
        id: 'exp-sephora-1',
        name: 'Beauty Essentials Set',
        price: 129.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400'
      }],
      zara: [{
        id: 'exp-zara-1',
        name: 'Classic Trench Coat',
        price: 159.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400'
      }],
      lululemon: [{
        id: 'exp-lululemon-1',
        name: 'Align High-Rise Pant 25"',
        price: 118.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1534367610401-9f00a1e0c1a9?w=400'
      }],
      alo: [{
        id: 'exp-alo-1',
        name: 'Airlift Yoga Leggings',
        price: 108.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1520975682038-c710c4e9659d?w=400'
      }],
      baccarat: [{
        id: 'exp-baccarat-1',
        name: 'Crystal Vase – Harcourt',
        price: 690.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1603566234499-59a3ed8bbfd4?w=400'
      }],
      nike: [{
        id: 'exp-nike-1',
        name: 'Nike Air Zoom Pegasus',
        price: 130.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
      }],
    };
    
    return merchantProducts[merchantId] || [];
  };

  const handleGetStarted = () => {
    setCurrentStep('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCurrentStep('landing');
  };

  const handleMerchantSelect = (merchant: string) => {
    setSelectedMerchant(merchant);
    // Load merchant products but don't add to cart yet
    setCartItems([]);
    setCurrentStep('product');
  };

  const handleBackToLanding = () => {
    setCurrentStep('landing');
    setSelectedMerchant(null);
    setCartItems([]); // Clear cart when going back
  };

  const handleAddToCart = () => {
    // Load merchant products into cart
    if (selectedMerchant) {
      const products = loadMerchantProduct(selectedMerchant);
      setCartItems(products);
    }
    setCurrentStep('cart');
  };

  const handleBuyNow = () => {
    // Load merchant products into cart and go to checkout
    if (selectedMerchant) {
      const products = loadMerchantProduct(selectedMerchant);
      setCartItems(products);
    }
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
    setCartItems([]); // Clear cart on start over
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

      {/* Fallback product page for explore merchants */}
      {currentStep === 'product' &&
        selectedMerchant &&
        !['amazon','wayfair','bestbuy','target'].includes(selectedMerchant) && (
        <GenericProductPage
          merchantName={selectedMerchant.charAt(0).toUpperCase() + selectedMerchant.slice(1)}
          product={(loadMerchantProduct(selectedMerchant)[0]) || {
            name: 'Featured Product',
            price: 99.0,
            image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400'
          }}
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

      {currentStep === 'product' && selectedMerchant === 'walmart' && (
        <WalmartProductPage
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