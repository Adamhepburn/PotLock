// Plaid API Integration for PotLock
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const { buyUSDC, transferToPotLock } = require('./coinbase');

// Using environment variables for Plaid credentials
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox');

// Validate that Plaid credentials are available
if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
  console.error('Missing Plaid API credentials. Make sure PLAID_CLIENT_ID and PLAID_SECRET environment variables are set.');
}

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
 * @param {string} userAddress - User's blockchain address (optional)
 * @returns {Promise<Object>} Transfer details
 */
async function initiateTransfer(accessToken, accountId, amount, userAddress) {
  try {
    console.log(`Initiating transfer of $${amount} from account ${accountId}`);
    
    // Get account details
    const accountInfo = await getBankAccounts(accessToken);
    const account = accountInfo.accounts.find(acc => acc.account_id === accountId);
    
    if (!account) {
      throw new Error('Bank account not found');
    }

    // In a development environment with Plaid sandbox, we use processor tokens or simulate transfers
    if (PLAID_ENV === 'sandbox') {
      console.log('Using Plaid sandbox - simulating successful transfer');
      
      // If we have Coinbase API keys and a userAddress, we could use the Coinbase API
      let buyResult = null;
      let contractTransfer = null;
      
      if (userAddress) {
        // This integration would depend on having Coinbase API keys configured
        try {
          // Mock a Payment Method ID for Coinbase integration
          const paymentMethodId = `pm_${accountId}`;
          
          // Attempt to call Coinbase integration (may not work without Coinbase keys)
          buyResult = await buyUSDC(amount, paymentMethodId);
          contractTransfer = await transferToPotLock(amount, userAddress);
        } catch (coinbaseError) {
          console.log('Coinbase integration skipped or failed:', coinbaseError.message);
          // Continue without Coinbase integration in development
        }
      }
      
      return {
        success: true,
        transferId: `tr_${Date.now()}`,
        amount,
        accountId,
        userAddress: userAddress || null,
        message: 'Plaid sandbox transfer simulated successfully',
        buyResult,
        contractTransfer
      };
    } else {
      // In production, we would use Plaid's transfer API to initiate a real ACH transfer
      // This requires additional Plaid Transfer product setup and approval
      
      // Create a transfer authorization
      const authorizationResponse = await plaidClient.transferAuthorizationCreate({
        access_token: accessToken,
        account_id: accountId,
        type: 'credit',
        network: 'ach',
        amount: amount.toString(),
        ach_class: 'ppd',
        user: {
          legal_name: account.owners?.[0]?.names?.[0] || 'PotLock User',
        },
        description: 'PotLock Deposit'
      });
      
      // Check if authorization was successful
      if (authorizationResponse.data.authorization.decision !== 'approved') {
        throw new Error(`Transfer authorization failed: ${authorizationResponse.data.authorization.decision_rationale.code}`);
      }
      
      // Create the transfer
      const transferResponse = await plaidClient.transferCreate({
        access_token: accessToken,
        account_id: accountId,
        authorization_id: authorizationResponse.data.authorization.id,
        description: 'PotLock Deposit',
        amount: amount.toString(),
        currency: 'USD',
        ach_class: 'ppd',
      });
      
      const transferId = transferResponse.data.transfer.id;
      
      // If we have Coinbase integration and userAddress, proceed with conversion to USDC
      if (userAddress) {
        try {
          // In a real implementation, we would create a webhook to handle the transfer completion
          // and then initiate the Coinbase conversion once the funds are received
          
          // For now, we'll just log that we would do this in production
          console.log(`In production: Will convert $${amount} to USDC for address ${userAddress} after transfer ${transferId} completes`);
        } catch (coinbaseError) {
          console.error('Coinbase integration error:', coinbaseError);
          // Continue even if Coinbase integration fails - we still completed the bank transfer
        }
      }
      
      return {
        success: true,
        transferId,
        amount,
        accountId,
        userAddress: userAddress || null,
        plaidTransfer: transferResponse.data.transfer
      };
    }
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