# Amazon Credit Score App - HackPrinceton 2025

A mobile application that calculates alternative credit scores based on Amazon transaction data using the Knot API.

## Overview

This project consists of two main components:

1. **iOS Mobile App** - SwiftUI-based app with fake Amazon login
2. **Node.js Backend** - Server with Knot API integration and credit score calculation

## Features

- 📱 Authentic Amazon-style login interface
- 🔐 Fake authentication for demonstration
- 🔗 Knot API integration for transaction data
- 📊 Alternative credit score calculation (300-850 range)
- 🎨 Beautiful UI with circular progress indicator
- 🔄 Real-time communication between mobile and backend

## Architecture

```
┌─────────────────┐
│   iOS App       │
│  (SwiftUI)      │
└────────┬────────┘
         │ HTTP/JSON
         ▼
┌─────────────────┐
│  Node.js        │
│  Backend        │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│   Knot API      │
│  (Transaction   │
│      Data)      │
└─────────────────┘
```

## Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Knot API credentials (optional)
npm start
```

The backend will run on `http://localhost:3000`

### iOS App Setup

1. Open the Xcode project:
```bash
cd ios-app
open AmazonCreditScore.xcodeproj
```

2. Update the backend URL in `NetworkService.swift` if needed

3. Build and run in Xcode (Cmd+R)

## Documentation

- [Backend README](./backend/README.md) - Detailed backend documentation
- [iOS App README](./ios-app/README.md) - Detailed iOS app documentation
- [Knot API Documentation](https://docs.knotapi.com/sdk/ios) - Official Knot API docs

## How It Works

1. **User Login**: User enters credentials on fake Amazon login screen
2. **Backend Authentication**: App sends login request to backend
3. **Knot API Integration**: Backend uses Knot API to fetch Amazon transaction data
4. **Score Calculation**: Backend calculates credit score using custom algorithms
5. **Display Results**: App receives and displays the credit score

## Credit Score Algorithm

The alternative credit score is calculated based on:

- **Transaction Volume** (100 points): Number of transactions
- **Consistency** (100 points): Regularity of purchases
- **Average Amount** (100 points): Average transaction size
- **Diversity** (100 points): Variety of purchase categories
- **Recent Activity** (50 points): Transactions in last 30 days

**Total Range:** 300-850 (following FICO model)

## Knot API Integration

This project integrates with the [Knot API](https://docs.knotapi.com/sdk/ios) to retrieve Amazon transaction data.

To use with real Knot API:
1. Sign up at https://knotapi.com
2. Get API credentials
3. Add to backend `.env` file
4. Integrate Knot iOS SDK in mobile app

**Note:** Mock data is used if Knot API credentials are not configured.

## Project Structure

```
hackprinceton2025/
├── ios-app/                    # iOS mobile application
│   ├── AmazonCreditScore.xcodeproj/
│   ├── AmazonCreditScore/
│   │   ├── AmazonCreditScoreApp.swift
│   │   ├── ContentView.swift
│   │   ├── LoginView.swift
│   │   └── NetworkService.swift
│   └── README.md
├── backend/                    # Node.js backend server
│   ├── routes/
│   │   ├── auth.js
│   │   └── knot.js
│   ├── services/
│   │   ├── knotService.js
│   │   └── creditScoreService.js
│   ├── server.js
│   ├── package.json
│   └── README.md
└── README.md
```

## API Endpoints

### POST `/api/login`
Authenticate user and calculate credit score

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "creditScore": 750,
  "transactionCount": 20
}
```

### GET `/api/knot/status`
Check Knot API connection status

### GET `/api/knot/transactions/:email`
Retrieve transaction data for user

## Technologies Used

### Mobile App
- Swift 5.0
- SwiftUI
- iOS 16.0+

### Backend
- Node.js
- Express.js
- Axios (HTTP client)
- Knot API SDK

## Development Notes

- **Fake Authentication**: Current implementation accepts any login credentials
- **Mock Data**: Backend generates mock transactions if Knot API is not configured
- **Development Mode**: Use localhost for testing
- **Production**: Use HTTPS and proper authentication

## Security Considerations

- Implement real OAuth with Amazon for production
- Use HTTPS for all communications
- Secure API keys in environment variables
- Add rate limiting and request validation
- Implement proper user authentication

## Future Enhancements

- [ ] Real Amazon OAuth integration
- [ ] User database for persistent storage
- [ ] Advanced ML-based credit scoring
- [ ] Transaction history view in app
- [ ] Credit score trend tracking
- [ ] Push notifications
- [ ] Android app version
- [ ] Web dashboard

## Testing

### Backend
```bash
cd backend
npm test  # (if tests are added)
```

### iOS App
Run in Xcode simulator or on device

## Contributing

This is a hackathon project for HackPrinceton 2025. Contributions and improvements are welcome!

## License

MIT

## Authors

HackPrinceton 2025 Team

## Acknowledgments

- Knot API for transaction data access
- Amazon for inspiration (this is not affiliated with Amazon)
- HackPrinceton 2025 organizers