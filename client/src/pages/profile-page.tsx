import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Sample user data (would normally come from auth context)
  const user = {
    username: "aaa",
    email: "aaaa@gmail.com",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    joinedAt: new Date().toISOString(),
  };
  
  // Handle logout
  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      setIsLoggingOut(false);
      navigate("/auth");
    }, 1000);
  };

  return (
    <div className="min-h-screen pb-20 flex flex-col">
      <div className="bg-primary text-white p-6">
        <h1 className="text-xl font-bold">Profile</h1>
      </div>
      
      <div className="p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Username</Label>
                <div className="font-medium">{user.username}</div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Email</Label>
                <div className="font-medium">{user.email}</div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Wallet Address</Label>
                <div className="font-mono text-sm truncate">{user.walletAddress}</div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Joined</Label>
                <div className="font-medium">{new Date(user.joinedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500">Connected Wallet</div>
                <div className="font-medium flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Coinbase Wallet</span>
                </div>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md font-mono text-sm break-all">
              {user.walletAddress}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full"
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Log out"}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-6">
        <Button variant="ghost" onClick={() => navigate("/games")}>Games</Button>
        <Button variant="ghost" className="bg-gray-100" onClick={() => navigate("/profile")}>Profile</Button>
      </div>
    </div>
  );
}