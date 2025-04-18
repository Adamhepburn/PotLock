import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import escrowABI from "../contracts/EscrowContract.json";
import { ethers } from "ethers";
import { apiRequest, queryClient } from "../lib/queryClient";

// Add the window.ethereum type
declare global {
  interface Window {
    ethereum: any;
  }
}

// Define Web3 context type
type Web3ContextType = {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getContract: (address: string) => ethers.Contract | null;
  networkName: string | null;
  chainId: number | null;
  address: string | null;
};

const Web3Context = createContext<Web3ContextType | null>(null);

// USDC contract addresses (Mainnet, Testnet)
const USDC_CONTRACT_ADDRESSES: Record<string, string> = {
  // Base Mainnet
  "8453": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  // Base Sepolia (Testnet)
  "84532": "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
};

// Create a provider component
export function Web3Provider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  // Effect to check if metamask is already connected
  useEffect(() => {
    const checkConnection = async () => {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Get accounts
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            // User is already connected
            const ethersProvider = new ethers.BrowserProvider(window.ethereum);
            const ethersSigner = await ethersProvider.getSigner();
            const network = await ethersProvider.getNetwork();
            
            setProvider(ethersProvider);
            setSigner(ethersSigner);
            setAddress(accounts[0]);
            setNetworkName(network.name);
            setChainId(Number(network.chainId));
            setIsConnected(true);
            
            // Sync wallet address with server
            try {
              await apiRequest("POST", "/api/user/wallet", { walletAddress: accounts[0] });
            } catch (error) {
              // If not logged in or other error, this will fail silently
              console.log("Not updating wallet address - user may not be logged in");
            }
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  // Set up event listeners for account and chain changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      // Handle account changes
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          disconnectWallet();
        } else if (accounts[0] !== address) {
          // Account changed
          setAddress(accounts[0]);
          
          // Update provider and signer with new account
          if (provider) {
            const ethersSigner = await provider.getSigner();
            setSigner(ethersSigner);
            
            // Sync wallet address with server
            try {
              await apiRequest("POST", "/api/user/wallet", { walletAddress: accounts[0] });
            } catch (error) {
              // If not logged in or other error, this will fail silently
              console.log("Not updating wallet address - user may not be logged in");
            }
          }
        }
      };

      // Handle chain changes
      const handleChainChanged = (chainIdHex: string) => {
        // Force page reload to ensure everything is in sync
        window.location.reload();
      };

      // Subscribe to events
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup function
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [provider, address]);

  // Connect wallet function
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to use this feature.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Request accounts access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();
      const network = await ethersProvider.getNetwork();
      
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setAddress(accounts[0]);
      setNetworkName(network.name);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      
      // Sync wallet address with server
      try {
        await apiRequest("POST", "/api/user/wallet", { walletAddress: accounts[0] });
      } catch (error) {
        // If not logged in or other error, this will fail silently
        console.log("Not updating wallet address - user may not be logged in");
      }
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
      });
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setNetworkName(null);
    setChainId(null);
    setIsConnected(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  // Get contract instance
  const getContract = (contractAddress: string) => {
    if (!signer || !provider) return null;
    
    try {
      return new ethers.Contract(
        contractAddress,
        escrowABI.abi,
        signer
      );
    } catch (error) {
      console.error("Error creating contract instance:", error);
      return null;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet,
        getContract,
        networkName,
        chainId,
        address,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

// Custom hook to use the Web3 context
export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
