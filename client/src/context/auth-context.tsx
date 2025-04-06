import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChange } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";

// Admin and demo credentials
const ADMIN_EMAIL = "admin@lyra.app";
const DEMO_EMAIL = "demo@lyra.app";
const DEMO_MODE = true; // Set to true to enable demo mode

interface AuthContextProps {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  isAdmin: false,
  authError: null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Create a constant function to avoid recreation on each render
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};
    let timeout: NodeJS.Timeout;
    
    try {
      console.log("Initializing auth state...");
      
      // Debug: Log environment variables (redacted for security)
      console.log("Firebase config check:", {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "✓ Present" : "✗ Missing",
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✓ Present" : "✗ Missing",
        appId: import.meta.env.VITE_FIREBASE_APP_ID ? "✓ Present" : "✗ Missing"
      });
      
      // Check if Firebase environment variables are configured
      const isFirebaseConfigured = 
        import.meta.env.VITE_FIREBASE_API_KEY && 
        import.meta.env.VITE_FIREBASE_PROJECT_ID && 
        import.meta.env.VITE_FIREBASE_APP_ID;
      
      if (!isFirebaseConfigured) {
        console.warn("Firebase is not fully configured. Some authentication features may not work.");
        setErrorState("auth-config-missing");
      }
      
      // Handle demo mode if enabled
      if (DEMO_MODE) {
        console.log("Demo mode enabled - creating mock demo user");
        // Create a mock user object for demo mode
        const mockDemoUser = {
          uid: "demo-user-123",
          email: DEMO_EMAIL,
          displayName: "Demo User",
          emailVerified: true,
          isAnonymous: false,
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString()
          }
        } as unknown as FirebaseUser;
        
        // Set the user with a slight delay to simulate authentication
        setTimeout(() => {
          setUser(mockDemoUser);
          setIsAdmin(false); // Demo users are not admins by default
          setLoading(false);
        }, 1000);
      } 
      else {
        // Regular Firebase authentication 
        unsubscribe = onAuthStateChange((user) => {
          console.log("Auth state changed:", user ? "Logged in" : "Not logged in");
          setUser(user);
          
          // Check if user is admin
          setIsAdmin(user?.email === ADMIN_EMAIL);
          
          setLoading(false);
        });
      }
      
      // Ensure loading state is set to false after a timeout
      // This prevents infinite loading if Firebase has issues
      timeout = setTimeout(() => {
        if (loading) {
          console.log("Auth timeout - forcing loading to false");
          setLoading(false);
          if (!errorState) {
            setErrorState("auth-timeout");
          }
        }
      }, 3000);
      
      // Set a longer timeout for loading state
      // in case the first timeout doesn't work
      const longTimeout = setTimeout(() => {
        console.log("Loading timeout reached after 5 seconds");
        setLoading(false);
        if (!errorState) {
          setErrorState("auth-timeout-long");
        }
      }, 5000);
      
      return () => {
        unsubscribe();
        clearTimeout(timeout);
        clearTimeout(longTimeout);
      };
    } catch (error) {
      console.error("Auth initialization error:", error);
      setLoading(false);
      setErrorState("auth-init-error");
      return () => {};
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin,
      authError: errorState 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
