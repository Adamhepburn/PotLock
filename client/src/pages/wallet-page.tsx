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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white mr-2 hover:bg-white/20"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Wallet</h1>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Wallet Connection
            </CardTitle>
            <CardDescription>
              Connect your wallet to use the platform's full features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`p-4 mb-4 rounded-lg ${isConnected ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 ${isConnected ? 'bg-green-500' : 'bg-gray-400'} rounded-full mr-2`}></div>
                  <span className={`font-medium ${isConnected ? 'text-green-800' : 'text-gray-800'}`}>
                    {isConnected ? "Connected to Coinbase Wallet" : "Not connected"}
                  </span>
                </div>
              </div>
              
              {isConnected && (
                <div className="mt-2 pt-2 border-t border-green-100">
                  <div className="font-mono text-sm break-all text-gray-600">
                    {address}
                  </div>
                </div>
              )}
            </div>
            
            {!isConnected ? (
              <Button 
                className="w-full bg-blue-700 hover:bg-blue-800 text-white"
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
                  "Connect Coinbase Wallet"
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Features available with wallet:</div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Shield className="h-4 w-4 text-green-500 mr-2" />
                      <span>Secure escrow for game payments</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                      <span>Earn ~5% APY on idle funds via Aave</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                      <span>Fast and transparent cash-outs</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={disconnectWallet}
                >
                  Disconnect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}