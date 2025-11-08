const express = require('express');
const router = express.Router();
const knotService = require('../services/knotService');

/**
 * GET /api/knot/status
 * Check Knot API connection status
 */
router.get('/knot/status', async (req, res) => {
    try {
        const status = await knotService.checkStatus();
        res.json({
            success: true,
            status: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to check Knot API status',
            error: error.message
        });
    }
});

/**
 * GET /api/knot/transactions/:email
 * Get transactions for a specific user
 */
router.get('/knot/transactions/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const transactions = await knotService.getAmazonTransactions(email);
        
        res.json({
            success: true,
            email: email,
            transactionCount: transactions.length,
            transactions: transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
});

module.exports = router;
