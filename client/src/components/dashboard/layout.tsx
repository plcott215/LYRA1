import React from "react";
import Sidebar from "./sidebar";
import TopBar from "./top-bar";
import ProBanner from "../pro-banner";
import { useSubscription } from "@/context/subscription-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { isPro } = useSubscription();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 ml-16 md:ml-64 min-h-screen">
        <TopBar title={title} />
        
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          {children}
          
          {!isPro && (
            <div className="mt-8">
              <ProBanner />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
