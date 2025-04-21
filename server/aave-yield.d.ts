/**
 * TypeScript declarations for Aave Yield Integration Module
 */

/**
 * Calculate current APY from Aave for USDC
 * @returns Current APY as percentage
 */
export function getCurrentApy(): Promise<number>;

/**
 * Get total deposited USDC in Aave
 * @returns Total deposited in USDC and the current value with accrued interest
 */
export function getTotalDeposited(): Promise<{
  totalDeposited: number;
  currentValue: number;
}>;

/**
 * Deposit idle USDC into Aave to earn yield
 * @param amount - Amount in USDC to deposit
 * @returns Transaction result
 */
export function depositToAave(amount: number): Promise<{
  success: boolean;
  amount?: number;
  txHash?: string;
  error?: string;
}>;

/**
 * Withdraw USDC from Aave
 * @param amount - Amount in USDC to withdraw
 * @returns Transaction result
 */
export function withdrawFromAave(amount: number): Promise<{
  success: boolean;
  amount?: number;
  txHash?: string;
  error?: string;
}>;

/**
 * Calculate accrued interest for a user based on their proportion of the pool
 * @param userBalance - User's balance in USDC
 * @param totalPoolSize - Total pool size in USDC
 * @returns Interest calculation details
 */
export function calculateUserInterest(
  userBalance: number,
  totalPoolSize: number
): Promise<{
  calculatedAt: Date;
  userBalance: number;
  poolSize: number;
  depositedInAave: number;
  userInterestAmount: number;
  userApy: number;
  error?: string;
}>;

/**
 * Manage idle funds by depositing excess to Aave or withdrawing as needed
 * @param totalIdleFunds - Total idle funds in the system
 * @param reserveAmount - Amount to keep in reserve (not deposited)
 * @returns Operation result
 */
export function manageIdleFunds(
  totalIdleFunds: number,
  reserveAmount?: number
): Promise<{
  success: boolean;
  message?: string;
  totalIdleFunds?: number;
  inAave?: number;
  inReserve?: number;
  amount?: number;
  txHash?: string;
  error?: string;
}>;