import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Loader2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function InterestDisplay() {
  const { user, devMode } = useAuth();
  const { toast } = useToast();
  const [progressValue, setProgressValue] = useState(0);
  
  // Fetch current APY
  const { 
    data: apyData,
    isLoading: isLoadingApy
  } = useQuery({
    queryKey: ['/api/yield/apy'],
    queryFn: async () => {
      // In dev mode, return mock data
      if (devMode) {
        return { apy: 3.75 };
      }
      const res = await apiRequest("GET", "/api/yield/apy");
      if (!res.ok) throw new Error('Failed to fetch APY');
      return await res.json();
    }
  });
  
  // Fetch user's interest info
  const { 
    data: interestData,
    isLoading: isLoadingInterest
  } = useQuery({
    queryKey: ['/api/yield/interest'],
    queryFn: async () => {
      // In dev mode, return mock data
      if (devMode) {
        return {
          calculatedAt: new Date(),
          userBalance: 1000,
          poolSize: 100000,
          depositedInAave: 80000,
          userInterestAmount: 17.54,
          userApy: 3.75
        };
      }
      const res = await apiRequest("GET", "/api/yield/interest");
      if (!res.ok) throw new Error('Failed to fetch interest data');
      return await res.json();
    },
    enabled: !!user
  });
  
  // Animate progress bar on load
  useEffect(() => {
    if (!isLoadingInterest && interestData) {
      // Calculate what percentage of the year has passed to fill the progress bar
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      const yearProgress = ((now.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime())) * 100;
      
      // Animate progress bar from 0 to current value
      let value = 0;
      const interval = setInterval(() => {
        value += 2;
        setProgressValue(Math.min(value, yearProgress));
        if (value >= yearProgress) {
          clearInterval(interval);
        }
      }, 20);
      
      return () => clearInterval(interval);
    }
  }, [isLoadingInterest, interestData]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <Card className="neumorphic-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
            Interest Earned
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Your idle funds automatically earn interest while they're not being used in a game. Interest is calculated based on the Aave lending protocol rates.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Current annual rate: {isLoadingApy ? "Loading..." : `${apyData?.apy || 0}% APY`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingInterest ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Interest earned this year</span>
              <span className="font-medium text-lg">{formatCurrency(interestData?.userInterestAmount || 0)}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Year progress</span>
                <span>{progressValue.toFixed(0)}%</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
            
            <div className="pt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="neumorphic-inset rounded-lg p-3">
                <div className="text-muted-foreground text-xs mb-1">Your balance</div>
                <div className="font-medium">{formatCurrency(interestData?.userBalance || 0)}</div>
              </div>
              <div className="neumorphic-inset rounded-lg p-3">
                <div className="text-muted-foreground text-xs mb-1">Projected annual</div>
                <div className="font-medium">{formatCurrency((interestData?.userBalance || 0) * (interestData?.userApy || 0) / 100)}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}