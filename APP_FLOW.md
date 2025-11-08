# App Flow & Screenshots Documentation

## Application Flow

### 1. User Journey

```
┌────────────────────┐
│   App Launch       │
│                    │
│  [Amazon Logo]     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│   Login Screen     │
│                    │
│  Email: _______    │
│  Password: ___     │
│  [Sign in Button]  │
└─────────┬──────────┘
          │ User enters any credentials
          ▼
┌────────────────────┐
│   Loading State    │
│   (Spinner)        │
└─────────┬──────────┘
          │ Backend processes
          ▼
┌────────────────────┐
│  Credit Score      │
│     Display        │
│                    │
│    ╱────╲          │
│   │ 750  │         │
│    ╲────╱          │
│   out of 850       │
│                    │
│ Based on Amazon    │
│ transaction data   │
└────────────────────┘
```

### 2. Backend Processing Flow

```
Mobile App                Backend                 Knot API
(React Native)           (Python/FastAPI)
    │                        │                        │
    │ POST /api/login        │                        │
    ├───────────────────────>│                        │
    │ {email, password}      │                        │
    │                        │                        │
    │                        │ GET transactions       │
    │                        ├───────────────────────>│
    │                        │                        │
    │                        │<───────────────────────┤
    │                        │ [transaction array]    │
    │                        │                        │
    │                        │ Calculate Score        │
    │                        │ - Volume: 60 pts       │
    │                        │ - Consistency: 80 pts  │
    │                        │ - Amount: 60 pts       │
    │                        │ - Diversity: 60 pts    │
    │                        │ - Recent: 30 pts       │
    │                        │ Base: 500              │
    │                        │ Total: 790/850         │
    │                        │                        │
    │<───────────────────────┤                        │
    │ {creditScore: 790}     │                        │
    │                        │                        │
```

### 3. UI Components

#### Login Screen (LoginView.swift)
```
╔════════════════════════════════════╗
║                                    ║
║           🛒                       ║
║         (cart icon)                ║
║                                    ║
║          amazon                    ║
║                                    ║
║  Sign in to your Amazon account    ║
║                                    ║
║  ┌──────────────────────────────┐ ║
║  │ Email                        │ ║
║  │ ________________________     │ ║
║  └──────────────────────────────┘ ║
║                                    ║
║  ┌──────────────────────────────┐ ║
║  │ Password                     │ ║
║  │ ••••••••                     │ ║
║  └──────────────────────────────┘ ║
║                                    ║
║  ┌──────────────────────────────┐ ║
║  │        Sign in               │ ║
║  └──────────────────────────────┘ ║
║         (orange button)            ║
║                                    ║
║  By continuing, you agree to       ║
║  Amazon's Conditions of Use and    ║
║      Privacy Notice                ║
║                                    ║
╚════════════════════════════════════╝
```

#### Credit Score Display (ContentView.swift)
```
╔════════════════════════════════════╗
║                                    ║
║  Your Alternative Credit Score     ║
║                                    ║
║                                    ║
║          ╱────────╲                ║
║         │          │               ║
║        │    750     │              ║
║         │          │               ║
║          ╲────────╱                ║
║         (circular progress)        ║
║          out of 850                ║
║                                    ║
║                                    ║
║   Based on your Amazon             ║
║   transaction history              ║
║                                    ║
║                                    ║
╚════════════════════════════════════╝
```

### 4. API Response Examples

#### Successful Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "creditScore": 790,
  "transactionCount": 20
}
```

#### Transaction Data Sample
```json
{
  "id": "txn_1762577348211_3",
  "date": "2025-10-24T04:49:08.211Z",
  "amount": 11.92,
  "category": "Clothing",
  "description": "Amazon Purchase 4",
  "merchant": "Amazon.com"
}
```

#### Knot Status Response
```json
{
  "success": true,
  "status": {
    "configured": true,
    "connected": false,
    "message": "Knot API credentials configured but connection failed"
  }
}
```

### 5. Credit Score Calculation Example

For 20 mock transactions:

| Factor            | Score | Max | Calculation                      |
|-------------------|-------|-----|----------------------------------|
| Base Score        | 500   | -   | Starting point                   |
| Transaction Volume| 60    | 100 | 20 transactions → 60 points     |
| Consistency       | 80    | 100 | Regular pattern → 80 points     |
| Average Amount    | 60    | 100 | ~$70 average → 60 points        |
| Category Diversity| 60    | 100 | 3-4 categories → 60 points      |
| Recent Activity   | 30    | 50  | 5-7 recent txns → 30 points     |
| **Total**         | **790**| **850** | **Final Credit Score**      |

### 6. Directory Structure Visual

```
hackprinceton2025/
│
├── 📱 mobile-app/
│   ├── src/
│   │   ├── App.js                       (Main app with navigation)
│   │   ├── screens/
│   │   │   ├── LoginScreen.js           (Amazon login UI)
│   │   │   └── CreditScoreScreen.js     (Score display)
│   │   ├── components/
│   │   │   └── CircularProgress.js      (SVG progress indicator)
│   │   └── services/
│   │       └── NetworkService.js        (API client)
│   ├── android/                         (Android native code)
│   ├── ios/                             (iOS native code)
│   ├── package.json                     (Dependencies)
│   └── README.md
│
├── 🖥️  backend/
│   ├── services/
│   │   ├── knot_service.py              (Knot integration)
│   │   └── credit_score_service.py      (Score algorithm)
│   ├── main.py                          (FastAPI app)
│   ├── requirements.txt                 (Dependencies)
│   └── README.md
│
├── 📚 KNOT_INTEGRATION.md               (Integration guide)
└── 📄 README.md                         (Main documentation)
```

### 7. Technology Stack

```
┌─────────────────────────────────────────────┐
│              Mobile Layer                   │
│  ┌─────────────────────────────────────┐   │
│  │  React Native (iOS & Android)       │   │
│  │  - LoginScreen                      │   │
│  │  - CreditScoreScreen                │   │
│  │  - NetworkService                   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ▼ HTTP/JSON
┌─────────────────────────────────────────────┐
│            Backend Layer                    │
│  ┌─────────────────────────────────────┐   │
│  │  Python + FastAPI                   │   │
│  │  - Authentication Endpoints         │   │
│  │  - Knot API Integration             │   │
│  │  - Credit Score Service             │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ▼ REST API
┌─────────────────────────────────────────────┐
│           External Services                 │
│  ┌─────────────────────────────────────┐   │
│  │  Knot API                           │   │
│  │  - Transaction Data                 │   │
│  │  - Account Linking                  │   │
│  │  - Amazon Integration               │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 8. Key Features Summary

✅ **Fake Amazon Login**
- Authentic UI design matching Amazon's style
- Email and password input fields
- Loading state during authentication
- Error message display

✅ **Backend API**
- RESTful endpoints
- JSON request/response format
- Error handling and validation
- Health check monitoring

✅ **Knot API Integration**
- Transaction data retrieval
- Mock data fallback for development
- Configurable credentials
- Status monitoring endpoint

✅ **Credit Score Algorithm**
- 5-factor calculation system
- Score range: 300-850 (FICO model)
- Transparent scoring methodology
- Real-time calculation

✅ **Beautiful UI**
- Circular progress indicator
- Gradient color scheme
- Smooth transitions
- Professional design

---

This documentation provides a comprehensive overview of the application's visual structure, data flow, and user experience without requiring actual screenshots.
