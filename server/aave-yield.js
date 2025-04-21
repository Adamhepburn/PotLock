/**
 * Aave Yield Integration Module
 * This module handles interactions with Aave Protocol to generate yield for idle user funds
 */

import { ethers } from 'ethers';

// Aave v3 Pool contract address on Base network
const AAVE_POOL_ADDRESS = '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5';

// USDC token address on Base network
const USDC_TOKEN_ADDRESS = '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA';

// Aave Interest Bearing USDC token (aUSDC) on Base
const A_USDC_TOKEN_ADDRESS = '0x724dc807b04555b71ed48a6896b6F41593b8C637';

// Simplified ABI for Aave Pool contract - only the functions we need
const AAVE_POOL_ABI = [
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)",
  "function withdraw(address asset, uint256 amount, address to)",
];

// Simplified ABI for ERC20 tokens
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

/**
 * Get provider and signer for blockchain interactions
 * @returns {Object} Provider and signer objects
 */
function getProviderAndSigner() {
  // Check for admin wallet private key
  if (!process.env.ADMIN_WALLET_PRIVATE_KEY) {
    throw new Error('ADMIN_WALLET_PRIVATE_KEY not configured');
  }

  // Create provider for Base network
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.BASE_RPC_URL || 'https://mainnet.base.org'
  );
  
  // Create signer from private key
  const signer = new ethers.Wallet(process.env.ADMIN_WALLET_PRIVATE_KEY, provider);
  
  return { provider, signer };
}

/**
 * Get contract instances for Aave Pool and tokens
 * @returns {Object} Contract instances
 */
function getContracts() {
  try {
    const { signer } = getProviderAndSigner();
    
    // Create contract instances
    const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, signer);
    const usdcToken = new ethers.Contract(USDC_TOKEN_ADDRESS, ERC20_ABI, signer);
    const aUsdcToken = new ethers.Contract(A_USDC_TOKEN_ADDRESS, ERC20_ABI, signer);
    
    return { aavePool, usdcToken, aUsdcToken };
  } catch (error) {
    console.error('Error creating contract instances:', error);
    return { aavePool: null, usdcToken: null, aUsdcToken: null };
  }
}

/**
 * Calculate current APY from Aave for USDC
 * @returns {Promise<number>} Current APY as percentage
 */
async function getCurrentApy() {
  try {
    // In a real implementation, this would query the Aave Data Provider
    // to get the current supply APY for USDC
    // For now, return a reasonable estimate based on recent rates
    return 3.75; // 3.75% APY
  } catch (error) {
    console.error('Error getting current APY:', error);
    return 0;
  }
}

/**
 * Get total deposited USDC in Aave
 * @returns {Promise<Object>} Total deposited in USDC and the current value with accrued interest
 */
async function getTotalDeposited() {
  try {
    const { aUsdcToken } = getContracts();
    if (!aUsdcToken) return { totalDeposited: 0, currentValue: 0 };
    
    const { signer } = getProviderAndSigner();
    const adminAddress = await signer.getAddress();
    
    // Get aUSDC balance (this is the interest-bearing token that represents our deposit)
    const aUsdcBalance = await aUsdcToken.balanceOf(adminAddress);
    const decimals = await aUsdcToken.decimals();
    
    const totalDeposited = parseFloat(ethers.utils.formatUnits(aUsdcBalance, decimals));
    
    return {
      totalDeposited,
      currentValue: totalDeposited, // In Aave v3, 1 aUSDC = 1 USDC + accrued interest
    };
  } catch (error) {
    console.error('Error getting total deposited:', error);
    return { totalDeposited: 0, currentValue: 0 };
  }
}

/**
 * Deposit idle USDC into Aave to earn yield
 * @param {number} amount - Amount in USDC to deposit
 * @returns {Promise<Object>} Transaction result
 */
