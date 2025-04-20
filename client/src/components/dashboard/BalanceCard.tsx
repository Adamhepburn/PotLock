import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, Eye, EyeOff } from "lucide-react";
import DepositModal from "@/components/deposit/DepositModal";
import WithdrawModal from "@/components/withdrawal/WithdrawModal";

interface BalanceCardProps {
  availableBalance: number;
  totalBalance: number;
}

export default function BalanceCard({
  availableBalance = 500,
  totalBalance = 500
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
            Your available balance
          </div>
        </div>
        
        <div className="space-y-5">
          <div>
            <div className="mt-1 mb-4">
              <span className="text-2xl font-bold text-gray-800">
                {isHidden ? "••••••" : formatCurrency(totalBalance)}
              </span>
            </div>
          </div>
          
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