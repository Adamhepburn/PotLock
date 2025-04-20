import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wallet, PiggyBank, ArrowRight, AlignRight } from "lucide-react";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { 
    user, 
    loginMutation, 
    registerMutation,
    devMode,
    toggleDevMode
  } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState<string>("credentials");
  
  const isLoading = loginMutation.isPending || registerMutation.isPending;
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Handle login form submission
  async function handleCredentialSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (activeTab === "register") {
        // Register
        await registerMutation.mutateAsync({
          username,
          password,
          email,
          displayName: username
        });
        navigate("/dashboard");
      } else {
        // Login
        await loginMutation.mutateAsync({
          username,
          password
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: activeTab === "register" ? "Registration failed" : "Login failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  }

  const handleWalletConnect = () => {
    // In a real implementation, this would connect to Coinbase wallet
    // For our development environment, we'll just use our mock wallet
    toast({
      title: "Wallet connected",
      description: "Connected to wallet successfully"
    });
    setTimeout(() => navigate("/dashboard"), 1000);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Column - Authentication Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/90 rounded-full mb-4">
              <span className="text-white text-2xl">🃏</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              PotLock
            </h1>
            <p className="text-muted-foreground mt-2">
              Secure poker escrow for easy payouts
            </p>
          </div>

          {/* Auth Methods */}
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle>Welcome to PotLock</CardTitle>
              <CardDescription>
                Sign in to manage your poker games and funds
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="wallet" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="wallet" onClick={() => setActiveTab("wallet")}>
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Coinbase Wallet</span>
                  </TabsTrigger>
                  <TabsTrigger value="credentials" onClick={() => setActiveTab("credentials")}>
                    <span>Email & Password</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* Wallet Login */}
                <TabsContent value="wallet" className="space-y-4">
                  <div className="text-center space-y-4">
                    <div className="rounded-full mx-auto w-20 h-20 bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Connect Your Wallet</h3>
                      <p className="text-muted-foreground text-sm">
                        Sign in securely using your Coinbase Wallet
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleWalletConnect} 
                      className="w-full gap-2"
                      size="lg"
                    >
                      <Wallet className="h-4 w-4" />
                      Connect Wallet
                    </Button>
                    
                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Don't have a Coinbase Wallet?
                      </p>
                      <Button variant="link" className="text-sm p-0">
                        Get Coinbase Wallet
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Credentials Login */}
                <TabsContent value="credentials">
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid grid-cols-2 mb-6">
                      <TabsTrigger 
                        value="login" 
                        onClick={() => setActiveTab("login")}
                      >
                        Login
                      </TabsTrigger>
                      <TabsTrigger 
                        value="register" 
                        onClick={() => setActiveTab("register")}
                      >
                        Register
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login">
                      <form onSubmit={handleCredentialSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="your_username"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            "Login"
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="register">
                      <form onSubmit={handleCredentialSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reg-username">Username</Label>
                          <Input
                            id="reg-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="your_username"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="reg-email">Email</Label>
                          <Input
                            id="reg-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="reg-password">Password</Label>
                          <Input
                            id="reg-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
              
              {/* Dev Mode Button */}
              <div className="mt-6 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={toggleDevMode}
                >
                  {devMode ? "Disable" : "Enable"} Developer Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Right Column - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/90 to-primary/70 text-white items-center">
        <div className="max-w-lg mx-auto p-12">
          <h2 className="text-4xl font-bold mb-4">Poker, Simplified</h2>
          <p className="text-lg mb-8">
            PotLock makes poker payouts simple and secure with blockchain technology.
            No more IOUs or cash disputes at the table.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Secure Escrow</h3>
                <p className="text-white/80">
                  All bets are securely held in smart contracts until the game ends
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <PiggyBank className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Earn While You Wait</h3>
                <p className="text-white/80">
                  Your idle funds earn 3-5% APY between games through Aave staking
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <ArrowRight className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Instant Payouts</h3>
                <p className="text-white/80">
                  Get paid instantly when the game is over - no waiting for bank transfers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
