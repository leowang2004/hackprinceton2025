// Amazon Checkout Flow - WingsPay Integration

// State Management
const state = {
    currentModal: null,
    linkedApis: [],
    selectedPlan: null,
    loginModalApi: null,
    orderCompleted: false
};

// API Options Configuration
const API_OPTIONS = [
    {
        id: 'amazon',
        name: 'Amazon',
        description: 'Link your Amazon account to verify spending',
        color: '#FF9900',
        recommended: true
    },
    {
        id: 'doordash',
        name: 'DoorDash',
        description: 'Connect DoorDash to verify activity',
        color: '#FF3008',
        recommended: true
    },
    {
        id: 'instacart',
        name: 'Instacart',
        description: 'Link Instacart for payment verification',
        color: '#43B02A',
        recommended: false
    },
    {
        id: 'uber',
        name: 'Uber',
        description: 'Connect your Uber account',
        color: '#000000',
        recommended: false
    },
    {
        id: 'target',
        name: 'Target',
        description: 'Link Target shopping history',
        color: '#CC0000',
        recommended: false
    },
    {
        id: 'starbucks',
        name: 'Starbucks',
        description: 'Connect Starbucks Rewards',
        color: '#00704A',
        recommended: false
    }
];

// Order Total (from cart)
const ORDER_TOTAL = 299.99;

// Payment Plans Configuration (will be updated dynamically from backend)
let PAYMENT_PLANS = [
    { months: 3, rate: 0, monthly: 99.99 },
    { months: 6, rate: 5.99, monthly: 51.25 },
    { months: 12, rate: 9.99, monthly: 27.50 }
];

// Backend API Configuration
const BACKEND_API_URL = 'http://localhost:3000';

// Fetch credit score and lending offer from backend
async function fetchCreditScore() {
    try {
        const response = await fetch(`${BACKEND_API_URL}/api/get-credit-score`);
        if (!response.ok) {
            console.error('Failed to fetch credit score:', response.statusText);
            return null;
        }
        const data = await response.json();
        console.log('Credit Score Data:', data);
        
        // Update payment plans based on backend offer and ORDER_TOTAL
        if (data.lendingOffer && data.lendingOffer.status === 'Approved') {
            const maxAmount = data.lendingOffer.maxAmount;
            
            // Check if ORDER_TOTAL exceeds approved amount
            if (ORDER_TOTAL > maxAmount) {
                console.log('Order total exceeds approved amount');
                return { ...data, lendingOffer: { ...data.lendingOffer, status: 'Declined', message: 'Order amount exceeds your approved limit' }};
            }
            
            // Calculate interest-free BNPL plans for the actual order total
            // Standard BNPL: Pay in 4, 6, or 12 months with 0% interest if paid on time
            PAYMENT_PLANS = [
                { 
                    months: 4, 
                    rate: 0, // 0% APR if paid on time
                    monthly: ORDER_TOTAL / 4 
                },
                { 
                    months: 6, 
                    rate: 0, // 0% APR if paid on time
                    monthly: ORDER_TOTAL / 6
                },
                { 
                    months: 12, 
                    rate: 0, // 0% APR if paid on time
                    monthly: ORDER_TOTAL / 12
                }
            ];
            
            return data;
        } else {
            console.log('Credit not approved:', data.lendingOffer?.message);
            return data;
        }
    } catch (error) {
        console.error('Error fetching credit score:', error);
        return null;
    }
}

// Utility Functions
function render() {
    const app = document.getElementById('app');
    
    if (state.orderCompleted) {
        app.innerHTML = renderSuccess();
    } else {
        app.innerHTML = renderCheckout();
    }
    
    renderModals();
}

function showModal(modalName) {
    state.currentModal = modalName;
    renderModals();
}

function closeModal() {
    state.currentModal = null;
    state.loginModalApi = null;
    renderModals();
}

