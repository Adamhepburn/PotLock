import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWeb3 } from "@/hooks/use-web3";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LightbulbIcon, TrendingUp, Clock, PiggyBank, ShieldCheck } from "lucide-react";
import { ethers } from "ethers";
import { useAuth } from "@/hooks/use-auth";

interface StakingModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  contractAddress: string;
  duration?: string; // Optional duration like "7 days" or "until next game"
}

export function StakingModalEnhanced({ 
  open, 
  onOpenChange, 
  amount, 
  contractAddress,
  duration = "until next game"
}: StakingModalEnhancedProps) {
  const { isConnected, getContract, address } = useWeb3();
  const { user, devMode } = useAuth();
  const { toast } = useToast();
  const [isStaking, setIsStaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [stakingAmount, setStakingAmount] = useState(amount);
  
  const handleStake = async () => {
    if (!isConnected && !devMode) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first to use the investment feature.",
        variant: "destructive",
      });
      return;
    }

    const amountValue = parseFloat(stakingAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to invest.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsStaking(true);
      
      // In dev mode, simulate success without making actual blockchain calls
      if (devMode) {
        // Simulate blockchain delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsStaking(false);
        setIsSuccess(true);
        return;
      }
      
      // Get contract instance
      const contract = getContract(contractAddress);
      if (!contract) {
        throw new Error("Failed to get contract instance");
      }
      
      // Convert amount to wei (with 6 decimals for USDC)
      const amountInWei = ethers.parseUnits(stakingAmount, 6);
      
      // Call stakeInAave function on the contract
      const tx = await contract.stakeInAave(amountInWei);
      await tx.wait();
      
      setIsStaking(false);
      setIsSuccess(true);
      
    } catch (error: any) {
      console.error("Investment error:", error);
      setIsStaking(false);
      toast({
        title: "Investment failed",
        description: error.message || "Failed to invest funds. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleClose = () => {
    if (isSuccess) {
      toast({
        title: "Investment successful",
        description: `You've successfully invested ${stakingAmount} USDC to earn ~3% APY.`,
      });
    }
    onOpenChange(false);
    
    // Reset the modal state after closing
    setTimeout(() => {
      setIsSuccess(false);
      setStakingAmount(amount);
    }, 300);
  };
  
  const apy = 3; // Current APY percentage
  const estimatedReturn = (parseFloat(stakingAmount || "0") * (apy / 100)).toFixed(2);
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Earn {apy}% on Your Funds</span>
              </DialogTitle>
              <DialogDescription>
                Invest your idle funds {duration} and earn interest while you wait.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount to Invest (USDC)</Label>
                <Input
                  id="amount"
                  value={stakingAmount}
                  onChange={(e) => setStakingAmount(e.target.value)}
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  disabled={isStaking}
                />
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Estimated return: {estimatedReturn} USDC per year
                </p>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-md">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <LightbulbIcon className="h-4 w-4 text-primary" />
                  How it works:
                </h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <PiggyBank className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Your funds earn approximately {apy}% yearly interest</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Access your money anytime - no lock-up period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Completely secure with industry-leading protection</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-secondary/20 p-3 rounded-md text-sm">
                <p className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Interest accrues every minute and is automatically added to your balance.</span>
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isStaking}>
                Maybe Later
              </Button>
              <Button onClick={handleStake} disabled={isStaking}>
                {isStaking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Start Earning"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Success state
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-center">
              Investment Successful!
            </h3>
            <p className="text-center text-muted-foreground">
              Your {stakingAmount} USDC is now earning {apy}% APY. You can withdraw anytime.
            </p>
            
            <div className="bg-muted p-4 rounded-md w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Amount invested:</span>
                <span className="font-medium">{stakingAmount} USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Est. yearly earnings:</span>
                <span className="font-medium text-primary">{estimatedReturn} USDC</span>
              </div>
            </div>
            
            <Button onClick={handleClose} className="mt-4 w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default StakingModalEnhanced;