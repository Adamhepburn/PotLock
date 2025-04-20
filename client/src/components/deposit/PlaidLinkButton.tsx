import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Building } from "lucide-react";

interface PlaidLinkButtonProps {
  amount?: string;
}

export default function PlaidLinkButton({ amount }: PlaidLinkButtonProps) {
  const { toast } = useToast();

  const handlePlaidLink = async () => {
    // Normally this would open Plaid Link, but we'll use a toast notification for now
    toast({
      title: "Bank Account Linking",
      description: "Plaid integration is coming soon. This would normally open the Plaid Link interface.",
    });
  };

  return (
    <Button
      className="w-full shadow-lg"
      style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }}
      onClick={handlePlaidLink}
    >
      <Building className="h-4 w-4 mr-2" />
      Link Bank Account
    </Button>
  );
}