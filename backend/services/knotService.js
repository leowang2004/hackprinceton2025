const axios = require('axios');

/**
 * Knot API Service
 * Integrates with Knot API to retrieve Amazon transaction data
 * Documentation: https://docs.knotapi.com/sdk/ios
 */
class KnotService {
    constructor() {
        this.apiKey = process.env.KNOT_API_KEY || '';
        this.clientId = process.env.KNOT_CLIENT_ID || '';
        this.baseURL = process.env.KNOT_API_BASE_URL || 'https://api.knotapi.com/v1';
        
        // Create axios instance with default config
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
                'X-Knot-API-Key': this.apiKey
            }
        });
    }

    /**
     * Check if Knot API is configured and accessible
     */
    async checkStatus() {
        if (!this.apiKey || !this.clientId) {
            return {
                configured: false,
                message: 'Knot API credentials not configured'
            };
        }

        try {
            // Attempt to make a simple API call to verify connectivity
            // This is a placeholder - actual endpoint depends on Knot API documentation
            const response = await this.client.get('/health');
            return {
                configured: true,
                connected: true,
                message: 'Knot API is connected'
            };
        } catch (error) {
            return {
                configured: true,
                connected: false,
                message: 'Knot API credentials configured but connection failed',
                error: error.message
            };
        }
    }

    /**
     * Get Amazon transaction data for a user
     * @param {string} email - User email (used as identifier)
     * @returns {Promise<Array>} Array of transaction objects
     */
    async getAmazonTransactions(email) {
        if (!this.apiKey || !this.clientId) {
            console.log('Knot API not configured, returning mock data');
            return this.getMockTransactions();
        }

        try {
            // According to Knot API documentation, we would:
            // 1. Create a session for the user
            // 2. Link their Amazon account
            // 3. Retrieve transaction data
            
            // For now, this is a placeholder implementation
            // Replace with actual Knot API calls based on their SDK documentation
            
            const response = await this.client.post('/sessions', {
                clientId: this.clientId,
                userEmail: email,
                platform: 'amazon'
            });

            const sessionId = response.data.sessionId;

            // Fetch transactions using the session
            const transactionsResponse = await this.client.get(`/sessions/${sessionId}/transactions`, {
                params: {
                    platform: 'amazon',
                    limit: 100
                }
            });

            return transactionsResponse.data.transactions || [];
        } catch (error) {
            console.error('Error fetching from Knot API:', error.message);
            // Return mock data if API call fails
            return this.getMockTransactions();
        }
    }

    /**
     * Generate mock transaction data for development/testing
     * This simulates what Knot API would return
     */
    getMockTransactions() {
        const categories = ['Electronics', 'Books', 'Home & Kitchen', 'Clothing', 'Groceries'];
        const transactions = [];
        const now = new Date();

        // Generate 20 mock transactions over the past 6 months
        for (let i = 0; i < 20; i++) {
            const daysAgo = Math.floor(Math.random() * 180);
            const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
            
            transactions.push({
                id: `txn_${Date.now()}_${i}`,
                date: date.toISOString(),
                amount: parseFloat((Math.random() * 200 + 10).toFixed(2)),
                category: categories[Math.floor(Math.random() * categories.length)],
                description: `Amazon Purchase ${i + 1}`,
                merchant: 'Amazon.com'
            });
        }

        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * Link Amazon account via Knot API
     * This would typically be done through the Knot iOS SDK
     */
    async linkAmazonAccount(userId, authToken) {
        if (!this.apiKey || !this.clientId) {
            throw new Error('Knot API not configured');
        }

        try {
            const response = await this.client.post('/accounts/link', {
                userId: userId,
                platform: 'amazon',
                authToken: authToken
            });

            return {
                success: true,
                accountId: response.data.accountId
            };
        } catch (error) {
            throw new Error(`Failed to link Amazon account: ${error.message}`);
        }
    }
}

module.exports = new KnotService();
