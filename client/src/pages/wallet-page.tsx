import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, DollarSign, Wallet, Clock, Info, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import InterestDisplay from "@/components/account/InterestDisplay";
import { formatDistanceToNow } from "date-fns";

export default function WalletPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, devMode } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch user balances
  const { 
    data: balances,
    isLoading: isLoadingBalances
  } = useQuery({
    queryKey: ['/api/balances'],
    queryFn: async () => {
      // In dev mode, return mock data
      if (devMode) {
        return {
          totalBalance: "1500.00",
          idleBalance: "1000.00",
          betBalance: "500.00"
        };
      }
      const res = await fetch(`/api/balances?walletAddress=${user?.walletAddress}`);
      if (!res.ok) throw new Error('Failed to fetch balances');
      return await res.json();
    },
    enabled: !!user?.walletAddress
  });
  
  // Mock transaction history for development
  const mockTransactions = [
    { 
      id: 1, 
      type: 'deposit', 
      amount: 500.00, 
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago 
      description: 'Bank deposit'
    },
    { 
      id: 2, 
      type: 'game', 
      amount: -200.00, 
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      description: 'Game buy-in: Poker Night'
    },
    { 
      id: 3, 
      type: 'game', 
      amount: 350.00, 
      date: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
      description: 'Game winnings: Poker Night'
    },
    { 
      id: 4, 
      type: 'interest', 
      amount: 1.25, 
      date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      description: 'Interest earned'
    }
  ];
  
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  };
  
  return (
    <div className="min-h-screen bg-app-background pb-20">
      <div className="bg-app-background border-b border-gray-200 p-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="neumorphic-button mr-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
          <h1 className="text-xl font-bold">My Account</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Card className="neumorphic-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                  <h2 className="text-3xl font-bold">
                    {isLoadingBalances ? (
                      <div className="h-9 w-36 animate-pulse bg-gray-200 rounded"></div>
                    ) : (
                      formatCurrency(balances?.totalBalance || 0)
                    )}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="neumorphic-button" 
                    onClick={() => navigate("/deposit")}
                  >
                    <ArrowDownRight className="h-4 w-4 mr-2" />
                    Add Funds
                  </Button>
                  <Button 
                    className="neumorphic-button"
                    onClick={() => navigate("/cash-out")}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Cash Out
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="neumorphic-inset p-4 rounded-lg">
                  <div className="flex items-center text-sm mb-1">
                    <Wallet className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Available Balance</span>
                  </div>
                  <p className="text-xl font-semibold">
                    {isLoadingBalances ? (
                      <div className="h-6 w-24 animate-pulse bg-gray-200 rounded"></div>
                    ) : (
                      formatCurrency(balances?.idleBalance || 0)
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Funds not currently in games</p>
                </div>
                
                <div className="neumorphic-inset p-4 rounded-lg">
                  <div className="flex items-center text-sm mb-1">
                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                    <span>In Active Games</span>
                  </div>
                  <p className="text-xl font-semibold">
                    {isLoadingBalances ? (
                      <div className="h-6 w-24 animate-pulse bg-gray-200 rounded"></div>
                    ) : (
                      formatCurrency(balances?.betBalance || 0)
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Funds locked in active games</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <InterestDisplay />
          
          <Card className="neumorphic-card overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              <CardDescription>
                Manage your funds and games
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left h-auto py-3 neumorphic-button"
                  onClick={() => navigate("/deposit")}
                >
                  <div className="flex-shrink-0 mr-3 bg-blue-100 p-2 rounded-full">
                    <ArrowDownRight className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Add Funds</div>
                    <div className="text-xs text-muted-foreground">Deposit using bank, card, or crypto</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left h-auto py-3 neumorphic-button"
                  onClick={() => navigate("/cash-out")}
                >
                  <div className="flex-shrink-0 mr-3 bg-amber-100 p-2 rounded-full">
                    <ArrowUpRight className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-medium">Cash Out</div>
                    <div className="text-xs text-muted-foreground">Withdraw funds to your bank or wallet</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left h-auto py-3 neumorphic-button"
                  onClick={() => navigate("/game-setup")}
                >
                  <div className="flex-shrink-0 mr-3 bg-green-100 p-2 rounded-full">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Create Game</div>
                    <div className="text-xs text-muted-foreground">Start a new poker game with friends</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <TabsList className="neumorphic-card">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="deposits">Deposits</TabsTrigger>
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="interest">Interest</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <Card className="neumorphic-card">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {mockTransactions.map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-3 ${
                            transaction.type === 'deposit' ? 'bg-blue-100' : 
                            transaction.type === 'interest' ? 'bg-green-100' :
                            transaction.amount > 0 ? 'bg-green-100' : 'bg-amber-100'
                          }`}>
                            {transaction.type === 'deposit' ? (
                              <ArrowDownRight className={`h-4 w-4 text-blue-600`} />
                            ) : transaction.type === 'interest' ? (
                              <TrendingUp className={`h-4 w-4 text-green-600`} />
                            ) : transaction.amount > 0 ? (
                              <ArrowDownRight className={`h-4 w-4 text-green-600`} />
                            ) : (
                              <ArrowUpRight className={`h-4 w-4 text-amber-600`} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(transaction.date, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className={`font-medium ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="deposits" className="mt-0">
              <Card className="neumorphic-card">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {mockTransactions
                      .filter(tx => tx.type === 'deposit')
                      .map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between p-4">
                          <div className="flex items-center">
                            <div className="p-2 rounded-full bg-blue-100 mr-3">
                              <ArrowDownRight className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(transaction.date, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className="font-medium text-green-600">
                            +{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))}
                    {!mockTransactions.some(tx => tx.type === 'deposit') && (
                      <div className="p-6 text-center text-muted-foreground">
                        No deposit transactions found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="games" className="mt-0">
              <Card className="neumorphic-card">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {mockTransactions
                      .filter(tx => tx.type === 'game')
                      .map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between p-4">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full mr-3 ${
                              transaction.amount > 0 ? 'bg-green-100' : 'bg-amber-100'
                            }`}>
                              {transaction.amount > 0 ? (
                                <ArrowDownRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(transaction.date, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className={`font-medium ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))}
                    {!mockTransactions.some(tx => tx.type === 'game') && (
                      <div className="p-6 text-center text-muted-foreground">
                        No game transactions found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="interest" className="mt-0">
              <Card className="neumorphic-card">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {mockTransactions
                      .filter(tx => tx.type === 'interest')
                      .map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between p-4">
                          <div className="flex items-center">
                            <div className="p-2 rounded-full bg-green-100 mr-3">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(transaction.date, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className="font-medium text-green-600">
                            +{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))}
                    {!mockTransactions.some(tx => tx.type === 'interest') && (
                      <div className="p-6 text-center text-muted-foreground">
                        No interest transactions found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}