# Knot API Integration Guide

This document provides detailed information on integrating the Knot API for retrieving Amazon transaction data.

## Overview

[Knot API](https://docs.knotapi.com/) provides secure access to user transaction data from various platforms including Amazon, Walmart, and more. This application uses Knot to retrieve Amazon purchase history for credit score calculation.

## Getting Started

### 1. Sign Up for Knot API

Visit [https://knotapi.com](https://knotapi.com) to create an account and get your API credentials.

### 2. Get API Credentials

Once registered, you'll receive:
- **API Key**: Used for backend authentication
- **Client ID**: Used for iOS SDK initialization

### 3. Configure Backend

Add credentials to backend `.env` file:

```bash
KNOT_API_KEY=your_api_key_here
KNOT_CLIENT_ID=your_client_id_here
KNOT_API_BASE_URL=https://api.knotapi.com/v1
```

### 4. Install iOS SDK

Add Knot SDK to your iOS project using CocoaPods:

```ruby
pod 'KnotSDK'
```

Or using Swift Package Manager:

```
https://github.com/knotapi/knot-ios-sdk
```

## iOS Integration

### Step 1: Initialize Knot SDK

In `AmazonCreditScoreApp.swift`:

```swift
import KnotSDK

@main
struct AmazonCreditScoreApp: App {
    init() {
        // Configure Knot SDK with your client ID
        Knot.configure(
            clientID: "your_client_id_here",
            environment: .sandbox // Use .production for production
        )
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

### Step 2: Present Knot Authentication

Replace the fake login with Knot authentication:

```swift
import KnotSDK

struct LoginView: View {
    let onLoginSuccess: (String) -> Void
    
    private func handleKnotLogin() {
        // Present Knot authentication for Amazon
        Knot.present(
            platform: .amazon,
            from: self
        ) { result in
            switch result {
            case .success(let session):
                // Session token to send to backend
                let token = session.token
                sendTokenToBackend(token)
                
            case .failure(let error):
                print("Knot authentication failed: \(error)")
            }
        }
    }
    
    private func sendTokenToBackend(_ token: String) {
        // Send token to backend for transaction retrieval
        NetworkService.shared.sendKnotToken(token) { result in
            switch result {
            case .success(let creditScore):
                onLoginSuccess(creditScore)
            case .failure(let error):
                print("Backend error: \(error)")
            }
        }
    }
}
```

### Step 3: Update Network Service

Add method to send Knot token:

```swift
func sendKnotToken(_ token: String, completion: @escaping (Result<Int, Error>) -> Void) {
    guard let url = URL(string: "\(baseURL)/api/knot/authenticate") else {
        completion(.failure(NSError(domain: "Invalid URL", code: -1, userInfo: nil)))
        return
    }
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body: [String: Any] = ["token": token]
    
    do {
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
    } catch {
        completion(.failure(error))
        return
    }
    
    let task = URLSession.shared.dataTask(with: request) { data, response, error in
        // Handle response...
    }
    
    task.resume()
}
```

## Backend Integration

### Step 1: Install Knot SDK (Node.js)

```bash
npm install @knotapi/knot-node
```

### Step 2: Initialize Knot Client

In `services/knotService.js`:

```javascript
const Knot = require('@knotapi/knot-node');

class KnotService {
    constructor() {
        this.client = new Knot({
            apiKey: process.env.KNOT_API_KEY,
            clientId: process.env.KNOT_CLIENT_ID,
            environment: 'sandbox' // or 'production'
        });
    }
}
```

### Step 3: Authenticate and Retrieve Transactions

```javascript
async getAmazonTransactions(sessionToken) {
    try {
        // Verify the session token
        const session = await this.client.sessions.verify(sessionToken);
        
        // Get account ID from session
        const accountId = session.accountId;
        
        // Retrieve transactions
        const transactions = await this.client.transactions.list({
            accountId: accountId,
            platform: 'amazon',
            startDate: '2024-01-01',
            endDate: new Date().toISOString(),
            limit: 100
        });
        
        return transactions.data;
    } catch (error) {
        console.error('Knot API error:', error);
        throw error;
    }
}
```

### Step 4: Create Authentication Endpoint

In `routes/auth.js`:

```javascript
router.post('/knot/authenticate', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }
        
        // Get transactions using Knot token
        const transactions = await knotService.getAmazonTransactions(token);
        
        // Calculate credit score
        const creditScore = creditScoreService.calculateCreditScore(transactions);
        
        res.json({
            success: true,
            creditScore: creditScore,
            transactionCount: transactions.length
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
});
```

## API Reference

### Knot iOS SDK Methods

```swift
// Configure SDK
Knot.configure(clientID: String, environment: Environment)

// Present authentication
Knot.present(platform: Platform, from: UIViewController, completion: Completion)

// Available platforms
.amazon
.walmart
.instacart
// ... more platforms
```

### Knot Node.js SDK Methods

```javascript
// Initialize client
const knot = new Knot({
    apiKey: 'your_api_key',
    clientId: 'your_client_id',
    environment: 'sandbox' // or 'production'
});

// Verify session
await knot.sessions.verify(token);

// List transactions
await knot.transactions.list({
    accountId: 'account_id',
    platform: 'amazon',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    limit: 100
});

// Get account details
await knot.accounts.retrieve(accountId);
```

## Transaction Data Structure

Knot API returns transactions in this format:

```javascript
{
    "id": "txn_abc123",
    "accountId": "acc_xyz789",
    "date": "2024-11-08T10:30:00Z",
    "amount": 49.99,
    "currency": "USD",
    "description": "Amazon Prime Video subscription",
    "category": "Entertainment",
    "merchant": {
        "name": "Amazon.com",
        "category": "Retail"
    },
    "status": "completed"
}
```

## Error Handling

### Common Errors

1. **Authentication Failed**
   - User cancelled authentication
   - Invalid credentials
   - Network error

2. **Session Expired**
   - Token expired
   - Need to re-authenticate

3. **Rate Limiting**
   - Too many requests
   - Implement exponential backoff

### Error Handling Example

```javascript
try {
    const transactions = await knotService.getAmazonTransactions(token);
} catch (error) {
    if (error.code === 'SESSION_EXPIRED') {
        // Ask user to re-authenticate
    } else if (error.code === 'RATE_LIMIT') {
        // Implement retry with backoff
    } else {
        // Handle other errors
    }
}
```

## Security Best Practices

1. **Never expose API keys in client code**
   - Store in backend environment variables
   - Use iOS Keychain for sensitive data

2. **Use HTTPS in production**
   - All API calls should use TLS

3. **Validate session tokens**
   - Always verify tokens on backend
   - Don't trust client-side validation

4. **Implement rate limiting**
   - Protect against abuse
   - Follow Knot API rate limits

5. **Handle tokens securely**
   - Don't log tokens
   - Use short-lived tokens
   - Implement token refresh

## Testing

### Sandbox Mode

Knot provides a sandbox environment for testing:

```javascript
environment: 'sandbox'
```

Use test accounts:
- Email: `test@knotapi.com`
- Password: `testpassword`

### Mock Data

For development without Knot credentials, the app uses mock transaction data. See `knotService.js` for implementation.

## Migration to Production

1. **Get production credentials**
   - Request production access from Knot
   - Update environment variables

2. **Change environment**
   ```javascript
   environment: 'production'
   ```

3. **Update base URLs**
   - Ensure all URLs point to production

4. **Test thoroughly**
   - Test with real Amazon accounts
   - Verify transaction data accuracy

## Troubleshooting

### Issue: "Knot SDK not initialized"
**Solution:** Ensure `Knot.configure()` is called before any other Knot methods

### Issue: "Invalid API key"
**Solution:** Verify credentials in `.env` file and dashboard

### Issue: "No transactions returned"
**Solution:** 
- Check date range
- Verify user has transaction history
- Check platform availability

### Issue: "Session token expired"
**Solution:** Implement token refresh or re-authenticate user

## Resources

- [Knot API Documentation](https://docs.knotapi.com/)
- [iOS SDK Reference](https://docs.knotapi.com/sdk/ios)
- [Node.js SDK Reference](https://docs.knotapi.com/sdk/node)
- [API Status Page](https://status.knotapi.com/)
- [Developer Dashboard](https://dashboard.knotapi.com/)

## Support

For Knot API support:
- Email: support@knotapi.com
- Documentation: https://docs.knotapi.com
- Community: https://community.knotapi.com

## Next Steps

1. Sign up for Knot API account
2. Get sandbox credentials
3. Test integration in development
4. Apply for production access
5. Deploy to production

---

**Note:** This is a working implementation with mock data. Follow this guide to integrate the real Knot API when ready for production.
