import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Game, InsertGameReservation } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  DollarSign, 
  Filter, 
  Plus, 
  User, 
  CalendarDays,
  Search,
  Star,
  PlusCircle
} from "lucide-react";

// Extended Game type with user data
type ExtendedGame = Game & {
  creator: {
    username: string;
    displayName?: string;
  };
  reservationCount: number;
  hasReserved: boolean;
};

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  
  const [reservingGameId, setReservingGameId] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [filter, setFilter] = useState<string>("all"); // all, friends, upcoming
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  
  // Mock games data for development
  const [gamesData, setGamesData] = useState<ExtendedGame[]>([
    {
      id: 1,
      name: "Friday Night Poker",
      code: "FNP123",
      buyInAmount: "100",
      status: "active",
      createdById: 1,
      createdAt: new Date(),
      contractAddress: null,
      bankerAddress: null,
      location: "Mike's Apartment",
      gameDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      description: "Regular weekly game, BYOB and snacks!",
      isPrivate: false,
      maxPlayers: 8,
      creator: {
        username: "demo_user",
        displayName: "Poker King"
      },
      reservationCount: 3,
      hasReserved: false
    },
    {
      id: 2,
      name: "High Stakes Tournament",
      code: "HST456",
      buyInAmount: "250",
      status: "active",
      createdById: 2,
      createdAt: new Date(),
      contractAddress: null,
      bankerAddress: null,
      location: "Poker Club Downtown",
      gameDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      description: "Professional dealer, serious players only",
      isPrivate: true,
      maxPlayers: 10,
      creator: {
        username: "john_doe",
        displayName: "John"
      },
      reservationCount: 6,
      hasReserved: true
    },
    {
      id: 3,
      name: "Casual Sunday Game",
      code: "CSG789",
      buyInAmount: "50",
      status: "active",
      createdById: 3,
      createdAt: new Date(),
      contractAddress: null,
      bankerAddress: null,
      location: "Sarah's House",
      gameDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      description: "Beginner-friendly game with small stakes",
      isPrivate: false,
      maxPlayers: 6,
      creator: {
        username: "sarah_smith",
        displayName: "Sarah"
      },
      reservationCount: 2,
      hasReserved: false
    }
  ]);

  // Simple refetch function for mock data
  const refetch = () => {
    console.log("Refetching games...");
    // In a real implementation, this would make an API call
  };

  // Filtered games based on selected filter
  const filteredGames = gamesData?.filter(game => {
    if (filter === "all") return true;
    if (filter === "friends") return game.creator.username !== user?.username; // Only friends' games
    if (filter === "upcoming") {
      const gameDate = game.gameDate ? new Date(game.gameDate) : null;
      return gameDate && gameDate > new Date(); // Only future games
    }
    return true;
  });

  // Handle game reservation
  const handleReserveSpot = async (gameId: number, buyInAmount: string) => {
    setReservingGameId(gameId);
    
    // Calculate deposit (half of buy-in)
    const buyInNumeric = parseFloat(buyInAmount.toString());
    const deposit = (buyInNumeric / 2).toFixed(2);
    setDepositAmount(deposit);
    
    // For demo, simulate reservation success
    setTimeout(() => {
      // Success message would be shown here with proper toast in a production app
      alert(`Spot Reserved: You've reserved a spot by depositing $${deposit}.`);
      
      // Update game data
      const updatedGames = gamesData.map(game => {
        if (game.id === gameId) {
          return { ...game, reservationCount: game.reservationCount + 1, hasReserved: true };
        }
        return game;
      });
      setGamesData(updatedGames);
      
      setReservingGameId(null);
      // Refetch games to update UI
      refetch();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm opacity-90">Discover upcoming poker games from your friends</p>
      </div>
      
      <div className="px-4 py-6">
        {/* Search and filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto py-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search games..." 
              className="pl-9" 
            />
          </div>
          
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={filter === "friends" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("friends")}
          >
            <Users className="h-4 w-4 mr-1" />
            Friends
          </Button>
          <Button 
            variant={filter === "upcoming" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("upcoming")}
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            Upcoming
          </Button>
        </div>
        
        {/* Create game button */}
        <Button 
          className="w-full mb-6 font-medium" 
          onClick={() => navigate("/games")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Game
        </Button>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : isError ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="text-red-500 mb-2">Error loading games</div>
                <Button onClick={() => refetch()}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredGames && filteredGames.length > 0 ? (
          <div className="space-y-6">
            {filteredGames.map(game => (
              <Card key={game.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <CardDescription>
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" /> 
                          Hosted by {game.creator.displayName || game.creator.username}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant={game.isPrivate ? "outline" : "secondary"}>
                      {game.isPrivate ? "Private" : "Open"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 text-gray-500 mr-2" />
                      <div className="text-sm">
                        {game.gameDate 
                          ? new Date(game.gameDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })
                          : "Date not set"}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <div className="text-sm">
                        {game.gameDate
                          ? new Date(game.gameDate).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : "Time not set"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                      <div className="text-sm">
                        {game.location || "Location not specified"}
                      </div>
                    </div>
                  </div>
                  
                  {game.description && (
                    <div className="mb-4 text-sm text-gray-600">
                      {game.description}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                      <span className="font-medium">${game.buyInAmount.toString()}</span>
                      <span className="text-xs text-gray-500 ml-1">buy-in</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="font-medium">{game.reservationCount || 0}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        / {game.maxPlayers || 10} reserved
                      </span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/games/${game.id}`)}
                  >
                    View Details
                  </Button>
                  
                  {game.hasReserved ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Spot Reserved
                    </Badge>
                  ) : reservingGameId === game.id ? (
                    <div className="flex items-center">
                      <span className="text-xs mr-2">Reserving...</span>
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => handleReserveSpot(game.id, game.buyInAmount.toString())}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Reserve Spot
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No games found</h3>
                <p className="text-gray-500 mb-4">
                  {filter === "all" 
                    ? "No games have been created yet."
                    : filter === "friends"
                    ? "None of your friends have created games yet."
                    : "No upcoming games found."}
                </p>
                <Button onClick={() => navigate("/games")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Game
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-6">
        <Button variant="ghost" className="flex flex-col items-center justify-center h-full bg-gray-50" onClick={() => navigate("/dashboard")}>
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center justify-center h-full" onClick={() => navigate("/games")}>
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">Games</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center justify-center h-full" onClick={() => navigate("/profile")}>
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Button>
      </div>
    </div>
  );
}