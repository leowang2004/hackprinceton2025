# WingsPay - Intelligent BNPL Platform

A complete Buy Now Pay Later (BNPL) system with intelligent credit scoring, flexible payment plans, and React-based frontend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm

### 1. Install Dependencies

**Backend:**
```powershell
cd C:\Users\leowh\Desktop\Desktop\hackprinceton2025
npm install
```

**Frontend:**
```powershell
cd C:\Users\leowh\Desktop\Desktop\hackprinceton2025\newfrontend
npm install
```

### 2. Start the Backend Server
```powershell
cd C:\Users\leowh\Desktop\Desktop\hackprinceton2025
node server.js
```

**Server runs on:** http://localhost:3000
- Backend API endpoints
- Credit scoring service
- Payment plan calculations

### 3. Start the Frontend (Separate Terminal)
```powershell
cd C:\Users\leowh\Desktop\Desktop\hackprinceton2025\newfrontend
npm run dev
```

**Frontend runs on:** http://localhost:5173
- React + TypeScript + Vite
- Full shopping and checkout experience
- Hot reload for development

### 4. Access the Application

Open your browser to: **http://localhost:5173**

## 🎯 Application Flow

1. **Welcome Screen** - Introduction to WingsPay
2. **Onboarding** - Quick onboarding flow
3. **Connected Merchants** - Dashboard showing your connected stores
   - Real-time credit score display
   - Available credit limit
   - Connected merchants count (from backend)
4. **Product Selection** - Browse products at merchant stores
5. **Shopping Cart** - Review items and see payment options
6. **Checkout** - Choose payment method (WingsPay or traditional)
7. **Payment Plan Selection** - Choose from flexible payment plans
8. **Order Confirmation** - View payment schedule and order details

## 📊 System Overview

### Key Features:
- ✅ **Comprehensive Credit Scoring** - Uses 4 data sources (transactions, bills, deposits, loans)
- ✅ **Intelligent Loan Calculations** - Fluid algorithm based on creditworthiness
- ✅ **Real-time Backend Integration** - All data fetched dynamically from API
- ✅ **React Context API** - Centralized state management
- ✅ **Dynamic Payment Plans** - 4, 6, and 12-month options
- ✅ **Beautiful Modern UI** - Built with Tailwind CSS and Lucide icons
- ✅ **Responsive Design** - Works on all devices

## 📁 Project Structure

```
hackprinceton2025/
├── backend/
│   ├── server.js                # Main backend server
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   └── knot.js             # Knot API integration routes
│   └── services/
│       ├── creditScoreService.js   # Credit scoring logic
│       └── knotService.js          # Knot API service
├── dummydata.json              # Transaction data (Amazon purchases)
├── dummybill.json              # Bill payment data (6 bills)
├── dummydeposit.json           # Income/deposit data (4 deposits)
├── dummyloan.json              # Loan/debt data (6 loans)
├── newfrontend/
│   ├── src/
│   │   ├── App.tsx             # Main app component with routing
│   │   ├── components/         # All UI components
│   │   │   ├── ConnectedMerchantsLanding.tsx
│   │   │   ├── ShoppingCart.tsx
│   │   │   ├── ModernCheckout.tsx
│   │   │   ├── PaymentPlanSelection.tsx
│   │   │   └── OrderConfirmation.tsx
│   │   ├── contexts/
│   │   │   └── PaymentContext.tsx  # Global state management
│   │   └── services/
│   │       ├── api.ts          # API integration layer
│   │       └── NetworkService.ts
│   ├── package.json
│   └── vite.config.ts
├── FRONTEND_INTEGRATION.md
├── CREDIT_ALGORITHM.md
└── README.md
```

## 🧮 Credit Scoring Algorithm

**Version:** Comprehensive (4 Data Sources)
**Score Range:** 500-800
**Target:** 650-750 (good credit)

### Weighted Components:
- **30%** - Transaction Spending Analysis
  - Purchase frequency
  - Transaction amounts
  - Spending patterns
- **25%** - Income from Deposits
  - Regular deposits
  - Income consistency
  - Deposit amounts
- **20%** - Bill Payment Reliability
  - On-time payments
  - Payment completion rate
  - Bill types
- **15%** - Debt Burden
  - Outstanding loans
  - Overdue amounts
  - Debt-to-income ratio
- **10%** - Account Balance
  - Current balance
  - Minimum balance maintenance

### Loan Calculation (Fluid):
- **Score 500:** ~$2,000 max credit
- **Score 650:** ~$5,000 max credit
- **Score 750:** ~$7,000 max credit
- **Score 800:** ~$8,000 max credit

### Payment Plans:
Based on credit score and order total:
- **4 months** - Standard (divide by 4)
- **6 months** - Extended (order total × 0.18)
- **12 months** - Flexible (order total × 0.095)

## 🎯 Expected Results (with dummy data)

Based on current dummy data files:
- **Credit Score:** ~680-720
- **Max Credit Limit:** ~$4,000-$6,000
- **Cart Total:** $839.16 (3 audio products)
- **Monthly Payment (4mo):** ~$209.79
- **Status:** Approved ✅

