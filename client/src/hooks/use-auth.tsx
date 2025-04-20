import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User, LoginData } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Set to true for bypassing real authentication in development
const USE_DEV_MODE = true;

// Mock user data for development
const MOCK_USER: User = {
  id: 999,
  username: "poker_player",
  email: "player@potlock.app",
  password: "",
  displayName: "John Smith",
  createdAt: new Date(),
  walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", // Example wallet address
  profileImage: null
};

type RegisterData = z.infer<typeof insertUserSchema>;

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<User, "password">, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<User, "password">, Error, RegisterData>;
  updateWalletMutation: UseMutationResult<{success: boolean, walletAddress: string}, Error, {walletAddress: string}>;
  devMode: boolean;
  toggleDevMode: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [devMode, setDevMode] = useState(USE_DEV_MODE);
  
  // Initialize the mock user in development mode
  useEffect(() => {
    if (devMode) {
      queryClient.setQueryData(["/api/user"], MOCK_USER);
    }
  }, [devMode]);
  
  const {
    data: serverUser,
    error,
    isLoading: authLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    // Skip real auth in dev mode
    enabled: !devMode,
  });
  
  // Use mock user in dev mode, real user otherwise
  const user = devMode ? MOCK_USER : (serverUser ?? null);
  const isLoading = devMode ? false : authLoading;
  
  // Function to toggle development mode
  const toggleDevMode = () => {
    const newMode = !devMode;
    setDevMode(newMode);
    
    if (newMode) {
      queryClient.setQueryData(["/api/user"], MOCK_USER);
      toast({
        title: "Developer Mode Enabled",
        description: "Using mock user for authentication",
      });
    } else {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Developer Mode Disabled",
        description: "Using real authentication",
      });
    }
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      if (devMode) {
        // In dev mode, return mock user without calling API
        return { ...MOCK_USER, username: credentials.username };
      }
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: Omit<User, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      if (devMode) {
        // In dev mode, return mock user merged with provided data
        return { 
          ...MOCK_USER, 
          username: userData.username,
          email: userData.email,
          displayName: userData.displayName
        };
      }
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user: Omit<User, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (devMode) {
        // In dev mode, simulate logout without API call
        return;
      }
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // If in dev mode, automatically log back in after short delay
      if (devMode) {
        setTimeout(() => {
          queryClient.setQueryData(["/api/user"], MOCK_USER);
        }, 500);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateWalletMutation = useMutation({
    mutationFn: async ({ walletAddress }: { walletAddress: string }) => {
      if (devMode) {
        // In dev mode, simulate successful wallet connection
        return { success: true, walletAddress };
      }
      const res = await apiRequest("POST", "/api/user/wallet", { walletAddress });
      return await res.json();
    },
    onSuccess: (data) => {
      // Update user with new wallet address
      if (user) {
        queryClient.setQueryData(["/api/user"], {
          ...user,
          walletAddress: data.walletAddress,
        });
      }
      toast({
        title: "Wallet connected",
        description: "Your wallet has been successfully connected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to connect wallet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateWalletMutation,
        devMode,
        toggleDevMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
