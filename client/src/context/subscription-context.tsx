import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Demo mode settings
const DEMO_MODE = true; // Sync with auth-context
const DEMO_EMAIL = "demo@lyra.app"; // Demo account email

// Define the subscription response type
interface SubscriptionResponse {
  isPro: boolean;
  trialDaysLeft: number;
  subscriptionData: {
    status?: string;
    startDate?: string;
    endDate?: string;
    trialEnd?: string;
  } | null;
}

interface SubscriptionContextProps {
  isPro: boolean;
  trialDaysLeft: number;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  subscriptionData: {
    status?: string;
    startDate?: string;
    endDate?: string;
    trialEnd?: string;
  } | null;
}

const SubscriptionContext = createContext<SubscriptionContextProps>({
  isPro: false,
  trialDaysLeft: 3,
  loading: true,
  checkSubscription: async () => {},
  subscriptionData: null,
});

export const useSubscription = () => useContext(SubscriptionContext);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider = ({ children }: SubscriptionProviderProps) => {
  const { user, isAdmin } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(3);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<{
    status?: string;
    startDate?: string;
    endDate?: string;
    trialEnd?: string;
  } | null>(null);
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!user) {
      setIsPro(false);
      setLoading(false);
      return;
    }
    
    // For demo mode, we'll automatically set a Pro subscription
    if (DEMO_MODE && user?.email === DEMO_EMAIL) {
      console.log("Demo user detected - setting Pro subscription automatically");
      
      // Set a mock Pro subscription for demo users
      const currentDate = new Date();
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1); // 1 month subscription
      
      setIsPro(true);
      setTrialDaysLeft(0); // No trial needed for demo Pro
      setSubscriptionData({
        status: "active",
        startDate: currentDate.toISOString(),
        endDate: futureDate.toISOString()
      });
      setLoading(false);
      return;
    }
    
    try {
      // Fetch subscription status from server for all users
      const data = await apiRequest<SubscriptionResponse>({
        url: "/api/subscription",
        method: "GET",
      });
      
      // Set subscription status from server response
      setIsPro(!!data.isPro);
      setTrialDaysLeft(data.trialDaysLeft || 0);
      setSubscriptionData(data.subscriptionData);
      setLoading(false);
    } catch (error) {
      // Default to non-Pro access if API fails
      setIsPro(false);
      setLoading(false);
      setTrialDaysLeft(0);
      
      // Only log this error, don't show it to the user
      console.error("Error checking subscription:", error);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setIsPro(false);
      setLoading(false);
    }
  }, [user, isAdmin]); // Added isAdmin to the dependency array

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        trialDaysLeft,
        loading,
        checkSubscription,
        subscriptionData,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
