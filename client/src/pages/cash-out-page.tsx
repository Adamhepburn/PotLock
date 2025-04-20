import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CreditCard, Building, Wallet, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CashOutPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [withdrawMethod, setWithdrawMethod] = useState<"bank" | "card" | "wallet">("bank");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCashOut = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than $0.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Call our withdraw API endpoint
      const response = await apiRequest("POST", "/api/withdraw", {
        amount: parseFloat(amount),
        destinationAddress: "user-destination-address" // In a real app, we would get this from user input or profile
      });
      
      if (!response.ok) {
        throw new Error("Failed to process withdrawal");
      }
      
      // Process successful
      toast({
        title: "Withdrawal Successful",
        description: `$${parseFloat(amount).toFixed(2)} has been withdrawn from your account.`,
      });
      
      // Navigate to wallet page
      setTimeout(() => {
        navigate("/wallet");
      }, 2000);
      
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Withdrawal Failed",
        description: "There was a problem processing your withdrawal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-background pb-20">
      <div className="bg-app-background border-b border-gray-200 p-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="neumorphic-button mr-2"
            onClick={() => navigate("/wallet")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Account
          </Button>
          <h1 className="text-xl font-bold">Withdraw Funds</h1>
        </div>
      </div>

      <div className="container max-w-xl mx-auto px-4 py-8">
        <div className="neumorphic-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Cash Out</h2>
          <p className="text-gray-600 mb-6">
            Choose your preferred method to withdraw funds from your PotLock account.
          </p>

          <Tabs defaultValue="bank" className="w-full" onValueChange={(value) => setWithdrawMethod(value as any)}>
            <TabsList className="neumorphic-card p-1 mb-6 w-full grid grid-cols-3">
              <TabsTrigger value="bank" className="neumorphic-button data-[state=active]:shadow-inner">
                <Building className="h-4 w-4 mr-2" />
                Bank Account
              </TabsTrigger>
              <TabsTrigger value="card" className="neumorphic-button data-[state=active]:shadow-inner">
                <CreditCard className="h-4 w-4 mr-2" />
                Credit Card
              </TabsTrigger>
              <TabsTrigger value="wallet" className="neumorphic-button data-[state=active]:shadow-inner">
                <Wallet className="h-4 w-4 mr-2" />
                Coinbase
              </TabsTrigger>
            </TabsList>
            
            {/* Common content for all tabs */}
            <TabsContent value="bank" className="focus:outline-none">
              <div className="neumorphic-inset p-6 rounded-xl mb-6">
                <div className="flex items-center mb-4">
                  <Building className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-semibold">Withdraw to Bank Account</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Withdraw funds to your connected bank account. Funds typically arrive within 1-3 business days.
                </p>
                
                {/* Amount Input */}
                <div className="space-y-4 mb-6">
                  <div className="neumorphic-inset p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Amount</label>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">$</span>
                        <input 
                          type="text" 
                          className="w-24 p-2 rounded-md outline-none bg-transparent text-right" 
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full shadow-lg"
                  style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }}
                  disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || isProcessing}
                  onClick={handleCashOut}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Withdraw ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="card" className="focus:outline-none">
              <div className="neumorphic-inset p-6 rounded-xl mb-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-semibold">Withdraw to Credit Card</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Withdraw funds directly to your connected credit card. Funds typically arrive within 24 hours.
                </p>
                
                {/* Amount Input */}
                <div className="space-y-4 mb-6">
                  <div className="neumorphic-inset p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Amount</label>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">$</span>
                        <input 
                          type="text" 
                          className="w-24 p-2 rounded-md outline-none bg-transparent text-right" 
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full shadow-lg"
                  style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }}
                  disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || isProcessing}
                  onClick={handleCashOut}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Withdraw ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="wallet" className="focus:outline-none">
              <div className="neumorphic-inset p-6 rounded-xl mb-6">
                <div className="flex items-center mb-4">
                  <Wallet className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-semibold">Withdraw to Coinbase</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Withdraw funds directly to your Coinbase account. Funds typically arrive instantly.
                </p>
                
                {/* Amount Input */}
                <div className="space-y-4 mb-6">
                  <div className="neumorphic-inset p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Amount</label>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">$</span>
                        <input 
                          type="text" 
                          className="w-24 p-2 rounded-md outline-none bg-transparent text-right" 
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full shadow-lg"
                  style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }}
                  disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || isProcessing}
                  onClick={handleCashOut}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Withdraw ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="neumorphic-card p-6">
          <h3 className="font-semibold mb-4">Important Information</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mt-0.5 mr-2">i</span>
              Withdrawals typically take 1-3 business days to appear in your bank account.
            </li>
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mt-0.5 mr-2">i</span>
              There are no fees for standard withdrawals.
            </li>
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mt-0.5 mr-2">i</span>
              The minimum withdrawal amount is $10.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}