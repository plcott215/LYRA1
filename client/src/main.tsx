import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/auth-context";
import { SubscriptionProvider } from "./context/subscription-context";
import { ThemeProvider } from "./context/theme-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <ThemeProvider>
          <App />
          <Toaster />
        </ThemeProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);
