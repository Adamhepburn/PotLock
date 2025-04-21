import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, CreditCard, Building, Wallet, Shield, TrendingUp, 
  DollarSign, Loader2, Copy, CheckCircle, AlertCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PlaidLinkButton from "@/components/deposit/PlaidLinkButton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function DepositPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, devMode } = useAuth();
  const [depositMethod, setDepositMethod] = useState<"bank" | "card" | "crypto">("bank");
  const [amount, setAmount] = useState<string>("");
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Get crypto deposit address
  const { 
    data: depositAddress,
    isLoading: isLoadingAddress,
    isError: isAddressError,
    refetch: refetchAddress
  } = useQuery({
    queryKey: ['/api/deposit/address'],
    queryFn: async () => {
      // In dev mode, return a mock deposit address
      if (devMode) {
        return {
          id: `mock-${user?.id}-${Date.now()}`,
          address: '0x7e1E393CeE9d3Ef545fC7EE6B01b6dEDdA7AF58D',
          network: 'base',
          uri: 'ethereum:0x7e1E393CeE9d3Ef545fC7EE6B01b6dEDdA7AF58D?token=USDC'
        };
      }
      
      const res = await apiRequest("GET", "/api/deposit/address");
      if (!res.ok) throw new Error('Failed to get deposit address');
      return await res.json();
    },
    enabled: depositMethod === 'crypto' && !!user
  });
  
  // Mutation for credit card payment
  const cardPaymentMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/coinbase/buy", {
        amount,
        paymentMethod: "card" // Server-side will handle getting a real payment method
      });
      if (!response.ok) {
        throw new Error("Failed to process payment");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Deposit Initiated",
        description: `Your deposit of $${parseFloat(amount).toFixed(2)} is being processed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Failed",
        description: error.message || "There was a problem processing your payment. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleCreditCardPayment = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than $0.",
        variant: "destructive"
      });
      return;
    }
    
    cardPaymentMutation.mutate(parseFloat(amount));
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setIsCopied(true);
        toast({
          title: "Address Copied",
          description: "Deposit address copied to clipboard",
        });
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Copy Failed",
          description: "Failed to copy address to clipboard",
          variant: "destructive"
        });
      }
    );
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
              <TabsTrigger value="crypto" className="neumorphic-button data-[state=active]:shadow-inner">
                <Wallet className="h-4 w-4 mr-2" />
                Crypto
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
            
            {/* Crypto Deposit */}
            <TabsContent value="crypto">
              <div className="neumorphic-inset p-6 rounded-xl mb-6">
                <div className="flex items-center mb-4">
                  <Wallet className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-semibold">Deposit with Cryptocurrency</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Deposit cryptocurrency directly to your PotLock account. We accept USDC on the Base network.
                </p>
                
                {isLoadingAddress ? (
                  <div className="neumorphic-inset p-6 rounded-lg flex items-center justify-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-500" />
                    <span>Generating deposit address...</span>
                  </div>
                ) : isAddressError ? (
                  <div className="neumorphic-inset p-6 rounded-lg">
                    <div className="flex items-center text-red-500 mb-4">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Error generating deposit address</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      We couldn't generate a deposit address at this time. Please try again later.
                    </p>
                    <Button 
                      variant="outline"
                      className="w-full neumorphic-button"
                      onClick={() => refetchAddress()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : depositAddress ? (
                  <div className="space-y-6">
                    <div className="neumorphic-inset p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Your USDC Deposit Address</h4>
                      <div className="bg-white/50 p-3 rounded-md font-mono text-xs break-all mb-3">
                        {depositAddress.address}
                      </div>
                      <div className="flex justify-between">
                        <div className="text-xs text-gray-500">Network: <span className="font-medium">Base</span></div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs flex items-center text-blue-500 hover:text-blue-700"
                          onClick={() => copyToClipboard(depositAddress.address)}
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Address
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="neumorphic-inset p-4 rounded-lg space-y-2">
                      <div className="flex items-center text-sm">
                        <Shield className="h-4 w-4 text-green-500 mr-2" />
                        <span className="font-medium">Important</span>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-2 pl-6 list-disc">
                        <li>Only send USDC on the Base network to this address</li>
                        <li>Sending any other cryptocurrency may result in permanent loss</li>
                        <li>Minimum deposit: $5.00 worth of USDC</li>
                        <li>Funds typically arrive within 10-30 minutes</li>
                      </ul>
                    </div>
                    
                    <div className="neumorphic p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Transaction Status</h4>
                      <div className="flex items-center mb-3">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                        <span className="text-gray-600 text-sm">Waiting for deposit</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Your balance will update automatically once your deposit is confirmed.
                      </p>
                    </div>
                  </div>
                ) : null}
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