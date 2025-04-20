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

      // Step 1: Get a link token from our server
      const linkTokenResponse = await apiRequest("POST", "/api/plaid/link-token", {});
      
      if (!linkTokenResponse.ok) {
        throw new Error("Failed to get Plaid link token");
      }
      
      const { link_token } = await linkTokenResponse.json();
      
      if (!link_token) {
        throw new Error("No link token returned");
      }

      // In a real implementation, we would open the Plaid Link here
      // For now, we'll simulate a successful bank linking
      simulatePlaidLinkFlow(link_token, amount);
      
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

  // This function simulates what would happen after a successful Plaid Link flow
  const simulatePlaidLinkFlow = async (linkToken: string, amount: string) => {
    try {
      // For demo purposes, we'll simulate getting these values from the Plaid Link flow
      const mockPublicToken = "public-sandbox-" + Math.random().toString(36).substring(2, 15);
      const mockAccountId = "account-sandbox-" + Math.random().toString(36).substring(2, 15);
      
      // Step 2: Exchange the public token for an access token
      const exchangeResponse = await apiRequest("POST", "/api/plaid/exchange", {
        publicToken: mockPublicToken
      });
      
      if (!exchangeResponse.ok) {
        throw new Error("Failed to exchange public token");
      }
      
      const { accessToken } = await exchangeResponse.json();
      
      // Step 3: Initiate transfer with the access token and account ID
      const transferResponse = await apiRequest("POST", "/api/plaid/transfer", {
        accessToken,
        accountId: mockAccountId,
        amount: parseFloat(amount)
      });
      
      if (!transferResponse.ok) {
        throw new Error("Failed to initiate transfer");
      }
      
      // Step 4: Show success message
      toast({
        title: "Deposit Initiated",
        description: `$${parseFloat(amount).toFixed(2)} will be transferred from your bank account. This process typically takes 1-3 business days.`,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error in Plaid flow:", error);
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