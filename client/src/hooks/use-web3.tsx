import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Import CoinbaseWalletSDK
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

// This would be replaced with the actual Web3 import in a production app
// For our mock implementation, we'll create a simplified version
interface Web3ContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  networkName: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<any>;
  signMessage: (message: string) => Promise<string>;
}

// Create context
export const Web3Context = createContext<Web3ContextType | null>(null);

// Network information
const NETWORK_NAMES: {[key: string]: string} = {
  "1": "Ethereum",
  "137": "Polygon",
  "8453": "Base",
};

// Provider component
export function Web3Provider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<string | null>(null);
  const [coinbaseWallet, setCoinbaseWallet] = useState<any>(null);

  // Setup Coinbase Wallet on component mount
  useEffect(() => {
    try {
      // Initialize Coinbase Wallet SDK
      const APP_NAME = "PotLock";
      const APP_LOGO_URL = "https://example.com/logo.png";
      const DEFAULT_ETH_JSONRPC_URL = "https://mainnet.base.org";
      const DEFAULT_CHAIN_ID = 8453; // Base Mainnet

      // Initialize a CoinbaseWalletSDK instance
      const coinbaseWalletSDK = new CoinbaseWalletSDK({
        appName: APP_NAME,
        appLogoUrl: APP_LOGO_URL,
        darkMode: false
      });

      // Create a provider
      const coinbaseWalletProvider = coinbaseWalletSDK.makeWeb3Provider(
        DEFAULT_ETH_JSONRPC_URL, 
        DEFAULT_CHAIN_ID
      );

      setCoinbaseWallet(coinbaseWalletProvider);
    } catch (error) {
      console.error("Failed to initialize Coinbase Wallet SDK:", error);
    }
  }, []);

  // Function to connect wallet
  const connectWallet = async () => {
    if (!coinbaseWallet) {
      throw new Error("Coinbase Wallet SDK not initialized");
    }
    
    setIsConnecting(true);
    
    try {
      // Trigger connection
      const accounts = await coinbaseWallet.request({
        method: "eth_requestAccounts"
      });
      
      // Get network
      const chainId = await coinbaseWallet.request({
        method: "eth_chainId"
      });
      
      // Set state
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setNetworkId(parseInt(chainId, 16).toString());
        setIsConnected(true);
        
        toast({
          title: "Connected",
          description: `Wallet connected successfully!`,
        });
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  // Function to disconnect wallet
  const disconnectWallet = async () => {
    if (!coinbaseWallet) return;
    
    try {
      await coinbaseWallet.disconnect();
      
      // Reset state
      setAddress(null);
      setNetworkId(null);
      setIsConnected(false);
      
      toast({
        title: "Disconnected",
        description: "Wallet disconnected successfully",
      });
    } catch (error: any) {
      console.error("Error disconnecting wallet:", error);
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect wallet",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to send transaction
  const sendTransaction = async (to: string, amount: string) => {
    if (!coinbaseWallet || !address) {
      throw new Error("Wallet not connected");
    }
    
    try {
      // Convert amount to wei (this is simplified)
      const amountInWei = BigInt(parseFloat(amount) * 1e18).toString();
      
      // Send transaction
      const txHash = await coinbaseWallet.request({
        method: "eth_sendTransaction",
        params: [{
          from: address,
          to,
          value: amountInWei,
        }],
      });
      
      toast({
        title: "Transaction Sent",
        description: `Transaction hash: ${txHash.substring(0, 10)}...`,
      });
      
      return txHash;
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send transaction",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to sign message
  const signMessage = async (message: string) => {
    if (!coinbaseWallet || !address) {
      throw new Error("Wallet not connected");
    }
    
    try {
      // Sign message
      const signature = await coinbaseWallet.request({
        method: "personal_sign",
        params: [message, address],
      });
      
      return signature;
    } catch (error: any) {
      console.error("Error signing message:", error);
      toast({
        title: "Signing Failed",
        description: error.message || "Failed to sign message",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get network name from ID
  const networkName = networkId ? NETWORK_NAMES[networkId] || `Chain ${networkId}` : null;

  return (
    <Web3Context.Provider
      value={{
        isConnected,
        isConnecting,
        address,
        networkName,
        connectWallet,
        disconnectWallet,
        sendTransaction,
        signMessage,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

// Hook to use web3
export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}