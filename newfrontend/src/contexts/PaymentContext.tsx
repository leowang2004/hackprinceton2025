import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { calculatePaymentPlans, formatCurrency, type PaymentPlan } from '../services/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface PaymentContextType {
  cartTotal: number;
  cartItems: CartItem[];
  creditScore: number;
  maxCreditLimit: number;
  approved: boolean;
  loading: boolean;
  paymentPlans: PaymentPlan[];
  selectedPlan: PaymentPlan | null;
  declineReason?: string;
  connectedMerchantsCount: number;
  refreshPaymentData: () => Promise<void>;
  setSelectedPlan: (plan: PaymentPlan | null) => void;
  setCartItems: (items: CartItem[]) => void;
  addToCart: (item: CartItem) => void;
  clearCart: () => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [creditScore, setCreditScore] = useState(0);
  const [maxCreditLimit, setMaxCreditLimit] = useState(0);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [declineReason, setDeclineReason] = useState<string>();
  const [connectedMerchantsCount, setConnectedMerchantsCount] = useState(0);

  // Cart management functions
  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      // Check if item already exists
      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        // Update quantity if exists
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity
        };
        return updated;
      }
      // Add new item
      return [...prev, item];
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Fetch merchant data
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/get-merchants');
        const data = await response.json();
        setConnectedMerchantsCount(data.totalConnected || 0);
      } catch (error) {
        console.error('Error fetching merchants:', error);
        setConnectedMerchantsCount(0);
      }
    };
    fetchMerchants();
  }, []);

  // Initial load: compute credit score and available credit on first visit
  useEffect(() => {
    const fetchInitialScore = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:3000/api/get-credit-score');
        if (!res.ok) throw new Error('Failed to fetch initial credit score');
        const data = await res.json();
        setCreditScore(Number(data?.creditScore) || 0);
        const offer = data?.lendingOffer || {};
        setMaxCreditLimit(Number(offer?.maxAmount) || 0);
        setApproved(offer?.status === 'Approved');
      } catch (err) {
        console.error('Error fetching initial score:', err);
        setApproved(false);
        setMaxCreditLimit(0);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialScore();
  }, []);

  // Calculate cart total from items (including tax)
  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.08; // 8% tax rate
    const total = subtotal * (1 + taxRate);
    setCartTotal(total);
  }, [cartItems]);

  // Fetch payment data when cart total changes
  const refreshPaymentData = async () => {
    if (cartTotal === 0) return;

    setLoading(true);
    console.log('🔄 PaymentContext: Refreshing payment data for cart total:', cartTotal);

    try {
      const result = await calculatePaymentPlans(cartTotal);

      if (result) {
        setCreditScore(result.creditScore);
        setMaxCreditLimit(result.maxCreditLimit);
        setApproved(result.approved);
        setPaymentPlans(result.plans);
        setDeclineReason(result.declineReason);

        console.log('✅ PaymentContext: Data loaded');
        console.log('   Credit Score:', result.creditScore);
        console.log('   Max Credit:', result.maxCreditLimit);
        console.log('   Approved:', result.approved);
        console.log('   Plans:', result.plans.length);
      } else {
        setApproved(false);
        setDeclineReason('Unable to connect to payment service');
      }
    } catch (error) {
      console.error('❌ PaymentContext: Error loading payment data:', error);
      setApproved(false);
      setDeclineReason('An error occurred while checking credit');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh when cart total changes
  useEffect(() => {
    refreshPaymentData();
  }, [cartTotal]);

  const value: PaymentContextType = {
    cartTotal,
    cartItems,
    creditScore,
    maxCreditLimit,
    approved,
    loading,
    paymentPlans,
    selectedPlan,
    declineReason,
    connectedMerchantsCount,
    refreshPaymentData,
    setSelectedPlan,
    setCartItems,
    addToCart,
    clearCart,
    updateQuantity,
    removeItem
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}
