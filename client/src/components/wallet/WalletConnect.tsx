import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ChevronRight, ArrowRight, ShieldCheck, Loader2, Landmark, Coins } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWeb3 } from "@/hooks/use-web3";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectProps {
  onConnected?: (address: string) => void;
  compact?: boolean;
}

export default function WalletConnect({ onConnected, compact = false }: WalletConnectProps) {
  const { toast } = useToast();
  const { updateWalletMutation, devMode } = useAuth();
  const { connectWallet, disconnectWallet, isConnected, isConnecting, address, networkName } = useWeb3();
  const [displayAddress, setDisplayAddress] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      // Format address for display (first 6 and last 4 characters)
      setDisplayAddress(`${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
      onConnected?.(address);
    } else {
      setDisplayAddress(null);
    }
  }, [address, onConnected]);

  const handleConnectWallet = async () => {
    try {
      if (devMode) {
        // In development mode, simulate wallet connection
        toast({
          title: "Dev mode",
          description: "Wallet connection simulated in development mode",
        });
        
        // Wait a moment to simulate connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update wallet address in user profile
        await updateWalletMutation.mutateAsync({
          walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
        });
        
        return;
      }
      
      // Connect wallet using web3 hook
      await connectWallet();
      
      if (address) {
        // Update wallet address in user profile
        await updateWalletMutation.mutateAsync({
          walletAddress: address
        });
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected successfully.",
      });
    } catch (error: any) {
      console.error("Error disconnecting wallet:", error);
      toast({
        title: "Disconnection failed",
        description: error.message || "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (compact) {
    return (
      <div className="rounded-md border bg-card text-card-foreground shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">{isConnected ? "Wallet Connected" : "Connect Wallet"}</h3>
              {isConnected && displayAddress && (
                <p className="text-xs text-muted-foreground">{displayAddress}</p>
              )}
            </div>
          </div>
          
          <Button 
            variant={isConnected ? "outline" : "default"} 
            size="sm"
            onClick={isConnected ? handleDisconnectWallet : handleConnectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isConnected ? (
              "Disconnect"
            ) : (
              "Connect"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Wallet Connection
        </CardTitle>
        <CardDescription>
          Connect your Coinbase Wallet to deposit, play, and withdraw funds.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-primary/5 rounded-md">
              <div className="mr-3 bg-primary/10 p-2 rounded-full">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">Wallet Connected</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {displayAddress} 
                  {networkName && (
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px]">
                      {networkName}
                    </span>
                  )}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-md flex flex-col items-center text-center">
                <Coins className="h-5 w-5 text-primary mb-1" />
                <h4 className="text-sm font-medium">Fund with Card</h4>
                <p className="text-xs text-muted-foreground">Add money with credit card</p>
              </div>
              <div className="p-3 border rounded-md flex flex-col items-center text-center">
                <Landmark className="h-5 w-5 text-primary mb-1" />
                <h4 className="text-sm font-medium">Connect Bank</h4>
                <p className="text-xs text-muted-foreground">Link bank account</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-primary/5 rounded-md">
              <div className="rounded-full mr-3 bg-primary/10 p-2">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Not Connected</h3>
                <p className="text-xs text-muted-foreground">Connect your wallet to continue</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-1.5 h-6 w-6 flex items-center justify-center">
                  <span className="text-xs font-medium">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Create or connect to Coinbase Wallet</h4>
                  <p className="text-xs text-muted-foreground">Your funds stay in your control at all times</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-1.5 h-6 w-6 flex items-center justify-center">
                  <span className="text-xs font-medium">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Deposit funds via bank or card</h4>
                  <p className="text-xs text-muted-foreground">Add USD to your wallet to play poker</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-1.5 h-6 w-6 flex items-center justify-center">
                  <span className="text-xs font-medium">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Play & earn interest between games</h4>
                  <p className="text-xs text-muted-foreground">Your idle funds can earn ~3% APY</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        {isConnected ? (
          <>
            <Button variant="outline" onClick={handleDisconnectWallet}>
              Disconnect Wallet
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              View Wallet Details <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </>
        ) : (
          <Button 
            className="w-full"
            onClick={handleConnectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Connect Coinbase Wallet <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}