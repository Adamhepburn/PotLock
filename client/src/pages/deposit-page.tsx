import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CreditCard, Building, Wallet, Shield, TrendingUp, DollarSign } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PlaidLinkButton from "@/components/deposit/PlaidLinkButton";

export default function DepositPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isConnected, connectWallet, disconnectWallet, address, isConnecting } = useWeb3();
  const [depositMethod, setDepositMethod] = useState<"bank" | "card" | "wallet">("bank");
  const [amount, setAmount] = useState<string>("");
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [isProcessingCoinbase, setIsProcessingCoinbase] = useState(false);
  
  const handleCreditCardPayment = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than $0.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessingCard(true);
      
      // In a real implementation, we would:
      // 1. Get payment methods from Coinbase
      // 2. Let the user select or add a card
      // 3. Process the payment with the selected method
      
      // For now, we'll simulate the process with a mock payment method
      const mockPaymentMethod = "pm_card_" + Math.random().toString(36).substring(2, 15);
      
      // Call our coinbase/buy API endpoint
      const response = await apiRequest("POST", "/api/coinbase/buy", {
        amount: parseFloat(amount),
        paymentMethod: mockPaymentMethod
      });
      
      if (!response.ok) {
        throw new Error("Failed to process payment");
      }
      
      // Process successful
      toast({
        title: "Deposit Successful",
        description: `$${parseFloat(amount).toFixed(2)} has been added to your account.`,
      });
      
    } catch (error) {
      console.error("Error processing credit card payment:", error);
      toast({
        title: "Payment Failed",
        description: "There was a problem processing your payment. Please try again or use a different method.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingCard(false);
    }
  };
  
  const handleCoinbaseDeposit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than $0.",
        variant: "destructive"
      });
      return;
    }
    
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Coinbase Wallet first.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessingCoinbase(true);
      
      // Call our deposit API endpoint to deposit directly from wallet
      const response = await apiRequest("POST", "/api/deposit", {
        amount: parseFloat(amount)
      });
      
      if (!response.ok) {
        throw new Error("Failed to process deposit");
      }
      
      // Process successful
      toast({
        title: "Deposit Successful",
        description: `$${parseFloat(amount).toFixed(2)} has been added to your account.`,
      });
      
    } catch (error) {
      console.error("Error processing Coinbase deposit:", error);
      toast({
        title: "Deposit Failed",
        description: "There was a problem processing your deposit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingCoinbase(false);
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
          <h1 className="text-xl font-bold">Add Funds</h1>
        </div>
      </div>

      <div className="container max-w-xl mx-auto px-4 py-8">
        <div className="neumorphic-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Deposit Funds</h2>
          <p className="text-gray-600 mb-6">
            Choose your preferred method to add funds to your PotLock account.
          </p>

          <Tabs defaultValue="bank" className="w-full" onValueChange={(value) => setDepositMethod(value as any)}>
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
            
            {/* Bank Account */}
            <TabsContent value="bank">
              <div className="neumorphic-inset p-6 rounded-xl mb-6">
                <div className="flex items-center mb-4">
                  <Building className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-semibold">Link Your Bank Account</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Securely connect your bank account to deposit funds quickly and without fees.
                  We use Plaid to ensure your banking information stays safe and secure.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="neumorphic p-4 rounded-lg">
                    <div className="flex items-center text-sm mb-2">
                      <Shield className="h-4 w-4 text-green-500 mr-2" />
                      <span className="font-medium">Bank-level Security</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Your banking credentials are never stored on our servers.
                    </p>
                  </div>
                  
                  <div className="neumorphic p-4 rounded-lg">
                    <div className="flex items-center text-sm mb-2">
                      <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                      <span className="font-medium">No Fees for ACH Transfers</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      ACH transfers from your bank are completely free.
                    </p>
                  </div>
                </div>
                
                {/* Bank connection status - For a real app, this would show actual connected bank accounts */}
                <div className="neumorphic-inset p-4 rounded-lg mb-6 bg-white/50">
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                    <span className="text-gray-600 text-sm">No bank accounts connected</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Connect your bank account to start making deposits.
                  </p>
                </div>
                
                <div className="mt-4">
                  <PlaidLinkButton />
                </div>
                
                {/* Deposit form - Would appear after bank connected in a real app */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-medium mb-4">Make a Deposit</h4>
                  <div className="space-y-4 mb-4">
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
                    className="w-full neumorphic-button"
                    disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
                    onClick={() => {
                      // In a real app, this would use a connected bank account
                      toast({
                        title: "Deposit Initiated",
                        description: `$${amount} will be transferred from your bank account. This process typically takes 1-3 business days.`,
                      });
                    }}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Deposit Funds
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Credit Card */}
            <TabsContent value="card">
              <div className="neumorphic-inset p-6 rounded-xl mb-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-semibold">Pay with Credit or Debit Card</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Add funds instantly using your credit or debit card. A small processing fee will apply.
                </p>
                
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
                
                <div className="text-xs text-gray-500 mb-6">
                  <div className="flex justify-between mb-1">
                    <span>Processing Fee (2.9%)</span>
                    <span>${amount ? (parseFloat(amount) * 0.029).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${amount ? (parseFloat(amount) * 1.029).toFixed(2) : '0.00'}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full shadow-lg"
                  style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }}
                  disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
                  onClick={handleCreditCardPayment}
                >
                  {isProcessingCard ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                    </>
                  )}
                </Button>
                
                <div className="flex items-center justify-center mt-4">
                  <div className="flex space-x-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" className="h-6" />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Coinbase Wallet */}
            <TabsContent value="wallet">
              <div className="neumorphic-inset p-6 rounded-xl mb-6">
                <div className="flex items-center mb-4">
                  <Wallet className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-semibold">Connect Coinbase Wallet</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Connect your Coinbase Wallet to deposit funds quickly and securely.
                </p>
                
                <div className={`p-4 mb-6 rounded-lg neumorphic-inset`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${isConnected ? 'bg-green-500' : 'bg-gray-400'} rounded-full mr-2`}></div>
                      <span className={`font-medium ${isConnected ? 'text-green-800' : 'text-gray-800'}`}>
                        {isConnected ? "Connected to Coinbase" : "Not connected"}
                      </span>
                    </div>
                  </div>
                  
                  {isConnected && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="font-mono text-sm break-all text-gray-600">
                        {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : ''}
                      </div>
                    </div>
                  )}
                </div>
                
                {!isConnected ? (
                  <Button 
                    className="w-full shadow-lg"
                    style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }}
                    onClick={connectWallet}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Coinbase
                      </span>
                    )}
                  </Button>
                ) : (
                  <>
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
                      className="w-full shadow-lg mb-4"
                      style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }}
                      disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || isProcessingCoinbase}
                      onClick={handleCoinbaseDeposit}
                    >
                      {isProcessingCoinbase ? (
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
                          Deposit ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full neumorphic-button"
                      onClick={disconnectWallet}
                    >
                      Disconnect Wallet
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Info Section */}
        <div className="neumorphic-card p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Your Funds Earn Interest
          </h3>
          
          <p className="text-gray-600 text-sm mb-4">
            While your money sits in your PotLock account, it automatically earns interest. 
            The current annual percentage yield is approximately 3%.
          </p>
          
          <Button 
            variant="outline" 
            className="w-full neumorphic-button"
            onClick={() => navigate("/about")}
          >
            Learn How It Works
          </Button>
        </div>
      </div>
    </div>
  );
}