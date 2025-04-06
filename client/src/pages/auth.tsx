import AuthForm from "@/components/auth/auth-form";
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
      <AuthForm />
    </div>
  );
};

export default Auth;
