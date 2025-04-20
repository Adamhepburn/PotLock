import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, TrendingUp, Shield, Clock, DollarSign, Lock, 
  PiggyBank, CreditCard, Landmark, Zap, RefreshCw 
} from "lucide-react";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Accordion, AccordionContent, 
  AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";

export default function AboutPage() {
  const [, navigate] = useLocation();

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

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            The Smart Way to Manage Your Poker Games
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            PotLock provides a secure, transparent platform for managing poker games and payments,
            with automatic interest earnings while your funds sit in your account.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          <Card className="neumorphic-card border-0">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Earn Interest</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your funds automatically earn interest (~5% APY) between games through Aave's lending pools
                on the Base network.
              </p>
            </CardContent>
          </Card>

          <Card className="neumorphic-card border-0">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Safe & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All funds are securely stored with blockchain technology. Transactions are transparent
                and verifiable by all players.
              </p>
            </CardContent>
          </Card>

          <Card className="neumorphic-card border-0">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <PiggyBank className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Easy Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Connect your bank account, use a credit card, or Coinbase wallet for a seamless deposit
                experience with no technical knowledge needed.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">How PotLock Works</h2>
          
          <div className="neumorphic-card p-6 border-0 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Landmark className="h-5 w-5 mr-2 text-blue-500" />
                  Earning Interest with Aave
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  When you deposit funds into PotLock, they don't just sit idle - your money works for you!
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5 mr-2">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Your deposits are automatically converted to USDC (a US dollar-pegged stablecoin)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5 mr-2">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Funds are then deposited into Aave lending pools on the Base network</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5 mr-2">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>You earn approximately 5% APY - much higher than traditional savings accounts</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5 mr-2">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Your funds remain 100% liquid and available for withdrawal at any time</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-500" />
                  What is Aave?
                </h3>
                <p className="text-gray-600 mb-3 text-sm">
                  Aave is one of the largest and most secure lending protocols in the world. It allows people to:
                </p>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-0.5 mr-2">
                      <span className="text-xs">1</span>
                    </div>
                    <span>Deposit money and earn interest (this is what PotLock does with your funds)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-0.5 mr-2">
                      <span className="text-xs">2</span>
                    </div>
                    <span>Borrow money using their crypto assets as collateral</span>
                  </li>
                </ul>
                <p className="text-gray-600 text-sm">
                  The interest you earn comes from borrowers paying to access the liquidity pool. Aave protocols 
                  have handled over $100 billion in transactions across multiple blockchain networks.
                </p>
              </div>
            </div>
          </div>

          <div className="neumorphic-card p-6 border-0">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2 text-blue-500" />
                  Game Flow Explained
                </h3>
                <div className="relative">
                  <div className="absolute left-2.5 top-0 h-full w-0.5 bg-blue-100"></div>
                  <div className="space-y-8 relative">
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-0 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">1</div>
                      <h4 className="font-medium mb-1 text-gray-800">Create a Game</h4>
                      <p className="text-sm text-gray-600">Set up a game, specify buy-in amount, and invite friends to join.</p>
                    </div>
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-0 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">2</div>
                      <h4 className="font-medium mb-1 text-gray-800">Players Join & Deposit</h4>
                      <p className="text-sm text-gray-600">Players deposit funds into PotLock for the buy-in amount, which immediately starts earning interest.</p>
                    </div>
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-0 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">3</div>
                      <h4 className="font-medium mb-1 text-gray-800">Play Your Game</h4>
                      <p className="text-sm text-gray-600">Enjoy your poker game! PotLock tracks chip counts throughout the game.</p>
                    </div>
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-0 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">4</div>
                      <h4 className="font-medium mb-1 text-gray-800">Cash Out</h4>
                      <p className="text-sm text-gray-600">When a player is ready to leave, they submit their final chip count. Other players verify the amount.</p>
                    </div>
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-0 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">5</div>
                      <h4 className="font-medium mb-1 text-gray-800">Withdraw Funds</h4>
                      <p className="text-sm text-gray-600">Players can withdraw their winnings to a bank account, credit card, or Coinbase wallet.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-500" />
                  Security & Transparency
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  PotLock combines traditional security with blockchain transparency to create the most secure poker payment platform available.
                </p>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-0 mb-4 neumorphic p-3 rounded-lg">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline">
                      How are my funds secured?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600">
                      Your funds are secured through a combination of smart contracts on the Base network and Coinbase's security infrastructure. All transactions are recorded on the blockchain, creating an immutable record that can't be altered or deleted.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2" className="border-0 mb-4 neumorphic p-3 rounded-lg">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline">
                      What is the Base network?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600">
                      Base is a secure, low-cost Ethereum Layer 2 blockchain developed by Coinbase. It offers faster transactions and lower fees than Ethereum while maintaining the same level of security. PotLock uses Base for its reliability and Coinbase integration.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3" className="border-0 mb-4 neumorphic p-3 rounded-lg">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline">
                      How are disputes handled?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600">
                      PotLock includes a built-in dispute resolution system. When a player requests to cash out, other players must approve the chip count. If there's a disagreement, players can counter with what they believe is the correct amount, and the majority decision prevails.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4" className="border-0 neumorphic p-3 rounded-lg">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline">
                      Can I verify my transactions?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600">
                      Yes! Every transaction in PotLock is recorded on the Base blockchain and can be verified using a block explorer. This creates complete transparency for all poker game participants, ensuring fair play and accurate payouts.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6 text-center">Ready to Transform Your Poker Games?</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="shadow-lg"
              style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }}
              onClick={() => navigate("/deposit")}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
            <Button 
              variant="outline"
              className="neumorphic-button"
              onClick={() => navigate("/game-setup")}
            >
              <Clock className="h-4 w-4 mr-2" />
              Create a Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}