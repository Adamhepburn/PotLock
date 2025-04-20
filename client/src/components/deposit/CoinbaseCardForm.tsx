import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2 } from "lucide-react";

interface CoinbaseCardFormProps {
  disabled: boolean;
  onSubmit: () => void;
}

export default function CoinbaseCardForm({ disabled, onSubmit }: CoinbaseCardFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and format with spaces every 4 digits
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted.substring(0, 19)); // Max 16 digits + 3 spaces
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format as MM/YY
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 2) {
      setExpiryDate(value);
    } else {
      setExpiryDate(`${value.substring(0, 2)}/${value.substring(2, 4)}`);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow 3-4 digits
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value.substring(0, 4));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would validate the card details and call an API
    // For our mock implementation, we'll just simulate a successful card payment
    setIsSubmitting(true);
    
    // Trigger the deposit process
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 2000);
  };

  const isFormValid = cardNumber.replace(/\s/g, '').length >= 16 && 
                      cardName.length > 0 && 
                      expiryDate.length >= 4 && 
                      cvv.length >= 3;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card-number">Card Number</Label>
        <Input
          id="card-number"
          placeholder="4111 1111 1111 1111"
          value={cardNumber}
          onChange={handleCardNumberChange}
          disabled={disabled || isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-name">Name on Card</Label>
        <Input
          id="card-name"
          placeholder="John Doe"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          disabled={disabled || isSubmitting}
          required
        />
      </div>

      <div className="flex gap-4">
        <div className="space-y-2 flex-1">
          <Label htmlFor="expiry-date">Expiry Date</Label>
          <Input
            id="expiry-date"
            placeholder="MM/YY"
            value={expiryDate}
            onChange={handleExpiryDateChange}
            disabled={disabled || isSubmitting}
            required
          />
        </div>
        
        <div className="space-y-2 flex-1">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            placeholder="123"
            value={cvv}
            onChange={handleCvvChange}
            disabled={disabled || isSubmitting}
            required
            type="password"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={disabled || isSubmitting || !isFormValid}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay with Card
          </>
        )}
      </Button>
      
      <div className="text-center">
        <small className="text-muted-foreground">
          Processed securely via Coinbase
        </small>
      </div>
    </form>
  );
}