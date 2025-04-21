import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  Menu,
  Home,
  Wallet,
  PieChart,
  Users,
  Settings,
  LogOut,
  User,
  CreditCard,
  Bell,
  HelpCircle
} from "lucide-react";

export default function TopNavigation() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  // Mock notification data
  const mockNotifications = [
    { 
      id: 1, 
      title: "Friend Request", 
      message: "Alex Smith sent you a friend request", 
      time: "5 minutes ago",
      read: false
    },
    { 
      id: 2, 
      title: "Game Invitation", 
      message: "You're invited to Friday Night Poker", 
      time: "1 hour ago",
      read: false
    },
    { 
      id: 3, 
      title: "Staking Rewards", 
      message: "You earned $1.25 in staking rewards", 
      time: "Yesterday",
      read: true
    }
  ];
  
  const [notifications, setNotifications] = useState(mockNotifications);
  const notificationCount = notifications.filter(n => !n.read).length;
  
  // Mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation('/auth');
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              PotLock
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8"
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-white flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {notificationCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs hover:bg-gray-100"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              {notifications.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-medium text-sm">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 h-2 w-2 rounded-full bg-primary inline-block"></span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{notification.time}</div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <Bell className="h-10 w-10 mx-auto opacity-20" />
                  </div>
                  <p className="text-sm text-gray-500">No notifications</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-1 pl-2 pr-2 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src="/avatar.png" 
                    alt={user?.displayName || user?.username || "User"} 
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.displayName 
                      ? getInitials(user.displayName) 
                      : user?.username?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <Menu className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                {user?.displayName || user?.username || "User"}
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setLocation('/')}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/wallet')}>
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Account Balance</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setLocation('/deposit')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Add Funds</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/profile')}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Friends</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/about')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>About PotLock</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}