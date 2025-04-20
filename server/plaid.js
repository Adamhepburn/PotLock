// Plaid API Integration for PotLock
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const { buyUSDC, transferToPotLock } = require('./coinbase');

// Note: In a production environment, these should be securely stored environment variables
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';

// Initialize Plaid client
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

/**
 * Create a link token for Plaid Link initialization
 * @param {string} userId - User ID for the client
 * @returns {Promise<Object>} Link token response
 */
async function createLinkToken(userId) {
  try {
    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      throw new Error('Plaid API credentials are not configured');
    }

    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'PotLock',
      products: ['auth', 'transactions'],
      language: 'en',
      country_codes: ['US'],
    };

    const response = await plaidClient.linkTokenCreate(request);
    return response.data;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
}

/**
 * Exchange public token for access token
 * @param {string} publicToken - Public token from Plaid Link
 * @returns {Promise<Object>} Access token response
 */
async function exchangePublicToken(publicToken) {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    return response.data;
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw error;
  }
}

/**
 * Get bank account information using access token
 * @param {string} accessToken - Plaid access token
 * @returns {Promise<Object>} Bank account details
 */
async function getBankAccounts(accessToken) {
  try {
    const response = await plaidClient.authGet({
      access_token: accessToken,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting bank accounts:', error);
    throw error;
  }
}

/**
 * Initiate ACH transfer from bank account to Coinbase
 * @param {string} accessToken - Plaid access token
 * @param {string} accountId - Bank account ID
 * @param {number} amount - Amount to transfer in USD
 * @param {string} userAddress - User's blockchain address
 * @returns {Promise<Object>} Transfer details
 */
async function initiateTransfer(accessToken, accountId, amount, userAddress) {
  try {
    // In a real implementation, this would:
    // 1. Use Plaid to initiate an ACH transfer to Coinbase
    // 2. Use Coinbase to convert USD to USDC
    // 3. Transfer USDC to PotLock smart contract
    
    // For now, simulate these steps with mock data
    console.log(`Initiating transfer of $${amount} from account ${accountId}`);
    
    // Get account details
    const accountInfo = await getBankAccounts(accessToken);
    const account = accountInfo.accounts.find(acc => acc.account_id === accountId);
    
    if (!account) {
      throw new Error('Bank account not found');
    }
    
    // Mock a Payment Method ID for Coinbase
    const paymentMethodId = `pm_${accountId}`;
    
    // Convert USD to USDC via Coinbase
    const buyResult = await buyUSDC(amount, paymentMethodId);
    
    // Transfer USDC to PotLock contract
    const contractTransfer = await transferToPotLock(amount, userAddress);
    
    return {
      success: true,
      transferId: `tr_${Date.now()}`,
      amount,
      userAddress,
      buyResult,
      contractTransfer
    };
  } catch (error) {
    console.error('Error initiating transfer:', error);
    throw error;
  }
}

// Export functions for use in routes
module.exports = {
  createLinkToken,
  exchangePublicToken,
  getBankAccounts,
  initiateTransfer
};