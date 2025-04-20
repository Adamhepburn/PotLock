import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, Eye, EyeOff, Percent, Wallet } from "lucide-react";
import DepositModal from "@/components/deposit/DepositModal";
import WithdrawModal from "@/components/withdrawal/WithdrawModal";
import { useWeb3 } from "@/hooks/use-web3";

interface BalanceCardProps {
  availableBalance: number;
  totalBalance: number;
  inBets?: number;
  earningInterest?: number;
  apy?: number;
}

export default function BalanceCard({
  availableBalance = 500,
  totalBalance = 500,
  inBets = 0,
  earningInterest = 0,
  apy = 3
}: BalanceCardProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const { isConnected, connectWallet } = useWeb3();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
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
            {earningInterest > 0 ? (
              <div className="flex items-center">
                Your balance <span className="flex items-center ml-1 text-green-600 text-xs">
                  <Percent className="h-3 w-3 mr-0.5" />{apy}% APY on {formatCurrency(earningInterest)}
                </span>
              </div>
            ) : "Your available balance"}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="mt-1 mb-3">
              <span className="text-2xl font-bold text-gray-800">
                {isHidden ? "••••••" : formatCurrency(totalBalance)}
              </span>
              {inBets > 0 && (
                <div className="text-sm text-gray-500 mt-1">
                  {formatCurrency(inBets)} in active bets
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1 primary-action-button"
              size="sm"
              onClick={() => setDepositModalOpen(true)}
            >
              Add Funds
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 neumorphic-button" 
              size="sm"
              onClick={() => setWithdrawModalOpen(true)}
            >
              Cash Out
            </Button>
          </div>
          
          {!isConnected && (
            <Button
              variant="outline"
              className="w-full neumorphic-button flex items-center justify-center gap-2 mt-2"
              onClick={connectWallet}
            >
              <Wallet className="h-4 w-4" />
              Connect Coinbase
            </Button>
          )}
        </div>
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