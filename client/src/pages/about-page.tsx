import { useState } from "react";
import { 
  TrendingUp, 
  Shield, 
  RefreshCw, 
  Clock, 
  DollarSign, 
  PiggyBank, 
  Lightbulb, 
  Unlock, 
  Percent,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  const [, navigate] = useLocation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl pt-10 pb-20 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">
          About PotLock
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          PotLock makes poker games simpler and more secure by taking care of 
          the money so you can focus on your game.
        </p>
      </div>

      {/* How it works section */}
      <div className="neumorphic-card p-8 mb-10">
        <div className="flex items-center justify-center mb-8">
          <div className="h-1 flex-1 bg-gradient-to-r from-transparent to-blue-500"></div>
          <h2 className="text-2xl font-bold px-4">How It Works</h2>
          <div className="h-1 flex-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="neumorphic p-6 rounded-xl text-center">
            <div className="bg-blue-50 p-4 rounded-full inline-flex mb-4">
              <PiggyBank className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Add Funds</h3>
            <p className="text-gray-600">
              Deposit money to your account using your bank account or credit card.
            </p>
          </div>

          <div className="neumorphic p-6 rounded-xl text-center">
            <div className="bg-blue-50 p-4 rounded-full inline-flex mb-4">
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Play Games</h3>
            <p className="text-gray-600">
              Create or join poker games and let PotLock handle all the financial transactions.
            </p>
          </div>

          <div className="neumorphic p-6 rounded-xl text-center">
            <div className="bg-blue-50 p-4 rounded-full inline-flex mb-4">
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cash Out</h3>
            <p className="text-gray-600">
              Request payouts anytime and receive funds directly to your bank account.
            </p>
          </div>
        </div>
      </div>

      {/* How does the magic happen */}
      <div className="neumorphic-card p-8 mb-10">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('magic')}
        >
          <div className="flex items-center">
            <Lightbulb className="h-6 w-6 mr-3 text-amber-500" />
            <h2 className="text-2xl font-bold">How Does The Magic Happen?</h2>
          </div>
          {expandedSection === 'magic' ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {expandedSection === 'magic' && (
          <div className="mt-6 space-y-6 text-gray-600">
            <p>
              While your money sits in your PotLock account, we put it to work for you
              through trusted financial channels. Here's how we make your money grow:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="neumorphic-inset p-6 rounded-xl">
                <div className="flex items-start mb-4">
                  <div className="bg-green-50 p-2 rounded-full mr-3">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Diversified Investments</h3>
                    <p className="text-gray-600 text-sm">
                      Your funds are placed in a diversified portfolio of high-quality, 
                      low-risk financial instruments that generate returns while protecting your principal.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="neumorphic-inset p-6 rounded-xl">
                <div className="flex items-start mb-4">
                  <div className="bg-blue-50 p-2 rounded-full mr-3">
                    <Shield className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Security First</h3>
                    <p className="text-gray-600 text-sm">
                      Your funds are protected by bank-level security. We prioritize 
                      safety and stability over high-risk investment strategies.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="neumorphic-inset p-6 rounded-xl">
                <div className="flex items-start mb-4">
                  <div className="bg-purple-50 p-2 rounded-full mr-3">
                    <Percent className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Competitive Yield</h3>
                    <p className="text-gray-600 text-sm">
                      We provide interest rates that outperform traditional savings accounts by accessing 
                      institutional financial products typically unavailable to individual consumers.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="neumorphic-inset p-6 rounded-xl">
                <div className="flex items-start mb-4">
                  <div className="bg-amber-50 p-2 rounded-full mr-3">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Interest Accrues Daily</h3>
                    <p className="text-gray-600 text-sm">
                      Interest is calculated daily and added to your balance regularly, 
                      allowing you to earn money on both your principal deposit and previously earned interest.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-xl">
              <div className="flex items-center mb-4">
                <Unlock className="h-6 w-6 mr-2 text-blue-500" />
                <h3 className="text-xl font-semibold">No Lock-up Periods</h3>
              </div>
              <p>
                Unlike many investment vehicles, your money is never locked away. You can withdraw your 
                funds at any time without penalties, giving you complete control over your money.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* FAQ Section */}
      <div className="neumorphic-card p-8 mb-10">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('faq')}
        >
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          {expandedSection === 'faq' ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {expandedSection === 'faq' && (
          <div className="mt-6 space-y-6">
            <div className="neumorphic-inset p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Is my money safe?</h3>
              <p className="text-gray-600">
                Absolutely! We use bank-level security protocols and partner with trusted financial 
                institutions to ensure your funds are secure at all times.
              </p>
            </div>
            
            <div className="neumorphic-inset p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">How much interest will I earn?</h3>
              <p className="text-gray-600">
                Our current yield is approximately 5% annually, which is significantly higher than 
                traditional savings accounts. This rate may fluctuate based on market conditions.
              </p>
            </div>
            
            <div className="neumorphic-inset p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Can I withdraw my money anytime?</h3>
              <p className="text-gray-600">
                Yes! Your funds remain accessible at all times. There are no lock-up periods or withdrawal penalties.
              </p>
            </div>
            
            <div className="neumorphic-inset p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">How can I track my earnings?</h3>
              <p className="text-gray-600">
                Your account dashboard shows your total balance, including interest earned. 
                You can also view detailed breakdowns of daily, weekly, monthly, and yearly projections.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Benefits section */}
      <div className="neumorphic-card p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="h-1 flex-1 bg-gradient-to-r from-transparent to-blue-500"></div>
          <h2 className="text-2xl font-bold px-4">Why Choose PotLock?</h2>
          <div className="h-1 flex-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="neumorphic p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-3">For Casual Players</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-green-50 p-1 rounded-full mr-2 mt-1">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-600">No need to carry cash to games</span>
              </li>
              <li className="flex items-start">
                <div className="bg-green-50 p-1 rounded-full mr-2 mt-1">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-600">Earn interest on your idle funds</span>
              </li>
              <li className="flex items-start">
                <div className="bg-green-50 p-1 rounded-full mr-2 mt-1">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-600">Track your poker performance over time</span>
              </li>
            </ul>
          </div>
          
          <div className="neumorphic p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-3">For Game Hosts</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-blue-50 p-1 rounded-full mr-2 mt-1">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-gray-600">No more payment collection headaches</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-50 p-1 rounded-full mr-2 mt-1">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-gray-600">Transparent financial tracking</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-50 p-1 rounded-full mr-2 mt-1">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-gray-600">Easier player management and invitations</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center mt-10">
          <Button 
            className="h-14 px-8 text-lg shadow-lg"
            style={{ backgroundColor: "hsl(204, 80%, 63%)", color: "white" }}
            onClick={() => navigate("/wallet")}
          >
            <DollarSign className="h-5 w-5 mr-2" />
            Start Earning Now
          </Button>
        </div>
      </div>
    </div>
  );
}