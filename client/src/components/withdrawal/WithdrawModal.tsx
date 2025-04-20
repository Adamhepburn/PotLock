import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, DollarSign, Loader2, AlertCircle, ArrowDownToLine, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance?: number;
}

export function WithdrawModal({ 
  open, 
  onOpenChange, 
  availableBalance = 100  // Default mock balance
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"bank" | "wallet">("bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, "");
    // Only allow one decimal point
    if (value.split(".").length > 2) return;
    setAmount(value);
  };

  const resetForm = () => {
    setAmount("");
    setIsProcessing(false);
    setIsSuccess(false);
  };

  const handleWithdrawSuccess = () => {
    setIsProcessing(false);
    setIsSuccess(true);
    
    // Simulate withdrawal confirmation
    setTimeout(() => {
      // Here we would actually update the user's balance on the server
      toast({
        title: "Withdrawal Initiated",
        description: withdrawMethod === "bank" 
          ? `${amount} USDC ($${amount}) will arrive in your bank account in 1-3 business days.`
          : `${amount} USDC has been sent to your wallet.`,
      });
      onOpenChange(false);
      resetForm();
    }, 1500);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after a brief delay to avoid visual glitches
    setTimeout(resetForm, 300);
  };

  const handleProcessWithdrawal = () => {
    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    // Validate sufficient balance
    if (parseFloat(amount) > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You can only withdraw up to ${availableBalance} USDC.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // In a real implementation, this would call an API to process the withdrawal
    // For our mock implementation, we'll just simulate a successful withdrawal after a delay
    setTimeout(handleWithdrawSuccess, 2000);
  };

  // If user has no linked bank account, show appropriate message
  const hasBankAccount = true; // Mock value - would come from user profile
  
  // Reset amount if it exceeds available balance when available balance changes
  useEffect(() => {
    if (parseFloat(amount) > availableBalance) {
      setAmount(availableBalance.toString());
    }
  }, [availableBalance]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Withdraw your USDC to your bank account or crypto wallet.
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                <span className="text-sm font-medium">Available Balance</span>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="font-medium">{availableBalance} USDC</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Withdraw (USDC)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="amount"
                    placeholder="50.00"
                    className="pl-10"
                    value={amount}
                    onChange={handleAmountChange}
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    {amount ? `$${amount} USD equivalent` : "Enter an amount to withdraw"}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto py-0 px-2"
                    onClick={() => setAmount(availableBalance.toString())}
                    disabled={isProcessing}
                  >
                    Max
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="bank" className="w-full" onValueChange={(value) => setWithdrawMethod(value as "bank" | "wallet")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bank" disabled={isProcessing}>
                    <Building2 className="mr-2 h-4 w-4" />
                    Bank Account
                  </TabsTrigger>
                  <TabsTrigger value="wallet" disabled={isProcessing}>
                    <Wallet className="mr-2 h-4 w-4" />
                    Crypto Wallet
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="bank" className="space-y-4 mt-4">
                  {hasBankAccount ? (
                    <div className="space-y-2">
                      <p className="text-sm">
                        Withdraw to your linked bank account. Funds will arrive in 1-3 business days.
                      </p>
                      <div className="bg-muted p-2 rounded-md flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Chase Bank (...1234)</span>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You don't have a bank account linked. Please link a bank account first.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
                
                <TabsContent value="wallet" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      Withdraw directly to your crypto wallet. This is typically instant but may take up to 30 minutes.
                    </p>
                    <div className="bg-muted p-2 rounded-md flex items-center">
                      <Wallet className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium truncate">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Fee information */}
              <div className="text-sm text-muted-foreground">
                <p>
                  {withdrawMethod === "bank"
                    ? "Bank withdrawals have a $0.25 fixed fee plus 1% of the withdrawal amount."
                    : "Crypto withdrawals have a network gas fee of approximately 0.001 ETH."
                  }
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button 
                onClick={handleProcessWithdrawal} 
                disabled={
                  isProcessing || 
                  !amount || 
                  parseFloat(amount) <= 0 || 
                  parseFloat(amount) > availableBalance ||
                  (withdrawMethod === "bank" && !hasBankAccount)
                }
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Withdraw Funds
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-3">
              <ArrowDownToLine className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-center">Withdrawal Initiated!</h3>
            <p className="text-center text-muted-foreground">
              {withdrawMethod === "bank"
                ? `${amount} USDC ($${amount}) will arrive in your bank account in 1-3 business days.`
                : `${amount} USDC has been sent to your wallet.`
              }
            </p>
            <Button onClick={handleClose} className="mt-4">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default WithdrawModal;