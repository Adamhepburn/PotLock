// Coinbase API Integration for PotLock
import fetch from 'node-fetch';
import crypto from 'crypto';

// Use environment variables for Coinbase credentials
const COINBASE_API_KEY = process.env.COINBASE_API_KEY;
const COINBASE_API_SECRET = process.env.COINBASE_API_SECRET;
const COINBASE_PASSPHRASE = process.env.COINBASE_PASSPHRASE;
const ADMIN_WALLET_PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY;

// Indicate whether to use Coinbase Pro/Exchange API or regular Coinbase API
const USE_EXCHANGE_API = process.env.USE_EXCHANGE_API === 'true';

// API base URLs
const COINBASE_API_URL = 'https://api.coinbase.com';
const COINBASE_EXCHANGE_API_URL = 'https://api.exchange.coinbase.com';

// Crypto settings
const DEFAULT_CRYPTO = 'USDC';
const DEFAULT_CURRENCY = 'USD';

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

/**
 * Generate a new cryptocurrency deposit address for a user
 * @param {string} userId - User ID to associate with the address
 * @param {string} currency - Currency code (e.g., 'USDC')
 * @returns {Promise<Object>} Deposit address information
 */
async function generateDepositAddress(userId, currency = DEFAULT_CRYPTO) {
  try {
    // Get the account ID for the specified currency
    const accountId = await getCryptoAccountId(currency);
    
    if (!accountId) {
      throw new Error(`No account found for ${currency}`);
    }
    
    const endpoint = `/v2/accounts/${accountId}/addresses`;
    const body = {
      name: `PotLock User: ${userId}`
    };
    
    const headers = generateCoinbaseHeaders('POST', endpoint, body);
    const response = await fetch(`${COINBASE_API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to generate deposit address: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    return {
      address: data.data.address,
      addressUrl: data.data.address_uri,
      currency,
      userId
    };
  } catch (error) {
    console.error('Error generating deposit address:', error);
    throw error;
  }
}

/**
 * Get cryptocurrency account ID by currency code
 * @param {string} currency - Currency code (e.g., 'USDC')
 * @returns {Promise<string|null>} Account ID if found, null otherwise
 */
async function getCryptoAccountId(currency) {
  try {
    const endpoint = '/v2/accounts';
    const headers = generateCoinbaseHeaders('GET', endpoint);
    const response = await fetch(`${COINBASE_API_URL}${endpoint}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch accounts: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const account = data.data.find(acc => acc.currency.code === currency);
    
    return account ? account.id : null;
  } catch (error) {
    console.error('Error getting crypto account ID:', error);
    throw error;
  }
}

/**
 * Send cryptocurrency to an external address (withdrawal)
 * @param {string} address - Destination cryptocurrency address
 * @param {number} amount - Amount to send
 * @param {string} currency - Currency code (e.g., 'USDC')
 * @param {string} description - Transaction description/memo
 * @returns {Promise<Object>} Transaction details
 */
async function sendCrypto(address, amount, currency = DEFAULT_CRYPTO, description = 'PotLock Withdrawal') {
  try {
    // Get the account ID for the specified currency
    const accountId = await getCryptoAccountId(currency);
    
    if (!accountId) {
      throw new Error(`No account found for ${currency}`);
    }
    
    const endpoint = `/v2/accounts/${accountId}/transactions`;
    const body = {
      type: 'send',
      to: address,
      amount,
      currency,
      description
    };
    
    const headers = generateCoinbaseHeaders('POST', endpoint, body);
    const response = await fetch(`${COINBASE_API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to send cryptocurrency: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    return {
      id: data.data.id,
      status: data.data.status,
      amount: data.data.amount.amount,
      currency: data.data.amount.currency,
      toAddress: address,
      network: data.data.network,
      description
    };
  } catch (error) {
    console.error('Error sending cryptocurrency:', error);
    throw error;
  }
}

/**
 * Get transaction by ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} Transaction details
 */
async function getTransaction(transactionId) {
  try {
    const endpoint = `/v2/accounts/transactions/${transactionId}`;
    const headers = generateCoinbaseHeaders('GET', endpoint);
    const response = await fetch(`${COINBASE_API_URL}${endpoint}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch transaction: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw error;
  }
}

/**
 * Check for incoming deposits to a specific address
 * @param {string} address - Cryptocurrency address to check
 * @returns {Promise<Array>} List of deposits
 */
async function checkDeposits(address) {
  try {
    // In development, we'll mock this functionality
    // In production, you'd use Coinbase webhooks or poll the transactions endpoint
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }
    
    // This is just a placeholder - in production, you'd implement this
    // based on Coinbase's API for checking transactions
    
    return [];
  } catch (error) {
    console.error('Error checking deposits:', error);
    throw error;
  }
}

// Export functions for use in routes
export {
  buyUSDC,
  sellUSDC,
  getPaymentMethods,
  transferToPotLock,
  generateDepositAddress,
  getCryptoAccountId,
  sendCrypto,
  getTransaction,
  checkDeposits
};