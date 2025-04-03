import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/context/subscription-context";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
}

const SidebarItem = ({ icon, label, path, isActive }: SidebarItemProps) => {
  return (
    <Link href={path}>
      <div
        className={cn(
          "flex items-center py-2 px-3 rounded-lg mb-1 transition-all duration-300 cursor-pointer hover-scale",
          isActive
            ? "bg-[#FFE600] border-l-2 border-[#FFE600] shadow-[0_0_25px_rgba(255,230,0,0.9)] neon-underglow-intense"
            : "hover:bg-black/40 hover:text-primary hover:shadow-[0_0_15px_rgba(255,230,0,0.4)]"
        )}
      >
        <div className={cn("text-lg", isActive ? "text-black text-shadow-sm" : "")}>
          {icon}
        </div>
        <span className={cn("ml-3 hidden md:block", isActive ? "font-bold text-black" : "")}>
          {label}
        </span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const [location] = useLocation();
  const { isPro, trialDaysLeft } = useSubscription();

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
    },
    {
      icon: <i className="ri-mic-line" />,
      label: "Voice-to-Brief",
      path: "/dashboard/voice",
    },
    {
      icon: <i className="ri-user-add-line" />,
      label: "Client Onboarding",
      path: "/dashboard/onboarding",
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
    <aside className="bg-card w-16 md:w-64 flex flex-col fixed h-full transition-all duration-300 z-20 border-r border-border shadow-[5px_0_20px_rgba(255,230,0,0.3)]">
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
          <p className="text-muted-foreground text-xs uppercase tracking-wider hidden md:block mb-2 px-3">
            Tools
          </p>

          {sidebarItems.slice(0, 6).map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
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

      {/* Pro Upgrade */}
      {!isPro && (
        <div className="p-4 hidden md:block">
          <div className="bg-background rounded-lg p-4 border border-border overflow-hidden relative shadow-[0_0_20px_rgba(255,230,0,0.7)] neon-underglow-pulsate">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary opacity-30 rounded-full blur-xl"></div>
            <h4 className="font-medium text-sm mb-1">Free Trial</h4>
            <p className="text-muted-foreground text-xs mb-3">{trialDaysLeft} days remaining</p>
            <Link href="/subscribe">
              <Button
                className="w-full py-1.5 px-3 bg-[#FFE600] text-black text-sm font-medium shadow-[0_0_15px_rgba(255,230,0,0.6)] hover:shadow-[0_0_25px_rgba(255,230,0,0.9)] transition-all duration-200 neon-underglow-intense"
                size="sm"
              >
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
