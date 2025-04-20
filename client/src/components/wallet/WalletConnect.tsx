import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeb3 } from "@/hooks/use-web3";
import { useToast } from "@/hooks/use-toast";
import { Wallet, ArrowRightLeft, Loader2, ChevronRight, Coins, Copy, Check } from "lucide-react";

interface WalletConnectProps {
  onOpenDepositModal?: () => void;
  onOpenWithdrawModal?: () => void;
}

export default function WalletConnect({ 
  onOpenDepositModal, 
  onOpenWithdrawModal 
}: WalletConnectProps) {
  const { isConnected, isConnecting, address, connectWallet, disconnectWallet } = useWeb3();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const formatAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const copyAddressToClipboard = () => {
    if (!address) return;
    
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopied(true);
        toast({
          title: "Address copied",
          description: "Wallet address copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error("Failed to copy address:", error);
        toast({
          title: "Copy failed",
          description: "Failed to copy address to clipboard",
          variant: "destructive",
        });
      });
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center">
          <Wallet className="h-5 w-5 mr-2 text-primary" />
          Wallet
        </CardTitle>
        <CardDescription>
          Connect your Coinbase Wallet for payments
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="space-y-1">
                <p className="text-sm font-medium">Coinbase Wallet</p>
                <div className="flex items-center">
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatAddress(address)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={copyAddressToClipboard}
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                Connected
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                size="sm"
                onClick={onOpenDepositModal}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Deposit
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                size="sm"
                onClick={onOpenWithdrawModal}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2 rotate-180" />
                Withdraw
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Coins className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Not Connected</h4>
                  <p className="text-xs text-muted-foreground">
                    Connect your wallet to manage funds
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect Coinbase Wallet
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
      
      {isConnected && (
        <CardFooter className="flex justify-between pt-0 border-t border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={disconnectWallet}
          >
            Disconnect Wallet
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}