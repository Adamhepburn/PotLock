import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Settings, LogOut, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle logout
  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Simulate logout process
    setTimeout(() => {
      logoutMutation.mutate(undefined, {
        onSuccess: () => {
          toast({
            title: "Logged out",
            description: "You have been successfully logged out.",
          });
          navigate("/auth");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to logout. Please try again.",
            variant: "destructive",
          });
          setIsLoggingOut(false);
        }
      });
    }, 1000);
  };

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
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={user?.username} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" placeholder="Add a display name" />
                <div className="text-xs text-gray-500">
                  This is how you'll appear to other players
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email} />
              </div>
              
              <div className="pt-2">
                <Button className="w-full">Save Changes</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </CardTitle>
          </CardHeader>
          <CardContent>
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
    </div>
  );
}