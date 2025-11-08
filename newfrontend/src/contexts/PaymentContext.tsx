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
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// Initial cart data (would come from a real cart in production)
const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: '1',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    price: 399.99,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1604780032295-9f8186eede96?w=400'
  },
  {
    id: '2',
    name: 'Apple AirPods Pro (2nd Generation)',
    price: 249.00,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400'
  },
  {
    id: '3',
    name: 'Samsung Galaxy Buds2 Pro',
    price: 190.17,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'
  }
];

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [cartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [cartTotal, setCartTotal] = useState(0);
  const [creditScore, setCreditScore] = useState(0);
  const [maxCreditLimit, setMaxCreditLimit] = useState(0);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [declineReason, setDeclineReason] = useState<string>();
  const [connectedMerchantsCount, setConnectedMerchantsCount] = useState(0);

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

  // Calculate cart total from items
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
    setSelectedPlan
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
