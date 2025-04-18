import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWeb3 } from "@/hooks/use-web3";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertGameSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TabNavigation from "@/components/TabNavigation";
import { Loader2 } from "lucide-react";

// Form schemas
const createGameSchema = insertGameSchema
  .pick({
    name: true,
    buyInAmount: true,
    bankerAddress: true,
  })
  .extend({
    buyInAmount: z.string().min(1, "Buy-in amount is required"),
  });

const joinGameSchema = z.object({
  code: z.string().min(1, "Game code is required"),
  walletAddress: z.string().min(1, "Wallet address is required"),
});

type CreateGameFormValues = z.infer<typeof createGameSchema>;
type JoinGameFormValues = z.infer<typeof joinGameSchema>;

export default function GameSetupPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { address, connectWallet, isConnected } = useWeb3();
  const { toast } = useToast();

  // Fetch user's games
  const { data: games, isLoading: isLoadingGames } = useQuery({
    queryKey: ["/api/games"],
    enabled: !!user,
  });

  // Create game mutation
  const createGameMutation = useMutation({
    mutationFn: async (data: CreateGameFormValues) => {
      const res = await apiRequest("POST", "/api/games", {
        ...data,
        buyInAmount: parseFloat(data.buyInAmount),
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Game created",
        description: "Your poker game has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      createGameForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create game",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Join game mutation
  const joinGameMutation = useMutation({
    mutationFn: async (data: JoinGameFormValues) => {
      const res = await apiRequest("POST", "/api/games/join", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Game joined",
        description: "You have successfully joined the game!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      joinGameForm.reset();
      
      // Navigate to the game detail page
      navigate(`/games/${data.game.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join game",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create game form
  const createGameForm = useForm<CreateGameFormValues>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      name: "",
      buyInAmount: "",
      bankerAddress: address || "",
    },
  });

  // Join game form
  const joinGameForm = useForm<JoinGameFormValues>({
    resolver: zodResolver(joinGameSchema),
    defaultValues: {
      code: "",
      walletAddress: address || "",
    },
  });

  // Update wallet address in forms when connected
  useEffect(() => {
    if (address) {
      createGameForm.setValue("bankerAddress", address);
      joinGameForm.setValue("walletAddress", address);
    }
  }, [address]);

  // Handle create game submission
  function onCreateGameSubmit(values: CreateGameFormValues) {
    // Check if user has a wallet connected
    if (!isConnected) {
      toast({
        title: "Connect wallet first",
        description: "Please connect your wallet before creating a game.",
        variant: "destructive",
      });
      connectWallet();
      return;
    }
    
    createGameMutation.mutate(values);
  }

  // Handle join game submission
  function onJoinGameSubmit(values: JoinGameFormValues) {
    // Check if user has a wallet connected
    if (!isConnected) {
      toast({
        title: "Connect wallet first",
        description: "Please connect your wallet before joining a game.",
        variant: "destructive",
      });
      connectWallet();
      return;
    }
    
    joinGameMutation.mutate(values);
  }

  return (
    <div className="game-setup-screen min-h-screen pb-20 flex flex-col p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Game Setup</h1>
        <div className="flex items-center">
          <div className="text-sm text-gray-600 mr-2">Connected:</div>
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
            {isConnected ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <div className="text-xs font-mono truncate max-w-[100px]">
                  {address ? `${address.substring(0, 6)}...${address.substring(38)}` : ""}
                </div>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={connectWallet}
                className="text-xs"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Game Section */}
      <Card className="mb-6 shadow-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Create a Game</h2>
          
          <Form {...createGameForm}>
            <form onSubmit={createGameForm.handleSubmit(onCreateGameSubmit)} className="space-y-4">
              <FormField
                control={createGameForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-sm font-medium">Game Name</FormLabel>
                    <FormControl>
                      <Input 
                        className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Friday Night Poker" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createGameForm.control}
                name="buyInAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-sm font-medium">Buy-in Amount (USDC)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          className="appearance-none border border-gray-300 rounded-lg w-full py-3 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          type="number" 
                          placeholder="100" 
                          {...field} 
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createGameForm.control}
                name="bankerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-sm font-medium">Banker Wallet Address (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        className="appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 font-mono text-sm text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="0x..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out"
                disabled={createGameMutation.isPending}
              >
                {createGameMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Game"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Join Game Section */}
      <Card className="mb-6 shadow-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Join a Game</h2>
          
          <Form {...joinGameForm}>
            <form onSubmit={joinGameForm.handleSubmit(onJoinGameSubmit)} className="space-y-4">
              <FormField
                control={joinGameForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-sm font-medium">Game Code</FormLabel>
                    <FormControl>
                      <Input 
                        className="appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="POKER123" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={joinGameForm.control}
                name="walletAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-sm font-medium">Your Wallet Address</FormLabel>
                    <FormControl>
                      <Input 
                        className="appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 font-mono text-sm text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="0x..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out"
                disabled={joinGameMutation.isPending}
              >
                {joinGameMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Game"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Active Games Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Active Games</h2>
        
        {isLoadingGames ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : games && games.length > 0 ? (
          games.map((game: any) => (
            <Card 
              key={game.id} 
              className="mb-3 border-l-4 border-primary shadow-sm"
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
          ))
        ) : (
          <Card className="bg-gray-50 border border-dashed border-gray-300">
            <CardContent className="p-6 text-center text-gray-500">
              <p>You don't have any active games yet.</p>
              <p className="text-sm mt-1">Create or join a game to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <TabNavigation />
    </div>
  );
}
