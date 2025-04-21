import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Building, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { usePlaidLink } from "react-plaid-link";

interface PlaidLinkButtonProps {
  amount?: string;
  onSuccess?: (publicToken: string, metadata: any) => void;
}

export default function PlaidLinkButton({ amount, onSuccess }: PlaidLinkButtonProps) {
  const { toast } = useToast();
  const { user, devMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // Handle the success callback from Plaid Link
  const handleSuccess = useCallback(async (publicToken: string, metadata: any) => {
    try {
      if (devMode) {
        // In dev mode, simulate success without making API calls
        toast({
          title: "Bank Connected Successfully",
          description: "Your bank account has been successfully linked. You can now deposit funds anytime.",
        });
        
        if (onSuccess) {
          onSuccess(publicToken, metadata);
        }
      } else {
        // In real mode, exchange the public token for an access token
        const exchangeResponse = await apiRequest("POST", "/api/plaid/exchange", {
          publicToken
        });
        
        if (!exchangeResponse.ok) {
          throw new Error("Failed to exchange public token");
        }
        
        const data = await exchangeResponse.json();
        
        // Show success message
        toast({
          title: "Bank Connected Successfully",
          description: "Your bank account has been successfully linked. You can now deposit funds anytime.",
        });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(publicToken, metadata);
        }
      }
    } catch (error) {
      console.error("Error in Plaid flow:", error);
      toast({
        title: "Bank Connection Failed",
        description: "There was a problem connecting to your bank. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLinkToken(null);
    }
  }, [toast, onSuccess, devMode]);
  
  // Handle the exit callback from Plaid Link
  const handleExit = useCallback(() => {
    setIsLoading(false);
    setLinkToken(null);
  }, []);

  // Initialize Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleSuccess,
    onExit: handleExit
  });

  // Handle the button click - Connect bank account
  const handlePlaidLink = async () => {
    try {
      setIsLoading(true);

      if (devMode) {
        // In dev mode, simulate getting a link token
        // For development, we'll use a fake token that won't actually work
        // but will allow us to test the flow
        setTimeout(() => {
          // Simulate bank connection success
          toast({
            title: "Bank Connected Successfully",
            description: "Your bank account has been successfully linked in development mode. You can now deposit funds anytime.",
          });
          setIsLoading(false);
        }, 1500);
      } else {
        // In real mode, get link token from the server
        const response = await apiRequest("POST", "/api/plaid/link-token", {});
        
        if (!response.ok) {
          throw new Error("Failed to get Plaid link token");
        }
        
        const data = await response.json();
        
        if (!data.link_token) {
          throw new Error("No link token returned");
        }
        
        // Set the link token - this will trigger the usePlaidLink hook
        setLinkToken(data.link_token);
      }
    } catch (error) {
      console.error("Error connecting bank:", error);
      toast({
        title: "Bank Connection Failed",
        description: "There was a problem connecting to your bank. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Effect to open Plaid Link when token is set and ready
  if (linkToken && ready && !isLoading && !devMode) {
    // Open Plaid Link (only in real mode)
    open();
  }
  
  // The actual deposit function - separate from bank connection
  const initiateDeposit = async (accessToken: string, accountId: string) => {
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
      
      if (devMode) {
        // In dev mode, simulate a successful deposit
        setTimeout(() => {
          toast({
            title: "Deposit Initiated",
            description: `$${parseFloat(amount).toFixed(2)} will be transferred from your bank account. This process typically takes 1-3 business days.`,
          });
          setIsLoading(false);
        }, 1000);
      } else {
        // In real mode, initiate transfer with the access token and account ID
        const transferResponse = await apiRequest("POST", "/api/plaid/transfer", {
          accessToken,
          accountId,
          amount: parseFloat(amount)
        });
        
        if (!transferResponse.ok) {
          throw new Error("Failed to initiate transfer");
        }
        
        // Show success message
        toast({
          title: "Deposit Initiated",
          description: `$${parseFloat(amount).toFixed(2)} will be transferred from your bank account. This process typically takes 1-3 business days.`,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error initiating deposit:", error);
      toast({
        title: "Deposit Failed",
        description: "There was a problem processing your deposit. Please try again.",
        variant: "destructive"
      });
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