import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// All users now have Pro access by default
const ProBanner = () => {
  return (
    <Card className="bg-card rounded-lg p-5 relative overflow-hidden shadow-[0_0_25px_rgba(255,230,0,0.8)]">
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary opacity-20 rounded-full blur-3xl"></div>
      
      <CardContent className="p-0 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-black mb-2 shadow-[0_0_12px_rgba(255,230,0,0.6)]">
            Pro Enabled
          </span>
          <h3 className="text-lg font-semibold mb-1">You have full Pro access</h3>
          <p className="text-muted-foreground">All Pro features are unlocked for your account</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="py-2 px-4 bg-background border border-primary text-foreground font-medium hover:bg-muted hover:shadow-[0_0_15px_rgba(255,230,0,0.3)] transition-all duration-200">
            View all features
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProBanner;
