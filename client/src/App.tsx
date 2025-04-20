import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { Web3Provider } from "@/hooks/use-web3";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import GameSetupPage from "@/pages/game-setup-page";
import GameDetailPage from "@/pages/game-detail-page";
import CashOutPage from "@/pages/cash-out-page";
import ApprovalPage from "@/pages/approval-page";
import StakingPage from "@/pages/staking-page";
import WalletPage from "@/pages/wallet-page";
import SettingsPage from "@/pages/settings-page";
import DashboardPage from "@/pages/dashboard-page";
import AboutPage from "@/pages/about-page";
import TopNavigation from "@/components/navigation/TopNavigation";

function AppRoutes() {
  const [location] = useLocation();
  const isAuthPage = location === "/auth";
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <TopNavigation />}
      
      <div className="flex-1">
        <Switch>
          <ProtectedRoute path="/" component={DashboardPage} />
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/dashboard" component={DashboardPage} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <ProtectedRoute path="/profile/:userId" component={ProfilePage} />
          <ProtectedRoute path="/games" component={GameSetupPage} />
          <ProtectedRoute path="/games/:id" component={GameDetailPage} />
          <ProtectedRoute path="/cash-out" component={CashOutPage} />
          <ProtectedRoute path="/cashout/:gameId" component={CashOutPage} />
          <ProtectedRoute path="/approval/:requestId" component={ApprovalPage} />
          <ProtectedRoute path="/staking" component={StakingPage} />
          <ProtectedRoute path="/wallet" component={WalletPage} />
          <ProtectedRoute path="/settings" component={SettingsPage} />
          <Route path="/about" component={AboutPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <TooltipProvider>
          <AppRoutes />
          <Toaster />
        </TooltipProvider>
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;
