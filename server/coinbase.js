// Coinbase API Integration for PotLock
const fetch = require('node-fetch');
const crypto = require('crypto');

// Note: In a production environment, these should be securely stored environment variables
const COINBASE_API_KEY = process.env.COINBASE_API_KEY;
const COINBASE_API_SECRET = process.env.COINBASE_API_SECRET;
const ADMIN_WALLET_PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY;

// Coinbase API base URL
const COINBASE_API_URL = 'https://api.coinbase.com';

/**
 * Generate headers required for Coinbase API authentication
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} requestPath - API endpoint path
 * @param {Object} body - Request body (for POST requests)
 * @returns {Object} Headers for Coinbase API request
 */
function generateCoinbaseHeaders(method, requestPath, body = '') {
  if (!COINBASE_API_KEY || !COINBASE_API_SECRET) {
    throw new Error('Coinbase API credentials are not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body || '');
  const message = timestamp + method + requestPath + bodyString;
  const signature = crypto
    .createHmac('sha256', COINBASE_API_SECRET)
    .update(message)
    .digest('hex');

  return {
    'CB-ACCESS-KEY': COINBASE_API_KEY,
    'CB-ACCESS-SIGN': signature,
    'CB-ACCESS-TIMESTAMP': timestamp,
    'CB-VERSION': '2021-10-05',
    'Content-Type': 'application/json'
  };
}

/**
 * Buy USDC with USD using Coinbase API
 * @param {number} amount - Amount in USD to convert to USDC
 * @param {string} paymentMethod - Payment method ID (card or bank)
 * @returns {Promise<Object>} Transaction details
 */
async function buyUSDC(amount, paymentMethod) {
  try {
    const endpoint = '/v2/accounts/primary/buys';
    const body = {
      amount,
      currency: 'USDC',
      payment_method: paymentMethod,
      commit: true
    };

    const headers = generateCoinbaseHeaders('POST', endpoint, body);
    const response = await fetch(`${COINBASE_API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Coinbase buy failed: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error buying USDC:', error);
    throw error;
  }
}

/**
 * Sell USDC for USD using Coinbase API
 * @param {number} amount - Amount in USDC to convert to USD
 * @param {string} paymentMethod - Payment method ID (bank account)
 * @returns {Promise<Object>} Transaction details
 */
async function sellUSDC(amount, paymentMethod) {
  try {
    const endpoint = '/v2/accounts/primary/sells';
    const body = {
      amount,
      currency: 'USDC',
      payment_method: paymentMethod,
      commit: true
    };

    const headers = generateCoinbaseHeaders('POST', endpoint, body);
    const response = await fetch(`${COINBASE_API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Coinbase sell failed: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error selling USDC:', error);
    throw error;
  }
}

/**
 * Get payment methods available in the user's Coinbase account
 * @returns {Promise<Array>} List of payment methods
 */
async function getPaymentMethods() {
  try {
    const endpoint = '/v2/payment-methods';
    const headers = generateCoinbaseHeaders('GET', endpoint);
    const response = await fetch(`${COINBASE_API_URL}${endpoint}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch payment methods: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting payment methods:', error);
    throw error;
  }
}

/**
 * Transfer USDC from Coinbase to PotLock smart contract
 * @param {number} amount - Amount in USDC to transfer
 * @param {string} userAddress - User's blockchain address
 * @returns {Promise<Object>} Transaction details
 */
async function transferToPotLock(amount, userAddress) {
  // In a real implementation, this would use web3.js or ethers.js
  // to interact with the PotLock smart contract
  
  // Mock implementation for now
  console.log(`Transferring ${amount} USDC to PotLock contract for user ${userAddress}`);
  
  // Return a mock transaction
  return {
    success: true,
    txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
    amount,
    userAddress
  };
}

// Export functions for use in routes
module.exports = {
  buyUSDC,
  sellUSDC,
  getPaymentMethods,
  transferToPotLock
};