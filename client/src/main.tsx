import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/auth-context";
import { SubscriptionProvider } from "./context/subscription-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <App />
        <Toaster />
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);
