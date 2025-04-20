import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  Star,
  Home,
  Check
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
    <div className="container mx-auto max-w-3xl pt-10 pb-20 px-4">
      {isViewingFriend && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6"
          onClick={() => navigate("/profile")}
        >
          <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
          Back to your profile
        </Button>
      )}
      
      {/* Profile header with neumorphic card */}
      <div className="neumorphic-card p-6 mb-8">
        <div className="flex items-center">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-white">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {activeUser?.username.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {/* Level indicator */}
            <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
              {playerLevel}
            </div>
          </div>
          
          <div className="ml-6 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {isViewingFriend && friendData?.displayName ? 
                    friendData.displayName : activeUser?.username || "User"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {isViewingFriend ? 
                    `@${activeUser?.username || "username"}` : activeUser?.email || "email"}
                </p>
                
                {/* Connection status badge */}
                {!isViewingFriend && (
                  <div className="flex items-center text-xs mt-2 bg-gray-100 w-fit rounded-full px-2 py-1">
                    <div className={`w-2 h-2 ${isConnected ? "bg-green-400" : "bg-gray-400"} rounded-full mr-1.5`}></div>
                    <span className="text-gray-600">{isConnected ? "Wallet Connected" : "Wallet Not Connected"}</span>
                  </div>
                )}
              </div>
              
              {isViewingFriend && (
                <Button 
                  size="sm"
                  variant="outline"
                  className="neumorphic-button"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Friends
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Player Level Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Level {playerLevel}</span>
            <span>{nextLevelProgress}% to Level {playerLevel + 1}</span>
          </div>
          <Progress value={nextLevelProgress} className="h-2" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="neumorphic-inset p-4 text-center">
            <div className="text-sm font-medium text-gray-500">Games</div>
            <div className="text-xl font-bold text-gray-800 mt-1">{stats.gamesPlayed}</div>
          </div>
          <div className="neumorphic-inset p-4 text-center">
            <div className="text-sm font-medium text-gray-500">Win Rate</div>
            <div className="text-xl font-bold text-gray-800 mt-1">
              {stats.gamesPlayed > 0 
                ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
                : 0}%
            </div>
          </div>
          <div className="neumorphic-inset p-4 text-center">
            <div className="text-sm font-medium text-gray-500">Net Profit</div>
            <div className="text-xl font-bold text-gray-800 mt-1">${stats.netProfit}</div>
          </div>
        </div>
      </div>
      
      {/* Main Action Buttons - only visible on own profile */}
      {!isViewingFriend && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button 
            className="h-14 shadow-lg"
            style={{ backgroundColor: "#1e40af", color: "white" }}
            onClick={() => navigate("/deposit")}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Add Funds
          </Button>
          <Button 
            className="h-14 shadow-lg"
            style={{ backgroundColor: "#1e40af", color: "white" }}
            onClick={() => navigate("/cashout/1")}
          >
            <DollarSign className="h-5 w-5 mr-2" />
            Cash Out
          </Button>
        </div>
      )}

      {/* Tabs content section */}
      <div className="mb-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="neumorphic-card p-1 mb-6">
            <TabsTrigger value="overview" className="neumorphic-button data-[state=active]:shadow-inner">Overview</TabsTrigger>
            <TabsTrigger value="achievements" className="neumorphic-button data-[state=active]:shadow-inner">Badges</TabsTrigger>
            <TabsTrigger value="friends" className="neumorphic-button data-[state=active]:shadow-inner">Friends</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="neumorphic-card mb-6 p-6">
              <div className="flex items-center mb-4">
                <Trophy className="w-5 h-5 mr-2 text-amber-500" />
                <h3 className="text-lg font-semibold">Player Stats</h3>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-6">
                  <div className="neumorphic-inset p-4 rounded-xl">
                    <div className="text-sm font-medium text-gray-500">Games Played</div>
                    <div className="text-xl font-bold mt-1">{stats.gamesPlayed}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Won: {stats.gamesWon} · Lost: {stats.gamesLost}
                    </div>
                  </div>
                  <div className="neumorphic-inset p-4 rounded-xl">
                    <div className="text-sm font-medium text-gray-500">Win Rate</div>
                    <div className="text-xl font-bold mt-1">
                      {stats.gamesPlayed > 0 
                        ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
                        : 0}%
                    </div>
                  </div>
                </div>
                  
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
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
                      {activeUser?.joinDate.toLocaleDateString() || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Activity Feed */}
            <div className="neumorphic-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                </div>
                <Badge className="bg-primary/10 text-primary border-0">{recentActivity.length}</Badge>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                    <div className="mr-3 p-2 neumorphic rounded-full">
                      {activity.type === 'game_join' && <Users className="h-5 w-5 text-blue-500" />}
                      {activity.type === 'cash_out' && <DollarSign className="h-5 w-5 text-green-500" />}
                      {activity.type === 'staking' && <TrendingUp className="h-5 w-5 text-purple-500" />}
                      {activity.type === 'game_win' && <Trophy className="h-5 w-5 text-amber-500" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{activity.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{activity.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="neumorphic-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Medal className="w-5 h-5 mr-2 text-amber-500" />
                  <h3 className="text-lg font-semibold">Achievements</h3>
                </div>
                <Badge className="bg-primary/10 text-primary border-0">
                  {achievements.filter(a => a.earned).length}/{achievements.length}
                </Badge>
              </div>
              
              <div className="space-y-5">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={`flex items-center p-4 rounded-xl ${achievement.earned ? 'neumorphic' : 'neumorphic-inset opacity-70'}`}
                  >
                    <div className={`p-3 rounded-full ${achievement.earned ? 'bg-primary/10' : 'bg-gray-100'}`}>
                      {achievement.icon}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{achievement.name}</div>
                        {achievement.earned ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Earned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                            Locked
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Friends Tab */}
          <TabsContent value="friends">
            <div className="neumorphic-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  <h3 className="text-lg font-semibold">Friends</h3>
                </div>
                <Badge className="bg-primary/10 text-primary border-0">{friends.length}</Badge>
              </div>
              
              <div className="space-y-4">
                {friends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-4 neumorphic rounded-xl">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 border border-gray-100">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {friend.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="font-medium">{friend.username}</div>
                        <div className="flex items-center">
                          <div className={`w-1.5 h-1.5 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} rounded-full mr-1.5`}></div>
                          <span className="text-xs text-gray-500 capitalize">{friend.status}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="neumorphic-button"
                      onClick={() => navigate(`/profile/${friend.id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
              
              {!isViewingFriend && (
                <div className="mt-6 pt-4 border-t">
                  <Button variant="outline" className="w-full neumorphic-button">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Friend
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}