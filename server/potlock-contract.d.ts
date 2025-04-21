declare module './potlock-contract.js' {
  /**
   * Deposit USDC into the PotLock contract on behalf of a user
   * @param userAddress - User's blockchain address
   * @param amount - Amount in USDC to deposit
   * @returns Transaction details
   */
  export function depositForUser(userAddress: string, amount: number): Promise<{
    success: boolean;
    txHash: string;
    amount: number;
    userAddress: string;
  }>;
  
  /**
   * Withdraw USDC from the PotLock contract on behalf of a user
   * @param userAddress - User's blockchain address
   * @param amount - Amount in USDC to withdraw
   * @param destinationAddress - Destination address for withdrawal
   * @returns Transaction details
   */
  export function withdrawForUser(userAddress: string, amount: number, destinationAddress: string): Promise<{
    success: boolean;
    txHash: string;
    amount: number;
    userAddress: string;
    destinationAddress: string;
  }>;
  
  /**
   * Get user balances from the PotLock contract
   * @param userAddress - User's blockchain address
   * @returns User's balances
   */
  export function getUserBalances(userAddress: string): Promise<{
    totalBalance: string;
    idleBalance: string;
    betBalance: string;
  }>;
}