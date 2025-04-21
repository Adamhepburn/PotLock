import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Building, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { usePlaidLink } from "react-plaid-link";

interface PlaidLinkButtonProps {
  amount?: string;
}

export default function PlaidLinkButton({ amount }: PlaidLinkButtonProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // Function to fetch a link token from our server
  const getLinkToken = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than $0.",
        variant: "destructive"
      });
      return null;
    }

    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/plaid/link-token", {});
      
      if (!response.ok) {
        throw new Error("Failed to get Plaid link token");
      }
      
      const data = await response.json();
      return data.link_token;
    } catch (error) {
      console.error("Error getting link token:", error);
      toast({
        title: "Bank Connection Failed",
        description: "There was a problem connecting to your bank. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return null;
    }
  };

  // Handle the success callback from Plaid Link
  const handleSuccess = useCallback(async (publicToken: string, metadata: any) => {
    try {
      // Exchange the public token for an access token
      const exchangeResponse = await apiRequest("POST", "/api/plaid/exchange", {
        publicToken
      });
      
      if (!exchangeResponse.ok) {
        throw new Error("Failed to exchange public token");
      }
      
      const { accessToken } = await exchangeResponse.json();
      
      // Get the selected account ID from the metadata
      const accountId = metadata.accounts[0]?.id;
      
      if (!accountId) {
        throw new Error("No account selected");
      }
      
      // Initiate the transfer with the access token and account ID
      const transferResponse = await apiRequest("POST", "/api/plaid/transfer", {
        accessToken,
        accountId,
        amount: parseFloat(amount!)
      });
      
      if (!transferResponse.ok) {
        throw new Error("Failed to initiate transfer");
      }
      
      // Show success message
      toast({
        title: "Deposit Initiated",
        description: `$${parseFloat(amount!).toFixed(2)} will be transferred from your bank account. This process typically takes 1-3 business days.`,
      });
    } catch (error) {
      console.error("Error in Plaid flow:", error);
      toast({
        title: "Deposit Failed",
        description: "There was a problem processing your deposit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLinkToken(null);
    }
  }, [amount, toast]);
  
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

  // Handle the button click
  const handlePlaidLink = async () => {
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
      
      // If we don't have a link token, get one
      if (!linkToken) {
        const token = await getLinkToken();
        if (token) {
          setLinkToken(token);
          // The usePlaidLink hook will automatically open when the token is set
        }
      } else if (ready) {
        // If we already have a token and Plaid Link is ready, open it
        open();
      }
    } catch (error) {
      console.error("Error initiating Plaid link:", error);
      toast({
        title: "Bank Connection Failed",
        description: "There was a problem connecting to your bank. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Effect to open Plaid Link when token is set and ready
  if (linkToken && ready && !isLoading) {
    open();
  }

  return (
    <Button
      className="w-full shadow-lg"
      style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }}
      onClick={handlePlaidLink}
      disabled={isLoading || !ready}
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