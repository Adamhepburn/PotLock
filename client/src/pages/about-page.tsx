import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Shield, Clock, DollarSign, Lock, PiggyBank, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AboutPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("earning");

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
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold">About PotLock</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-4 text-center">Simplify Poker Game Payments</h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
            PotLock provides a secure and transparent way to manage poker debts between friends, 
            with automatic interest earnings on your funds.
          </p>
        </div>

        <Tabs 
          defaultValue="earning" 
          className="mb-10"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="earning" className="py-3">
              <TrendingUp className="h-4 w-4 mr-2" />
              Earning Interest
            </TabsTrigger>
            <TabsTrigger value="security" className="py-3">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="features" className="py-3">
              <CreditCard className="h-4 w-4 mr-2" />
              Key Features
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="earning" className="space-y-6">
            <Card className="border-0 neumorphic-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <PiggyBank className="h-6 w-6 mr-2 text-blue-500" />
                  How Your Money Earns Interest
                </CardTitle>
                <CardDescription>
                  Your funds automatically earn interest while they're in your PotLock account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3 neumorphic p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="ml-3 font-semibold">Deposit Funds</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Add money to your PotLock account using your bank account, credit card, or Coinbase.
                    </p>
                  </div>
                  
                  <div className="space-y-3 neumorphic p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Lock className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="ml-3 font-semibold">Secure Investment</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your funds are automatically put into a high-yield savings option that provides approximately 3% annual interest.
                    </p>
                  </div>
                  
                  <div className="space-y-3 neumorphic p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="ml-3 font-semibold">Earn Automatically</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Interest accrues every day while your funds are in your account, helping your money grow between games.
                    </p>
                  </div>
                </div>
                
                <div className="p-6 bg-blue-50 rounded-xl">
                  <h3 className="font-semibold mb-2 text-blue-800">How It Works (In Simple Terms)</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    PotLock partners with trusted financial institutions to provide competitive interest rates to our users. 
                    When you deposit money into your PotLock account, it's automatically added to a shared savings pool.
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    This pool is invested in low-risk, high-quality lending markets that typically offer better returns than 
                    traditional bank accounts. Your funds remain liquid and can be withdrawn at any time.
                  </p>
                  <p className="text-sm text-gray-700">
                    Interest is calculated daily and automatically added to your balance. The current annual yield is 
                    approximately 3%, which is significantly higher than most savings accounts.
                  </p>
                </div>

                <Button 
                  className="w-full neumorphic-button"
                  onClick={() => navigate("/deposit")}
                >
                  Start Earning Interest Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 neumorphic-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-blue-500" />
                  Safe & Secure Transactions
                </CardTitle>
                <CardDescription>
                  Your funds and personal information are protected with industry-leading security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3 neumorphic p-4 rounded-lg">
                    <h3 className="font-semibold">Bank-Level Encryption</h3>
                    <p className="text-sm text-gray-600">
                      All sensitive data and transactions are secured with 256-bit encryption, the same technology used by banks.
                    </p>
                  </div>
                  
                  <div className="space-y-3 neumorphic p-4 rounded-lg">
                    <h3 className="font-semibold">Transparent Record-Keeping</h3>
                    <p className="text-sm text-gray-600">
                      Every transaction is recorded and verifiable, providing complete transparency for all game participants.
                    </p>
                  </div>
                  
                  <div className="space-y-3 neumorphic p-4 rounded-lg">
                    <h3 className="font-semibold">Secure Payment Processing</h3>
                    <p className="text-sm text-gray-600">
                      We use trusted payment processors like Plaid and Coinbase to ensure your financial data remains safe.
                    </p>
                  </div>
                  
                  <div className="space-y-3 neumorphic p-4 rounded-lg">
                    <h3 className="font-semibold">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account with optional two-factor authentication.
                    </p>
                  </div>
                </div>
                
                <div className="p-6 bg-green-50 rounded-xl">
                  <h3 className="font-semibold mb-2 text-green-800">Your Funds Are Protected</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    PotLock partners with regulated financial institutions to ensure your funds are held securely. 
                    The investment pool is diversified across multiple high-quality lending markets to minimize risk.
                  </p>
                  <p className="text-sm text-gray-700">
                    Even though we offer higher interest rates than traditional banks, we maintain strict risk management 
                    protocols to prioritize the safety of your funds. Your money is always available for withdrawal.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-6">
            <Card className="border-0 neumorphic-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <CreditCard className="h-6 w-6 mr-2 text-blue-500" />
                  Key Features
                </CardTitle>
                <CardDescription>
                  Discover what makes PotLock the best solution for poker game payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3 neumorphic p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="ml-3 font-semibold">Interest Bearing</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your funds automatically earn approximately 3% annual interest while in your account.
                    </p>
                  </div>
                  
                  <div className="space-y-3 neumorphic p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="ml-3 font-semibold">Instant Payouts</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Cash out instantly at the end of games with no waiting period for transfers.
                    </p>
                  </div>
                  
                  <div className="space-y-3 neumorphic p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="ml-3 font-semibold">Dispute Resolution</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Built-in mechanisms for resolving payment disputes fairly and transparently.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 mt-4">
                  <h3 className="font-semibold text-lg">Additional Features</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Game Invitations</p>
                        <p className="text-xs text-gray-500">Invite friends to games with automatic buy-in tracking</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Game History</p>
                        <p className="text-xs text-gray-500">Track your poker performance over time</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Multiple Payment Methods</p>
                        <p className="text-xs text-gray-500">Bank account, credit card, and Coinbase support</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Friend System</p>
                        <p className="text-xs text-gray-500">Connect with poker buddies for easy game organization</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full neumorphic-button"
                  onClick={() => navigate("/")}
                >
                  Get Started Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-10">
          <h3 className="text-xl font-semibold mb-4">Ready to simplify your poker games?</h3>
          <div className="flex justify-center space-x-4">
            <Button 
              className="neumorphic-button shadow-lg"
              style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }}
              onClick={() => navigate("/deposit")}
            >
              Add Funds
            </Button>
            <Button 
              variant="outline"
              className="neumorphic-button"
              onClick={() => navigate("/game-setup")}
            >
              Set Up a Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}