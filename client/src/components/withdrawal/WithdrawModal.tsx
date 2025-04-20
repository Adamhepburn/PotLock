import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Building, 
  Wallet, 
  ArrowRight, 
  Check, 
  Loader2, 
  DollarSign,
  ShieldCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/use-web3";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxAmount?: string;
}

export default function WithdrawModal({ 
  open, 
  onOpenChange,
  maxAmount = "500"
}: WithdrawModalProps) {
  const { toast } = useToast();
  const { isConnected, address, connectWallet } = useWeb3();
  const [activeTab, setActiveTab] = useState<string>("bank");
  const [amount, setAmount] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [routingNumber, setRoutingNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  const resetForm = () => {
    setAmount("");
    setAccountNumber("");
    setRoutingNumber("");
    setAccountName("");
    setIsProcessing(false);
    setIsSuccess(false);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Accept only numeric and decimal point
    const value = e.target.value.replace(/[^\d.]/g, "");
    
    // Ensure only one decimal point
    const parts = value.split(".");
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }
    
    // Don't allow amount greater than maxAmount
    if (parseFloat(value) > parseFloat(maxAmount)) {
      setAmount(maxAmount);
      return;
    }
    
    setAmount(value);
  };
  
  const validateBankForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive",
      });
      return false;
    }
    
    if (!accountNumber || accountNumber.length < 8) {
      toast({
        title: "Invalid account number",
        description: "Please enter a valid account number",
        variant: "destructive",
      });
      return false;
    }
    
    if (!routingNumber || routingNumber.length !== 9) {
      toast({
        title: "Invalid routing number",
        description: "Please enter a valid 9-digit routing number",
        variant: "destructive",
      });
      return false;
    }
    
    if (!accountName) {
      toast({
        title: "Missing account name",
        description: "Please enter the account holder's name",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const validateWalletForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive",
      });
      return false;
    }
    
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleBankWithdraw = async () => {
    if (!validateBankForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate API call to process withdrawal
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setIsSuccess(true);
      
      toast({
        title: "Withdrawal initiated",
        description: `$${amount} will be sent to your bank account in 1-3 business days`,
      });
      
      // Close modal after showing success state
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 2000);
    } catch (error: any) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Withdrawal failed",
        description: error.message || "An error occurred while processing your withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCryptoWithdraw = async () => {
    if (!validateWalletForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In real implementation, would make API call to backend to process withdrawal
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setIsSuccess(true);
      
      toast({
        title: "Withdrawal complete",
        description: `$${amount} worth of USDC has been sent to your wallet`,
      });
      
      // Close modal after showing success state
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 2000);
    } catch (error: any) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Withdrawal failed",
        description: error.message || "An error occurred while processing your withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Withdraw money to your bank account or crypto wallet.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="bank" className="mt-2" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>Bank</span>
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>Crypto</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Bank Tab */}
          <TabsContent value="bank" className="mt-4">
            {isSuccess ? (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Withdrawal Initiated!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  ${amount} will be sent to your bank account in 1-3 business days
                </p>
                <Button variant="outline" onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                    <span className="text-xs text-muted-foreground">
                      Available: ${maxAmount}
                    </span>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="withdraw-amount"
                      placeholder="0.00"
                      className="pl-10"
                      value={amount}
                      onChange={handleAmountChange}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number" 
                    placeholder="12345678"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="routing-number">Routing Number</Label>
                  <Input
                    id="routing-number" 
                    placeholder="123456789"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, "").substring(0, 9))}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Holder Name</Label>
                  <Input 
                    id="account-name" 
                    placeholder="J. Doe"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="text-xs text-muted-foreground flex items-center mt-4">
                  <ShieldCheck className="h-4 w-4 mr-1 text-green-600" />
                  Your banking information is secure and encrypted
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Crypto Tab */}
          <TabsContent value="crypto" className="mt-4 space-y-4">
            {isSuccess ? (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Withdrawal Complete!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  ${amount} worth of USDC has been sent to your wallet
                </p>
                <Button variant="outline" onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="crypto-amount">Amount (USD)</Label>
                    <span className="text-xs text-muted-foreground">
                      Available: ${maxAmount}
                    </span>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="crypto-amount"
                      placeholder="0.00"
                      className="pl-10"
                      value={amount}
                      onChange={handleAmountChange}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                
                <div className="p-4 border rounded-md bg-gray-50">
                  <h4 className="text-sm font-medium mb-2">Connected Wallet</h4>
                  {isConnected ? (
                    <div className="text-sm space-y-1">
                      <div className="font-mono text-xs text-gray-500 truncate">
                        {address && address.slice(0, 8) + '...' + address.slice(-6)}
                      </div>
                      <p className="text-xs text-green-700 flex items-center">
                        <Check className="h-3 w-3 mr-1" /> Ready for withdrawal
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground mb-4">
                      Connect your wallet to receive funds as USDC stablecoin.
                    </div>
                  )}
                  
                  {!isConnected && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={connectWallet}
                    >
                      Connect Wallet
                    </Button>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground flex items-center mt-2">
                  <ShieldCheck className="h-4 w-4 mr-1 text-green-600" />
                  Withdrawals are sent as USDC (USD Coin) stablecoin
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {!isSuccess && (
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              className="w-full"
              onClick={activeTab === "bank" ? handleBankWithdraw : handleCryptoWithdraw}
              disabled={isProcessing || (activeTab === "crypto" && !isConnected)}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Withdraw ${amount || "0"} <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}