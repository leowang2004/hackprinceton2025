# Testing Knot Session Creation

This document demonstrates how to create a Knot session using the `/api/create-session` endpoint.

## Prerequisites

1. Server is running: `npm start`
2. Server listens on: `http://localhost:3000`
3. API key is configured in `server.js` or `.env` as `KNOT_API_KEY`

## Sample Request

### PowerShell (Windows)

```powershell
# Basic request with defaults
$body = @{
    type = "transaction_link"
    external_user_id = "demo-user-123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/create-session" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

Write-Host "Session ID: $($response.sessionId)"
Write-Host "Type: $($response.type)"
Write-Host "User ID: $($response.external_user_id)"
```

### PowerShell with Optional Fields

```powershell
$body = @{
    type = "transaction_link"
    external_user_id = "user-456"
    phone_number = "+11234567890"
    email = "test@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/create-session" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

### Curl (Linux/Mac/Git Bash)

```bash
# Basic request
curl -X POST http://localhost:3000/api/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transaction_link",
    "external_user_id": "demo-user-123"
  }'
```

### Curl with Optional Fields

```bash
curl -X POST http://localhost:3000/api/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transaction_link",
    "external_user_id": "user-456",
    "phone_number": "+11234567890",
    "email": "test@example.com"
  }'
```

### JavaScript (Browser/Node)

```javascript
const createSession = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'transaction_link',
        external_user_id: 'demo-user-123',
        phone_number: '+11234567890',
        email: 'test@example.com'
      })
    });
    
    const data = await response.json();
    console.log('Session created:', data.sessionId);
    return data;
  } catch (error) {
    console.error('Failed to create session:', error);
  }
};

createSession();
```

## Expected Response

### Success (200)

```json
{
  "sessionId": "915efe72-5136-4652-z91q-d9d48003c102",
  "type": "transaction_link",
  "external_user_id": "demo-user-123"
}
```

### Error (400 - Invalid Request)

```json
{
  "error": "Failed to create session",
  "details": "The type field is required.",
  "code": "INVALID_FIELD",
  "type": "INVALID_REQUEST"
}
```

### Error (401 - Unauthorized)

```json
{
  "error": "Failed to create session",
  "details": "Invalid client_id or secret provided.",
  "code": "INVALID_API_KEYS",
  "type": "INVALID_INPUT"
}
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Session type: `transaction_link`, `card_switcher`, `link`, or `vault` |
| `external_user_id` | string | Yes | Your unique identifier for the user |
| `card_id` | string | Conditional | Required if `type = card_switcher` |
| `phone_number` | string | No | User's phone in E.164 format (e.g., `+11234567890`) |
| `email` | string | No | User's email address |
| `processor_token` | string | No | Plaid processor token for transaction data |

## Testing Steps

1. **Start the server**
   ```powershell
   npm start
   ```

2. **Open a new PowerShell terminal**

3. **Run the test request**
   ```powershell
   $body = @{ type = "transaction_link"; external_user_id = "test-user" } | ConvertTo-Json
   Invoke-RestMethod -Uri "http://localhost:3000/api/create-session" -Method Post -Body $body -ContentType "application/json"
   ```

4. **Verify the response** contains a `sessionId` field

5. **Use the sessionId** to initialize the Knot SDK in your front-end application

## Integration Example

Once you have a `sessionId`, you can use it to initialize the Knot SDK:

```javascript
// In your front-end code
const { sessionId } = await fetch('/api/create-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'transaction_link',
    external_user_id: 'user-123'
  })
}).then(r => r.json());

// Initialize Knot SDK
const knot = new Knot({
  environment: 'development'
});

knot.open({
  sessionId: sessionId,
  onSuccess: (data) => console.log('Success:', data),
  onError: (error) => console.error('Error:', error),
  onExit: () => console.log('User exited')
});
```

## Troubleshooting

### "Cannot find module 'axios'"
Run: `npm install`

### "Invalid API keys"
Check that the API key in `server.js` or `.env` is correct and in the format `client_id:secret` (base64-encoded for Basic Auth)

### Connection refused
Ensure the server is running on port 3000: `npm start`

### CORS errors (from browser)
The server already has CORS enabled. If issues persist, check browser console for specific error messages.
