import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Wallet, 
  CreditCard, 
  Settings, 
  DollarSign, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Shield,
  Users,
  LogOut,
  Trophy,
  Medal,
  Crown,
  Swords,
  BadgeCheck,
  Heart,
  UserPlus,
  Star
} from "lucide-react";

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/profile/:userId?");
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  
  // Check if we're viewing someone else's profile
  const isViewingFriend = Boolean(match && params && params.userId);
  
  // Demo user data (simulated)
  const user = {
    id: "current-user",
    username: "Demo User",
    email: "demo@example.com",
    walletAddress: address || "Not connected",
    joinDate: new Date(),
  };
  
  // Friend data (simulated)
  const friendData = isViewingFriend ? {
    id: params?.userId || "",
    username: "John Poker",
    displayName: "The Card King",
    email: "hidden@privacy.com",
    walletAddress: "hidden",
    joinDate: new Date(2024, 2, 15),
  } : null;
  
  // The active user data - either our profile or friend's profile
  const activeUser = isViewingFriend ? friendData : user;
  
  // Check for stored wallet connection on load
  useEffect(() => {
    const storedWallet = localStorage.getItem('wallet_address');
    if (storedWallet) {
      setAddress(storedWallet);
      setIsConnected(true);
    }
  }, []);
  
  // Handle wallet connection (simulated)
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection for demo purposes
    setTimeout(() => {
      // Generate a mock wallet address
      const mockAddress = "0x" + Math.random().toString(16).substring(2, 42);
      
      // Store in local state and localStorage
      setAddress(mockAddress);
      setIsConnected(true);
      localStorage.setItem('wallet_address', mockAddress);
      
      toast({
        title: "Wallet connected",
        description: "Coinbase Wallet has been connected successfully!",
      });
      setIsConnecting(false);
    }, 1500);
  };
  
  // Handle wallet disconnection (simulated)
  const handleDisconnectWallet = () => {
    // Simulate wallet disconnection
    setAddress(null);
    setIsConnected(false);
    
    // Remove from localStorage
    localStorage.removeItem('wallet_address');
    
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected.",
    });
  };
  
  // Handle logout (simulated)
  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Disconnect wallet if connected
    if (isConnected) {
      handleDisconnectWallet();
    }
    
    // Simulate logout process
    setTimeout(() => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      setIsLoggingOut(false);
      navigate("/auth");
    }, 1000);
  };

  // Game stats
  const stats = {
    gamesPlayed: 8,
    gamesWon: 3,
    gamesLost: 5,
    totalEarnings: 520,
    totalLosses: 430,
    netProfit: 90,
    activeCashouts: 2,
    totalStaked: isConnected ? 100 : 0,
    earnedYield: isConnected ? 1.25 : 0,
  };

  // Activity history
  const recentActivity = [
    { type: 'game_join', description: 'Joined "Friday Night Poker"', date: '3 days ago' },
    { type: 'cash_out', description: 'Cashed out $75.00', date: '5 days ago' },
    { type: 'staking', description: 'Staked 100 USDC in Aave', date: '1 week ago' },
    { type: 'game_win', description: 'Won $120 in "Texas Hold\'em Classic"', date: '2 weeks ago' },
  ];
  
  // Mock friends data
  const friends = [
    { id: "friend-1", username: "Jane Doe", status: "online" },
    { id: "friend-2", username: "Mike Poker", status: "offline" },
    { id: "friend-3", username: "Sarah Cards", status: "offline" }
  ];
  
  // Achievements for the gamified profile
  const achievements = [
    { id: 1, name: "First Win", description: "Won your first poker game", icon: <Trophy className="h-5 w-5 text-amber-500" />, earned: true },
    { id: 2, name: "Big Spender", description: "Staked over $500 in a single game", icon: <DollarSign className="h-5 w-5 text-green-500" />, earned: true },
    { id: 3, name: "Comeback Kid", description: "Won after being down to less than 10% of chips", icon: <Swords className="h-5 w-5 text-indigo-500" />, earned: true },
    { id: 4, name: "Royal Flush", description: "Got a royal flush in a game", icon: <Crown className="h-5 w-5 text-purple-500" />, earned: false },
    { id: 5, name: "Tournament Champion", description: "Won a tournament with 8+ players", icon: <Medal className="h-5 w-5 text-amber-600" />, earned: false }
  ];
  
  // Player level calculation based on games and wins
  const playerLevel = Math.floor(stats.gamesPlayed / 2) + stats.gamesWon;
  const nextLevelProgress = ((stats.gamesPlayed % 2) + (stats.gamesWon % 2)) * 50;

  // Recent games
  const recentGames = [
    { id: 1, name: "Friday Night Poker", date: "Last Friday", result: "Win", amount: "+$120" },
    { id: 2, name: "Weekly Tournament", date: "June 10", result: "Loss", amount: "-$50" },
    { id: 3, name: "Texas Hold'em Classic", date: "June 3", result: "Win", amount: "+$75" }
  ];

  return (
    <div className="min-h-screen pb-20 flex flex-col">
      {/* Header with user info */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white pt-8 pb-6 px-6">
        {isViewingFriend && (
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/profile")}
            >
              <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
              Back to your profile
            </Button>
          </div>
        )}
        
        <div className="flex items-center mb-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-white">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary-foreground text-primary text-lg">
                {activeUser?.username.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {/* Level indicator */}
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
              {playerLevel}
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">
                  {isViewingFriend && friendData?.displayName ? 
                    friendData.displayName : activeUser?.username || "User"}
                </h1>
                <p className="text-sm opacity-90">
                  {isViewingFriend ? 
                    `@${activeUser?.username || "username"}` : activeUser?.email || "email"}
                </p>
              </div>
              
              {isViewingFriend ? (
                <Button 
                  size="sm"
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                >
                  <Heart className="h-4 w-4 mr-1 fill-white" />
                  Friends
                </Button>
              ) : (
                <div className="flex items-center text-xs bg-white/20 rounded-full px-2 py-0.5">
                  <div className={`w-2 h-2 ${isConnected ? "bg-green-400" : "bg-gray-200"} rounded-full mr-1.5`}></div>
                  <span>{isConnected ? "Wallet Connected" : "Wallet Not Connected"}</span>
                </div>
              )}
            </div>
            
            {/* Level progress */}
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Level {playerLevel}</span>
                <span>Level {playerLevel + 1}</span>
              </div>
              <Progress value={nextLevelProgress} className="h-1.5 bg-white/20" />
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs opacity-75">Total Games</div>
            <div className="text-xl font-bold">{stats.gamesPlayed}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs opacity-75">Win Rate</div>
            <div className="text-xl font-bold">
              {stats.gamesPlayed > 0 
                ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
                : 0}%
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs opacity-75">Net Profit</div>
            <div className="text-xl font-bold">${stats.netProfit}</div>
          </div>
        </div>
      </div>

      {/* Main content with tabs */}
      <div className="px-6 py-4">
        {isViewingFriend ? (
          // Friend profile view - gamified tabs
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="games">Games</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab for Friend */}
            <TabsContent value="overview">
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-amber-500" />
                    Player Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Games Played</div>
                        <div className="text-xl font-bold">{stats.gamesPlayed}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Won: {stats.gamesWon} · Lost: {stats.gamesLost}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Win Rate</div>
                        <div className="text-xl font-bold">
                          {stats.gamesPlayed > 0 
                            ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
                            : 0}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Favorite Game</div>
                          <div className="font-medium">Texas Hold'em</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Playing Style</div>
                          <div className="font-medium">Aggressive</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Member Since</div>
                          <div className="font-medium">
                            {friendData?.joinDate.toLocaleDateString() || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <BadgeCheck className="w-5 h-5 mr-2 text-indigo-500" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.filter(a => a.earned).slice(0, 3).map(achievement => (
                      <div key={achievement.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                          {achievement.icon}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">{achievement.name}</div>
                          <div className="text-xs text-gray-500">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-sm"
                    onClick={() => document.querySelector('[data-value="achievements"]')?.click()}
                  >
                    View All Achievements
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-500" />
                    Mutual Friends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {friends.slice(0, 2).map(friend => (
                      <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{friend.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <div className="font-medium">{friend.username}</div>
                            <div className="flex items-center">
                              <div className={`w-1.5 h-1.5 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} rounded-full mr-1.5`}></div>
                              <span className="text-xs text-gray-500 capitalize">{friend.status}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/profile/${friend.id}`)}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-sm"
                    onClick={() => document.querySelector('[data-value="friends"]')?.click()}
                  >
                    View All Friends
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-amber-500" />
                    All Achievements
                  </CardTitle>
                  <CardDescription>
                    Achievements earned by playing poker games
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.map(achievement => (
                      <div 
                        key={achievement.id} 
                        className={`flex items-center p-3 rounded-lg ${achievement.earned ? 'bg-gray-50' : 'bg-gray-50/50'}`}
                      >
                        <div className={`p-2 rounded-full shadow-sm ${achievement.earned ? 'bg-white' : 'bg-gray-100'}`}>
                          {achievement.icon}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{achievement.name}</div>
                            {achievement.earned ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <BadgeCheck className="h-3 w-3 mr-1" />
                                Earned
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                                Locked
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Friends Tab */}
            <TabsContent value="friends">
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-500" />
                      Friends
                    </CardTitle>
                    <Badge>{friends.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {friends.map(friend => (
                      <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{friend.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <div className="font-medium">{friend.username}</div>
                            <div className="flex items-center">
                              <div className={`w-1.5 h-1.5 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} rounded-full mr-1.5`}></div>
                              <span className="text-xs text-gray-500 capitalize">{friend.status}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/profile/${friend.id}`)}>
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Games Tab */}
            <TabsContent value="games">
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-amber-500" />
                    Recent Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentGames.map(game => (
                      <div key={game.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{game.name}</div>
                          <div className="text-xs text-gray-500">{game.date}</div>
                        </div>
                        <div className="flex items-center">
                          <Badge 
                            variant="outline" 
                            className={`mr-3 ${
                              game.result === 'Win' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {game.result}
                          </Badge>
                          <div className={`font-medium ${
                            game.amount.startsWith('+') 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {game.amount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-sm"
                    onClick={() => navigate("/games")}
                  >
                    View All Games
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Personal profile view - with wallet, earnings, settings
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          
            {/* Overview Tab */}
            <TabsContent value="overview">
              {/* Account Card */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Account
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-sm">Edit</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-500">Username</Label>
                        <div className="font-medium">{user.username}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Email</Label>
                        <div className="font-medium">{user.email}</div>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-gray-500">Joined</Label>
                        <div className="font-medium">{user.joinDate.toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Game Stats Card */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Game Statistics
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-sm"
                      onClick={() => navigate("/games")}
                    >
                      View Games
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Games Played</div>
                      <div className="text-xl font-bold">{stats.gamesPlayed}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Won: {stats.gamesWon} · Lost: {stats.gamesLost}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Win Rate</div>
                      <div className="text-xl font-bold">
                        {stats.gamesPlayed > 0 
                          ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
                          : 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="text-sm">
                        <div className="text-gray-500 text-xs">Total Earnings</div>
                        <div className="font-medium text-green-600">${stats.totalEarnings}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-500 text-xs">Total Losses</div>
                        <div className="font-medium text-red-600">${stats.totalLosses}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-500 text-xs">Net Profit</div>
                        <div className={`font-medium ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${stats.netProfit}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-start">
                        <div className="mt-0.5">
                          {activity.type === 'game_join' && (
                            <Users className="h-5 w-5 text-blue-500" />
                          )}
                          {activity.type === 'cash_out' && (
                            <DollarSign className="h-5 w-5 text-green-500" />
                          )}
                          {activity.type === 'staking' && (
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                          )}
                          {activity.type === 'game_win' && (
                            <CreditCard className="h-5 w-5 text-amber-500" />
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium">{activity.description}</div>
                          <div className="text-xs text-gray-500">{activity.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="w-full text-sm">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Wallet Tab */}
            <TabsContent value="wallet">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Wallet className="w-5 h-5 mr-2" />
                      Wallet Connection
                    </CardTitle>
                    {isConnected && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDisconnectWallet}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    Connect your wallet to use the platform's full features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`p-4 mb-4 rounded-lg ${isConnected ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 ${isConnected ? 'bg-green-500' : 'bg-gray-400'} rounded-full mr-2`}></div>
                        <span className={`font-medium ${isConnected ? 'text-green-800' : 'text-gray-800'}`}>
                          {isConnected ? "Connected to Coinbase Wallet" : "Not connected"}
                        </span>
                      </div>
                    </div>
                    
                    {isConnected && (
                      <div className="mt-2 pt-2 border-t border-green-100">
                        <div className="font-mono text-sm break-all text-gray-600">
                          {address}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!isConnected ? (
                    <Button 
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white"
                      onClick={handleConnectWallet}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connecting...
                        </span>
                      ) : (
                        "Connect Coinbase Wallet"
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Features available with wallet:</div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Shield className="h-4 w-4 text-green-500 mr-2" />
                            <span>Secure escrow for game payments</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                            <span>Earn ~5% APY on idle funds via Aave</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                            <span>Fast and transparent cash-outs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {isConnected && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Earn Interest
                    </CardTitle>
                    <CardDescription>
                      Earn approximately 5% APY on your funds between games
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-gray-500">Total Staked</div>
                            <div className="text-lg font-bold text-emerald-700">${stats.totalStaked}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Interest Earned</div>
                            <div className="text-lg font-bold text-emerald-700">${stats.earnedYield}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button className="w-full" onClick={() => navigate("/staking")}>
                          Keep Earning (Stake Funds)
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => navigate("/staking")}>
                          Withdraw Staked Funds
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Earnings Tab */}
            <TabsContent value="earnings">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Earnings Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Total Winnings</div>
                        <div className="text-2xl font-bold">${stats.totalEarnings}</div>
                        <div className="text-xs text-gray-500 mt-1">From {stats.gamesWon} winning games</div>
                      </div>
                      
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Total Losses</div>
                        <div className="text-2xl font-bold">${stats.totalLosses}</div>
                        <div className="text-xs text-gray-500 mt-1">From {stats.gamesLost} losing games</div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Net Profit/Loss</div>
                        <div className={`text-lg font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${stats.netProfit}
                        </div>
                      </div>
                    </div>
                    
                    {isConnected && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">Interest Earned</div>
                          <div className="text-lg font-bold text-emerald-600">${stats.earnedYield}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Earning ~5% APY by staking ${stats.totalStaked} in Aave's lending pool
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Active Cash Outs</div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{stats.activeCashouts}</Badge>
                      </div>
                      
                      {stats.activeCashouts > 0 ? (
                        <Button variant="outline" className="w-full" onClick={() => navigate('/cash-out')}>
                          View Cash Out Status
                        </Button>
                      ) : (
                        <div className="text-xs text-gray-500">
                          No pending cash outs at the moment
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Earnings History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentGames.map(game => (
                      <div key={game.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{game.name}</div>
                          <div className="text-xs text-gray-500">{game.date}</div>
                        </div>
                        <div className={`font-medium ${
                          game.amount.startsWith('+') 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {game.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="w-full text-sm">
                    View Complete History
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue={user.username} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input id="displayName" placeholder="Add a display name" />
                      <div className="text-xs text-gray-500">
                        This is how you'll appear to other players
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user.email} />
                    </div>
                    
                    <div className="pt-2">
                      <Button className="w-full">Save Changes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    variant="destructive"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "Logging out..." : "Log out"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      {/* Navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-6">
        <Button variant="ghost" className="flex flex-col items-center justify-center h-full" onClick={() => navigate("/games")}>
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">Games</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center justify-center h-full bg-gray-50" onClick={() => navigate("/profile")}>
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Button>
      </div>
    </div>
  );
}