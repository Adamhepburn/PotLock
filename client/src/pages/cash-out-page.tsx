import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWeb3 } from "@/hooks/use-web3";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import TabNavigation from "@/components/TabNavigation";
import { Loader2 } from "lucide-react";

// Form schema
const cashOutSchema = z.object({
  chipCount: z.string()
    .min(1, "Chip count is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Must be a positive number"
    ),
});

type CashOutFormValues = z.infer<typeof cashOutSchema>;

export default function CashOutPage() {
  const { gameId } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch game details
  const { data: game, isLoading: isLoadingGame } = useQuery({
    queryKey: [`/api/games/${gameId}`],
    enabled: !!gameId,
  });

  // Fetch players in the game
  const { data: players, isLoading: isLoadingPlayers } = useQuery({
    queryKey: [`/api/games/${gameId}/players`],
    enabled: !!gameId,
  });

  // Cash out mutation
  const cashOutMutation = useMutation({
    mutationFn: async (data: CashOutFormValues) => {
      const res = await apiRequest("POST", "/api/cashout", {
        gameId,
        chipCount: parseFloat(data.chipCount),
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Cash out request submitted",
        description: "Your chip count has been submitted for approval.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}/players`] });
      navigate(`/games/${gameId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit cash out request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cash out form
  const form = useForm<CashOutFormValues>({
    resolver: zodResolver(cashOutSchema),
    defaultValues: {
      chipCount: "",
    },
  });

  // Handle cash out form submission
  function onSubmit(values: CashOutFormValues) {
    cashOutMutation.mutate(values);
  }

  // Get current player
  const currentPlayer = players?.find(player => player.userId === user?.id);

  // Calculate total in escrow
  const totalInEscrow = players?.reduce((sum, player) => sum + parseFloat(player.buyIn.toString()), 0) || 0;

  // Calculate players who have cashed out
  const cashedOutCount = players?.filter(player => player.status === "cashed-out").length || 0;

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
    <div className="cash-out-screen min-h-screen pb-20 flex flex-col">
      <div className="bg-primary text-white p-6">
        <div className="flex items-center mb-2">
          <button 
            className="mr-3"
            onClick={() => navigate(`/games/${gameId}`)}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="text-xl font-bold">Cash Out</h1>
        </div>
        <div className="text-sm opacity-90">
          <div>Game: <span>{game.name}</span></div>
          <div>Buy-in: <span>${game.buyInAmount} USDC</span></div>
        </div>
      </div>
      
      <div className="p-6 flex-1">
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Submit Chip Count</h2>
          
          <div className="text-sm text-gray-600 mb-4">
            Enter the dollar value of chips you currently have. This amount will be verified by other players before payout.
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="chipCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-gray-700 text-sm font-medium mb-2">Chip Value ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          className="appearance-none border border-gray-300 rounded-lg w-full py-3 pl-10 pr-4 text-2xl font-medium text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          type="number" 
                          step="0.01"
                          placeholder="0.00" 
                          {...field}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500 text-2xl">$</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="text-blue-500 mr-3">
                    <i className="fas fa-info-circle text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-blue-800 font-medium mb-1">How it works</h3>
                    <p className="text-blue-700 text-sm">
                      After submitting your chip count, other players must approve your cash-out. Once approved, the smart contract will automatically transfer your share of the escrow funds to your wallet.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out"
                disabled={cashOutMutation.isPending}
              >
                {cashOutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Chip Count"
                )}
              </Button>
            </form>
          </Form>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Game Summary</h2>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Total in Escrow:</span>
            <span className="font-medium text-gray-800">${totalInEscrow.toFixed(2)} USDC</span>
          </div>
          
          {currentPlayer && (
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Your Buy-in:</span>
              <span className="font-medium text-gray-800">${parseFloat(currentPlayer.buyIn.toString()).toFixed(2)} USDC</span>
            </div>
          )}
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Player Count:</span>
            <span className="font-medium text-gray-800">{players?.length || 0} players</span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Cashed Out:</span>
            <span className="font-medium text-gray-800">{cashedOutCount} player{cashedOutCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
      
      <TabNavigation />
    </div>
  );
}
