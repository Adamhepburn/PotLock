import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import GameSetupPage from "@/pages/game-setup-page";
import GameDetailPage from "@/pages/game-detail-page";
import CashOutPage from "@/pages/cash-out-page";
import ApprovalPage from "@/pages/approval-page";

function App() {
  return (
    <TooltipProvider>
      <Switch>
        <Route path="/" component={AuthPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/games" component={GameSetupPage} />
        <Route path="/games/:id" component={GameDetailPage} />
        <Route path="/cashout/:gameId" component={CashOutPage} />
        <Route path="/approval/:requestId" component={ApprovalPage} />
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
