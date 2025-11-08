# Amazon Credit Score Backend

Backend server for the Amazon Credit Score application that integrates with Knot API to calculate alternative credit scores based on Amazon transaction data.

## Features

- **Fake Amazon Login**: Accepts login credentials and simulates authentication
- **Knot API Integration**: Retrieves Amazon transaction data using Knot API SDK
- **Credit Score Calculation**: Implements algorithms to calculate alternative credit scores
- **RESTful API**: Provides endpoints for mobile app integration

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Knot API credentials (optional - will use mock data if not provided)

## Installation

1. Clone the repository:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Knot API credentials:
```
KNOT_API_KEY=your_api_key_here
KNOT_CLIENT_ID=your_client_id_here
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Authentication

#### POST `/api/login`
Handles fake Amazon login and returns credit score.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "creditScore": 750,
  "transactionCount": 20
}
```

### Knot API

#### GET `/api/knot/status`
Check Knot API connection status.

**Response:**
```json
{
  "success": true,
  "status": {
    "configured": true,
    "connected": true,
    "message": "Knot API is connected"
  }
}
```

#### GET `/api/knot/transactions/:email`
Get transactions for a specific user.

**Response:**
```json
{
  "success": true,
  "email": "user@example.com",
  "transactionCount": 20,
  "transactions": [...]
}
```

### Health Check

#### GET `/health`
Check server health status.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Credit Score Algorithm

The credit score is calculated using multiple factors:

1. **Transaction Volume** (max +100 points)
   - Based on total number of transactions
   - More transactions = higher score

2. **Transaction Consistency** (max +100 points)
   - Measures regularity of purchases
   - Consistent purchasing patterns = higher score

3. **Average Transaction Amount** (max +100 points)
   - Based on average purchase amount
   - Higher average = higher score (indicates purchasing power)

4. **Category Diversity** (max +100 points)
   - Number of different purchase categories
   - More diverse purchases = higher score

5. **Recent Activity** (max +50 points)
   - Transactions in the last 30 days
   - Recent activity = higher score

**Score Range:** 300-850 (following FICO score model)

## Knot API Integration

The application integrates with [Knot API](https://docs.knotapi.com/sdk/ios) to retrieve Amazon transaction data. 

### Setup:

1. Sign up for a Knot API account at https://knotapi.com
2. Get your API credentials (API Key and Client ID)
3. Add credentials to `.env` file
4. The iOS app will use Knot SDK to authenticate users with Amazon
5. Backend retrieves transaction data via Knot API

### Mock Data:

If Knot API credentials are not configured, the service will generate mock transaction data for development and testing purposes.

## Project Structure

```
backend/
├── server.js              # Main server file
├── routes/
│   ├── auth.js           # Authentication routes
│   └── knot.js           # Knot API routes
├── services/
│   ├── knotService.js    # Knot API integration
│   └── creditScoreService.js  # Credit score algorithms
├── package.json
├── .env.example
└── README.md
```

## Error Handling

All endpoints include proper error handling:
- 400: Bad Request (missing parameters)
- 500: Internal Server Error

Errors are logged to console for debugging.

## Security Considerations

- **CORS** is enabled for cross-origin requests
- **Environment variables** protect sensitive API keys
- **Error messages** are sanitized in production
- **HTTPS** should be used in production deployment

## Development Notes

- The current implementation uses **mock Amazon authentication** (any credentials work)
- Real Amazon OAuth would require additional setup
- Knot API calls are placeholder implementations following their documentation
- Credit score algorithms are simplified for demonstration

## Future Enhancements

- [ ] Implement real Amazon OAuth
- [ ] Add user database for persistent data
- [ ] Enhance credit score algorithms with ML models
- [ ] Add rate limiting and authentication
- [ ] Implement caching for transaction data
- [ ] Add comprehensive unit tests
- [ ] Deploy to cloud platform (AWS, Azure, etc.)

## License

MIT
