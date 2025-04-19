import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useLocation, Route } from "wouter";
import { Button } from "@/components/ui/button";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading, devMode, toggleDevMode } = useAuth();
  const [, navigate] = useLocation();

  // Always render the component directly for path matches in dev mode
  if (devMode) {
    return <Route path={path} component={Component} />;
  }
  
  // Show loading indicator when authentication is in progress
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
          <p className="text-sm text-muted-foreground">Loading authentication...</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleDevMode}
          >
            Enable Developer Mode
          </Button>
        </div>
      </Route>
    );
  }

  // Show authentication required if no user is logged in
  if (!user) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-2xl font-bold">Authentication Required</h1>
            <p className="text-muted-foreground">You need to log in to view this page</p>
            <div className="flex flex-col sm:flex-row justify-center mt-4 gap-4">
              <Button 
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
              <Button 
                variant="outline"
                onClick={toggleDevMode}
              >
                Enable Developer Mode
              </Button>
            </div>
          </div>
        </div>
      </Route>
    );
  }

  // User is authenticated, render the actual component
  return <Route path={path} component={Component} />;
}
