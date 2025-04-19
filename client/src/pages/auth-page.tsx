import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { 
    user, 
    loginMutation, 
    registerMutation,
    isLoading: authLoading
  } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  
  const isLoading = loginMutation.isPending || registerMutation.isPending;
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Handle login form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (isRegister) {
        // Register
        await registerMutation.mutateAsync({
          username,
          password,
          email,
          displayName: username
        });
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });
        navigate("/dashboard");
      } else {
        // Login
        await loginMutation.mutateAsync({
          username,
          password
        });
        toast({
          title: "Logged in",
          description: "You have been logged in successfully!",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: isRegister ? "Registration failed" : "Login failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
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
            <h1 className="text-3xl font-bold text-gray-800">PotLock</h1>
            <p className="text-gray-600 mt-2">Secure blockchain platform for poker payouts</p>
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
                    disabled={registerMutation.isPending || loginMutation.isPending}
                  >
                    {registerMutation.isPending || loginMutation.isPending
                      ? (isRegister ? "Creating account..." : "Logging in...") 
                      : (isRegister ? "Create Account" : "Login")}
                  </Button>
                </form>
                

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
