// Merchant Selection Logic

// Store selected merchant in session storage
function goToMerchant(merchant) {
    console.log(`Navigating to ${merchant} checkout...`);
    
    // Store merchant selection
    sessionStorage.setItem('selectedMerchant', merchant);
    
    // Navigate to the appropriate checkout page
    if (merchant === 'amazon') {
        // Redirect to Amazon checkout flow
        window.location.href = 'amazon-checkout.html';
    } else if (merchant === 'wayfair') {
        // Redirect to Wayfair checkout flow
        window.location.href = 'wayfair-checkout.html';
    }
}

// Optional: Add keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === '1') {
        goToMerchant('amazon');
    } else if (event.key === '2') {
        goToMerchant('wayfair');
    }
});

// Optional: Add analytics tracking
function trackMerchantSelection(merchant) {
    // This is where you would send analytics data
    console.log('Analytics: Merchant selected -', merchant);
    
    // Example: Send to analytics service
    // analytics.track('merchant_selected', { merchant: merchant });
}

// Add click tracking to buttons
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn-amazon, .btn-wayfair');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const merchant = this.classList.contains('btn-amazon') ? 'amazon' : 'wayfair';
            trackMerchantSelection(merchant);
        });
    });
});
