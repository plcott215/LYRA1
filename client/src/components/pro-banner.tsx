import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useSubscription } from "@/context/subscription-context";
import { cn } from "@/lib/utils";

interface ProBannerProps {
  className?: string;
  variant?: "default" | "compact";
}

const ProBanner = ({ className, variant = "default" }: ProBannerProps) => {
  const { isPro, trialDaysLeft } = useSubscription();
  
  const isCompact = variant === "compact";
  
  return (
    <Card className={cn(
      "bg-card rounded-lg relative overflow-hidden",
      isPro ? "shadow-[0_0_25px_rgba(255,230,0,0.8)]" : "",
      isCompact ? "p-3" : "p-5",
      className
    )}>
      {isPro && (
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary opacity-20 rounded-full blur-3xl"></div>
      )}
      
      <CardContent className={cn(
        "p-0 flex flex-col md:flex-row items-center justify-between",
        isCompact ? "gap-2" : ""
      )}>
        <div className={cn("md:mb-0", isCompact ? "mb-2" : "mb-4")}>
          {isPro ? (
            <>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-black mb-2 shadow-[0_0_12px_rgba(255,230,0,0.6)]">
                Pro Enabled
              </span>
              <h3 className={cn("font-semibold mb-1", isCompact ? "text-base" : "text-lg")}>
                You have full Pro access
              </h3>
              <p className={cn("text-muted-foreground", isCompact ? "text-xs" : "text-sm")}>
                All Pro features are unlocked for your account
              </p>
            </>
          ) : (
            <>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-card border border-primary text-muted-foreground mb-2">
                Free Plan
              </span>
              <h3 className={cn("font-semibold mb-1", isCompact ? "text-base" : "text-lg")}>
                Upgrade to Pro
              </h3>
              <p className={cn("text-muted-foreground", isCompact ? "text-xs" : "text-sm")}>
                Unlock all premium features and tools
                {trialDaysLeft > 0 && ` - ${trialDaysLeft} days left in trial`}
              </p>
            </>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {isPro ? (
            <Button 
              variant="outline" 
              size={isCompact ? "sm" : "default"}
              className="border border-primary text-foreground font-medium hover:bg-muted hover:shadow-[0_0_15px_rgba(255,230,0,0.3)] transition-all duration-200"
            >
              View all features
            </Button>
          ) : (
            <Link href="/subscribe">
              <Button 
                size={isCompact ? "sm" : "default"}
                className="bg-primary text-black font-medium hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(255,230,0,0.5)] transition-all duration-200"
              >
                Upgrade Now
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProBanner;
