declare module './plaid.js' {
  /**
   * Create a link token for Plaid Link initialization
   * @param userId - User ID for the client
   * @returns Link token response
   */
  export function createLinkToken(userId: string): Promise<{
    expiration: string;
    link_token: string;
    request_id: string;
  }>;
  
  /**
   * Exchange public token for access token
   * @param publicToken - Public token from Plaid Link
   * @returns Access token response
   */
  export function exchangePublicToken(publicToken: string): Promise<{
    access_token: string;
    item_id: string;
  }>;
  
  /**
   * Get bank account information using access token
   * @param accessToken - Plaid access token
   * @returns Bank account details
   */
  export function getBankAccounts(accessToken: string): Promise<{
    accounts: Array<{
      account_id: string;
      balances: {
        available: number;
        current: number;
        iso_currency_code: string;
        limit: number | null;
        unofficial_currency_code: string | null;
      };
      mask: string;
      name: string;
      official_name: string | null;
      subtype: string;
      type: string;
    }>;
  }>;
  
  /**
   * Initiate ACH transfer from bank account to Coinbase
   * @param accessToken - Plaid access token
   * @param accountId - Bank account ID
   * @param amount - Amount to transfer in USD
   * @param userAddress - User's blockchain address (optional)
   * @returns Transfer details
   */
  export function initiateTransfer(
    accessToken: string, 
    accountId: string, 
    amount: number, 
    userAddress?: string
  ): Promise<{
    transfer_id: string;
    status: string;
    amount: number;
  }>;
}