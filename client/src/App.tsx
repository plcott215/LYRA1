import { Switch, Route } from "wouter";
import { useAuth } from "./context/auth-context";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Subscribe from "@/pages/subscribe";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={user ? Dashboard : Auth} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/subscribe" component={Subscribe} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
