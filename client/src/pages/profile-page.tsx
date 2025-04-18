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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  
  // Sample user data (would normally come from auth context)
  const user = {
    username: "aaa",
    email: "aaaa@gmail.com",
    walletAddress: address || "Not connected",
    joinedAt: new Date().toISOString(),
  };
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
      toast({
        title: "Wallet connected",
        description: "Coinbase Wallet has been connected successfully!",
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
  };
  
  // Handle wallet disconnection
  const handleDisconnectWallet = () => {
    disconnectWallet();
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected.",
    });
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
                <div className="text-sm text-gray-500">Wallet Status</div>
                <div className="font-medium flex items-center">
                  <div className={`w-2 h-2 ${isConnected ? "bg-green-500" : "bg-gray-400"} rounded-full mr-2`}></div>
                  <span>{isConnected ? "Connected to Coinbase Wallet" : "Not connected"}</span>
                </div>
              </div>
              {isConnected ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDisconnectWallet}
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md font-mono text-sm break-all">
              {address || "No wallet connected"}
            </div>
            
            {!isConnected && (
              <div className="mt-4">
                <Button 
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white"
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect Coinbase Wallet"}
                </Button>
              </div>
            )}
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