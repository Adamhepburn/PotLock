import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building, Link, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlaidLinkButtonProps {
  amount: string;
  onSuccess?: (publicToken: string, metadata: any) => void;
}

export default function PlaidLinkButton({ amount, onSuccess }: PlaidLinkButtonProps) {
  const { toast } = useToast();
  const [isLinking, setIsLinking] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  
  // This would use the actual Plaid Link in a production app
  // For now, we'll simulate the process
  const handleOpenPlaidLink = async () => {
    setIsLinking(true);
    
    try {
      // Simulate API call to create a link token
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful bank connection
      setIsLinked(true);
      toast({
        title: "Bank account connected",
        description: "Your bank account has been successfully linked",
      });
      
      // Simulate deposit completion
      setTimeout(() => {
        toast({
          title: "Deposit initiated",
          description: `$${amount} deposit from your bank account is being processed`,
        });
      }, 1000);
      
      // Call onSuccess callback with mock data
      onSuccess?.("mock-public-token", {
        institution: {
          name: "Chase",
          institution_id: "ins_123",
        },
        accounts: [
          {
            id: "acc_123",
            name: "Checking Account",
            mask: "1234",
            type: "depository",
            subtype: "checking",
          }
        ],
      });
      
    } catch (error: any) {
      console.error("Error linking bank:", error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect your bank account",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };
  
  return (
    <Button
      variant={isLinked ? "outline" : "default"}
      className="w-full"
      onClick={handleOpenPlaidLink}
      disabled={isLinking || isLinked}
    >
      {isLinking ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : isLinked ? (
        <>
          <Building className="mr-2 h-4 w-4 text-green-600" />
          Connected to Chase •••• 1234
        </>
      ) : (
        <>
          <Link className="mr-2 h-4 w-4" />
          Connect Bank Account
        </>
      )}
    </Button>
  );
}