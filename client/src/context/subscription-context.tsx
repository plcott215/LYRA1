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
  const { user } = useAuth();
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

    try {
      setLoading(true);
      const response = await apiRequest("GET", "/api/subscription");
      const data = await response.json();
      
      setIsPro(data.isPro || false);
      setTrialDaysLeft(data.trialDaysLeft || 3);
      setSubscriptionData(data.subscriptionData || null);
    } catch (error) {
      // If there's an error, assume user is on free tier
      setIsPro(false);
      console.error("Error checking subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setIsPro(false);
      setLoading(false);
    }
  }, [user]);

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
