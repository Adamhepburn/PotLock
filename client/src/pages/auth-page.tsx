import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  // Handle login form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isRegister) {
        // Register
        await apiRequest("POST", "/api/register", {
          username,
          password,
          email
        });
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });
        navigate("/games");
      } else {
        // Login
        await apiRequest("POST", "/api/login", {
          username,
          password
        });
        toast({
          title: "Logged in",
          description: "You have been logged in successfully!",
        });
        navigate("/games");
      }
    } catch (error: any) {
      toast({
        title: isRegister ? "Registration failed" : "Login failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle MetaMask login
  async function handleMetaMaskLogin() {
    setIsConnecting(true);
    
    try {
      // Simple success message since we're not actually connecting
      toast({
        title: "MetaMask connection",
        description: "MetaMask connection feature is not available in this demo.",
      });
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="auth-screen h-screen flex flex-col p-6">
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="w-full max-w-sm">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-4">
              <span className="text-white text-3xl">🃏</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">PokerEscrow</h1>
            <p className="text-gray-600 mt-2">Secure blockchain escrow for poker games</p>
          </div>

          {/* Auth Forms */}
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between mb-4">
                  <Button 
                    variant={isRegister ? "outline" : "default"}
                    onClick={() => setIsRegister(false)}
                    className="w-1/2 mr-2"
                  >
                    Login
                  </Button>
                  <Button 
                    variant={isRegister ? "default" : "outline"}
                    onClick={() => setIsRegister(true)}
                    className="w-1/2 ml-2"
                  >
                    Sign Up
                  </Button>
                </div>
              
                <form onSubmit={handleSubmit} className="space-y-4">
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
                  
                  {isRegister && (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  )}
                  
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
                    {isLoading 
                      ? (isRegister ? "Creating account..." : "Logging in...") 
                      : (isRegister ? "Create Account" : "Login")}
                  </Button>
                </form>
                
                <div className="relative flex items-center justify-center my-6">
                  <div className="border-t border-gray-300 w-full"></div>
                  <div className="absolute bg-white px-3 text-sm text-gray-500">or</div>
                </div>
                
                <Button 
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                  onClick={handleMetaMaskLogin}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : `${isRegister ? "Sign Up" : "Connect"} with MetaMask`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
