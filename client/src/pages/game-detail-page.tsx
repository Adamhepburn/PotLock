import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWeb3 } from "@/hooks/use-web3";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import TabNavigation from "@/components/TabNavigation";
import { Loader2 } from "lucide-react";

export default function GameDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { address, isConnected } = useWeb3();
  const { toast } = useToast();

  // Fetch game details
  const { data: game, isLoading: isLoadingGame } = useQuery({
    queryKey: [`/api/games/${id}`],
    enabled: !!id,
  });

  // Fetch players in the game
  const { data: players, isLoading: isLoadingPlayers } = useQuery({
    queryKey: [`/api/games/${id}/players`],
    enabled: !!id,
  });

  // Fetch pending cash out requests
  const { data: cashOutRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: [`/api/games/${id}/cashout-requests`],
    enabled: !!id,
  });

  // End game mutation (for banker only)
  const endGameMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/games/${id}/end`, {});
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Game ended",
        description: "The game has been ended and funds distributed.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to end game",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle approving a cash out request
  const handleApprove = (requestId: number) => {
    navigate(`/approval/${requestId}`);
  };

  // Handle disputing a cash out request
  const handleDispute = (requestId: number) => {
    navigate(`/approval/${requestId}`);
  };

  // Handle cash out button click
  const handleCashOut = () => {
    if (!game) return;
    navigate(`/cashout/${id}`);
  };

  // Handle end game button click (banker only)
  const handleEndGame = () => {
    if (!game) return;
    if (user?.walletAddress !== game.bankerAddress) {
      toast({
        title: "Not authorized",
        description: "Only the banker can end the game.",
        variant: "destructive",
      });
      return;
    }
    
    endGameMutation.mutate();
  };

  // Check if current user is the banker
  const isBanker = game && user?.walletAddress === game.bankerAddress;

  // Calculate total in escrow
  const totalInEscrow = players?.reduce((sum, player) => sum + parseFloat(player.buyIn.toString()), 0) || 0;

  // Get current player
  const currentPlayer = players?.find(player => player.userId === user?.id);

  // Loading state
  if (isLoadingGame || isLoadingPlayers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle case when game is not found
  if (!game) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Game Not Found</h1>
        <p className="text-gray-600 mb-6">The game you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate("/")}>Back to Games</Button>
      </div>
    );
  }

  return (
    <div className="game-detail-screen min-h-screen pb-20 flex flex-col">
      <div className="bg-primary text-white p-6">
        <div className="flex items-center mb-2">
          <button 
            className="mr-3" 
            onClick={() => navigate("/")}
          >
            <i className="fas fa-arrow-left"></i>
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
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Escrow Status</h2>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Total in Escrow:</span>
            <span className="font-medium text-gray-800">${totalInEscrow.toFixed(2)} USDC</span>
          </div>
          
          {currentPlayer && (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-600">Your Buy-in:</span>
                <span className="font-medium text-gray-800">${parseFloat(currentPlayer.buyIn.toString()).toFixed(2)} USDC</span>
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
        </div>
        
        {/* Players List */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Players</h2>
          
          {players && players.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {players.map((player: any) => {
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
                          {player.walletAddress}
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
                      <i className={`${
                        player.status === "active" 
                          ? "fas fa-check-circle" 
                          : player.status === "cashing-out" 
                            ? "fas fa-clock" 
                            : "fas fa-check-circle"
                      } mr-1`}></i>
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
        </div>
        
        {/* Cash Out Actions */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Actions</h2>
          
          {currentPlayer && currentPlayer.status === "active" && (
            <Button 
              className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out mb-3"
              onClick={handleCashOut}
            >
              <i className="fas fa-money-bill-wave mr-2"></i>
              Cash Out
            </Button>
          )}
          
          {/* Only for banker role */}
          {isBanker && (
            <Button 
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out"
              onClick={handleEndGame}
              disabled={endGameMutation.isPending}
            >
              {endGameMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ending Game...
                </>
              ) : (
                <>
                  <i className="fas fa-flag-checkered mr-2"></i>
                  End Game (Banker Only)
                </>
              )}
            </Button>
          )}
        </div>
        
        {/* Pending Approvals */}
        {!isLoadingRequests && cashOutRequests && cashOutRequests.length > 0 && (
          <div className="mt-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Pending Approvals</h2>
            
            {cashOutRequests.filter((req: any) => req.status === "pending").map((request: any) => {
              // Calculate time since request
              const requestTime = new Date(request.createdAt);
              const now = new Date();
              const diffMinutes = Math.floor((now.getTime() - requestTime.getTime()) / (1000 * 60));
              
              let timeAgo;
              if (diffMinutes < 1) {
                timeAgo = "just now";
              } else if (diffMinutes === 1) {
                timeAgo = "1 min ago";
              } else if (diffMinutes < 60) {
                timeAgo = `${diffMinutes} min ago`;
              } else if (diffMinutes < 120) {
                timeAgo = "1 hour ago";
              } else {
                timeAgo = `${Math.floor(diffMinutes / 60)} hours ago`;
              }
              
              return (
                <div key={request.id} className="bg-white rounded-lg shadow-sm p-4 mb-3 border-l-4 border-amber-500">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-800">{request.playerUsername}</div>
                    <div className="text-sm text-gray-500">{timeAgo}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm text-gray-600">Chip count submitted:</div>
                    <div className="text-xl font-medium text-gray-800">${parseFloat(request.chipCount).toFixed(2)}</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition duration-200 ease-in-out text-sm"
                      onClick={() => handleApprove(request.id)}
                      disabled={request.userHasVoted}
                    >
                      <i className="fas fa-check mr-1"></i> Approve
                    </Button>
                    <Button 
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition duration-200 ease-in-out text-sm"
                      onClick={() => handleDispute(request.id)}
                      disabled={request.userHasVoted}
                    >
                      <i className="fas fa-times mr-1"></i> Dispute
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {cashOutRequests.filter((req: any) => req.status === "pending").length === 0 && (
              <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                No pending approval requests.
              </div>
            )}
          </div>
        )}
      </div>
      
      <TabNavigation />
    </div>
  );
}
