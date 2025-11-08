/**
 * Credit Score Service
 * Calculates alternative credit score based on Amazon transaction data
 * 
 * This is a placeholder implementation with basic algorithms
 * In a real implementation, this would use sophisticated ML models
 * and more comprehensive transaction analysis
 */
class CreditScoreService {
    /**
     * Calculate credit score from transaction data
     * @param {Array} transactions - Array of transaction objects from Knot API
     * @returns {number} Credit score between 300-850
     */
    calculateCreditScore(transactions) {
        if (!transactions || transactions.length === 0) {
            // Return a default score if no transactions
            return 650;
        }

        // Base score
        let score = 500;

        // Factor 1: Transaction Volume (max +100 points)
        const volumeScore = this.calculateVolumeScore(transactions);
        score += volumeScore;

        // Factor 2: Transaction Consistency (max +100 points)
        const consistencyScore = this.calculateConsistencyScore(transactions);
        score += consistencyScore;

        // Factor 3: Average Transaction Amount (max +100 points)
        const amountScore = this.calculateAmountScore(transactions);
        score += amountScore;

        // Factor 4: Category Diversity (max +100 points)
        const diversityScore = this.calculateDiversityScore(transactions);
        score += diversityScore;

        // Factor 5: Recent Activity (max +50 points)
        const recentActivityScore = this.calculateRecentActivityScore(transactions);
        score += recentActivityScore;

        // Ensure score is within valid range (300-850)
        score = Math.max(300, Math.min(850, Math.round(score)));

        return score;
    }

    /**
     * Calculate score based on transaction volume
     * More transactions indicate more economic activity
     */
    calculateVolumeScore(transactions) {
        const count = transactions.length;
        
        if (count >= 50) return 100;
        if (count >= 30) return 80;
        if (count >= 20) return 60;
        if (count >= 10) return 40;
        if (count >= 5) return 20;
        return 10;
    }

    /**
     * Calculate score based on transaction consistency
     * Regular purchases indicate stable financial behavior
     */
    calculateConsistencyScore(transactions) {
        if (transactions.length < 2) return 0;

        // Calculate time gaps between transactions
        const sortedTransactions = [...transactions].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );

        const gaps = [];
        for (let i = 1; i < sortedTransactions.length; i++) {
            const gap = Math.abs(
                new Date(sortedTransactions[i].date) - new Date(sortedTransactions[i - 1].date)
            );
            gaps.push(gap / (1000 * 60 * 60 * 24)); // Convert to days
        }

        // Calculate standard deviation of gaps
        const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
        const stdDev = Math.sqrt(variance);

        // Lower standard deviation = more consistent = higher score
        if (stdDev < 10) return 100;
        if (stdDev < 20) return 80;
        if (stdDev < 30) return 60;
        if (stdDev < 45) return 40;
        return 20;
    }

    /**
     * Calculate score based on average transaction amount
     * Higher average amounts may indicate higher purchasing power
     */
    calculateAmountScore(transactions) {
        const amounts = transactions.map(t => t.amount || 0);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;

        if (avgAmount >= 200) return 100;
        if (avgAmount >= 150) return 80;
        if (avgAmount >= 100) return 60;
        if (avgAmount >= 50) return 40;
        if (avgAmount >= 25) return 20;
        return 10;
    }

    /**
     * Calculate score based on category diversity
     * Diverse purchases indicate well-rounded financial activity
     */
    calculateDiversityScore(transactions) {
        const categories = new Set(transactions.map(t => t.category).filter(Boolean));
        const uniqueCategories = categories.size;

        if (uniqueCategories >= 8) return 100;
        if (uniqueCategories >= 6) return 80;
        if (uniqueCategories >= 4) return 60;
        if (uniqueCategories >= 2) return 40;
        return 20;
    }

    /**
     * Calculate score based on recent activity
     * Recent transactions indicate current active usage
     */
    calculateRecentActivityScore(transactions) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const recentTransactions = transactions.filter(
            t => new Date(t.date) >= thirtyDaysAgo
        );

        const count = recentTransactions.length;
        
        if (count >= 10) return 50;
        if (count >= 7) return 40;
        if (count >= 5) return 30;
        if (count >= 3) return 20;
        if (count >= 1) return 10;
        return 0;
    }

    /**
     * Get detailed score breakdown for transparency
     */
    getScoreBreakdown(transactions) {
        return {
            totalScore: this.calculateCreditScore(transactions),
            factors: {
                volume: {
                    score: this.calculateVolumeScore(transactions),
                    maxScore: 100,
                    description: 'Transaction volume'
                },
                consistency: {
                    score: this.calculateConsistencyScore(transactions),
                    maxScore: 100,
                    description: 'Purchase consistency'
                },
                amount: {
                    score: this.calculateAmountScore(transactions),
                    maxScore: 100,
                    description: 'Average transaction amount'
                },
                diversity: {
                    score: this.calculateDiversityScore(transactions),
                    maxScore: 100,
                    description: 'Category diversity'
                },
                recentActivity: {
                    score: this.calculateRecentActivityScore(transactions),
                    maxScore: 50,
                    description: 'Recent activity'
                }
            }
        };
    }
}

module.exports = new CreditScoreService();
