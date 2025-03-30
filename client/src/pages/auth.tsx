import AuthForm from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";

const Auth = () => {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const handleDemo = () => {
    setLocation("/dashboard");
  };

  const handleAdminDemo = () => {
    setLocation("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
      <AuthForm />
      
      <div className="mt-8 text-center space-y-2">
        <Button
          variant="link"
          onClick={handleDemo}
          className="text-muted-foreground hover:text-primary transition-colors text-sm"
        >
          Skip login (demo mode)
        </Button>
        
        <div>
          <Button
            variant="link"
            onClick={handleAdminDemo}
            className="text-muted-foreground hover:text-primary transition-colors text-sm"
          >
            Admin demo (admin@lyra.app / admin123)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
