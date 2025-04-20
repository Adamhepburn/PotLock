import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp,
  ArrowRight,
  Check,
  Loader2,
  DollarSign,
  InfoIcon,
  PiggyBank
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/use-web3";

interface StakingModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  contractAddress: string;
  duration?: string; // Optional duration like "7 days" or "until next game"
}

export default function StakingModalEnhanced({
  open,
  onOpenChange,
  amount,
  contractAddress,
  duration = "unlimited"
}: StakingModalEnhancedProps) {
  const { toast } = useToast();
  const { isConnected, address, sendTransaction } = useWeb3();
  const [stakeAmount, setStakeAmount] = useState<string>(amount);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number>(50);
  
  // Mock APY that would come from a smart contract or API
  const APY = 3.5;
  
  const resetForm = () => {
    setStakeAmount(amount);
    setIsProcessing(false);
    setIsSuccess(false);
    setSliderValue(50);
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
    
    // Don't allow amount greater than available amount
    if (parseFloat(value) > parseFloat(amount)) {
      setStakeAmount(amount);
      return;
    }
    
    setStakeAmount(value);
  };
  
  const handleSliderChange = (value: number[]) => {
    const percentage = value[0];
    setSliderValue(percentage);
    
    // Calculate amount based on percentage
    const calculatedAmount = (parseFloat(amount) * percentage / 100).toFixed(2);
    setStakeAmount(calculatedAmount);
  };
  
  const handleMaxButtonClick = () => {
    setStakeAmount(amount);
    setSliderValue(100);
  };
  
  // Calculate earnings based on APY and amount
  const calculateEarnings = (principal: number, apy: number, timeInYears: number) => {
    return principal * (Math.pow(1 + apy / 100, timeInYears) - 1);
  };
  
  const dailyEarnings = calculateEarnings(parseFloat(stakeAmount) || 0, APY, 1/365);
  const weeklyEarnings = calculateEarnings(parseFloat(stakeAmount) || 0, APY, 7/365);
  const monthlyEarnings = calculateEarnings(parseFloat(stakeAmount) || 0, APY, 30/365);
  const yearlyEarnings = calculateEarnings(parseFloat(stakeAmount) || 0, APY, 1);
  
  const validate = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to stake",
        variant: "destructive",
      });
      return false;
    }
    
    if (parseFloat(stakeAmount) > parseFloat(amount)) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough available funds to stake this amount",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate API call to stake funds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setIsSuccess(true);
      
      toast({
        title: "Funds staked successfully",
        description: `$${stakeAmount} is now earning ${APY}% APY`,
      });
      
      // Close modal after showing success state
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 2000);
    } catch (error: any) {
      console.error("Error staking funds:", error);
      toast({
        title: "Staking failed",
        description: error.message || "An error occurred while staking your funds",
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
          <DialogTitle className="flex items-center">
            <PiggyBank className="mr-2 h-5 w-5 text-primary" />
            Earn While You Wait
          </DialogTitle>
          <DialogDescription>
            Put your idle funds to work and earn {APY}% APY interest on your deposit.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="py-6 flex flex-col items-center justify-center text-center mt-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Funds Staked!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ${stakeAmount} is now earning {APY}% APY
            </p>
            <div className="bg-muted p-3 rounded-md text-sm mb-4 text-left">
              <p>Expected earnings:</p>
              <p className="text-xs text-muted-foreground mt-1">
                ~${yearlyEarnings.toFixed(2)} per year
              </p>
            </div>
            <Button variant="outline" onClick={() => {
              onOpenChange(false);
              resetForm();
            }}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="stake-amount">Amount to Earn With (USDC)</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs" 
                    onClick={handleMaxButtonClick}
                  >
                    Max
                  </Button>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="stake-amount"
                    placeholder="0.00"
                    className="pl-10"
                    value={stakeAmount}
                    onChange={handleAmountChange}
                    disabled={isProcessing}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Available: ${amount} USDC
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Amount Slider</Label>
                <Slider
                  defaultValue={[50]}
                  max={100}
                  step={1}
                  value={[sliderValue]}
                  onValueChange={handleSliderChange}
                  disabled={isProcessing}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-md space-y-3">
                <h4 className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  Estimated Earnings at {APY}% APY
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-background p-2 rounded-md">
                    <p className="text-xs text-muted-foreground">Daily</p>
                    <p className="text-sm font-medium">${dailyEarnings.toFixed(4)}</p>
                  </div>
                  <div className="bg-background p-2 rounded-md">
                    <p className="text-xs text-muted-foreground">Weekly</p>
                    <p className="text-sm font-medium">${weeklyEarnings.toFixed(3)}</p>
                  </div>
                  <div className="bg-background p-2 rounded-md">
                    <p className="text-xs text-muted-foreground">Monthly</p>
                    <p className="text-sm font-medium">${monthlyEarnings.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-start">
                  <InfoIcon className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  Funds can be withdrawn at any time without penalties
                </p>
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button
                type="submit"
                className="w-full"
                onClick={handleSubmit}
                disabled={isProcessing || parseFloat(stakeAmount || "0") <= 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Start Earning {APY}% APY <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}