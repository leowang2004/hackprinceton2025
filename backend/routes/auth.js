const express = require('express');
const router = express.Router();
const knotService = require('../services/knotService');
const creditScoreService = require('../services/creditScoreService');

/**
 * POST /api/login
 * Handles fake Amazon login and initiates credit score calculation
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Simulate successful login (fake authentication)
        console.log(`Login attempt for email: ${email}`);
        console.log('Login successful (fake authentication)');

        // Fetch transaction data from Amazon via Knot API
        let transactions = [];
        try {
            transactions = await knotService.getAmazonTransactions(email);
            console.log(`Retrieved ${transactions.length} transactions from Knot API`);
        } catch (error) {
            console.error('Error fetching transactions from Knot API:', error.message);
            // Continue with empty transactions array if Knot API fails
            // This allows the app to work even without actual Knot API credentials
        }

        // Calculate credit score based on transaction data
        const creditScore = creditScoreService.calculateCreditScore(transactions);

        // Return success response with credit score
        res.json({
            success: true,
            message: 'Login successful',
            creditScore: creditScore,
            transactionCount: transactions.length
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login',
            error: error.message
        });
    }
});

module.exports = router;