async function depositToAave(amount) {
  try {
    const { aavePool, usdcToken } = getContracts();
    if (!aavePool || !usdcToken) throw new Error('Contracts not available');
    
    const { signer } = getProviderAndSigner();
    const adminAddress = await signer.getAddress();
    
    // Get USDC decimals
    const decimals = await usdcToken.decimals();
    
    // Convert amount to proper format with decimals
    const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);
    
    // First approve Aave Pool to spend our USDC
    const approveTx = await usdcToken.approve(AAVE_POOL_ADDRESS, amountWei);
    await approveTx.wait();
    
    // Now supply USDC to Aave
    // The last parameter (referralCode) is unused in most deployments so we pass 0
    const supplyTx = await aavePool.supply(
      USDC_TOKEN_ADDRESS,
      amountWei,
      adminAddress,
      0
    );
    
    const receipt = await supplyTx.wait();
    
    return {
      success: true,
      amount,
      txHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error('Error depositing to Aave:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Withdraw USDC from Aave
 * @param {number} amount - Amount in USDC to withdraw
 * @returns {Promise<Object>} Transaction result
 */
async function withdrawFromAave(amount) {
  try {
    const { aavePool } = getContracts();
    if (!aavePool) throw new Error('Contracts not available');
    
    const { signer } = getProviderAndSigner();
    const adminAddress = await signer.getAddress();
    
    // Convert amount to proper format with decimals (USDC has 6 decimals)
    const amountWei = ethers.utils.parseUnits(amount.toString(), 6);
    
    // Withdraw USDC from Aave
    const withdrawTx = await aavePool.withdraw(
      USDC_TOKEN_ADDRESS,
      amountWei,
      adminAddress
    );
    
    const receipt = await withdrawTx.wait();
    
    return {
      success: true,
      amount,
      txHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error('Error withdrawing from Aave:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Calculate accrued interest for a user based on their proportion of the pool
 * @param {number} userBalance - User's balance in USDC
 * @param {number} totalPoolSize - Total pool size in USDC
 * @returns {Promise<Object>} Interest calculation details
 */
async function calculateUserInterest(userBalance, totalPoolSize) {
  try {
    // Get total deposited and current value
    const { totalDeposited, currentValue } = await getTotalDeposited();
    
    // If there's nothing deposited, return 0 interest
    if (totalDeposited === 0 || totalPoolSize === 0) {
      return {
        calculatedAt: new Date(),
        userBalance,
        poolSize: totalPoolSize,
        depositedInAave: totalDeposited,
        userInterestAmount: 0,
        userApy: 0,
      };
    }
    
    // Calculate total interest earned
    const totalInterest = currentValue - totalDeposited;
    
    // Calculate user's proportion of the pool
    const userProportion = userBalance / totalPoolSize;
    
    // Calculate user's share of the interest
    const userInterest = totalInterest * userProportion;
    
    // Calculate effective APY
    const currentApy = await getCurrentApy();
    
    return {
      calculatedAt: new Date(),
      userBalance,
      poolSize: totalPoolSize,
      depositedInAave: totalDeposited,
      userInterestAmount: userInterest,
      userApy: currentApy,
    };
  } catch (error) {
    console.error('Error calculating user interest:', error);
    return {
      calculatedAt: new Date(),
      userBalance,
      poolSize: totalPoolSize,
      error: error.message,
      userInterestAmount: 0,
      userApy: 0,
    };
  }
}

/**
 * Manage idle funds by depositing excess to Aave or withdrawing as needed
 * @param {number} totalIdleFunds - Total idle funds in the system
 * @param {number} reserveAmount - Amount to keep in reserve (not deposited)
 * @returns {Promise<Object>} Operation result
 */
async function manageIdleFunds(totalIdleFunds, reserveAmount = 1000) {
  try {
    // Get current deposited amount
    const { totalDeposited } = await getTotalDeposited();
    
    // Calculate how much should be in Aave vs reserve
    const targetAmountInAave = Math.max(0, totalIdleFunds - reserveAmount);
    
    // If we need to deposit more
    if (targetAmountInAave > totalDeposited) {
      const amountToDeposit = targetAmountInAave - totalDeposited;
      return await depositToAave(amountToDeposit);
    }
    
    // If we need to withdraw some
    if (targetAmountInAave < totalDeposited) {
      const amountToWithdraw = totalDeposited - targetAmountInAave;
      return await withdrawFromAave(amountToWithdraw);
    }
    
    // If current allocation is good
    return {
      success: true,
      message: "Idle funds already optimally allocated",
      totalIdleFunds,
      inAave: totalDeposited,
      inReserve: totalIdleFunds - totalDeposited,
    };
  } catch (error) {
    console.error('Error managing idle funds:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export {
  getCurrentApy,
  getTotalDeposited,
  depositToAave,
  withdrawFromAave,
  calculateUserInterest,
  manageIdleFunds,
};