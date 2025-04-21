import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Plus, 
  Users, 
  User,
  DollarSign, 
  Calendar, 
  Clock, 
  MapPin, 
  Copy, 
  Check, 
  Search,
  UserPlus,
  UserCheck,
  AlertTriangle,
  Loader2,
  X,
  ArrowLeft
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Friend {
  id: string;
  username: string;
  status: string;
  lastActive: string;
}

interface Game {
  id: number;
  name: string;
  code: string;
  buyInAmount: number;
  date?: string;
  time?: string;
  location?: string;
  maxPlayers?: number;
  currentPlayers?: number;
  status?: string;
  players?: { id: string; username: string; status: string }[];
}

export default function GameSetupPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, devMode } = useAuth();
  
  // Game creation state
  const [createStep, setCreateStep] = useState<number>(1);
  const [gameName, setGameName] = useState("");
  const [buyInAmount, setBuyInAmount] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [gameTime, setGameTime] = useState("");
  const [gameLocation, setGameLocation] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  
  // Join game state
  const [gameCode, setGameCode] = useState("");
  const [joiningGame, setJoiningGame] = useState(false);
  
  // Loading states
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [newGameId, setNewGameId] = useState<number | null>(null);
  const [newGameCode, setNewGameCode] = useState<string>("");
  
  // Query for active games
  const { data: activeGames = [] } = useQuery<Game[]>({
    queryKey: ['/api/games'],
    queryFn: async () => {
      if (devMode) {
        // Mock data for development
        return [
          { id: 1, name: "Friday Night Poker", code: "POKER123", buyInAmount: 100, date: "2025-04-25", time: "8:00 PM", location: "Mike's House", maxPlayers: 8, currentPlayers: 3, status: "upcoming" },
          { id: 2, name: "Weekend Tournament", code: "TOUR456", buyInAmount: 250, date: "2025-04-27", time: "2:00 PM", location: "Poker Club", maxPlayers: 12, currentPlayers: 8, status: "upcoming" }
        ];
      }
      
      const res = await apiRequest("GET", "/api/games");
      if (!res.ok) throw new Error('Failed to fetch games');
      return await res.json();
    }
  });
  
  // Query for user's friends
  const { data: friends = [] } = useQuery<Friend[]>({
    queryKey: ['/api/friends'],
    queryFn: async () => {
      if (devMode) {
        // Mock data for development
        return [
          { id: "friend-1", username: "Jane Doe", status: "online", lastActive: "Just now" },
          { id: "friend-2", username: "Mike Poker", status: "offline", lastActive: "3 hours ago" },
          { id: "friend-3", username: "Sarah Cards", status: "offline", lastActive: "Yesterday" },
          { id: "friend-4", username: "Tom Bailey", status: "online", lastActive: "Just now" },
          { id: "friend-5", username: "Chris Wilson", status: "offline", lastActive: "2 days ago" }
        ];
      }
      
      const res = await apiRequest("GET", "/api/friends");
      if (!res.ok) throw new Error('Failed to fetch friends');
      return await res.json();
    }
  });
  
  // Filtered friends based on search query
  const filteredFriends = searchQuery 
    ? friends.filter(friend => 
        friend.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedFriends.some(sf => sf.id === friend.id)
      )
    : friends.filter(friend => !selectedFriends.some(sf => sf.id === friend.id));
  
  // Create game mutation
  const createGameMutation = useMutation({
    mutationFn: async (gameData: {
      name: string;
      buyInAmount: number;
      date?: string;
      time?: string;
      location?: string;
      maxPlayers?: number;
      invitedFriends?: string[];
    }) => {
      if (devMode) {
        // Mock success response
        return {
          id: Math.floor(Math.random() * 1000) + 1,
          code: `GAME${Math.floor(Math.random() * 10000)}`,
          ...gameData
        };
      }
      
      const res = await apiRequest("POST", "/api/games", gameData);
      if (!res.ok) throw new Error('Failed to create game');
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      setNewGameId(data.id);
      setNewGameCode(data.code);
      // Reset form but keep selected friends for invitation
      setGameName("");
      setBuyInAmount("");
      setGameDate("");
      setGameTime("");
      setGameLocation("");
      setMaxPlayers("");
      setCreateStep(3); // Move to success step
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create game",
        description: error.message,
        variant: "destructive"
      });
      setIsCreatingGame(false);
    }
  });
  
  // Join game mutation
  const joinGameMutation = useMutation({
    mutationFn: async (code: string) => {
      if (devMode) {
        // Mock success response
        return { success: true };
      }
      
      const res = await apiRequest("POST", "/api/games/join", { code });
      if (!res.ok) throw new Error('Failed to join game');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      toast({
        title: "Game joined",
        description: "You have successfully joined the game!",
      });
      setGameCode("");
      setJoiningGame(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join game",
        description: error.message,
        variant: "destructive"
      });
      setJoiningGame(false);
    }
  });
  
  // Send invitations mutation
  const sendInvitationsMutation = useMutation({
    mutationFn: async ({ gameId, friendIds }: { gameId: number, friendIds: string[] }) => {
      if (devMode) {
        // Mock success response
        return { success: true, invitedCount: friendIds.length };
      }
      
      const res = await apiRequest("POST", "/api/games/invite", { gameId, friendIds });
      if (!res.ok) throw new Error('Failed to send invitations');
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Invitations sent",
        description: `Successfully sent ${data.invitedCount} invitations.`,
      });
      setSelectedFriends([]);
      setShowInviteDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send invitations",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle adding a friend to selected list
  const handleAddFriend = (friend: Friend) => {
    setSelectedFriends(prev => [...prev, friend]);
    setSearchQuery("");
  };
  
  // Handle removing a friend from selected list
  const handleRemoveFriend = (friendId: string) => {
    setSelectedFriends(prev => prev.filter(f => f.id !== friendId));
  };
  
  // Handle create game form submission
  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!gameName || !buyInAmount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // If we're on step 1, move to step 2
    if (createStep === 1) {
      setCreateStep(2);
      return;
    }
    
    // Final step - create the game
    setIsCreatingGame(true);
    
    // Prepare data for game creation
    const gameData = {
      name: gameName,
      buyInAmount: parseFloat(buyInAmount),
      date: gameDate || undefined,
      time: gameTime || undefined,
      location: gameLocation || undefined,
      maxPlayers: maxPlayers ? parseInt(maxPlayers) : undefined,
      invitedFriends: selectedFriends.map(f => f.id)
    };
    
    createGameMutation.mutate(gameData);
  };
  
  // Handle join game form submission
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
    joinGameMutation.mutate(gameCode);
  };
  
  // Handle sending invitations to a specific game
  const handleSendInvitations = (gameId: number) => {
    if (selectedFriends.length === 0) {
      toast({
        title: "No friends selected",
        description: "Please select at least one friend to invite.",
        variant: "destructive"
      });
      return;
    }
    
    sendInvitationsMutation.mutate({
      gameId,
      friendIds: selectedFriends.map(f => f.id)
    });
  };
  
  // Copy game code to clipboard
  const copyGameCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // Function to render the friend selection component
  const renderFriendSelection = () => (
    <div className="mt-6">
      <h3 className="font-medium text-lg mb-3">Invite Friends</h3>
      
      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search friends..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Selected friends */}
      {selectedFriends.length > 0 && (
        <div className="mb-4">
          <Label className="text-sm text-gray-600 mb-2 block">Selected ({selectedFriends.length})</Label>
          <div className="flex flex-wrap gap-2">
            {selectedFriends.map(friend => (
              <Badge 
                key={friend.id} 
                className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 py-1.5 px-3"
              >
                <span>{friend.username}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveFriend(friend.id)} 
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Friend list */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {filteredFriends.length > 0 ? (
          filteredFriends.map(friend => (
            <div 
              key={friend.id} 
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer"
              onClick={() => handleAddFriend(friend)}
            >
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {friend.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{friend.username}</div>
                  <div className="text-gray-500 text-xs flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-1.5 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    {friend.status === 'online' ? 'Online' : `Last active: ${friend.lastActive}`}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <UserPlus className="h-4 w-4 text-primary" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            {searchQuery ? 'No matching friends found' : 'No friends available to invite'}
          </div>
        )}
      </div>
    </div>
  );
  
  // Render based on the current create step
  const renderCreateGameContent = () => {
    if (createStep === 1) {
      // Step 1: Basic game information
      return (
        <div>
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
              disabled={!gameName || !buyInAmount || isCreatingGame}
            >
              Next: Invite Friends
            </Button>
          </form>
        </div>
      );
    } else if (createStep === 2) {
      // Step 2: Game details and invite friends
      return (
        <div>
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCreateStep(1)}
              className="mr-2 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-800">Game Details & Invites</h2>
          </div>
          
          <form onSubmit={handleCreateGame} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gameDate">Date (Optional)</Label>
                <Input 
                  id="gameDate"
                  type="date"
                  value={gameDate}
                  onChange={(e) => setGameDate(e.target.value)}
                  className="w-full" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gameTime">Time (Optional)</Label>
                <Input 
                  id="gameTime"
                  type="time"
                  value={gameTime}
                  onChange={(e) => setGameTime(e.target.value)}
                  className="w-full" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gameLocation">Location (Optional)</Label>
              <Input 
                id="gameLocation"
                value={gameLocation}
                onChange={(e) => setGameLocation(e.target.value)}
                className="w-full" 
                placeholder="e.g. Mike's Apartment" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Max Players (Optional)</Label>
              <Input 
                id="maxPlayers"
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                className="w-full" 
                placeholder="e.g. 8" 
              />
            </div>
            
            <Separator className="my-4" />
            
            {renderFriendSelection()}
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-primary text-white"
                disabled={isCreatingGame}
              >
                {isCreatingGame ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Creating Game...
                  </span>
                ) : (
                  <span>Create Game{selectedFriends.length > 0 ? ` & Invite ${selectedFriends.length} Friend${selectedFriends.length > 1 ? 's' : ''}` : ''}</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      );
    } else {
      // Step 3: Success and share options
      return (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Game Created Successfully!</h2>
          <p className="text-gray-600 mb-6">Your game has been created and invitations have been sent.</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Game Code:</span>
              <div className="flex items-center">
                <span className="font-mono font-medium mr-2">{newGameCode}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => copyGameCode(newGameCode)}
                >
                  {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Share this code with friends to let them join your game.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              className="w-full"
              onClick={() => navigate(`/games/${newGameId}`)}
            >
              View Game
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => {
                setCreateStep(1);
                setGameName("");
                setBuyInAmount("");
                setGameDate("");
                setGameTime("");
                setGameLocation("");
                setMaxPlayers("");
                setSelectedFriends([]);
                setNewGameId(null);
                setNewGameCode("");
              }}
            >
              Create Another Game
            </Button>
          </div>
        </div>
      );
    }
  };
  
  // Render friend invitation dialog
  const renderInviteFriendsDialog = () => (
    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
          <DialogDescription>
            Select friends to invite to this game.
          </DialogDescription>
        </DialogHeader>
        
        {renderFriendSelection()}
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowInviteDialog(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              // Get the selected game from the dialog context
              const gameId = Number(activeGames[0]?.id || 0);
              if (gameId) {
                handleSendInvitations(gameId);
              }
            }}
            disabled={selectedFriends.length === 0}
            className="bg-primary text-white"
          >
            Send Invitations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen pb-20 flex flex-col p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Poker Games</h1>
        {user && (
          <div className="flex items-center">
            <div className="text-sm text-gray-600 mr-2">Balance:</div>
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
              <DollarSign className="h-4 w-4 text-green-600 mr-1" />
              <div className="font-medium">
                $1,240.50
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="mb-6 w-full grid grid-cols-2">
          <TabsTrigger value="create" className="rounded-md">
            Create Game
          </TabsTrigger>
          <TabsTrigger value="join" className="rounded-md">
            Join Game
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-0">
          <Card className="shadow-md">
            <CardContent className="p-6">
              {renderCreateGameContent()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="join" className="mt-0">
          <Card className="shadow-md mb-6">
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
                    placeholder="Enter game code (e.g. POKER123)" 
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={!gameCode || joiningGame}
                >
                  {joiningGame ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Joining...
                    </span>
                  ) : (
                    "Join Game"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Active Games Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Your Games</h2>
          <Select defaultValue="upcoming">
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">In Progress</SelectItem>
              <SelectItem value="past">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {activeGames.length > 0 ? (
          <div className="space-y-3">
            {activeGames.map((game) => (
              <Card 
                key={game.id} 
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-gray-800 text-lg">{game.name}</h3>
                      <div className="flex items-center flex-wrap text-sm text-gray-500 mt-1 gap-x-4 gap-y-1">
                        <div className="flex items-center">
                          <DollarSign className="h-3.5 w-3.5 mr-1 opacity-70" />
                          ${game.buyInAmount} buy-in
                        </div>
                        
                        {game.date && game.time && (
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 opacity-70" />
                            {game.date} • {game.time}
                          </div>
                        )}
                        
                        {game.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1 opacity-70" />
                            {game.location}
                          </div>
                        )}
                        
                        {game.maxPlayers && (
                          <div className="flex items-center">
                            <Users className="h-3.5 w-3.5 mr-1 opacity-70" />
                            {game.currentPlayers || 1}/{game.maxPlayers} players
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFriends([]);
                          setShowInviteDialog(true);
                        }}
                        className="h-9"
                      >
                        <UserPlus className="h-4 w-4 mr-1.5" />
                        Invite
                      </Button>
                      
                      <Button
                        size="sm"
                        className="bg-primary text-white h-9"
                        onClick={() => navigate(`/games/${game.id}`)}
                      >
                        View Game
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center bg-white shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No games yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Create your first poker game to start playing with friends and manage your funds securely.
            </p>
            <Button 
              onClick={() => {
                const tabTrigger = document.querySelector<HTMLButtonElement>('[data-value="create"]');
                if (tabTrigger) tabTrigger.click();
              }}
              className="bg-primary text-white"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create Your First Game
            </Button>
          </Card>
        )}
      </div>
      
      {/* Invite Friends Dialog */}
      {renderInviteFriendsDialog()}
      
      {/* Navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-6">
        <Button variant="ghost" className="bg-gray-100" onClick={() => navigate("/games")}>Games</Button>
        <Button variant="ghost" onClick={() => navigate("/wallet")}>Wallet</Button>
        <Button variant="ghost" onClick={() => navigate("/friends")}>Friends</Button>
      </div>
    </div>
  );
}