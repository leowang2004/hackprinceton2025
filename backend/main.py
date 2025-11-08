from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
from dotenv import load_dotenv

from services.knot_service import KnotService
from services.credit_score_service import CreditScoreService

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Amazon Credit Score API",
    description="Backend API for calculating alternative credit scores based on Amazon transaction data",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
knot_service = KnotService()
credit_score_service = CreditScoreService()


# Request/Response Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    success: bool
    message: str
    creditScore: int
    transactionCount: int


class HealthResponse(BaseModel):
    status: str
    message: str


class KnotStatusResponse(BaseModel):
    success: bool
    status: dict


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "OK",
        "message": "Server is running"
    }


@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Handle fake Amazon login and calculate credit score
    
    This endpoint:
    1. Accepts email and password (fake authentication)
    2. Retrieves Amazon transaction data via Knot API
    3. Calculates alternative credit score
    4. Returns the credit score to the mobile app
    """
    try:
        # Log the login attempt
        print(f"Login attempt for email: {request.email}")
        print("Login successful (fake authentication)")
        
        # Fetch transaction data from Amazon via Knot API
        transactions = []
        try:
            transactions = await knot_service.get_amazon_transactions(request.email)
            print(f"Retrieved {len(transactions)} transactions from Knot API")
        except Exception as e:
            print(f"Error fetching transactions from Knot API: {str(e)}")
            # Continue with empty transactions array if Knot API fails
            # This allows the app to work even without actual Knot API credentials
        
        # Calculate credit score based on transaction data
        credit_score = credit_score_service.calculate_credit_score(transactions)
        
        return {
            "success": True,
            "message": "Login successful",
            "creditScore": credit_score,
            "transactionCount": len(transactions)
        }
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during login: {str(e)}"
        )


@app.get("/api/knot/status", response_model=KnotStatusResponse)
async def knot_status():
    """Check Knot API connection status"""
    try:
        status = await knot_service.check_status()
        return {
            "success": True,
            "status": status
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to check Knot API status: {str(e)}"
        )


@app.get("/api/knot/transactions/{email}")
async def get_transactions(email: str):
    """Get transactions for a specific user"""
    try:
        transactions = await knot_service.get_amazon_transactions(email)
        return {
            "success": True,
            "email": email,
            "transactionCount": len(transactions),
            "transactions": transactions
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch transactions: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