// Checkout Screen
function renderCheckout() {
    return `
        <div class="max-w-6xl mx-auto">
            <a href="merchant-selection.html" class="back-link">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to Merchant Selection
            </a>

            <div class="grid md:grid-cols-2 gap-8">
                <!-- Order Summary -->
                <div class="order-2 md:order-1">
                    <div class="card">
                        <h2 class="text-2xl font-semibold mb-6">Order Summary</h2>
                        
                        <div class="flex gap-4 mb-6">
                            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop" 
                                 alt="Wireless Headphones" 
                                 class="w-24 h-24 rounded-lg object-cover">
                            <div class="flex-1">
                                <h3 class="font-medium mb-1">Premium Wireless Headphones</h3>
                                <p class="text-slate-600 text-sm mb-2">Noise-canceling, Bluetooth 5.0</p>
                                <p class="font-semibold text-lg">$299.99</p>
                            </div>
                        </div>

                        <div class="border-t border-slate-200 pt-4 space-y-2">
                            <div class="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>$299.99</span>
                            </div>
                            <div class="flex justify-between text-slate-600">
                                <span>Shipping</span>
                                <span>FREE</span>
                            </div>
                            <div class="flex justify-between text-slate-600">
                                <span>Tax</span>
                                <span>$0.00</span>
                            </div>
                            <div class="border-t border-slate-200 pt-2 mt-2">
                                <div class="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>$299.99</span>
                                </div>
                            </div>
                        </div>

                        <div class="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div class="flex gap-2 items-start">
                                <svg class="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.6 3.4C17.4 3.1 17.1 3 16.8 3H7.2c-.3 0-.6.1-.8.4L3 8v13c0 .6.4 1 1 1h16c.6 0 1-.4 1-1V8l-3.4-4.6zM12 18.5L6.5 13h3.3c.1 0 .2-.1.2-.2v-2.6h4v2.6c0 .1.1.2.2.2h3.3L12 18.5z"/>
                                </svg>
                                <div class="text-sm text-orange-900">
                                    <strong>Sold by Amazon</strong>
                                    <p class="text-orange-800 mt-1">Ships from Amazon warehouse with free Prime delivery</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment Options -->
                <div class="order-1 md:order-2">
                    <div class="card">
                        <h2 class="text-2xl font-semibold mb-6">Choose Payment Method</h2>
                        
                        <div class="space-y-3">
                            <!-- Credit Card -->
                            <button class="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group">
                                <div class="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <div>Credit or Debit Card</div>
                                    <div class="text-slate-600 text-sm">Visa, Mastercard, Amex</div>
                                </div>
                                <div class="text-slate-400 group-hover:text-slate-600 transition-colors">→</div>
                            </button>

                            <!-- WingsPay -->
                            <button onclick="handlePaymentSelect()" class="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-all text-left group">
                                <div class="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                                    <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <span>WingsPay</span>
                                        <span class="badge badge-primary">Recommended</span>
                                    </div>
                                    <div class="text-slate-600 text-sm">Pay in 4, interest-free payments</div>
                                </div>
                                <div class="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                            </button>

                            <!-- Amazon Pay -->
                            <button class="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group">
                                <div class="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                                    <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <div>Amazon Pay</div>
                                    <div class="text-slate-600 text-sm">Use your Amazon payment methods</div>
                                </div>
                                <div class="text-slate-400 group-hover:text-slate-600 transition-colors">→</div>
                            </button>
                        </div>

                        <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div class="flex gap-3">
                                <svg class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <div class="text-sm text-blue-900">
                                    <strong>Why choose WingsPay?</strong>
                                    <p class="mt-1 text-blue-800">Split your $299.99 purchase into 4 interest-free payments of $75. No hidden fees when paid on time!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// API Linking Modal
function renderApiLinkingModal() {
    const linkedCount = state.linkedApis.length;
    const progress = (linkedCount / API_OPTIONS.length) * 100;

    return `
        <div class="modal-overlay" onclick="handleOverlayClick(event)">
            <div class="modal-content modal-content-wide p-6">
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-2xl font-semibold">Link Your Accounts</h2>
                        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <p class="text-slate-600 mb-4">Connect your accounts to get better rates and higher credit limits</p>
                    
                    <div class="progress-bar mb-2">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <p class="text-sm text-slate-600">${linkedCount} of ${API_OPTIONS.length} accounts linked</p>
                </div>

                ${linkedCount >= 2 ? `
                    <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                        <div class="flex items-start gap-3">
                            <svg class="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <div>
                                <div class="font-medium text-emerald-900 mb-1">Great progress!</div>
                                <div class="text-emerald-700 text-sm">Based on your linked accounts, you qualify for up to $5,000 in WingsPay credit</div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="grid md:grid-cols-2 gap-3 mb-6">
                    ${API_OPTIONS.map(api => {
                        const isLinked = state.linkedApis.includes(api.id);
                        return `
                            <div class="api-card ${isLinked ? 'linked' : ''}" onclick="${isLinked ? '' : `handleApiLink('${api.id}')`}">
                                <div class="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl" style="background: ${api.color}; color: white;">
                                    ${getApiIcon(api.id)}
                                </div>
                                
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="font-medium">${api.name}</span>
                                        ${api.recommended ? '<span class="badge badge-primary">Recommended</span>' : ''}
                                    </div>
                                    <div class="text-sm text-slate-600">${api.description}</div>
                                    <div class="text-xs text-slate-400 mt-1">Connect to Knot API</div>
                                </div>
                                
                                ${isLinked ? `
                                    <div class="flex items-center gap-2">
                                        <svg class="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                        </svg>
                                        <span class="text-sm font-medium text-emerald-600">Linked</span>
                                    </div>
                                ` : `
                                    <button class="btn btn-secondary" onclick="event.stopPropagation(); handleApiLink('${api.id}')">Link</button>
                                `}
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="flex gap-3">
                    <button onclick="closeModal()" class="btn btn-secondary flex-1">Skip for now</button>
                    <button onclick="handleApiLinkingContinue()" class="btn btn-primary flex-1" ${linkedCount === 0 ? 'disabled' : ''}>
                        Continue with ${linkedCount} account${linkedCount !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// API Login Modal
function renderApiLoginModal() {
    if (!state.loginModalApi) return '';
    
    const api = API_OPTIONS.find(a => a.id === state.loginModalApi);
    if (!api) return '';

    return `
        <div class="modal-overlay" onclick="handleLoginOverlayClick(event)" style="z-index: 60;">
            <div class="modal-content p-0">
                <button onclick="closeLoginModal()" class="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                <div class="flex items-center justify-center py-8 border-b border-slate-200" style="color: ${api.color}">
                    ${getApiLogo(api.name)}
                </div>

                <div class="px-8 py-6">
                    <h2 class="text-xl font-semibold mb-6">Sign in or create account</h2>

                    <form onsubmit="handleApiLoginSubmit(event)" class="space-y-4">
                        <div>
                            <label for="api-email" class="block mb-2">Enter mobile number or email</label>
                            <input type="text" id="api-email" class="input" required>
                        </div>

                        <button type="submit" class="btn w-full text-black" style="background-color: ${api.color === '#000000' ? '#000000' : '#FFD814'}; color: ${api.color === '#000000' ? 'white' : 'black'};">
                            Continue
                        </button>

                        <p class="text-xs text-slate-600">
                            By continuing, you agree to ${api.name}'s 
                            <a href="#" class="text-blue-600 hover:underline hover:text-orange-600">Conditions of Use</a>
                            and 
                            <a href="#" class="text-blue-600 hover:underline hover:text-orange-600">Privacy Notice</a>.
                        </p>

                        <a href="#" class="text-blue-600 hover:underline hover:text-orange-600 text-sm block">Need help?</a>

                        <div class="border-t border-slate-300 my-4"></div>

                        <div>
                            <p class="text-slate-600 mb-2 text-sm">Buying for work?</p>
                            <a href="#" class="text-blue-600 hover:underline hover:text-orange-600 text-sm">Create a free business account</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Payment Plans Modal
function renderPaymentPlansModal() {
    const linkedCount = state.linkedApis.length;

    return `
        <div class="modal-overlay" onclick="handleOverlayClick(event)">
            <div class="modal-content modal-content-wide p-6">
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-2xl font-semibold">Choose Your Payment Plan</h2>
                        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <p class="text-slate-600">Select a payment schedule that works for you. All plans are interest-free when paid on time!</p>
                </div>

                ${linkedCount >= 2 ? `
                    <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                        <div class="flex items-start gap-3">
                            <svg class="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <div>
                                <div class="font-medium text-emerald-900 mb-1">Credit approved!</div>
                                <div class="text-emerald-700 text-sm">You're approved for up to $${ORDER_TOTAL.toFixed(2)} in interest-free financing</div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="space-y-3 mb-6">
                    ${PAYMENT_PLANS.map((plan, index) => {
                        return `
                            <div class="border-2 ${state.selectedPlan === index ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'} rounded-lg p-4 cursor-pointer hover:border-slate-300 transition-all" onclick="selectPlan(${index})">
                                <div class="flex items-center justify-between">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-2">
                                            <span class="font-semibold text-lg">${plan.months} monthly payments</span>
                                            ${index === 0 ? '<span class="badge badge-success">Most Popular</span>' : ''}
                                        </div>
                                        <div class="text-2xl font-bold text-indigo-600 mb-1">$${plan.monthly.toFixed(2)}/mo</div>
                                        <div class="text-slate-600 text-sm">
                                            0% APR - Interest-free when paid on time
                                        </div>
                                        <div class="text-slate-500 text-xs mt-1">
                                            Total: $${(plan.monthly * plan.months).toFixed(2)} (${plan.months} × $${plan.monthly.toFixed(2)})
                                        </div>
                                    </div>
                                    <div>
                                        <div class="h-6 w-6 rounded-full border-2 ${state.selectedPlan === index ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'} flex items-center justify-center">
                                            ${state.selectedPlan === index ? `
                                                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                                                </svg>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <button onclick="handlePlanConfirm()" class="btn btn-primary w-full" ${state.selectedPlan === null ? 'disabled' : ''}>
                    Confirm Payment Plan
                </button>

                <p class="text-xs text-center text-slate-500 mt-4">
                    By selecting a plan, you agree to WingsPay's terms. 0% APR applies when payments are made on time. Late fees may apply for missed payments.
                </p>
            </div>
        </div>
    `;
}

// Success Screen
function renderSuccess() {
    return `
        <div class="max-w-2xl mx-auto">
            <div class="card text-center">
                <div class="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <svg class="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>

                <h1 class="text-3xl font-semibold mb-4">Order Confirmed!</h1>
                <p class="text-slate-600 mb-8">Your payment plan has been set up successfully</p>

                <div class="bg-slate-50 rounded-lg p-6 mb-8 text-left">
                    <h2 class="font-semibold mb-4">Order Details</h2>
                    
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-slate-600">Order Number</span>
                            <span class="font-medium">#WP${Date.now().toString().slice(-6)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600">Payment Plan</span>
                            <span class="font-medium">${state.selectedPlan !== null ? PAYMENT_PLANS[state.selectedPlan].months : 3} monthly payments</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600">Monthly Payment</span>
                            <span class="font-medium text-indigo-600 text-lg">$${state.selectedPlan !== null ? PAYMENT_PLANS[state.selectedPlan].monthly.toFixed(2) : '99.99'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600">First Payment Due</span>
                            <span class="font-medium">${getDateTwoWeeksFromNow()}</span>
                        </div>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4 mb-8">
                    <div class="bg-blue-50 rounded-lg p-4 text-left">
                        <div class="flex items-center gap-3 mb-2">
                            <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            <span class="font-medium">Email Confirmation</span>
                        </div>
                        <div class="text-slate-600 text-sm">Check your inbox for order details</div>
                    </div>

                    <div class="bg-blue-50 rounded-lg p-4 text-left">
                        <div class="flex items-center gap-3 mb-2">
                            <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                            </svg>
                            <span class="font-medium">Track Shipment</span>
                        </div>
                        <div class="text-slate-600 text-sm">Track your package in the WingsPay app</div>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="window.location.href='merchant-selection.html'" class="btn btn-secondary flex-1">Back to Merchants</button>
                    <button class="btn btn-primary flex-1">View Order Details</button>
                </div>
            </div>
        </div>
    `;
}

// Helper Functions
function getApiIcon(apiId) {
    const icons = {
        amazon: '🛒',
        doordash: '🍔',
        instacart: '🛍️',
        uber: '🚗',
        target: '🎯',
        starbucks: '☕'
    };
    return icons[apiId] || '📱';
}

function getApiLogo(apiName) {
    if (apiName === 'Amazon') {
        return `
            <svg viewBox="0 0 603 182" class="h-10 w-auto" fill="currentColor">
                <path d="M374.3 141.6c-31.7 23.4-77.7 35.8-117.3 35.8-55.5 0-105.5-20.5-143.3-54.7-3-2.7-.3-6.3 3.3-4.2 41 23.9 91.7 38.3 144.1 38.3 35.3 0 74.1-7.3 109.9-22.5 5.4-2.3 9.9 3.5 4.6 7.3z"/>
                <path d="M387.5 126.3c-4-5.2-26.9-2.5-37.1-1.3-3.1.4-3.6-2.3-.8-4.3 18.2-12.8 48-9.1 51.5-4.8 3.5 4.3-.9 34.3-18 48.6-2.6 2.2-5.1 1-3.9-1.9 3.8-9.4 12.3-30.5 8.3-36.3z"/>
            </svg>
        `;
    }
    return `<span class="text-2xl font-bold">${apiName}</span>`;
}

function getDateTwoWeeksFromNow() {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Event Handlers
async function handlePaymentSelect() {
    // Fetch credit score from backend before showing API linking
    console.log('Fetching credit score from backend...');
    const creditData = await fetchCreditScore();
    
    if (creditData) {
        console.log('Credit Score:', creditData.creditScore);
        console.log('Lending Offer:', creditData.lendingOffer);
        
        if (creditData.lendingOffer && creditData.lendingOffer.status === 'Declined') {
            alert(`Sorry, FlexPay not available at this time.\n\n${creditData.lendingOffer.message}\n\nCredit Score: ${creditData.creditScore}`);
            return;
        }
    }
    
    // Show API linking modal
    showModal('apiLinking');
}

function handleApiLink(apiId) {
    state.loginModalApi = apiId;
    renderModals();
}

function handleApiLoginSubmit(event) {
    event.preventDefault();
    if (state.loginModalApi) {
        state.linkedApis.push(state.loginModalApi);
        state.loginModalApi = null;
        renderModals();
    }
}

function handleApiLinkingContinue() {
    closeModal();
    setTimeout(() => {
        showModal('paymentPlans');
    }, 300);
}

function selectPlan(planIndex) {
    state.selectedPlan = planIndex;
    renderModals();
}

function handlePlanConfirm() {
    if (state.selectedPlan !== null) {
        state.orderCompleted = true;
        closeModal();
        render();
    }
}

function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
        closeModal();
    }
}

function handleLoginOverlayClick(event) {
    if (event.target === event.currentTarget) {
        closeLoginModal();
    }
}

function closeLoginModal() {
    state.loginModalApi = null;
    renderModals();
}

function renderModals() {
    let modalsHtml = '';
    
    if (state.currentModal === 'apiLinking') {
        modalsHtml += renderApiLinkingModal();
    } else if (state.currentModal === 'paymentPlans') {
        modalsHtml += renderPaymentPlansModal();
    }

    if (state.loginModalApi) {
        modalsHtml += renderApiLoginModal();
    }

    const existingModals = document.getElementById('modals');
    if (existingModals) {
        existingModals.innerHTML = modalsHtml;
    } else {
        const modalsContainer = document.createElement('div');
        modalsContainer.id = 'modals';
        modalsContainer.innerHTML = modalsHtml;
        document.body.appendChild(modalsContainer);
    }
}

// Initialize App
render();