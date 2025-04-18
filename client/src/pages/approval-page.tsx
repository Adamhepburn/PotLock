import { useState, useEffect } from "react";
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

// Form schema for counter value
const counterValueSchema = z.object({
  counterValue: z.string()
    .min(1, "Counter value is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Must be a positive number"
    ),
});

type CounterValueFormValues = z.infer<typeof counterValueSchema>;

export default function ApprovalPage() {
  const { requestId } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [gameId, setGameId] = useState<string | null>(null);

  // Fetch cash out request details
  const { data: request, isLoading: isLoadingRequest } = useQuery({
    queryKey: [`/api/cashout-requests/${requestId}`],
    enabled: !!requestId,
    onSuccess: (data) => {
      if (data && data.gameId) {
        setGameId(data.gameId.toString());
      }
    },
  });

  // Fetch approvals for the cash out request
  const { data: approvals, isLoading: isLoadingApprovals } = useQuery({
    queryKey: [`/api/cashout-requests/${requestId}/approvals`],
    enabled: !!requestId,
  });

  // Approve cash out mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/approve", {
        requestId: parseInt(requestId),
        approved: true,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Approved",
        description: "You have approved this cash out request.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/cashout-requests/${requestId}/approvals`] });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}/cashout-requests`] });
      navigate(gameId ? `/games/${gameId}` : "/");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to approve",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Dispute cash out mutation
  const disputeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/approve", {
        requestId: parseInt(requestId),
        approved: false,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Disputed",
        description: "You have disputed this cash out request.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/cashout-requests/${requestId}/approvals`] });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}/cashout-requests`] });
      
      // Don't navigate away if they need to submit a counter value
    },
    onError: (error: any) => {
      toast({
        title: "Failed to dispute",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Counter value submission mutation
  const counterValueMutation = useMutation({
    mutationFn: async (data: CounterValueFormValues) => {
      const res = await apiRequest("POST", "/api/approve", {
        requestId: parseInt(requestId),
        approved: false,
        counterValue: parseFloat(data.counterValue),
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Counter value submitted",
        description: "Your counter value has been submitted.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/cashout-requests/${requestId}/approvals`] });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}/cashout-requests`] });
      navigate(gameId ? `/games/${gameId}` : "/");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit counter value",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Counter value form
  const counterValueForm = useForm<CounterValueFormValues>({
    resolver: zodResolver(counterValueSchema),
    defaultValues: {
      counterValue: "",
    },
  });

  // Handle approve button click
  const handleApprove = () => {
    approveMutation.mutate();
  };

  // Handle dispute button click
  const handleDispute = () => {
    disputeMutation.mutate();
  };

  // Handle counter value form submission
  function onSubmitCounterValue(values: CounterValueFormValues) {
    counterValueMutation.mutate(values);
  }

  // Check if current user has already voted
  const hasVoted = approvals?.some(approval => approval.approverId === user?.id);

  // Loading state
  if (isLoadingRequest || isLoadingApprovals) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle case when request is not found
  if (!request) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Request Not Found</h1>
        <p className="text-gray-600 mb-6">The cash out request you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate("/")}>Back to Games</Button>
      </div>
    );
  }

  // Format time since request
  const formatTimeAgo = (timestamp: string) => {
    const requestTime = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - requestTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "just now";
    if (diffMinutes === 1) return "1 minute ago";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 120) return "1 hour ago";
    return `${Math.floor(diffMinutes / 60)} hours ago`;
  };

  return (
    <div className="approval-screen min-h-screen pb-20 flex flex-col">
      <div className="bg-primary text-white p-6">
        <div className="flex items-center mb-2">
          <button 
            className="mr-3"
            onClick={() => navigate(gameId ? `/games/${gameId}` : "/")}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="text-xl font-bold">Approval Request</h1>
        </div>
        <div className="text-sm opacity-90">
          <div>Game: <span>{request.gameName || "Poker Game"}</span></div>
          <div>Request from: <span>{request.playerUsername || "Player"}</span></div>
        </div>
      </div>
      
      <div className="p-6 flex-1">
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <div className="text-center p-4">
            <div className="text-gray-600 mb-2">Chip Count Submitted</div>
            <div className="text-4xl font-bold text-gray-800 mb-3">${parseFloat(request.chipCount).toFixed(2)}</div>
            <div className="flex items-center justify-center text-gray-500 text-sm">
              <i className="fas fa-clock mr-1"></i>
              <span>{formatTimeAgo(request.createdAt)}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-5 mt-2">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Approval Status</h3>
            
            <div className="space-y-3 mb-6">
              {approvals && approvals.length > 0 ? (
                approvals.map((approval: any) => {
                  const initials = approval.username.substring(0, 2).toUpperCase();
                  const isCurrentUser = approval.approverId === user?.id;
                  
                  return (
                    <div key={approval.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-gray-600 text-sm font-medium">{initials}</span>
                        </div>
                        <span className="font-medium text-gray-800">
                          {approval.username} {isCurrentUser && "(You)"}
                        </span>
                      </div>
                      {approval.approved ? (
                        <div className="text-green-600">
                          <i className="fas fa-check-circle"></i>
                        </div>
                      ) : (
                        <div className="text-red-500">
                          <i className="fas fa-times-circle"></i>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No approvals yet.
                </div>
              )}
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="text-amber-500 mr-3">
                  <i className="fas fa-exclamation-triangle text-xl"></i>
                </div>
                <div>
                  <h3 className="text-amber-800 font-medium mb-1">Verification Required</h3>
                  <p className="text-amber-700 text-sm">
                    Please verify that the chip count submitted matches the actual chips the player has. Approving an incorrect amount could result in funds being improperly distributed.
                  </p>
                </div>
              </div>
            </div>
            
            {!hasVoted && (
              <div className="flex space-x-3">
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-1"></i> Approve
                    </>
                  )}
                </Button>
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out"
                  onClick={handleDispute}
                  disabled={disputeMutation.isPending}
                >
                  {disputeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disputing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-times mr-1"></i> Dispute
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {(hasVoted && !approvals?.find(approval => approval.approverId === user?.id)?.approved) || disputeMutation.isSuccess ? (
          <div className="bg-white rounded-lg shadow-md p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Submit a Counter Value</h2>
            
            <div className="text-sm text-gray-600 mb-4">
              If you believe the submitted chip count is incorrect, you can propose a counter value.
            </div>
            
            <Form {...counterValueForm}>
              <form onSubmit={counterValueForm.handleSubmit(onSubmitCounterValue)} className="space-y-4">
                <FormField
                  control={counterValueForm.control}
                  name="counterValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-gray-700 text-sm font-medium mb-2">Counter Value ($)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            className="appearance-none border border-gray-300 rounded-lg w-full py-3 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
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
                
                <Button 
                  type="submit" 
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out"
                  disabled={counterValueMutation.isPending}
                >
                  {counterValueMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Counter Value"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        ) : null}
      </div>
      
      <TabNavigation />
    </div>
  );
}
