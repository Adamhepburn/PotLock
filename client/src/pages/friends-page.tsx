import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Users,
  User,
  Search,
  UserCheck,
  Clock,
  UserX,
  Check,
  X,
  UserMinus
} from "lucide-react";

export default function FriendsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Add new friend state
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");
  const [searchResults, setSearchResults] = useState<{id: string, username: string}[]>([]);
  
  // Mock friends data
  const [friends, setFriends] = useState([
    { id: "friend-1", username: "Jane Doe", status: "online", lastActive: "Just now", gamesPlayed: 12, winRate: 67 },
    { id: "friend-2", username: "Mike Poker", status: "offline", lastActive: "3 hours ago", gamesPlayed: 8, winRate: 50 },
    { id: "friend-3", username: "Sarah Cards", status: "offline", lastActive: "Yesterday", gamesPlayed: 5, winRate: 40 },
    { id: "friend-4", username: "Tom Bailey", status: "online", lastActive: "Just now", gamesPlayed: 15, winRate: 73 },
    { id: "friend-5", username: "Chris Wilson", status: "offline", lastActive: "2 days ago", gamesPlayed: 3, winRate: 33 }
  ]);
  
  // Mock incoming friend requests
  const [incomingRequests, setIncomingRequests] = useState([
    { id: "req-1", username: "Alex Smith", timestamp: "5 minutes ago" },
    { id: "req-2", username: "Emma Johnson", timestamp: "Yesterday" }
  ]);
  
  // Mock outgoing friend requests
  const [outgoingRequests, setOutgoingRequests] = useState([
    { id: "out-1", username: "Bobby Thompson", timestamp: "1 hour ago" },
    { id: "out-2", username: "Lily Chen", timestamp: "2 days ago" }
  ]);
  
  // Search for users by username (simulated)
  const searchUsers = (query: string) => {
    // Example users for mock search results
    const mockUsers = [
      { id: "user-1", username: "Alex Smith" },
      { id: "user-2", username: "Bobby Johnson" },
      { id: "user-3", username: "Christina Lee" },
      { id: "user-4", username: "David Wilson" },
      { id: "user-5", username: "Emma Brown" },
    ];
    
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    
    // Filter users based on query
    const filteredUsers = mockUsers.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) &&
      // Don't include users who are already friends
      !friends.some(friend => friend.id === user.id) &&
      // Don't include users with pending requests
      !outgoingRequests.some(req => req.username === user.username)
    );
    
    setSearchResults(filteredUsers);
  };
  
  // Add new friend (simulated)
  const addFriend = (userId: string, username: string) => {
    setIsAddingFriend(true);
    
    // Simulate adding friend request
    setTimeout(() => {
      // Add to outgoing requests
      setOutgoingRequests(prev => [
        ...prev, 
        { id: `out-${Date.now()}`, username, timestamp: "Just now" }
      ]);
      
      toast({
        title: "Friend request sent",
        description: `Friend request sent to ${username}.`,
      });
      
      // Reset form
      setFriendUsername("");
      setSearchResults([]);
      setIsAddingFriend(false);
    }, 1000);
  };
  
  // Accept friend request (simulated)
  const acceptFriendRequest = (requestId: string, username: string) => {
    // Add to friends list
    setFriends(prev => [
      ...prev,
      { 
        id: requestId, 
        username, 
        status: "offline", 
        lastActive: "Just now", 
        gamesPlayed: 0, 
        winRate: 0 
      }
    ]);
    
    // Remove from incoming requests
    setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
    
    toast({
      title: "Friend request accepted",
      description: `${username} has been added to your friends list.`,
    });
  };
  
  // Decline friend request (simulated)
  const declineFriendRequest = (requestId: string, username: string) => {
    // Remove from incoming requests
    setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
    
    toast({
      title: "Friend request declined",
      description: `You declined ${username}'s friend request.`,
      variant: "destructive"
    });
  };
  
  // Cancel outgoing friend request (simulated)
  const cancelFriendRequest = (requestId: string, username: string) => {
    // Remove from outgoing requests
    setOutgoingRequests(prev => prev.filter(req => req.id !== requestId));
    
    toast({
      title: "Friend request cancelled",
      description: `Friend request to ${username} has been cancelled.`,
      variant: "destructive"
    });
  };
  
  // Remove friend (simulated)
  const removeFriend = (friendId: string, username: string) => {
    // Remove from friends list
    setFriends(prev => prev.filter(friend => friend.id !== friendId));
    
    toast({
      title: "Friend removed",
      description: `${username} has been removed from your friends list.`,
      variant: "destructive"
    });
  };
  
  return (
    <div className="container mx-auto max-w-4xl pt-8 pb-20 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Friends</h1>
        <p className="text-gray-600">Connect with other players and build your poker network</p>
      </div>
      
      <Tabs defaultValue="all-friends" className="w-full mb-8">
        <TabsList className="neumorphic-card p-1 mb-6">
          <TabsTrigger 
            value="all-friends" 
            className="neumorphic-button data-[state=active]:shadow-inner"
          >
            All Friends
            <Badge className="ml-2 bg-primary/10 text-primary border-0">
              {friends.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="requests" 
            className="neumorphic-button data-[state=active]:shadow-inner"
          >
            Requests
            {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
              <Badge className="ml-2 bg-primary/10 text-primary border-0">
                {incomingRequests.length + outgoingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="find-friends" 
            className="neumorphic-button data-[state=active]:shadow-inner"
          >
            Find Friends
          </TabsTrigger>
        </TabsList>
        
        {/* All Friends Tab */}
        <TabsContent value="all-friends">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.length > 0 ? (
              friends.map(friend => (
                <Card key={friend.id} className="neumorphic-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border border-gray-100">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {friend.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{friend.username}</div>
                          <div className="text-xs text-gray-500">
                            {friend.status === 'online' ? 'Online' : `Last active: ${friend.lastActive}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="neumorphic-button"
                          onClick={() => navigate(`/profile/${friend.id}`)}
                        >
                          <User className="h-4 w-4 mr-1" />
                          Profile
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-red-500"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] bg-[#f0f5fa] border-none shadow-md">
                            <DialogHeader>
                              <DialogTitle className="text-gray-800">Remove friend</DialogTitle>
                              <DialogDescription className="text-gray-600">
                                Are you sure you want to remove {friend.username} from your friends list?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="sm:justify-center sm:space-x-2 sm:py-4">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  const closeButton = document.querySelector<HTMLButtonElement>('[data-state="open"] [role="dialog"] button[aria-label="Close"]');
                                  if (closeButton) closeButton.click();
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={() => {
                                  removeFriend(friend.id, friend.username);
                                  const closeButton = document.querySelector<HTMLButtonElement>('[data-state="open"] [role="dialog"] button[aria-label="Close"]');
                                  if (closeButton) closeButton.click();
                                }}
                              >
                                Remove
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Games Played</div>
                          <div className="font-medium">{friend.gamesPlayed}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Win Rate</div>
                          <div className="font-medium">{friend.winRate}%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 neumorphic-card p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No friends yet</h3>
                <p className="text-gray-500 mb-4">
                  Add some friends to build your poker network
                </p>
                <Button 
                  className="neumorphic-button"
                  onClick={() => {
                    const tabTrigger = document.querySelector<HTMLButtonElement>('[data-value="find-friends"]');
                    if (tabTrigger) tabTrigger.click();
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find Friends
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Friend Requests Tab */}
        <TabsContent value="requests">
          <div className="space-y-6">
            {/* Incoming Requests */}
            <div>
              <div className="flex items-center mb-4">
                <UserCheck className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-lg font-semibold">Incoming Requests</h2>
                {incomingRequests.length > 0 && (
                  <Badge className="ml-2 bg-primary/10 text-primary border-0">
                    {incomingRequests.length}
                  </Badge>
                )}
              </div>
              
              {incomingRequests.length > 0 ? (
                <div className="space-y-2">
                  {incomingRequests.map(request => (
                    <Card key={request.id} className="neumorphic-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {request.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{request.username}</div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {request.timestamp}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="neumorphic-button bg-gradient-to-r from-primary/90 to-primary text-white hover:from-primary hover:to-primary/90"
                              onClick={() => acceptFriendRequest(request.id, request.username)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                              onClick={() => declineFriendRequest(request.id, request.username)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="neumorphic-card bg-gray-50/70">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">No incoming friend requests</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Outgoing Requests */}
            <div>
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-amber-500 mr-2" />
                <h2 className="text-lg font-semibold">Sent Requests</h2>
                {outgoingRequests.length > 0 && (
                  <Badge className="ml-2 bg-amber-100 text-amber-600 border-0">
                    {outgoingRequests.length}
                  </Badge>
                )}
              </div>
              
              {outgoingRequests.length > 0 ? (
                <div className="space-y-2">
                  {outgoingRequests.map(request => (
                    <Card key={request.id} className="neumorphic-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback className="bg-amber-100 text-amber-600">
                                {request.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{request.username}</div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                Sent {request.timestamp}
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => cancelFriendRequest(request.id, request.username)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="neumorphic-card bg-gray-50/70">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">No outgoing friend requests</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Find Friends Tab */}
        <TabsContent value="find-friends">
          <Card className="neumorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-primary" />
                Find New Friends
              </CardTitle>
              <CardDescription>
                Search for other players by username to connect with them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative">
                  <Input
                    placeholder="Search by username..."
                    value={friendUsername}
                    onChange={(e) => {
                      setFriendUsername(e.target.value);
                      searchUsers(e.target.value);
                    }}
                    className="neumorphic-inset bg-[#f0f5fa] border-none focus-visible:ring-primary/30 pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Search Results</h3>
                    <div className="neumorphic-inset rounded-xl overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        {searchResults.map((user) => (
                          <div 
                            key={user.id} 
                            className="flex items-center justify-between p-4 hover:bg-white/60 transition-colors duration-200"
                          >
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {user.username.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.username}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="neumorphic-button"
                              onClick={() => addFriend(user.id, user.username)}
                              disabled={isAddingFriend}
                            >
                              {isAddingFriend ? 
                                <span className="flex items-center">
                                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-1" />
                                  Sending...
                                </span> : 
                                <span className="flex items-center">
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Add Friend
                                </span>
                              }
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {friendUsername.trim() !== "" && searchResults.length === 0 && (
                  <div className="text-center py-6 neumorphic-inset rounded-xl">
                    <UserX className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No users found matching "{friendUsername}"</p>
                  </div>
                )}
                
                {friendUsername.trim() === "" && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto text-gray-200 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Search for Friends</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Enter a username above to find and connect with other players
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}