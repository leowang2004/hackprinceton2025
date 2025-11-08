from typing import List, Dict
from datetime import datetime, timedelta
import statistics


class CreditScoreService:
    """
    Credit Score Service
    Calculates alternative credit score based on Amazon transaction data
    
    This is a placeholder implementation with basic algorithms.
    In a real implementation, this would use sophisticated ML models
    and more comprehensive transaction analysis.
    """
    
    def calculate_credit_score(self, transactions: List[Dict]) -> int:
        """
        Calculate credit score from transaction data
        
        Args:
            transactions: List of transaction dictionaries from Knot API
            
        Returns:
            Credit score between 300-850
        """
        if not transactions or len(transactions) == 0:
            # Return a default score if no transactions
            return 650
        
        # Base score
        score = 500
        
        # Factor 1: Transaction Volume (max +100 points)
        volume_score = self._calculate_volume_score(transactions)
        score += volume_score
        
        # Factor 2: Transaction Consistency (max +100 points)
        consistency_score = self._calculate_consistency_score(transactions)
        score += consistency_score
        
        # Factor 3: Average Transaction Amount (max +100 points)
        amount_score = self._calculate_amount_score(transactions)
        score += amount_score
        
        # Factor 4: Category Diversity (max +100 points)
        diversity_score = self._calculate_diversity_score(transactions)
        score += diversity_score
        
        # Factor 5: Recent Activity (max +50 points)
        recent_activity_score = self._calculate_recent_activity_score(transactions)
        score += recent_activity_score
        
        # Ensure score is within valid range (300-850)
        score = max(300, min(850, round(score)))
        
        return score
    
    def _calculate_volume_score(self, transactions: List[Dict]) -> int:
        """
        Calculate score based on transaction volume
        More transactions indicate more economic activity
        """
        count = len(transactions)
        
        if count >= 50:
            return 100
        elif count >= 30:
            return 80
        elif count >= 20:
            return 60
        elif count >= 10:
            return 40
        elif count >= 5:
            return 20
        return 10
    
    def _calculate_consistency_score(self, transactions: List[Dict]) -> int:
        """
        Calculate score based on transaction consistency
        Regular purchases indicate stable financial behavior
        """
        if len(transactions) < 2:
            return 0
        
        # Calculate time gaps between transactions
        sorted_transactions = sorted(
            transactions,
            key=lambda x: datetime.fromisoformat(x['date'].replace('Z', '+00:00'))
        )
        
        gaps = []
        for i in range(1, len(sorted_transactions)):
            date1 = datetime.fromisoformat(sorted_transactions[i - 1]['date'].replace('Z', '+00:00'))
            date2 = datetime.fromisoformat(sorted_transactions[i]['date'].replace('Z', '+00:00'))
            gap_days = abs((date2 - date1).days)
            gaps.append(gap_days)
        
        # Calculate standard deviation of gaps
        if not gaps:
            return 0
        
        avg_gap = sum(gaps) / len(gaps)
        variance = sum((gap - avg_gap) ** 2 for gap in gaps) / len(gaps)
        std_dev = variance ** 0.5
        
        # Lower standard deviation = more consistent = higher score
        if std_dev < 10:
            return 100
        elif std_dev < 20:
            return 80
        elif std_dev < 30:
            return 60
        elif std_dev < 45:
            return 40
        return 20
    
    def _calculate_amount_score(self, transactions: List[Dict]) -> int:
        """
        Calculate score based on average transaction amount
        Higher average amounts may indicate higher purchasing power
        """
        amounts = [t.get('amount', 0) for t in transactions]
        avg_amount = sum(amounts) / len(amounts) if amounts else 0
        
        if avg_amount >= 200:
            return 100
        elif avg_amount >= 150:
            return 80
        elif avg_amount >= 100:
            return 60
        elif avg_amount >= 50:
            return 40
        elif avg_amount >= 25:
            return 20
        return 10
    
    def _calculate_diversity_score(self, transactions: List[Dict]) -> int:
        """
        Calculate score based on category diversity
        Diverse purchases indicate well-rounded financial activity
        """
        categories = set(t.get('category', '') for t in transactions if t.get('category'))
        unique_categories = len(categories)
        
        if unique_categories >= 8:
            return 100
        elif unique_categories >= 6:
            return 80
        elif unique_categories >= 4:
            return 60
        elif unique_categories >= 2:
            return 40
        return 20
    
    def _calculate_recent_activity_score(self, transactions: List[Dict]) -> int:
        """
        Calculate score based on recent activity
        Recent transactions indicate current active usage
        """
        now = datetime.now()
        thirty_days_ago = now - timedelta(days=30)
        
        recent_transactions = [
            t for t in transactions
            if datetime.fromisoformat(t['date'].replace('Z', '+00:00')) >= thirty_days_ago
        ]
        
        count = len(recent_transactions)
        
        if count >= 10:
            return 50
        elif count >= 7:
            return 40
        elif count >= 5:
            return 30
        elif count >= 3:
            return 20
        elif count >= 1:
            return 10
        return 0
    
    def get_score_breakdown(self, transactions: List[Dict]) -> Dict:
        """
        Get detailed score breakdown for transparency
        """
        return {
            'totalScore': self.calculate_credit_score(transactions),
            'factors': {
                'volume': {
                    'score': self._calculate_volume_score(transactions),
                    'maxScore': 100,
                    'description': 'Transaction volume'
                },
                'consistency': {
                    'score': self._calculate_consistency_score(transactions),
                    'maxScore': 100,
                    'description': 'Purchase consistency'
                },
                'amount': {
                    'score': self._calculate_amount_score(transactions),
                    'maxScore': 100,
                    'description': 'Average transaction amount'
                },
                'diversity': {
                    'score': self._calculate_diversity_score(transactions),
                    'maxScore': 100,
                    'description': 'Category diversity'
                },
                'recentActivity': {
                    'score': self._calculate_recent_activity_score(transactions),
                    'maxScore': 50,
                    'description': 'Recent activity'
                }
            }
        }
