import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GameDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Sample game data (would normally be fetched from API)
  const game = {
    id: Number(id),
    name: "Friday Night Poker",
    code: "POKER123",
    buyInAmount: 100,
    status: "active",
    bankerAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  };
  
  // Sample players (would normally be fetched from API)
  const players = [
    { 
      id: 1, 
      username: "Player1", 
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", 
      buyIn: 100, 
      status: "active" 
    },
    { 
      id: 2, 
      username: "Player2", 
      walletAddress: "0x8Df42Ae547f5454841d6355a4F5F30B6d5dc143A", 
      buyIn: 100, 
      status: "active" 
    }
  ];
  
  // Calculate total in escrow
  const totalInEscrow = players.reduce((sum, player) => sum + player.buyIn, 0);
  
  // Current player (would normally be determined from auth)
  const currentPlayer = players[0];
  
  // Handle cash out button click
  const handleCashOut = () => {
    navigate(`/cashout/${id}`);
    toast({
      title: "Navigating to Cash Out",
      description: "Taking you to the cash out page."
    });
  };
  
  // Handle end game button click
  const handleEndGame = () => {
    toast({
      title: "Game Ended",
      description: "The game has been ended and funds distributed."
    });
  };

  return (
    <div className="min-h-screen pb-20 flex flex-col">
      <div className="bg-primary text-white p-6">
        <div className="flex items-center mb-2">
          <button 
            className="mr-3" 
            onClick={() => navigate("/games")}
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">{game.name}</h1>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm opacity-90">
            <div>Game Code: <span className="font-mono">{game.code}</span></div>
            <div>Buy-in: <span>${game.buyInAmount} USDC</span></div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
            <span className="text-sm font-medium">{game.status === "active" ? "In Progress" : game.status}</span>
          </div>
        </div>
      </div>
      
      {/* Game Escrow Info */}
      <div className="p-6">
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Escrow Status</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Total in Escrow:</span>
              <span className="font-medium text-gray-800">${totalInEscrow.toFixed(2)} USDC</span>
            </div>
            
            {currentPlayer && (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-600">Your Buy-in:</span>
                  <span className="font-medium text-gray-800">${currentPlayer.buyIn.toFixed(2)} USDC</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Your Status:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    currentPlayer.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : currentPlayer.status === "cashing-out" 
                        ? "bg-amber-100 text-amber-800" 
                        : "bg-gray-100 text-gray-800"
                  }`}>
                    {currentPlayer.status === "active" 
                      ? "Active" 
                      : currentPlayer.status === "cashing-out" 
                        ? "Cashing Out" 
                        : "Cashed Out"}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Players List */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Players</h2>
            
            {players && players.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {players.map((player) => {
                  const initials = player.username.substring(0, 2).toUpperCase();
                  return (
                    <div key={player.id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-gray-600 text-sm font-medium">{initials}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{player.username}</div>
                          <div className="text-gray-500 text-xs font-mono truncate max-w-[150px]">
                            {player.walletAddress.substring(0, 6)}...{player.walletAddress.substring(38)}
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        player.status === "active" 
                          ? "text-green-600" 
                          : player.status === "cashing-out" 
                            ? "text-amber-600" 
                            : "text-gray-500"
                      }`}>
                        {player.status === "active" 
                          ? "Active" 
                          : player.status === "cashing-out" 
                            ? "Cashing Out" 
                            : "Cashed Out"}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No players have joined this game yet.
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Cash Out Actions */}
        <Card className="mb-4">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Actions</h2>
            
            {currentPlayer && currentPlayer.status === "active" && (
              <Button 
                className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out mb-3"
                onClick={handleCashOut}
              >
                Cash Out
              </Button>
            )}
            
            {/* Banker role button */}
            <Button 
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out"
              onClick={handleEndGame}
            >
              End Game (Banker Only)
            </Button>
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