import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Building, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface PlaidLinkButtonProps {
  amount?: string;
}

export default function PlaidLinkButton({ amount }: PlaidLinkButtonProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Handle the button click - Connect bank account
  const handlePlaidLink = async () => {
    try {
      setIsLoading(true);

      // Simulate successful bank connection for development
      await simulateBankConnection();
      
      toast({
        title: "Bank Connected Successfully",
        description: "Your bank account has been successfully linked. You can now deposit funds anytime.",
      });
      
    } catch (error) {
      console.error("Error connecting bank:", error);
      toast({
        title: "Bank Connection Failed",
        description: "There was a problem connecting to your bank. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // This function simulates a bank connection process
  const simulateBankConnection = async () => {
    // Simulate processing delay
    return new Promise(resolve => setTimeout(resolve, 1500));
  };
  
  // The actual deposit function - separate from bank connection
  const initiateDeposit = async (accountId: string) => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than $0.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Simulate a successful deposit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: "Deposit Initiated",
        description: `$${parseFloat(amount).toFixed(2)} will be transferred from your bank account. This process typically takes 1-3 business days.`,
      });
    } catch (error) {
      console.error("Error initiating deposit:", error);
      toast({
        title: "Deposit Failed",
        description: "There was a problem processing your deposit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full shadow-lg"
      style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }}
      onClick={handlePlaidLink}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </span>
      ) : (
        <span className="flex items-center">
          <Building className="h-4 w-4 mr-2" />
          Link Bank Account
        </span>
      )}
    </Button>
  );
}