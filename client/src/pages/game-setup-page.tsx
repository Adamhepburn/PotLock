import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GameSetupPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [gameName, setGameName] = useState("");
  const [buyInAmount, setBuyInAmount] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [creatingGame, setCreatingGame] = useState(false);
  const [joiningGame, setJoiningGame] = useState(false);
  
  // Sample games
  const sampleGames = [
    { id: 1, name: "Friday Night Poker", code: "POKER123", buyInAmount: 100 },
    { id: 2, name: "Weekend Tournament", code: "TOUR456", buyInAmount: 250 }
  ];
  
  // Handle create game
  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName || !buyInAmount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setCreatingGame(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Game created",
        description: "Your poker game has been created successfully!",
      });
      setGameName("");
      setBuyInAmount("");
      setCreatingGame(false);
    }, 1000);
  };
  
  // Handle join game
  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode) {
      toast({
        title: "Missing information",
        description: "Please enter a game code",
        variant: "destructive"
      });
      return;
    }
    
    setJoiningGame(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Game joined",
        description: "You have successfully joined the game!",
      });
      setGameCode("");
      setJoiningGame(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen pb-20 flex flex-col p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Game Setup</h1>
        <div className="flex items-center">
          <div className="text-sm text-gray-600 mr-2">Wallet:</div>
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <div className="text-xs font-mono truncate max-w-[100px]">
              0x742d...f44e
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Game Section */}
      <Card className="mb-6 shadow-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Create a Game</h2>
          
          <form onSubmit={handleCreateGame} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gameName">Game Name</Label>
              <Input 
                id="gameName"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="w-full" 
                placeholder="Friday Night Poker" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="buyInAmount">Buy-in Amount (USDC)</Label>
              <div className="relative">
                <Input 
                  id="buyInAmount"
                  value={buyInAmount}
                  onChange={(e) => setBuyInAmount(e.target.value)}
                  className="pl-8" 
                  type="number" 
                  placeholder="100" 
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={creatingGame}
            >
              {creatingGame ? "Creating..." : "Create Game"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Join Game Section */}
      <Card className="mb-6 shadow-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Join a Game</h2>
          
          <form onSubmit={handleJoinGame} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gameCode">Game Code</Label>
              <Input 
                id="gameCode"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                className="w-full" 
                placeholder="POKER123" 
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gray-800 hover:bg-gray-900"
              disabled={joiningGame}
            >
              {joiningGame ? "Joining..." : "Join Game"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Active Games Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Active Games</h2>
        
        {sampleGames.map((game) => (
          <Card 
            key={game.id} 
            className="mb-3 border-l-4 border-primary shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/games/${game.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-800">{game.name}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Game Code: {game.code} • ${game.buyInAmount} buy-in
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-primary text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/games/${game.id}`);
                  }}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-6">
        <Button variant="ghost" className="bg-gray-100" onClick={() => navigate("/games")}>Games</Button>
        <Button variant="ghost" onClick={() => navigate("/profile")}>Profile</Button>
      </div>
    </div>
  );
}