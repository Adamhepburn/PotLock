declare module './coinbase.js' {
  /**
   * Generate headers required for Coinbase API authentication
   * @param method - HTTP method (GET, POST, etc.)
   * @param requestPath - API endpoint path
   * @param body - Request body (for POST requests)
   * @returns Headers for Coinbase API request
   */
  export function generateCoinbaseHeaders(
    method: string, 
    requestPath: string, 
    body?: string | object
  ): Record<string, string>;
  
  /**
   * Buy USDC with USD using Coinbase API
   * @param amount - Amount in USD to convert to USDC
   * @param paymentMethod - Payment method ID (card or bank)
   * @returns Transaction details
   */
  export function buyUSDC(
    amount: number, 
    paymentMethod: string
  ): Promise<{
    id: string;
    status: string;
    amount: string;
    currency: string;
  }>;
  
  /**
   * Sell USDC for USD using Coinbase API
   * @param amount - Amount in USDC to convert to USD
   * @param paymentMethod - Payment method ID (bank account)
   * @returns Transaction details
   */
  export function sellUSDC(
    amount: number, 
    paymentMethod: string
  ): Promise<{
    id: string;
    status: string;
    amount: string;
    currency: string;
  }>;
  
  /**
   * Get payment methods available in the user's Coinbase account
   * @returns List of payment methods
   */
  export function getPaymentMethods(): Promise<Array<{
    id: string;
    type: string;
    name: string;
    currency: string;
    primary_buy: boolean;
    primary_sell: boolean;
    instant_buy: boolean;
    instant_sell: boolean;
  }>>;
  
  /**
   * Transfer USDC from Coinbase to PotLock smart contract
   * @param amount - Amount in USDC to transfer
   * @param userAddress - User's blockchain address
   * @returns Transaction details
   */
  export function transferToPotLock(
    amount: number, 
    userAddress: string
  ): Promise<{
    id: string;
    status: string;
    amount: string;
    destination: string;
  }>;
  
  /**
   * Generate a new cryptocurrency deposit address for a user
   * @param userId - User ID to associate with the address
   * @param currency - Currency code (e.g., 'USDC')
   * @returns Deposit address information
   */
  export function generateDepositAddress(
    userId: string, 
    currency?: string
  ): Promise<{
    id: string;
    address: string;
    network: string;
    uri: string;
  }>;
  
  /**
   * Get cryptocurrency account ID by currency code
   * @param currency - Currency code (e.g., 'USDC')
   * @returns Account ID if found, null otherwise
   */
  export function getCryptoAccountId(
    currency: string
  ): Promise<string | null>;
  
  /**
   * Send cryptocurrency to an external address (withdrawal)
   * @param address - Destination cryptocurrency address
   * @param amount - Amount to send
   * @param currency - Currency code (e.g., 'USDC')
   * @param description - Transaction description/memo
   * @returns Transaction details
   */
  export function sendCrypto(
    address: string, 
    amount: number, 
    currency?: string, 
    description?: string
  ): Promise<{
    id: string;
    status: string;
    amount: string;
    destination: string;
  }>;
  
  /**
   * Get transaction by ID
   * @param transactionId - Transaction ID
   * @returns Transaction details
   */
  export function getTransaction(
    transactionId: string
  ): Promise<{
    id: string;
    type: string;
    status: string;
    amount: string;
    native_amount: string;
    description: string;
    created_at: string;
    updated_at: string;
    details: Record<string, any>;
  }>;
  
  /**
   * Check for incoming deposits to a specific address
   * @param address - Cryptocurrency address to check
   * @returns List of deposits
   */
  export function checkDeposits(address: string): Promise<Array<{
    id: string;
    type: string;
    status: string;
    amount: string;
    native_amount: string;
    description: string;
    created_at: string;
  }>>;
}