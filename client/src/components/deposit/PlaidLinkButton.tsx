import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlaidLinkButtonProps {
  disabled: boolean;
  onSuccess: () => void;
}

export default function PlaidLinkButton({ disabled, onSuccess }: PlaidLinkButtonProps) {
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();

  const handleOpenPlaidLink = () => {
    if (disabled) return;
    
    setIsLinking(true);
    
    // In a real implementation, this would use the Plaid Link SDK to open the bank selection UI
    // This is a mock implementation that simulates a successful bank account link
    setTimeout(() => {
      toast({
        title: "Bank Account Linked",
        description: "Your bank account has been successfully linked.",
      });
      setIsLinking(false);
      
      // Trigger the deposit process
      onSuccess();
    }, 3000);
  };

  return (
    <Button 
      className="w-full" 
      variant="outline" 
      size="lg"
      disabled={disabled || isLinking}
      onClick={handleOpenPlaidLink}
    >
      {isLinking ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Linking Bank...
        </>
      ) : (
        <>
          <Building2 className="mr-2 h-4 w-4" />
          Link Bank Account
        </>
      )}
    </Button>
  );
}