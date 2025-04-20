import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWeb3 } from "@/hooks/use-web3";
import { Wallet, Shield, TrendingUp, DollarSign, ArrowLeft } from "lucide-react";

export default function WalletPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isConnected, connectWallet, disconnectWallet, address, isConnecting } = useWeb3();
  const [showInterestDetails, setShowInterestDetails] = useState(false);

  return (
    <div className="min-h-screen bg-app-background pb-20">
      <div className="bg-app-background border-b border-gray-200 p-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="neumorphic-button mr-2"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Account Balance</h1>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Account Balance Card */}
        <div className="neumorphic-card mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">Your Balance</h2>
              <p className="text-sm text-gray-500">Available for games</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary opacity-70" />
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold">$500.00</p>
            <div 
              className="text-xs text-green-700 flex items-center mt-1 cursor-pointer"
              onClick={() => setShowInterestDetails(!showInterestDetails)}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              $50.00 earning 3% APY
              {showInterestDetails ? 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m18 15-6-6-6 6"/></svg> : 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m6 9 6 6 6-6"/></svg>
              }
            </div>
            
            {showInterestDetails && (
              <div className="mt-3 p-3 rounded-md neumorphic-inset text-xs">
                <h4 className="font-medium mb-2 text-sm">Interest Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily:</span>
                    <span className="font-medium text-green-700">+$0.004</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weekly:</span>
                    <span className="font-medium text-green-700">+$0.03</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly:</span>
                    <span className="font-medium text-green-700">+$0.12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yearly (3% APY):</span>
                    <span className="font-medium text-green-700">+$1.50</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                    <span className="text-gray-600">Earned so far:</span>
                    <span className="font-medium text-green-700">+$0.37</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-6">
            <Button 
              className="flex-1 shadow-lg"
              style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }} 
              onClick={() => {
                toast({
                  title: "Coming soon",
                  description: "This feature will be available soon"
                });
              }}
            >
              Add Funds
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 neumorphic-button" 
              onClick={() => {
                toast({
                  title: "Coming soon",
                  description: "This feature will be available soon"
                });
              }}
            >
              Cash Out
            </Button>
          </div>
        </div>
        
        {/* Coinbase Connection Card */}
        <div className="neumorphic-card p-6 mb-6">
          <div className="flex items-center mb-4">
            <Wallet className="w-5 h-5 mr-2 text-primary" />
            <h2 className="text-lg font-semibold">Coinbase Wallet</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Connect your Coinbase wallet for faster withdrawals and deposits
          </p>
          
          <div className={`p-4 mb-4 rounded-lg neumorphic-inset`}>
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
            <div className="space-y-4">
              <div className="neumorphic-inset p-4 rounded-lg">
                <div className="text-sm text-gray-700 mb-3">Benefits of connected wallet:</div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Shield className="h-4 w-4 text-green-500 mr-2" />
                    <span>Secure escrow for game payments</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                    <span>Automatic interest on your balance</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                    <span>Fast withdrawals directly to wallet</span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full neumorphic-button"
                onClick={disconnectWallet}
              >
                Disconnect Wallet
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}