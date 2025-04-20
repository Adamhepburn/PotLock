import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PiggyBank, Wallet, TrendingUp, CreditCard, ArrowDownToLine, Loader2 } from "lucide-react";
import DepositModal from "@/components/deposit/DepositModal";
import WithdrawModal from "@/components/withdrawal/WithdrawModal";
import StakingModalEnhanced from "@/components/staking/StakingModalEnhanced";

interface BalanceCardProps {
  totalBalance?: number;
  stakedAmount?: number;
  inGameAmount?: number;
  availableAmount?: number;
  apy?: number;
  contractAddress?: string;
  isLoading?: boolean;
}

export default function BalanceCard({
  totalBalance = 100, // Default mock balance
  stakedAmount = 50,
  inGameAmount = 0,
  availableAmount = 50,
  apy = 3,
  contractAddress = "0x1234567890abcdef1234567890abcdef12345678",
  isLoading = false
}: BalanceCardProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isStakingModalOpen, setIsStakingModalOpen] = useState(false);

  // Calculate percentage of total balance that is staked
  const stakedPercentage = totalBalance > 0 ? Math.round((stakedAmount / totalBalance) * 100) : 0;
  
  // Calculate yearly earnings based on staked amount and APY
  const yearlyEarnings = stakedAmount * (apy / 100);
  
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-primary" />
            Your Balance
          </CardTitle>
          <CardDescription>
            Manage your funds and investments
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading balance information...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{totalBalance.toFixed(2)} USDC</h3>
                <span className="text-muted-foreground">${totalBalance.toFixed(2)} USD</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-muted rounded-md p-3">
                  <div className="flex items-center text-primary mb-1">
                    <PiggyBank className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Earning {apy}% APY</span>
                  </div>
                  <p className="text-lg font-medium">{stakedAmount.toFixed(2)} USDC</p>
                  <p className="text-xs text-muted-foreground">
                    +{yearlyEarnings.toFixed(2)} USDC/year
                  </p>
                </div>
                
                {inGameAmount > 0 && (
                  <div className="bg-muted rounded-md p-3">
                    <div className="flex items-center text-amber-500 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
                      </svg>
                      <span className="text-xs font-medium">In Game</span>
                    </div>
                    <p className="text-lg font-medium">{inGameAmount.toFixed(2)} USDC</p>
                    <p className="text-xs text-muted-foreground">
                      Active bets
                    </p>
                  </div>
                )}
                
                <div className="bg-muted rounded-md p-3">
                  <div className="flex items-center text-green-500 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.5h.375c.621 0 1.125.504 1.125 1.125 0 .621-.504 1.125-1.125 1.125h-.375m4.5-2.25h.375c.621 0 1.125.504 1.125 1.125 0 .621-.504 1.125-1.125 1.125h-.375m-7.5 0h.375c.621 0 1.125.504 1.125 1.125 0 .621-.504 1.125-1.125 1.125h-.375m10.5-10.5h.375c.621 0 1.125.504 1.125 1.125 0 .621-.504 1.125-1.125 1.125h-.375M10.5 8.25h.375c.621 0 1.125.504 1.125 1.125 0 .621-.504 1.125-1.125 1.125h-.375M7.5 12h.375c.621 0 1.125.504 1.125 1.125 0 .621-.504 1.125-1.125 1.125h-.375M13.5 12h.375c.621 0 1.125.504 1.125 1.125 0 .621-.504 1.125-1.125 1.125h-.375m-7.5 3h.375c.621 0 1.125.504 1.125 1.125 0 .621-.504 1.125-1.125 1.125h-.375m10.5-3h.375c.621 0 1.125.504 1.125 1.125 0 .621-.504 1.125-1.125 1.125h-.375" />
                    </svg>
                    <span className="text-xs font-medium">Available</span>
                  </div>
                  <p className="text-lg font-medium">{availableAmount.toFixed(2)} USDC</p>
                  <p className="text-xs text-muted-foreground">
                    Ready to use
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Tabs defaultValue="actions" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="actions">Quick Actions</TabsTrigger>
                    <TabsTrigger value="history">Transaction History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="actions" className="py-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => setIsDepositModalOpen(true)}
                        className="flex items-center gap-2 h-auto py-3"
                      >
                        <CreditCard className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <span>Add Funds</span>
                          <span className="text-xs font-normal">Deposit USD</span>
                        </div>
                      </Button>
                      
                      <Button 
                        onClick={() => setIsWithdrawModalOpen(true)}
                        variant="outline"
                        className="flex items-center gap-2 h-auto py-3"
                        disabled={availableAmount <= 0}
                      >
                        <ArrowDownToLine className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <span>Withdraw</span>
                          <span className="text-xs font-normal">To bank or wallet</span>
                        </div>
                      </Button>
                      
                      {availableAmount > 0 && (
                        <Button 
                          onClick={() => setIsStakingModalOpen(true)}
                          variant="secondary"
                          className="flex items-center gap-2 h-auto py-3 col-span-2"
                        >
                          <TrendingUp className="h-4 w-4" />
                          <div className="flex flex-col items-start">
                            <span>Start Earning {apy}% APY</span>
                            <span className="text-xs font-normal">on {availableAmount.toFixed(2)} USDC</span>
                          </div>
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="py-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 border-b text-sm">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-primary" />
                          <span>Deposit</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">+50 USDC</div>
                          <div className="text-xs text-muted-foreground">2 days ago</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 border-b text-sm">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span>Interest earned</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">+0.02 USDC</div>
                          <div className="text-xs text-muted-foreground">3 days ago</div>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        View All Transactions
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Modals */}
      <DepositModal
        open={isDepositModalOpen}
        onOpenChange={setIsDepositModalOpen}
      />
      
      <WithdrawModal
        open={isWithdrawModalOpen}
        onOpenChange={setIsWithdrawModalOpen}
        availableBalance={availableAmount}
      />
      
      <StakingModalEnhanced
        open={isStakingModalOpen}
        onOpenChange={setIsStakingModalOpen}
        amount={availableAmount.toString()}
        contractAddress={contractAddress}
      />
    </>
  );
}