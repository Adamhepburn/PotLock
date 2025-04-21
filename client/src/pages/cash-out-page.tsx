import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Building, Wallet, DollarSign, Shield, 
  Clock, AlertTriangle, ChevronRight, CheckCircle, Loader2, BanknoteIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import logos
import coinbaseLogoSrc from "@/assets/coinbase-logo.svg";
import baseLogoSrc from "@/assets/base-logo.svg";
import usdcLogoSrc from "@/assets/usdc-logo.svg";

type WithdrawalMethod = "bank" | "card" | "crypto";

export default function CashOutPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, devMode } = useAuth();
  const [withdrawalMethod, setWithdrawalMethod] = useState<WithdrawalMethod | null>(null);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [withdrawalReference, setWithdrawalReference] = useState("");
  const [withdrawalStatus, setWithdrawalStatus] = useState<"pending" | "processing" | "completed" | "failed">("pending");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [selectedBank, setSelectedBank] = useState({ name: "Chase Bank", accountNumber: "****6789", connected: true });
  const [selectedCard, setSelectedCard] = useState({ name: "Visa ending in 4242", connected: true });
  
  // Get user's current balance
  const { data: userBalance = 0 } = useQuery({
    queryKey: ['/api/user/balance'],
    queryFn: async () => {
      if (devMode) {
        // Mock balance for development
        return 1240.50;
      }
      
      const res = await apiRequest("GET", "/api/user/balance");
      if (!res.ok) throw new Error('Failed to fetch balance');
      const data = await res.json();
      return data.balance;
    }
  });
  
  // Withdrawal mutation
  const withdrawalMutation = useMutation({
    mutationFn: async ({ amount, method, destination }: { amount: number, method: string, destination?: string }) => {
      // In development mode, simulate a withdrawal response
      if (devMode) {
        return {
          success: true,
          amount,
          fee: method === "card" ? amount * 0.029 : 0,
          reference: `WD-${Date.now().toString().substring(5)}`,
          status: "processing",
          estimatedArrival: method === "crypto" ? "Instant" : method === "card" ? "1-2 days" : "2-3 business days"
        };
      }
      
      const response = await apiRequest("POST", "/api/withdraw", {
        amount,
        method,
        destination
      });
      
      if (!response.ok) {
        throw new Error("Failed to process withdrawal");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Set withdrawal reference and status
      setWithdrawalReference(data.reference);
      setWithdrawalStatus("processing");
      
      // Show success dialog
      setShowSuccessDialog(true);
      
      // Update user balance in the cache
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      
      // Close the processing dialog
      setShowConfirmDialog(false);
      setIsProcessing(false);
    },
    onError: (error: Error) => {
      console.error("Error processing withdrawal:", error);
      setIsProcessing(false);
      setShowConfirmDialog(false);
      
      toast({
        title: "Withdrawal Failed",
        description: error.message || "There was a problem processing your withdrawal. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleCashOut = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than $0.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if amount is greater than the user's balance
    if (parseFloat(amount) > userBalance) {
      toast({
        title: "Insufficient Funds",
        description: `You only have $${userBalance.toFixed(2)} available for withdrawal.`,
        variant: "destructive"
      });
      return;
    }
    
    // Show confirmation dialog
    setShowConfirmDialog(true);
  };
  
  const confirmWithdrawal = () => {
    setIsProcessing(true);
    
    let destination;
    if (withdrawalMethod === "crypto") {
      destination = destinationAddress;
    }
    
    withdrawalMutation.mutate({
      amount: parseFloat(amount),
      method: withdrawalMethod || "bank",
      destination
    });
  };

  // If no withdrawal method is selected, show the method selection screen
  const renderMethodSelection = () => {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Withdraw Funds</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Choose your preferred withdrawal method
          </p>
        </div>

        <div className="space-y-4">
          {/* Bank Account Option */}
          <button
            className="w-full p-6 flex items-center bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            onClick={() => setWithdrawalMethod("bank")}
          >
            <div className="bg-blue-50 rounded-full p-3 mr-4">
              <Building className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-lg">Bank Account</h3>
              <p className="text-gray-500 text-sm">Funds arrive in 1-3 business days</p>
              <div className="mt-1 flex items-center text-xs text-blue-600">
                <Shield className="h-3 w-3 mr-1" />
                <span>No fees</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          {/* Credit Card Option */}
          <button
            className="w-full p-6 flex items-center bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            onClick={() => setWithdrawalMethod("card")}
          >
            <div className="bg-blue-50 rounded-full p-3 mr-4">
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-lg">Credit Card</h3>
              <p className="text-gray-500 text-sm">Funds arrive in 24 hours</p>
              <div className="mt-1 flex items-center text-xs text-amber-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>2.9% fee applies</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          {/* Crypto Option */}
          <button
            className="w-full p-6 flex items-center bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            onClick={() => setWithdrawalMethod("crypto")}
          >
            <div className="bg-blue-50 rounded-full p-3 mr-4">
              <div className="relative">
                <img src={coinbaseLogoSrc} alt="Coinbase" className="h-8 w-8" />
              </div>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-lg">Coinbase</h3>
              <p className="text-gray-500 text-sm">Instant withdrawal to your wallet</p>
              <div className="mt-1 flex items-center text-xs text-blue-600">
                <Clock className="h-3 w-3 mr-1" />
                <span>Network fee applies</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    );
  };

  // Render withdrawal form once method is selected
  const renderWithdrawalForm = () => {
    // Common withdrawal form elements
    const renderAmountInput = () => (
      <div className="space-y-2 mb-6">
        <label className="block text-sm font-medium">Amount to withdraw</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-lg">$</span>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-3 border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500">USD</span>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Available: ${userBalance.toFixed(2)}</span>
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => setAmount(userBalance.toString())}
          >
            Max
          </button>
        </div>
      </div>
    );

    const renderFeeInfo = () => {
      if (withdrawalMethod === "card") {
        const amount = parseFloat(amount || "0");
        const fee = amount * 0.029;
        const total = amount - fee;
        
        return (
          <div className="bg-amber-50 rounded-lg p-3 mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Amount:</span>
              <span>${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Fee (2.9%):</span>
              <span>-${fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>You'll receive:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        );
      }
      
      return null;
    };

    const formTitle = 
      withdrawalMethod === "bank" ? "Withdraw to Bank Account" :
      withdrawalMethod === "card" ? "Withdraw to Credit Card" :
      "Withdraw to Coinbase";
    
    const formIcon = 
      withdrawalMethod === "bank" ? <Building className="h-6 w-6 text-blue-500" /> :
      withdrawalMethod === "card" ? <CreditCard className="h-6 w-6 text-blue-500" /> :
      <img src={coinbaseLogoSrc} alt="Coinbase" className="h-6 w-6" />;
    
    return (
      <div>
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4 text-gray-500 hover:text-gray-700"
            onClick={() => setWithdrawalMethod(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to withdrawal methods
          </Button>
          
          <div className="flex items-center mb-4">
            <div className="mr-3">
              {formIcon}
            </div>
            <h2 className="text-xl font-semibold">{formTitle}</h2>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          {/* Amount Input */}
          {renderAmountInput()}
          
          {/* Fee breakdown if applicable */}
          {renderFeeInfo()}
          
          {/* Destination address for crypto */}
          {withdrawalMethod === "crypto" && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Coinbase Email or USDC Address</label>
              <input
                type="text"
                className="block w-full px-3 py-3 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email or wallet address"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
              />
            </div>
          )}
          
          {/* Submit Button */}
          <Button
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white"
            disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || 
              (withdrawalMethod === "crypto" && !destinationAddress) ||
              isProcessing}
            onClick={handleCashOut}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <BanknoteIcon className="h-4 w-4 mr-2" />
                {`Withdraw $${amount ? parseFloat(amount).toFixed(2) : '0.00'}`}
              </span>
            )}
          </Button>
        </div>
        
        {/* Additional information */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-md font-medium mb-3">Important Information</h3>
          <div className="space-y-3 text-sm text-gray-600">
            {withdrawalMethod === "bank" && (
              <>
                <div className="flex items-start">
                  <Clock className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Bank withdrawals typically take 1-3 business days to complete.</span>
                </div>
                <div className="flex items-start">
                  <Shield className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>There are no fees for standard bank withdrawals.</span>
                </div>
              </>
            )}
            
            {withdrawalMethod === "card" && (
              <>
                <div className="flex items-start">
                  <Clock className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Card withdrawals typically process within 24 hours.</span>
                </div>
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>A 2.9% processing fee applies to all card withdrawals.</span>
                </div>
              </>
            )}
            
            {withdrawalMethod === "crypto" && (
              <>
                <div className="flex items-start">
                  <Clock className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Crypto withdrawals are typically processed instantly.</span>
                </div>
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Network fees apply and vary based on blockchain congestion.</span>
                </div>
              </>
            )}
            
            <div className="flex items-start">
              <Shield className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>The minimum withdrawal amount is $10.00.</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Confirmation dialog
  const renderConfirmationDialog = () => (
    <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Withdrawal</DialogTitle>
          <DialogDescription>
            Please review your withdrawal details before proceeding.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Method:</span>
            <span className="font-medium">
              {withdrawalMethod === "bank" ? "Bank Account" : 
               withdrawalMethod === "card" ? "Credit Card" : 
               "Coinbase"}
            </span>
          </div>
          
          {withdrawalMethod === "card" && (
            <div className="flex justify-between text-amber-600">
              <span>Fee (2.9%):</span>
              <span>-${(parseFloat(amount) * 0.029).toFixed(2)}</span>
            </div>
          )}
          
          {withdrawalMethod === "crypto" && (
            <div className="flex justify-between">
              <span className="text-gray-600">Destination:</span>
              <span className="font-medium">{destinationAddress}</span>
            </div>
          )}
          
          <div className="flex justify-between font-semibold">
            <span>You will receive:</span>
            <span>
              ${withdrawalMethod === "card" 
                ? (parseFloat(amount) - parseFloat(amount) * 0.029).toFixed(2) 
                : parseFloat(amount).toFixed(2)}
            </span>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md flex items-start">
            <Clock className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {withdrawalMethod === "crypto" 
                ? "Funds will typically arrive in your wallet instantly."
                : withdrawalMethod === "card"
                ? "Funds will typically arrive within 24 hours."
                : "Funds will typically arrive in 1-3 business days."}
            </span>
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:space-x-2">
          <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={confirmWithdrawal}
            disabled={isProcessing}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Processing...
              </span>
            ) : (
              <span>Confirm Withdrawal</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Success dialog
  const renderSuccessDialog = () => (
    <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-green-600">
            <CheckCircle className="mr-2 h-5 w-5" />
            Withdrawal Initiated
          </DialogTitle>
          <DialogDescription>
            Your withdrawal request has been successfully processed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Reference:</span>
            <span className="font-medium">{withdrawalReference}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="text-amber-600 font-medium">Processing</span>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md flex items-start">
            <Clock className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {withdrawalMethod === "crypto" 
                ? "Funds will typically arrive in your wallet instantly."
                : withdrawalMethod === "card"
                ? "Funds will typically arrive within 24 hours."
                : "Funds will typically arrive in 1-3 business days."}
            </span>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => {
              setShowSuccessDialog(false);
              setWithdrawalMethod(null);
              setAmount("");
              navigate("/wallet");
            }}
            className="w-full bg-blue-500 text-white hover:bg-blue-600"
          >
            Return to Wallet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="flex items-center max-w-5xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/wallet")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Wallet
          </Button>
          <h1 className="text-xl font-semibold">Withdraw Funds</h1>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6">
        {withdrawalMethod === null ? renderMethodSelection() : renderWithdrawalForm()}
      </div>
      
      {renderConfirmationDialog()}
      {renderSuccessDialog()}
    </div>
  );
}