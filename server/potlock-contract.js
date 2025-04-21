// PotLock Smart Contract Interface
import * as ethers from 'ethers';

// Note: In a production environment, these should be securely stored environment variables
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ADMIN_WALLET_PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY;

// Base network configurations
const BASE_MAINNET_RPC = `https://mainnet.base.org`;
const BASE_SEPOLIA_RPC = `https://sepolia.base.org`;

// Contract address and ABI
const POTLOCK_CONTRACT_ADDRESS = process.env.POTLOCK_CONTRACT_ADDRESS || '0xYourContractAddressHere';
const POTLOCK_CONTRACT_ABI = [
  // Sample ABI - this should be replaced with your actual contract ABI
  "function depositUSDC(uint256 amount) external returns (bool)",
  "function withdrawUSDC(uint256 amount, address destination) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function idleBalanceOf(address account) external view returns (uint256)",
  "function betBalanceOf(address account) external view returns (uint256)",
  "event Deposited(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount, address destination)"
];

// Initialize provider and contract
// ESM version uses different import pattern
const provider = new ethers.JsonRpcProvider(
  process.env.NODE_ENV === 'production' ? BASE_MAINNET_RPC : BASE_SEPOLIA_RPC
);

// Set up wallet and contract conditionally to avoid errors when private key isn't available
let wallet;
let potlockContract;

// Only attempt to create the wallet and contract if we have the necessary credentials
if (ADMIN_WALLET_PRIVATE_KEY) {
  try {
    // Create a wallet using admin private key
    wallet = new ethers.Wallet(ADMIN_WALLET_PRIVATE_KEY, provider);
    
    // Connect to the PotLock contract
    potlockContract = new ethers.Contract(
      POTLOCK_CONTRACT_ADDRESS,
      POTLOCK_CONTRACT_ABI,
      wallet
    );
  } catch (error) {
    console.warn("Failed to initialize wallet or contract:", error.message);
  }
} else {
  console.warn("ADMIN_WALLET_PRIVATE_KEY is not provided. Smart contract functionality is disabled.");
}

/**
 * Deposit USDC into the PotLock contract on behalf of a user
 * @param {string} userAddress - User's blockchain address
 * @param {number} amount - Amount in USDC to deposit
 * @returns {Promise<Object>} Transaction details
 */
async function depositForUser(userAddress, amount) {
  try {
    // Check if contract is available before proceeding
    if (!potlockContract) {
      throw new Error("Smart contract is not initialized. Missing ADMIN_WALLET_PRIVATE_KEY.");
    }
    
    // Convert amount to Wei (or the appropriate unit for your token)
    const amountInWei = ethers.parseUnits(amount.toString(), 6); // USDC has 6 decimals
    
    // Call the deposit function on the contract
    const tx = await potlockContract.depositUSDC(amountInWei);
    await tx.wait(); // Wait for transaction to be mined
    
    // Return transaction details
    return {
      success: true,
      txHash: tx.hash,
      amount,
      userAddress
    };
  } catch (error) {
    console.error('Error depositing to PotLock contract:', error);
    throw error;
  }
}

/**
 * Withdraw USDC from the PotLock contract on behalf of a user
 * @param {string} userAddress - User's blockchain address
 * @param {number} amount - Amount in USDC to withdraw
 * @param {string} destinationAddress - Destination address for withdrawal
 * @returns {Promise<Object>} Transaction details
 */
async function withdrawForUser(userAddress, amount, destinationAddress) {
  try {
    // Check if contract is available before proceeding
    if (!potlockContract) {
      throw new Error("Smart contract is not initialized. Missing ADMIN_WALLET_PRIVATE_KEY.");
    }
    
    // Convert amount to Wei (or the appropriate unit for your token)
    const amountInWei = ethers.parseUnits(amount.toString(), 6); // USDC has 6 decimals
    
    // Call the withdraw function on the contract
    const tx = await potlockContract.withdrawUSDC(amountInWei, destinationAddress);
    await tx.wait(); // Wait for transaction to be mined
    
    // Return transaction details
    return {
      success: true,
      txHash: tx.hash,
      amount,
      userAddress,
      destinationAddress
    };
  } catch (error) {
    console.error('Error withdrawing from PotLock contract:', error);
    throw error;
  }
}

/**
 * Get user balances from the PotLock contract
 * @param {string} userAddress - User's blockchain address
 * @returns {Promise<Object>} User's balances
 */
async function getUserBalances(userAddress) {
  try {
    // Get total balance
    const totalBalance = await potlockContract.balanceOf(userAddress);
    
    // Get idle balance (available for withdrawal or staking)
    const idleBalance = await potlockContract.idleBalanceOf(userAddress);
    
    // Get bet balance (locked in games)
    const betBalance = await potlockContract.betBalanceOf(userAddress);
    
    // Convert Wei values to USDC decimal format
    return {
      totalBalance: ethers.formatUnits(totalBalance, 6),
      idleBalance: ethers.formatUnits(idleBalance, 6),
      betBalance: ethers.formatUnits(betBalance, 6)
    };
  } catch (error) {
    console.error('Error getting user balances:', error);
    throw error;
  }
}

// Export functions for use in routes
export {
  depositForUser,
  withdrawForUser,
  getUserBalances
};