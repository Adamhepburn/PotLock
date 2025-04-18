import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/use-web3";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StakingModal } from "@/components/StakingModal";
import { Switch } from "@/components/ui/switch";

export default function CashOutPage() {
  const { gameId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isConnected } = useWeb3();
  const [chipCount, setChipCount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStakingModalOpen, setIsStakingModalOpen] = useState(false);
  const [enableStaking, setEnableStaking] = useState(false);
  
  // Contracts (would be fetched from config or environment)
  const escrowContractAddress = "0x1234567890123456789012345678901234567890"; // Sample address
  
  // Sample game data (would normally be fetched from API)
  const game = {
    id: Number(gameId),
    name: "Friday Night Poker",
    code: "POKER123",
    buyInAmount: 100,
  };
  
  // Handle cash out submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chipCount) {
      toast({
        title: "Missing information",
        description: "Please enter your chip count",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call for cash out request
    setTimeout(() => {
      toast({
        title: "Cash out request submitted",
        description: "Your request has been sent for approval by other players.",
      });
      setIsSubmitting(false);
      
      // If staking is enabled, open the staking modal after submission
      if (enableStaking) {
        setIsStakingModalOpen(true);
      } else {
        navigate(`/games/${gameId}`);
      }
    }, 1000);
  };
  
  // Toggle staking option
  const handleStakingToggle = (checked: boolean) => {
    if (checked && !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet in the profile page before enabling the earnings feature.",
        variant: "destructive"
      });
      return;
    }
    
    setEnableStaking(checked);
  };

  return (
    <div className="min-h-screen pb-20 flex flex-col">
      <div className="bg-primary text-white p-6">
        <div className="flex items-center">
          <button 
            className="mr-3" 
            onClick={() => navigate(`/games/${gameId}`)}
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">Cash Out</h1>
        </div>
        <div className="text-sm mt-1 opacity-90">
          {game.name}
        </div>
      </div>
      
      <div className="p-6">
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Submit Cash Out Request</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="chipCount">Your Final Chip Count</Label>
                <div className="relative">
                  <Input 
                    id="chipCount"
                    value={chipCount}
                    onChange={(e) => setChipCount(e.target.value)}
                    className="pl-8"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Enter the dollar amount of chips you currently have.
                </p>
              </div>
              
              {/* Staking option */}
              <div className="border border-gray-200 rounded-md p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="staking-toggle" className="font-medium">
                    Keep earning on your funds
                  </Label>
                  <Switch 
                    id="staking-toggle"
                    checked={enableStaking}
                    onCheckedChange={handleStakingToggle}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Earn approximately 5% APY on your funds until your next game. Your money stays accessible anytime.
                </p>
                {enableStaking && (
                  <div className="mt-2 text-sm font-medium text-emerald-600">
                    After cash-out approval, you'll be prompted to start earning.
                  </div>
                )}
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                <h3 className="text-amber-800 font-medium text-sm mb-2">Important</h3>
                <p className="text-sm text-amber-700">
                  Your cash out request will need to be approved by other players in the game. Enter the exact amount to avoid disputes.
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Cash Out Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Info Box */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-gray-800 mb-2">How Cash Out Works</h3>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal pl-4">
              <li>You submit your final chip count for review</li>
              <li>Other players in the game verify your submission</li>
              <li>Once approved, the escrow contract releases your funds</li>
              <li>Funds are transferred to your connected wallet</li>
              {enableStaking && (
                <li className="text-emerald-600 font-medium">
                  Your funds start earning ~5% APY until you need them again
                </li>
              )}
            </ol>
          </CardContent>
        </Card>
      </div>
      
      {/* Staking Modal */}
      <StakingModal
        open={isStakingModalOpen}
        onOpenChange={setIsStakingModalOpen}
        amount={chipCount}
        contractAddress={escrowContractAddress}
      />
      
      {/* Navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-6">
        <Button variant="ghost" onClick={() => navigate("/games")}>Games</Button>
        <Button variant="ghost" onClick={() => navigate("/profile")}>Profile</Button>
      </div>
    </div>
  );
}