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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Building,
  Wallet,
  ArrowRight,
  Check,
  Loader2,
  DollarSign,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/use-web3";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance?: number;
}

export function WithdrawModal({
  open,
  onOpenChange,
  availableBalance = 0,
}: WithdrawModalProps) {
  const { toast } = useToast();
  const { isConnected, address } = useWeb3();
  const [activeTab, setActiveTab] = useState<string>("wallet");
  const [amount, setAmount] = useState<string>("");
  const [accountType, setAccountType] = useState<string>("checking");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [routingNumber, setRoutingNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [withdrawalAddress, setWithdrawalAddress] = useState<string>(address || "");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  const resetForm = () => {
    setAmount("");
    setAccountType("checking");
    setAccountNumber("");
    setRoutingNumber("");
    setAccountName("");
    setWithdrawalAddress(address || "");
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
    
    // Don't allow amount greater than available balance
    if (parseFloat(value) > availableBalance) {
      setAmount(availableBalance.toString());
      return;
    }
    
    setAmount(value);
  };
  
  const formatRoutingNumber = (value: string) => {
    return value.replace(/\D/g, "").substring(0, 9);
  };
  
  const formatAccountNumber = (value: string) => {
    return value.replace(/\D/g, "").substring(0, 17);
  };
  
  const handleRoutingNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoutingNumber(formatRoutingNumber(e.target.value));
  };
  
  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountNumber(formatAccountNumber(e.target.value));
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
    
    if (!routingNumber || routingNumber.length !== 9) {
      toast({
        title: "Invalid routing number",
        description: "Please enter a valid 9-digit routing number",
        variant: "destructive",
      });
      return false;
    }
    
    if (!accountNumber || accountNumber.length < 4) {
      toast({
        title: "Invalid account number",
        description: "Please enter a valid account number",
        variant: "destructive",
      });
      return false;
    }
    
    if (!accountName) {
      toast({
        title: "Missing account name",
        description: "Please enter the name on your bank account",
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
    
    if (!withdrawalAddress || !/^0x[a-fA-F0-9]{40}$/.test(withdrawalAddress)) {
      toast({
        title: "Invalid wallet address",
        description: "Please enter a valid Ethereum wallet address",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (activeTab === "bank" && !validateBankForm()) {
      return;
    }
    
    if (activeTab === "wallet" && !validateWalletForm()) {
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
        description: `$${amount} withdrawal has been initiated to your ${activeTab === "bank" ? "bank account" : "wallet"}`,
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
            Withdraw funds to your bank account or crypto wallet.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="wallet" className="mt-2" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>To Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>To Bank</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Success state (shown for both tabs) */}
          {isSuccess && (
            <div className="py-6 flex flex-col items-center justify-center text-center mt-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Withdrawal Initiated!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                ${amount} will be sent to your {activeTab === "bank" ? "bank account" : "wallet"}
              </p>
              <Button variant="outline" onClick={() => {
                onOpenChange(false);
                resetForm();
              }}>
                Done
              </Button>
            </div>
          )}
          
          {/* Wallet Tab */}
          {!isSuccess && (
            <TabsContent value="wallet" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawal-amount">Amount (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="withdrawal-amount"
                    placeholder="0.00"
                    className="pl-10"
                    value={amount}
                    onChange={handleAmountChange}
                    disabled={isProcessing}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Available balance: ${availableBalance.toFixed(2)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wallet-address">Destination Wallet Address</Label>
                <Input
                  id="wallet-address"
                  placeholder="0x..."
                  value={withdrawalAddress}
                  onChange={(e) => setWithdrawalAddress(e.target.value)}
                  disabled={isProcessing}
                />
                {isConnected && (
                  <p className="text-xs text-muted-foreground">
                    Using your connected wallet address
                  </p>
                )}
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs text-yellow-800">
                    Withdrawals to external wallets typically complete within minutes but may take up to 24 hours. Network fees may apply.
                  </p>
                </div>
              </div>
            </TabsContent>
          )}
          
          {/* Bank Tab */}
          {!isSuccess && (
            <TabsContent value="bank" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank-withdrawal-amount">Amount (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="bank-withdrawal-amount"
                    placeholder="0.00"
                    className="pl-10"
                    value={amount}
                    onChange={handleAmountChange}
                    disabled={isProcessing}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Available balance: ${availableBalance.toFixed(2)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup value={accountType} onValueChange={setAccountType} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="checking" id="checking" />
                    <Label htmlFor="checking" className="cursor-pointer">Checking</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="savings" id="savings" />
                    <Label htmlFor="savings" className="cursor-pointer">Savings</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="routing-number">Routing Number</Label>
                <Input
                  id="routing-number"
                  placeholder="123456789"
                  value={routingNumber}
                  onChange={handleRoutingNumberChange}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  placeholder="123456789012"
                  value={accountNumber}
                  onChange={handleAccountNumberChange}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account-name">Name on Account</Label>
                <Input
                  id="account-name"
                  placeholder="John Doe"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs text-blue-800">
                    Bank withdrawals typically take 1-3 business days to complete. A fee of $0.25 applies to ACH transfers.
                  </p>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        {!isSuccess && (
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              className="w-full"
              onClick={handleSubmit}
              disabled={isProcessing || parseFloat(amount || "0") <= 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Withdraw ${parseFloat(amount || "0").toFixed(2)} <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}