import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChange } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";

// Admin credentials
const ADMIN_EMAIL = "admin@lyra.app";

interface AuthContextProps {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      console.log("Initializing auth state...");
      const unsubscribe = onAuthStateChange((user) => {
        console.log("Auth state changed:", user ? "Logged in" : "Not logged in");
        setUser(user);
        
        // Check if user is admin
        setIsAdmin(user?.email === ADMIN_EMAIL);
        
        setLoading(false);
      });
      
      // Ensure loading state is set to false after a timeout
      // This prevents infinite loading if Firebase has issues
      const timeout = setTimeout(() => {
        if (loading) {
          console.log("Auth timeout - forcing loading to false");
          setLoading(false);
        }
      }, 3000);
      
      return () => {
        unsubscribe();
        clearTimeout(timeout);
      };
    } catch (error) {
      console.error("Auth initialization error:", error);
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
