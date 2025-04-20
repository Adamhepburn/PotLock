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
  CreditCard, 
  Building, 
  ArrowRight, 
  Check, 
  Loader2, 
  DollarSign,
  ShieldCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PlaidLinkButton from "./PlaidLinkButton";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAmount?: string;
}

export default function DepositModal({ 
  open, 
  onOpenChange,
  defaultAmount = "100"
}: DepositModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("card");
  const [amount, setAmount] = useState<string>(defaultAmount);
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [cardholderName, setCardholderName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  const resetForm = () => {
    setAmount(defaultAmount);
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setCardholderName("");
    setIsProcessing(false);
    setIsSuccess(false);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");
    
    // Format with spaces every 4 digits
    let formatted = "";
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " ";
      }
      formatted += digits[i];
    }
    
    return formatted;
  };
  
  const formatExpiryDate = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");
    
    // Format as MM/YY
    if (digits.length <= 2) {
      return digits;
    } else {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    }
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    // Limit to 19 characters (16 digits + 3 spaces)
    setCardNumber(formatted.substring(0, 19));
  };
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    // Limit to 5 characters (MM/YY)
    setExpiryDate(formatted.substring(0, 5));
  };
  
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limit to 3-4 digits
    const value = e.target.value.replace(/\D/g, "").substring(0, 4);
    setCvv(value);
  };
  
  const handleCardholderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardholderName(e.target.value);
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
    
    setAmount(value);
  };
  
  const validateCardForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to deposit",
        variant: "destructive",
      });
      return false;
    }
    
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      toast({
        title: "Invalid card number",
        description: "Please enter a valid 16-digit card number",
        variant: "destructive",
      });
      return false;
    }
    
    if (!expiryDate || expiryDate.length < 5) {
      toast({
        title: "Invalid expiry date",
        description: "Please enter a valid expiry date (MM/YY)",
        variant: "destructive",
      });
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      toast({
        title: "Invalid CVV",
        description: "Please enter a valid CVV code",
        variant: "destructive",
      });
      return false;
    }
    
    if (!cardholderName) {
      toast({
        title: "Missing cardholder name",
        description: "Please enter the cardholder name",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateCardForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate API call to process payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setIsSuccess(true);
      
      toast({
        title: "Deposit successful",
        description: `$${amount} has been added to your account`,
      });
      
      // Close modal after showing success state
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 2000);
    } catch (error: any) {
      console.error("Error processing deposit:", error);
      toast({
        title: "Deposit failed",
        description: error.message || "An error occurred while processing your deposit",
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
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Add money to your account using a card or bank transfer.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="card" className="mt-2" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Card</span>
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>Bank</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Card Tab */}
          <TabsContent value="card" className="mt-4">
            {isSuccess ? (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Deposit Complete!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  ${amount} has been added to your account
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
                  <Label htmlFor="deposit-amount">Amount (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="deposit-amount"
                      placeholder="0.00"
                      className="pl-10"
                      value={amount}
                      onChange={handleAmountChange}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number" 
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <Input 
                      id="expiry-date" 
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={handleExpiryDateChange}
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input 
                      id="cvv" 
                      placeholder="123"
                      value={cvv}
                      onChange={handleCvvChange}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardholder-name">Cardholder Name</Label>
                  <Input 
                    id="cardholder-name" 
                    placeholder="J. Doe"
                    value={cardholderName}
                    onChange={handleCardholderNameChange}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="text-xs text-muted-foreground flex items-center mt-4">
                  <ShieldCheck className="h-4 w-4 mr-1 text-green-600" />
                  Your payment information is secure and encrypted
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Bank Tab */}
          <TabsContent value="bank" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank-amount">Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="bank-amount"
                  placeholder="0.00"
                  className="pl-10"
                  value={amount}
                  onChange={handleAmountChange}
                  disabled={isProcessing}
                />
              </div>
            </div>
            
            <div className="p-4 border rounded-md bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Link your bank account</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Securely connect your bank account to deposit funds directly.
              </p>
              
              <PlaidLinkButton amount={amount} />
            </div>
            
            <div className="text-xs text-muted-foreground flex items-center mt-2">
              <ShieldCheck className="h-4 w-4 mr-1 text-green-600" />
              Your bank information is secure and encrypted
            </div>
          </TabsContent>
        </Tabs>
        
        {activeTab === "card" && !isSuccess && (
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              className="w-full"
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Add ${amount || "0"} <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}