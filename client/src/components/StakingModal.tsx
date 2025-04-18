import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWeb3 } from "@/hooks/use-web3";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";

interface StakingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  contractAddress: string;
}

export function StakingModal({ open, onOpenChange, amount, contractAddress }: StakingModalProps) {
  const { isConnected, getContract, address } = useWeb3();
  const { toast } = useToast();
  const [isStaking, setIsStaking] = useState(false);
  const [stakingAmount, setStakingAmount] = useState(amount);
  
  const handleStake = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first to use the staking feature.",
        variant: "destructive",
      });
      return;
    }

    const amountValue = parseFloat(stakingAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to stake.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsStaking(true);
      
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
      
      toast({
        title: "Staking successful",
        description: `You've successfully staked ${stakingAmount} USDC to earn ~5% APY.`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Staking error:", error);
      toast({
        title: "Staking failed",
        description: error.message || "Failed to stake funds. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStaking(false);
    }
  };
  
  const handleWithdraw = () => {
    // This would be implemented to withdraw funds or handle user decline
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Keep Earning on Your Funds</DialogTitle>
          <DialogDescription>
            Earn approximately 5% APY on your USDC until your next game. Your funds remain accessible anytime.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input
              id="amount"
              value={stakingAmount}
              onChange={(e) => setStakingAmount(e.target.value)}
              type="number"
              step="0.01"
              placeholder="100.00"
              disabled={isStaking}
            />
            <p className="text-sm text-muted-foreground">
              Estimated return: ~{(parseFloat(stakingAmount || "0") * 0.05).toFixed(2)} USDC per year
            </p>
          </div>
          
          <div className="bg-primary/5 p-4 rounded-md">
            <h4 className="font-medium text-sm mb-2">How it works:</h4>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>Your funds are invested in the Aave lending pool on Base</li>
              <li>Earn approximately 5% APY on your USDC</li>
              <li>Withdraw anytime with no penalty</li>
              <li>Completely secure and transparent</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleWithdraw} disabled={isStaking}>
            Withdraw Now
          </Button>
          <Button onClick={handleStake} disabled={isStaking}>
            {isStaking ? "Processing..." : "Start Earning"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}