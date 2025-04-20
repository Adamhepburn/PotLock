import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Building2, DollarSign, PiggyBank, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PlaidLinkButton from "./PlaidLinkButton";
import CoinbaseCardForm from "./CoinbaseCardForm";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState<"bank" | "card">("bank");
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

  const handleDepositSuccess = () => {
    setIsProcessing(false);
    setIsSuccess(true);
    
    // Simulate deposit confirmation
    setTimeout(() => {
      // Here we would actually update the user's balance on the server
      toast({
        title: "Deposit Successful",
        description: `$${amount} has been deposited as ${amount} USDC. Ready to play or earn!`,
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

  const handleProcessDeposit = () => {
    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // In a real implementation, this would call an API to process the deposit
    // For our mock implementation, we'll just simulate a successful deposit after a delay
    setTimeout(handleDepositSuccess, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Deposit USD to play poker or earn interest on your idle funds.
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Deposit (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="amount"
                    placeholder="100.00"
                    className="pl-10"
                    value={amount}
                    onChange={handleAmountChange}
                    disabled={isProcessing}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {amount ? `Will be converted to ${amount} USDC` : "Enter an amount to deposit"}
                </p>
              </div>

              <Tabs defaultValue="bank" className="w-full" onValueChange={(value) => setDepositMethod(value as "bank" | "card")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bank" disabled={isProcessing}>
                    <Building2 className="mr-2 h-4 w-4" />
                    Bank Account
                  </TabsTrigger>
                  <TabsTrigger value="card" disabled={isProcessing}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Credit/Debit Card
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="bank" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      Link your bank account to deposit funds directly. Bank transfers typically take 1-3 business days to process.
                    </p>
                    
                    {/* In a real implementation, this would use the Plaid Link SDK */}
                    <PlaidLinkButton 
                      disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                      onSuccess={handleProcessDeposit}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="card" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      Deposit using your credit or debit card for instant funding. A 2.5% processing fee applies.
                    </p>
                    
                    {/* Card form component */}
                    <CoinbaseCardForm 
                      disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                      onSubmit={handleProcessDeposit}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleProcessDeposit} disabled={isProcessing || !amount || parseFloat(amount) <= 0}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Deposit Funds"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-3">
              <PiggyBank className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-center">Deposit Successful!</h3>
            <p className="text-center text-muted-foreground">
              ${amount} has been deposited as {amount} USDC
            </p>
            <div className="flex items-center justify-center gap-2 bg-muted p-2 rounded-md">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{amount} USDC Added to Your Balance</span>
            </div>
            <Button onClick={handleClose} className="mt-4">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default DepositModal;