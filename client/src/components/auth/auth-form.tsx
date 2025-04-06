import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple } from "@/lib/firebase";

// Regular authentication will be used, no hardcoded credentials

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

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
      toast({
        title: "Authentication Error",
        description: error.message,
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
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAppleAuth = async () => {
    setIsLoading(true);
    
    try {
      await signInWithApple();
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          <span className="text-primary">Lyra</span>
        </h1>
        <p className="text-muted-foreground text-lg">AI-powered toolkit for freelancers</p>
      </div>

      <div className="bg-card rounded-xl p-6 relative overflow-hidden shadow-[0_0_15px_rgba(252,238,9,0.2)]">
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
              className="w-full bg-primary text-primary-foreground hover:shadow-[0_0_10px_rgba(252,238,9,0.5)] transition-all duration-200"
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
          
          <Button
            type="button"
            onClick={handleAppleAuth}
            className="w-full bg-background border border-border text-white hover:bg-muted transition-all duration-200 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.9545 9.56918C12.9436 8.11405 13.5774 7.04918 14.859 6.35042C14.139 5.34708 13.0469 4.80792 11.6138 4.72373C10.25 4.6416 8.98608 5.4941 8.46582 5.4941C7.92261 5.4941 6.82044 4.7538 5.69977 4.7538C3.58111 4.77676 1.35001 6.52655 1.35001 10.088C1.35001 11.1949 1.53755 12.3381 1.91263 13.5177C2.4126 15.0686 3.9596 18 5.56104 17.9479C6.4245 17.9229 7.04217 17.2805 8.16688 17.2805C9.2551 17.2805 9.82301 17.9479 10.8156 17.9479C12.4375 17.922 13.8125 15.2983 14.2862 13.7434C12.4375 12.8525 11.3596 11.3183 12.9545 9.56918Z" fill="black"/>
              <path d="M10.4687 3.81452C11.0724 3.08073 11.4584 2.09035 11.3506 1.08997C10.467 1.13647 9.41852 1.65229 8.76138 2.36416C8.1658 3.01097 7.70271 4.0228 7.83334 4.99124C8.78975 5.06249 9.82299 4.58937 10.4687 3.81452Z" fill="black"/>
            </svg>
            Apple
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
