import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
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

function App() {
  return (
    <TooltipProvider>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/profile/:userId" component={ProfilePage} />
        <Route path="/games" component={GameSetupPage} />
        <Route path="/games/:id" component={GameDetailPage} />
        <Route path="/cash-out" component={CashOutPage} />
        <Route path="/cashout/:gameId" component={CashOutPage} />
        <Route path="/approval/:requestId" component={ApprovalPage} />
        <Route path="/staking" component={StakingPage} />
        <Route path="/wallet" component={WalletPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