## � API Endpoints

### Backend (http://localhost:3000)

- **GET /api/get-credit-score**
  - Returns credit score and lending offer
  - Analyzes all 4 data sources
  - Response: `{ creditScore, status, maxAmount, termMonths }`

- **GET /api/get-merchants**
  - Returns connected merchant information
  - Response: `{ merchants: [...], totalConnected: 1 }`

### Frontend API Service (api.ts)

- **fetchCreditScore()** - Gets credit score from backend
- **calculatePaymentPlans(orderTotal)** - Calculates payment plans
- **formatCurrency(amount)** - Formats currency display

## 🎨 Frontend Architecture

### React Context Pattern
All components use the `PaymentContext` for centralized state:

```typescript
const { 
  cartTotal, 
  creditScore, 
  maxCreditLimit, 
  approved, 
  loading, 
  paymentPlans,
  selectedPlan,
  connectedMerchantsCount
} = usePayment();
```

### Key Features:
- **Auto-refresh** - Fetches backend data when cart changes
- **Loading states** - Shows "..." while fetching
- **Error handling** - Graceful fallbacks
- **Type safety** - Full TypeScript support

## 🛠 Technologies

### Backend:
- Node.js & Express
- RESTful API architecture
- JSON file-based data storage
- CORS enabled for frontend

### Frontend:
- React 18.3.1
- TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)
- React Router (navigation)

## 🔧 Troubleshooting

### Server won't start?
```powershell
# Kill existing node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Restart backend
cd C:\Users\leowh\Desktop\Desktop\hackprinceton2025
node server.js
```

### Frontend won't start?
```powershell
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Restart frontend
cd C:\Users\leowh\Desktop\Desktop\hackprinceton2025\newfrontend
npm run dev
```

### "No built frontend found" message?
This is normal for development! You're running two separate servers:
- Backend API on port 3000
- Frontend dev server on port 5173

To build frontend for production (optional):
```powershell
cd newfrontend
npm run build
```

### Data not showing in frontend?
1. Check backend is running on http://localhost:3000
2. Check frontend is running on http://localhost:5173
3. Open browser console (F12) for error messages
4. Look for console logs with emojis (🔄 🔍 ✅ 💳 📊)

### Credit score seems wrong?
- Check `dummydata.json`, `dummybill.json`, `dummydeposit.json`, `dummyloan.json`
- Review `server.js` credit calculation logic
- Check browser console for calculation logs

## 📖 Documentation

- **[APP_FLOW.md](./APP_FLOW.md)** - Complete application flow
- **[KNOT_INTEGRATION.md](./KNOT_INTEGRATION.md)** - Knot API integration guide
- **[FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)** - Frontend integration details
- **[CREDIT_ALGORITHM.md](./CREDIT_ALGORITHM.md)** - Algorithm documentation

## 🎉 Key Achievements

1. **Zero Hardcoded Values** ✅
   - All credit scores from backend
   - All payment amounts calculated dynamically
   - All merchant data from API

2. **Centralized State Management** ✅
   - React Context API for global state
   - Single source of truth
   - Auto-refresh on data changes

3. **Beautiful User Experience** ✅
   - Smooth animations and transitions
   - Loading states and error handling
   - Responsive design

4. **Production-Ready Architecture** ✅
   - Separation of concerns
   - Type-safe TypeScript
   - RESTful API design

## 🚀 Testing the Application

### 1. Test Backend Directly
```powershell
curl http://localhost:3000/api/get-credit-score
```

Expected response:
```json
{
  "creditScore": 720,
  "lendingOffer": {
    "status": "Approved",
    "maxAmount": 6000,
    "termMonths": 9
  }
}
```

### 2. Test Full User Flow
1. Open http://localhost:5173
2. Navigate through: Welcome → Onboarding → Landing
3. Check "Connected Merchants" page shows:
   - Real credit score (from backend)
   - Real available credit (from backend)
   - Connected stores count: 1 (Amazon from dummydata.json)
4. Go to Amazon → Add items → Cart → Checkout
5. Select WingsPay
6. Choose payment plan
7. View order confirmation

### 3. Verify Console Logs
Open browser DevTools (F12) → Console tab:
- 🔄 PaymentContext: Refreshing payment data
- 🔍 Fetching credit score from: http://localhost:3000/api/get-credit-score
- ✅ Backend Response Received: Credit Score: XXX
- 💳 calculatePaymentPlans called with order total: 839.16
- 📊 Backend Decision: Credit Score, Status, Max Credit
- 📋 Generated Payment Plans: 3 plans

## 🔮 Future Enhancements

- [ ] Real Knot API integration (replace dummy data)
- [ ] User authentication and sessions
- [ ] Database integration (replace JSON files)
- [ ] More merchant integrations
- [ ] Payment processing integration
- [ ] Credit score history tracking
- [ ] Account management dashboard
- [ ] Email notifications

---

**Status:** ✅ Fully functional and ready to demo!  
**Created for:** HackPrinceton 2025  
**Version:** 4.0 (Dynamic Backend Integration)  
**Architecture:** Two-server development (Backend :3000 + Frontend :5173)
