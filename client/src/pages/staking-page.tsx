import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useWeb3 } from "@/hooks/use-web3";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ethers } from "ethers";
import { ArrowDown, ArrowUp, Info, TrendingUp, Clock } from "lucide-react";

export default function StakingPage() {
  const [, navigate] = useLocation();
  const { isConnected, getContract, address } = useWeb3();
  const { toast } = useToast();
  
  // State for staking functionality
  const [stakedBalance, setStakedBalance] = useState("0");
  const [earnedYield, setEarnedYield] = useState("0");
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Contracts (would be fetched from config or environment)
  const escrowContractAddress = "0x1234567890123456789012345678901234567890"; // Sample address
  
  // Fetch user's staking data
  useEffect(() => {
    const fetchStakingData = async () => {
      if (!isConnected || !address) return;
      
      try {
        const contract = getContract(escrowContractAddress);
        if (!contract) return;
        
        // Get staked balance
        const balance = await contract.getUserStakedBalance(address);
        setStakedBalance(ethers.formatUnits(balance, 6)); // USDC has 6 decimals
        
        // Get estimated yield
        const yield_ = await contract.getUserYield(address);
        setEarnedYield(ethers.formatUnits(yield_, 6));
      } catch (error) {
        console.error("Error fetching staking data:", error);
      }
    };
    
    fetchStakingData();
    // Refresh data every 60 seconds
    const interval = setInterval(fetchStakingData, 60000);
    
    return () => clearInterval(interval);
  }, [isConnected, address, getContract]);
  
  // Handle staking
  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first to use the staking feature.",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to stake.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const contract = getContract(escrowContractAddress);
      if (!contract) {
        throw new Error("Failed to get contract instance");
      }
      
      // Convert amount to wei (with 6 decimals for USDC)
      const amountInWei = ethers.parseUnits(stakeAmount, 6);
      
      // Call stakeInAave function on the contract
      const tx = await contract.stakeInAave(amountInWei);
      await tx.wait();
      
      toast({
        title: "Staking successful",
        description: `You've successfully staked ${stakeAmount} USDC to earn ~5% APY.`,
      });
      
      // Reset input and refresh data
      setStakeAmount("");
      
      // Refresh staking data
      const balance = await contract.getUserStakedBalance(address);
      setStakedBalance(ethers.formatUnits(balance, 6));
      
      const yield_ = await contract.getUserYield(address);
      setEarnedYield(ethers.formatUnits(yield_, 6));
    } catch (error: any) {
      console.error("Staking error:", error);
      toast({
        title: "Staking failed",
        description: error.message || "Failed to stake funds. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle unstaking
  const handleUnstake = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first to use the staking feature.",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(unstakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to unstake.",
        variant: "destructive",
      });
      return;
    }
    
    if (amount > parseFloat(stakedBalance)) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough staked funds to withdraw this amount.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const contract = getContract(escrowContractAddress);
      if (!contract) {
        throw new Error("Failed to get contract instance");
      }
      
      // Convert amount to wei (with 6 decimals for USDC)
      const amountInWei = ethers.parseUnits(unstakeAmount, 6);
      
      // Call unstakeFromAave function on the contract
      const tx = await contract.unstakeFromAave(amountInWei);
      await tx.wait();
      
      toast({
        title: "Unstaking successful",
        description: `You've successfully withdrawn ${unstakeAmount} USDC from the staking pool.`,
      });
      
      // Reset input and refresh data
      setUnstakeAmount("");
      
      // Refresh staking data
      const balance = await contract.getUserStakedBalance(address);
      setStakedBalance(ethers.formatUnits(balance, 6));
      
      const yield_ = await contract.getUserYield(address);
      setEarnedYield(ethers.formatUnits(yield_, 6));
    } catch (error: any) {
      console.error("Unstaking error:", error);
      toast({
        title: "Unstaking failed",
        description: error.message || "Failed to withdraw funds. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle collecting yield
  const handleCollectYield = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first to use the staking feature.",
        variant: "destructive",
      });
      return;
    }
    
    if (parseFloat(earnedYield) <= 0) {
      toast({
        title: "No yield to collect",
        description: "You don't have any yield to collect yet.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const contract = getContract(escrowContractAddress);
      if (!contract) {
        throw new Error("Failed to get contract instance");
      }
      
      // Call collectYield function on the contract
      const tx = await contract.collectYield();
      await tx.wait();
      
      toast({
        title: "Yield collected",
        description: `You've successfully collected ${earnedYield} USDC of yield.`,
      });
      
      // Refresh staking data
      const balance = await contract.getUserStakedBalance(address);
      setStakedBalance(ethers.formatUnits(balance, 6));
      
      setEarnedYield("0");
    } catch (error: any) {
      console.error("Collecting yield error:", error);
      toast({
        title: "Failed to collect yield",
        description: error.message || "Failed to collect yield. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Simulate annual earnings for $100 over time
  const simulatedStakingData = [
    { month: "Initial", amount: 100 },
    { month: "Month 3", amount: 101.25 },
    { month: "Month 6", amount: 102.5 },
    { month: "Month 9", amount: 103.75 },
    { month: "Month 12", amount: 105 },
  ];
  
  return (
    <div className="min-h-screen pb-20 flex flex-col">
      <div className="bg-primary text-white p-6">
        <div className="flex items-center">
          <button 
            className="mr-3" 
            onClick={() => navigate("/profile")}
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">Earn Interest</h1>
        </div>
        <div className="text-sm mt-1 opacity-90">
          Earn ~5% APY on your funds between games
        </div>
      </div>
      
      <div className="p-6">
        {!isConnected ? (
          <Card className="mb-6">
            <CardContent className="p-5 text-center">
              <h2 className="text-lg font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-sm text-gray-600 mb-4">
                Connect your wallet in the profile page to access the earning feature.
              </p>
              <Button onClick={() => navigate("/profile")}>
                Go to Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Your Earnings</CardTitle>
                  <CardDescription>
                    Funds invested in Aave's lending pool on Base
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Staked</span>
                        <span className="font-medium">{parseFloat(stakedBalance).toFixed(2)} USDC</span>
                      </div>
                      <Progress value={parseFloat(stakedBalance) > 0 ? 100 : 0} />
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-md space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-green-800 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Earnings to Date
                        </span>
                        <span className="font-bold text-green-800">{parseFloat(earnedYield).toFixed(4)} USDC</span>
                      </div>
                      <div className="text-xs text-green-700">
                        Approximately 5% APY paid continuously
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium mb-2">Simulated Growth (for $100 invested)</h3>
                      <div className="space-y-2">
                        {simulatedStakingData.map((data, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-500">{data.month}</span>
                            <span className="font-medium">${data.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("deposit")}>
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Deposit More
                  </Button>
                  <Button onClick={handleCollectYield} disabled={isProcessing || parseFloat(earnedYield) <= 0}>
                    {isProcessing ? "Processing..." : "Collect Earnings"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex">
                      <Info className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                      <span className="text-sm">
                        Your funds are invested in Aave's lending pool on the Base network
                      </span>
                    </li>
                    <li className="flex">
                      <TrendingUp className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                      <span className="text-sm">
                        Earn approximately 5% APY on your USDC, with earnings accruing continuously
                      </span>
                    </li>
                    <li className="flex">
                      <Clock className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                      <span className="text-sm">
                        Your funds remain accessible at any time with no lock-up periods or penalties
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="deposit">
              <Card>
                <CardHeader>
                  <CardTitle>Deposit Funds</CardTitle>
                  <CardDescription>
                    Add more funds to start earning ~5% APY
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStake} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stakeAmount">Amount (USDC)</Label>
                      <div className="relative">
                        <Input
                          id="stakeAmount"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          type="number"
                          step="0.01"
                          placeholder="100.00"
                          className="pl-8"
                          disabled={isProcessing}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <div className="flex justify-between mb-1">
                        <span>Current Balance</span>
                        <span>{parseFloat(stakedBalance).toFixed(2)} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Yield Rate</span>
                        <span className="text-green-600">~5% APY</span>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isProcessing}>
                      {isProcessing ? "Processing..." : "Deposit and Start Earning"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="withdraw">
              <Card>
                <CardHeader>
                  <CardTitle>Withdraw Funds</CardTitle>
                  <CardDescription>
                    Access your funds anytime without penalties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUnstake} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="unstakeAmount">Amount (USDC)</Label>
                      <div className="relative">
                        <Input
                          id="unstakeAmount"
                          value={unstakeAmount}
                          onChange={(e) => setUnstakeAmount(e.target.value)}
                          type="number"
                          step="0.01"
                          placeholder="100.00"
                          className="pl-8"
                          disabled={isProcessing}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <div className="flex justify-between mb-1">
                        <span>Available to Withdraw</span>
                        <span>{parseFloat(stakedBalance).toFixed(2)} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Earnings to Date</span>
                        <span className="text-green-600">{parseFloat(earnedYield).toFixed(4)} USDC</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => setUnstakeAmount(parseFloat(stakedBalance).toString())}
                        disabled={isProcessing}
                      >
                        Max
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1" 
                        disabled={isProcessing || parseFloat(stakedBalance) <= 0}
                      >
                        {isProcessing ? "Processing..." : "Withdraw"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      {/* Navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-6">
        <Button variant="ghost" onClick={() => navigate("/games")}>Games</Button>
        <Button variant="ghost" onClick={() => navigate("/profile")}>Profile</Button>
      </div>
    </div>
  );
}