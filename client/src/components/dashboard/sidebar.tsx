import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/context/subscription-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  isPro?: boolean;
  isAdmin?: boolean;
}

const SidebarItem = ({ icon, label, path, isActive, isPro, isAdmin }: SidebarItemProps) => {
  return (
    <Link href={path}>
      <div
        className={cn(
          "flex items-center py-2 px-3 rounded-lg mb-1 transition-all duration-300 cursor-pointer hover-scale",
          isActive
            ? "bg-[#FFE600] border-l-2 border-[#FFE600] shadow-[0_0_25px_rgba(255,230,0,0.9)]"
            : "hover:bg-black/40 hover:text-primary hover:shadow-[0_0_15px_rgba(255,230,0,0.4)]"
        )}
      >
        <div className={cn("text-lg", isActive ? "text-black text-shadow-sm" : "")}>
          {icon}
        </div>
        <div className="flex items-center justify-between flex-1">
          <span className={cn("ml-3 hidden md:block", isActive ? "font-bold text-black" : "")}>
            {label}
          </span>
          {isPro && (
            <Badge 
              className={cn(
                "ml-2 bg-primary text-black text-[9px] shadow-[0_0_8px_rgba(255,230,0,0.5)] hidden md:flex",
                isActive ? "bg-black text-primary" : ""
              )}
            >
              PRO
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const [location] = useLocation();
  const { isPro, trialDaysLeft } = useSubscription();
  const { isAdmin } = useAuth();

  const sidebarItems = [
    {
      icon: <i className="ri-file-text-line" />,
      label: "Proposal Writer",
      path: "/dashboard",
    },
    {
      icon: <i className="ri-mail-line" />,
      label: "Email Rewriter",
      path: "/dashboard/email",
      isPro: true,
    },
    {
      icon: <i className="ri-money-dollar-circle-line" />,
      label: "Pricing Assistant",
      path: "/dashboard/pricing",
    },
    {
      icon: <i className="ri-file-list-3-line" />,
      label: "Contract Explainer",
      path: "/dashboard/contract",
      isPro: true,
    },
    {
      icon: <i className="ri-mic-line" />,
      label: "Voice-to-Brief",
      path: "/dashboard/voice",
      isPro: true,
    },
    {
      icon: <i className="ri-user-add-line" />,
      label: "Client Onboarding",
      path: "/dashboard/onboarding",
      isPro: true,
    },
    {
      icon: <i className="ri-history-line" />,
      label: "History",
      path: "/dashboard/history",
    },
    {
      icon: <i className="ri-settings-line" />,
      label: "Settings",
      path: "/dashboard/settings",
    },
  ];

  return (
    <aside className="bg-card w-16 md:w-64 flex flex-col fixed h-full transition-all duration-300 z-20 border-r border-border">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center md:justify-start px-4 border-b border-border">
        <Link href="/dashboard">
          <div className="cursor-pointer hover-bright">
            <span className="hidden md:block">
              <Logo size="sm" />
            </span>
            <span className="block md:hidden">
              <Logo size="sm" withText={false} />
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-6">
          <div className="flex items-center justify-between pr-3">
            <p className="text-muted-foreground text-xs uppercase tracking-wider hidden md:block mb-2 px-3">
              Tools
            </p>
            {isAdmin && (
              <Badge 
                className="bg-primary text-black text-xs shadow-[0_0_8px_rgba(255,230,0,0.5)] hidden md:flex"
              >
                Admin Access
              </Badge>
            )}
          </div>

          {sidebarItems.slice(0, 6).map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isPro={item.isPro}
              isAdmin={isAdmin}
              isActive={
                location === item.path ||
                (item.path === "/dashboard" && location === "/dashboard")
              }
            />
          ))}
        </div>

        <div className="px-3">
          <p className="text-muted-foreground text-xs uppercase tracking-wider hidden md:block mb-2 px-3">
            Account
          </p>

          {sidebarItems.slice(6).map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={location === item.path}
            />
          ))}
        </div>
      </nav>

      {/* Pro status notification */}
      <div className="p-4 hidden md:block">
        {isPro ? (
          <div className="bg-background rounded-lg p-4 border border-border overflow-hidden relative shadow-[0_0_15px_rgba(255,230,0,0.5)]">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary opacity-20 rounded-full blur-xl"></div>
            <h4 className="font-medium text-sm mb-1">Pro Access Enabled</h4>
            <p className="text-muted-foreground text-xs mb-2">All premium features unlocked</p>
          </div>
        ) : (
          <div className="bg-background rounded-lg p-4 border border-border overflow-hidden relative">
            <h4 className="font-medium text-sm mb-1">Upgrade to Pro</h4>
            <p className="text-muted-foreground text-xs mb-3">Unlock all premium features</p>
            <Link href="/subscribe">
              <Button size="sm" className="w-full bg-primary text-black hover:shadow-[0_0_10px_rgba(252,238,9,0.5)]">
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
