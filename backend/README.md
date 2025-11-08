# Amazon Credit Score Backend (Python/FastAPI)

Python backend server for the Amazon Credit Score application that integrates with Knot API to calculate alternative credit scores based on Amazon transaction data.

## Features

- **FastAPI Framework**: Modern, fast (high-performance) Python web framework
- **Fake Amazon Login**: Accepts login credentials and simulates authentication
- **Knot API Integration**: Retrieves Amazon transaction data using Knot API
- **Credit Score Calculation**: Implements algorithms to calculate alternative credit scores
- **RESTful API**: Provides endpoints for mobile app integration
- **Async Support**: Asynchronous request handling for better performance

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Knot API credentials (optional - will use mock data if not provided)

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
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
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 3000
```

### Production mode:
```bash
uvicorn main:app --host 0.0.0.0 --port 3000 --workers 4
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

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

#### GET `/api/knot/transactions/{email}`
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

## Project Structure

```
backend/
├── main.py                        # FastAPI application and endpoints
├── services/
│   ├── __init__.py
│   ├── knot_service.py           # Knot API integration
│   └── credit_score_service.py   # Credit score algorithms
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment variables template
├── .gitignore
└── README.md
```

## Knot API Integration

The application integrates with [Knot API](https://docs.knotapi.com/) to retrieve Amazon transaction data.

### Setup:

1. Sign up for a Knot API account at https://knotapi.com
2. Get your API credentials (API Key and Client ID)
3. Add credentials to `.env` file
4. The mobile app will use Knot SDK to authenticate users with Amazon
5. Backend retrieves transaction data via Knot API

### Mock Data:

If Knot API credentials are not configured, the service will generate mock transaction data for development and testing purposes.

## API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: http://localhost:3000/docs
- **ReDoc**: http://localhost:3000/redoc

## Error Handling

All endpoints include proper error handling:
- 400: Bad Request (missing or invalid parameters)
- 500: Internal Server Error

Errors are logged to console for debugging.

## Security Considerations

- **CORS** is configured for cross-origin requests
- **Environment variables** protect sensitive API keys
- **Pydantic models** validate all input data
- **HTTPS** should be used in production deployment

## Testing

Run tests (if test suite is added):
```bash
pytest
```

## Deployment

### Docker (recommended)

Create a `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
```

Build and run:
```bash
docker build -t amazon-credit-score-backend .
docker run -p 3000:3000 --env-file .env amazon-credit-score-backend
```

### Cloud Platforms

- **Heroku**: Use `Procfile` with `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
- **AWS Lambda**: Use Mangum adapter for serverless deployment
- **Google Cloud Run**: Deploy container directly
- **Azure App Service**: Deploy Python web app

## Development Notes

- The current implementation uses **mock Amazon authentication** (any credentials work)
- Real Amazon OAuth would require additional setup
- Knot API calls are placeholder implementations following their documentation
- Credit score algorithms are simplified for demonstration

## Dependencies

- **fastapi**: Modern web framework
- **uvicorn**: ASGI server
- **pydantic**: Data validation
- **python-dotenv**: Environment variable management
- **requests**: HTTP client for API calls

## Future Enhancements

- [ ] Implement real Amazon OAuth
- [ ] Add user database for persistent data (PostgreSQL/MongoDB)
- [ ] Enhance credit score algorithms with ML models (scikit-learn/TensorFlow)
- [ ] Add rate limiting and authentication middleware
- [ ] Implement caching for transaction data (Redis)
- [ ] Add comprehensive unit tests (pytest)
- [ ] Add database migrations (Alembic)
- [ ] Implement logging framework (structlog)
- [ ] Add monitoring and metrics (Prometheus)

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Import Errors
Make sure virtual environment is activated:
```bash
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

### CORS Issues
Update CORS configuration in `main.py` to include your frontend URL.

## License

MIT
