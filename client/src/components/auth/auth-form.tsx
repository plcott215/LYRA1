import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/lib/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";

// Regular authentication will be used, no hardcoded credentials

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigError, setShowConfigError] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { authError } = useAuth();
  
  // Check for authentication configuration issues
  useEffect(() => {
    if (authError && (
      authError === "auth-config-missing" || 
      authError === "auth-init-error" || 
      authError === "auth-timeout-long"
    )) {
      setShowConfigError(true);
    }
  }, [authError]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Regular user authentication
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast({
          title: "Account created successfully!",
          description: "Welcome to Lyra!",
        });
      } else {
        await signInWithEmail(email, password);
      }
      setLocation("/dashboard");
    } catch (error: any) {
      console.error("Email auth error:", error);
      
      // Provide a more user-friendly error message
      let errorMessage = error.message;
      let errorTitle = "Authentication Error";
      
      // Check for specific error messages to provide better feedback
      if (error.message.includes("configuration-not-found") || 
          error.message.includes("temporarily unavailable")) {
        errorTitle = "Service Temporarily Unavailable";
        errorMessage = "Our authentication service is currently unavailable. Please try again later.";
      } else if (error.message.includes("wrong-password")) {
        errorMessage = "Incorrect email or password. Please try again.";
      } else if (error.message.includes("user-not-found")) {
        errorMessage = "No account found with this email address.";
      } else if (error.message.includes("email-already-in-use")) {
        errorMessage = "An account with this email already exists.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      await signInWithGoogle();
      setLocation("/dashboard");
    } catch (error: any) {
      console.error("Google auth error:", error);
      
      // Provide user-friendly error messages based on error types
      let errorTitle = "Authentication Error";
      let errorMessage = error.message;
      
      // Handle various error scenarios
      if (error.message.includes("configuration-not-found") || 
          error.message.includes("auth/configuration") ||
          error.message.includes("Firebase configuration is missing")) {
        errorTitle = "Google Sign-in Unavailable";
        errorMessage = "Google sign-in is currently unavailable. Please use email sign-in instead.";
      } else if (error.code === "auth/popup-closed-by-user") {
        errorTitle = "Sign-in Cancelled";
        errorMessage = "You closed the sign-in window. Please try again if you want to sign in.";
      } else if (error.code === "auth/popup-blocked") {
        errorTitle = "Popup Blocked";
        errorMessage = "Sign-in popup was blocked by your browser. Please allow popups for this site and try again.";
      } else if (error.code === "auth/network-request-failed") {
        errorTitle = "Network Error";
        errorMessage = "A network error occurred. Please check your connection and try again.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // No Apple sign-in needed

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          <span className="text-primary">Lyra</span>
        </h1>
        <p className="text-muted-foreground text-lg">AI-powered toolkit for freelancers</p>
      </div>

      <div className="bg-card rounded-xl p-6 relative overflow-hidden shadow-[0_0_15px_rgba(252,238,9,0.2)]">
        {showConfigError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Configuration Issue</AlertTitle>
            <AlertDescription>
              The authentication service is currently experiencing configuration issues. 
              Some sign-in methods may not work properly. You can still try to sign in with email and password.
            </AlertDescription>
          </Alert>
        )}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {isSignUp ? "Create an account" : "Sign in to your account"}
          </h2>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border-border focus:ring-primary"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border-border focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="h-4 w-4 bg-background border-border"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-muted-foreground">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:shadow-[0_0_10px_rgba(252,238,9,0.5)] transition-all duration-200 relative overflow-hidden"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-b-transparent rounded-full"></div>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-border absolute w-full"></div>
          <div className="bg-card px-4 relative z-10 text-muted-foreground text-sm">or continue with</div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full bg-background border border-border text-white hover:bg-muted transition-all duration-200 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.20455C17.64 8.56637 17.5827 7.95274 17.4764 7.36365H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
              <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
              <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
              <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
            </svg>
            Google
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-4">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)} 
            className="text-primary hover:underline ml-1"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
