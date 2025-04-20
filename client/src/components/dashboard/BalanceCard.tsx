import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, ArrowRight, Eye, EyeOff } from "lucide-react";
import DepositModal from "@/components/deposit/DepositModal";
import WithdrawModal from "@/components/withdrawal/WithdrawModal";

interface BalanceCardProps {
  availableBalance: number;
  stakedBalance: number;
  totalBalance: number;
  onStake?: () => void;
}

export default function BalanceCard({
  availableBalance = 500,
  stakedBalance = 100,
  totalBalance = 600,
  onStake
}: BalanceCardProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  const stakedPercentage = (stakedBalance / totalBalance) * 100;
  
  return (
    <>
      <div className="neumorphic-card w-full p-5">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-lg font-semibold text-gray-800">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              Balance
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 neumorphic-button"
              onClick={() => setIsHidden(!isHidden)}
            >
              {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Your available and staked funds
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Balance</span>
            </div>
            <div className="mt-1 mb-1">
              <span className="text-2xl font-bold text-gray-800">
                {isHidden ? "••••••" : formatCurrency(totalBalance)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="neumorphic-inset p-3 rounded-xl">
              <span className="text-sm text-gray-500">Available</span>
              <p className="font-medium mt-1">
                {isHidden ? "••••••" : formatCurrency(availableBalance)}
              </p>
            </div>
            <div className="neumorphic-inset p-3 rounded-xl">
              <span className="text-sm text-gray-500">Staked (5% APY)</span>
              <p className="font-medium flex items-center mt-1">
                {isHidden ? "••••••" : formatCurrency(stakedBalance)}
                {stakedBalance > 0 && <TrendingUp className="h-3 w-3 ml-1 text-green-500" />}
              </p>
            </div>
          </div>
          
          {stakedBalance > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Staking Allocation</span>
                <span>{Math.round(stakedPercentage)}%</span>
              </div>
              <Progress value={stakedPercentage} className="h-1.5" />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              className="flex-1 neumorphic-button"
              style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }}
              size="sm"
              onClick={() => setDepositModalOpen(true)}
            >
              Deposit
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 neumorphic-button" 
              size="sm"
              onClick={() => setWithdrawModalOpen(true)}
            >
              Withdraw
            </Button>
          </div>
        </div>
        
        {stakedBalance === 0 && (
          <div className="border-t pt-4 mt-4">
            <Button 
              variant="ghost" 
              className="w-full text-sm justify-between neumorphic-button" 
              onClick={onStake}
            >
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                Stake funds to earn 5% APY
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <DepositModal 
        open={depositModalOpen} 
        onOpenChange={setDepositModalOpen} 
      />
      
      <WithdrawModal 
        open={withdrawModalOpen} 
        onOpenChange={setWithdrawModalOpen}
        maxAmount={availableBalance.toString()}
      />
    </>
  );
}