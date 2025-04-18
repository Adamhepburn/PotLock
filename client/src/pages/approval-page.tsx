import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ApprovalPage() {
  const { requestId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [counterValue, setCounterValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sample request data (would normally be fetched from API)
  const request = {
    id: Number(requestId),
    gameId: 1,
    playerId: 1,
    playerUsername: "Player1",
    chipCount: 150,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  
  // Sample game data
  const game = {
    id: request.gameId,
    name: "Friday Night Poker",
    code: "POKER123",
  };
  
  // Handle approve
  const handleApprove = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Approval submitted",
        description: "You've approved the cash out request.",
      });
      setIsSubmitting(false);
      navigate(`/games/${request.gameId}`);
    }, 1000);
  };
  
  // Handle dispute with counter-value
  const handleDispute = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!counterValue) {
      toast({
        title: "Missing information",
        description: "Please enter your counter value",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Dispute submitted",
        description: "Your counter-value has been submitted.",
      });
      setIsSubmitting(false);
      navigate(`/games/${request.gameId}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen pb-20 flex flex-col">
      <div className="bg-primary text-white p-6">
        <div className="flex items-center">
          <button 
            className="mr-3" 
            onClick={() => navigate(`/games/${request.gameId}`)}
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">Review Cash Out</h1>
        </div>
        <div className="text-sm mt-1 opacity-90">
          {game.name}
        </div>
      </div>
      
      <div className="p-6">
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Cash Out Request</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Player</div>
                <div className="font-medium">{request.playerUsername}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Requested Amount</div>
                <div className="text-2xl font-bold">${request.chipCount.toFixed(2)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Submitted</div>
                <div className="font-medium">{new Date(request.createdAt).toLocaleString()}</div>
              </div>
              
              <div className="pt-4">
                <Button 
                  className="w-full mb-3 bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Approve Request"}
                </Button>
                
                <div className="text-center text-sm text-gray-500 mb-3">OR</div>
                
                <div className="border rounded-lg p-4">
                  <form onSubmit={handleDispute}>
                    <h3 className="font-medium text-gray-800 mb-2">Dispute with Counter-Value</h3>
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="counterValue">Correct Chip Count</Label>
                      <div className="relative">
                        <Input 
                          id="counterValue"
                          value={counterValue}
                          onChange={(e) => setCounterValue(e.target.value)}
                          className="pl-8"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Enter what you believe is the correct amount
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Submit Dispute"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Info Box */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-gray-800 mb-2">About Approvals & Disputes</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
              <li>Approving confirms that the player's chip count is correct</li>
              <li>If you dispute, provide the correct amount you believe they have</li>
              <li>Majority of players must approve for the cash out to succeed</li>
              <li>Disputes trigger a mediation process with all players</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {/* Navigation bar would go here */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-6">
        <Button variant="ghost" onClick={() => navigate("/games")}>Games</Button>
        <Button variant="ghost" onClick={() => navigate("/auth")}>Profile</Button>
      </div>
    </div>
  );
}