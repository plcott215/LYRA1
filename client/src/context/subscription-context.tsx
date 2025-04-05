import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
    // Always set Pro status to true and loading to false
    setIsPro(true);
    setLoading(false);
    
    // Set subscription data with active status and long expiry
    const startDate = new Date().toISOString();
    const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString();
    
    setSubscriptionData({
      status: "active",
      startDate: startDate,
      endDate: endDate,
    });
    
    // Set trial days to 0 since we're fully Pro now
    setTrialDaysLeft(0);
    
    // No need to make API calls since we're forcing Pro status
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
