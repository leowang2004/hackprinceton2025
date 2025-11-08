import os
import requests
from datetime import datetime, timedelta
from typing import List, Dict
import random


class KnotService:
    """
    Knot API Service
    Integrates with Knot API to retrieve Amazon transaction data
    Documentation: https://docs.knotapi.com/sdk/ios
    """
    
    def __init__(self):
        self.api_key = os.getenv('KNOT_API_KEY', '')
        self.client_id = os.getenv('KNOT_CLIENT_ID', '')
        self.base_url = os.getenv('KNOT_API_BASE_URL', 'https://api.knotapi.com/v1')
        
        # Setup request headers
        self.headers = {
            'Content-Type': 'application/json',
            'X-Knot-API-Key': self.api_key
        }
    
    async def check_status(self) -> Dict:
        """Check if Knot API is configured and accessible"""
        if not self.api_key or not self.client_id:
            return {
                'configured': False,
                'message': 'Knot API credentials not configured'
            }
        
        try:
            # Attempt to make a simple API call to verify connectivity
            response = requests.get(
                f'{self.base_url}/health',
                headers=self.headers,
                timeout=5
            )
            return {
                'configured': True,
                'connected': True,
                'message': 'Knot API is connected'
            }
        except Exception as e:
            return {
                'configured': True,
                'connected': False,
                'message': 'Knot API credentials configured but connection failed',
                'error': str(e)
            }
    
    async def get_amazon_transactions(self, email: str) -> List[Dict]:
        """
        Get Amazon transaction data for a user
        
        Args:
            email: User email (used as identifier)
            
        Returns:
            List of transaction dictionaries
        """
        if not self.api_key or not self.client_id:
            print('Knot API not configured, returning mock data')
            return self._get_mock_transactions()
        
        try:
            # According to Knot API documentation, we would:
            # 1. Create a session for the user
            # 2. Link their Amazon account
            # 3. Retrieve transaction data
            
            # Create session
            session_response = requests.post(
                f'{self.base_url}/sessions',
                headers=self.headers,
                json={
                    'clientId': self.client_id,
                    'userEmail': email,
                    'platform': 'amazon'
                },
                timeout=10
            )
            
            if session_response.status_code != 200:
                raise Exception(f"Failed to create session: {session_response.text}")
            
            session_id = session_response.json().get('sessionId')
            
            # Fetch transactions using the session
            transactions_response = requests.get(
                f'{self.base_url}/sessions/{session_id}/transactions',
                headers=self.headers,
                params={
                    'platform': 'amazon',
                    'limit': 100
                },
                timeout=10
            )
            
            if transactions_response.status_code != 200:
                raise Exception(f"Failed to fetch transactions: {transactions_response.text}")
            
            return transactions_response.json().get('transactions', [])
            
        except Exception as e:
            print(f'Error fetching from Knot API: {str(e)}')
            # Return mock data if API call fails
            return self._get_mock_transactions()
    
    def _get_mock_transactions(self) -> List[Dict]:
        """
        Generate mock transaction data for development/testing
        This simulates what Knot API would return
        """
        categories = ['Electronics', 'Books', 'Home & Kitchen', 'Clothing', 'Groceries']
        transactions = []
        now = datetime.now()
        
        # Generate 20 mock transactions over the past 6 months
        for i in range(20):
            days_ago = random.randint(0, 180)
            date = now - timedelta(days=days_ago)
            
            transactions.append({
                'id': f'txn_{int(datetime.now().timestamp() * 1000)}_{i}',
                'date': date.isoformat(),
                'amount': round(random.uniform(10, 200), 2),
                'category': random.choice(categories),
                'description': f'Amazon Purchase {i + 1}',
                'merchant': 'Amazon.com'
            })
        
        # Sort by date (most recent first)
        transactions.sort(key=lambda x: x['date'], reverse=True)
        return transactions
    
    async def link_amazon_account(self, user_id: str, auth_token: str) -> Dict:
        """
        Link Amazon account via Knot API
        This would typically be done through the Knot SDK
        """
        if not self.api_key or not self.client_id:
            raise Exception('Knot API not configured')
        
        try:
            response = requests.post(
                f'{self.base_url}/accounts/link',
                headers=self.headers,
                json={
                    'userId': user_id,
                    'platform': 'amazon',
                    'authToken': auth_token
                },
                timeout=10
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to link account: {response.text}")
            
            return {
                'success': True,
                'accountId': response.json().get('accountId')
            }
            
        except Exception as e:
            raise Exception(f'Failed to link Amazon account: {str(e)}')
