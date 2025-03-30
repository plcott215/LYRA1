import { Switch, Route } from "wouter";
import { useAuth } from "./context/auth-context";
import Auth from "@/pages/auth";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Subscribe from "@/pages/subscribe";
import Pricing from "@/pages/pricing";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

function App() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [hasError, setHasError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout reached after 5 seconds");
        setLoadingTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Error boundary
  useEffect(() => {
    const handleErrors = (event: ErrorEvent) => {
      console.error("Application error:", event.error);
      setHasError(true);
      toast({
        title: "Application Error",
        description: "Something went wrong. Please try refreshing the page.",
        variant: "destructive",
      });
    };

    window.addEventListener("error", handleErrors);
    return () => window.removeEventListener("error", handleErrors);
  }, []);

  // Show loading spinner for initial load, but with a bypass option if it takes too long
  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        {loadingTimeout && (
          <button 
            className="text-primary hover:underline mt-4"
            onClick={() => setLoadingTimeout(true)}
          >
            Having trouble? Click to continue anyway
          </button>
        )}
      </div>
    );
  }

  // If there's an error or loading timeout, allow continuing with the app
  // This will let users access the app even if authentication fails
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={(user || hasError || loadingTimeout) ? Dashboard : Auth} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/pricing" component={Pricing} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
