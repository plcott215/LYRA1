import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

const ProBanner = () => {
  return (
    <Card className="bg-card rounded-lg p-5 relative overflow-hidden shadow-[0_0_10px_rgba(252,238,9,0.2)]">
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary opacity-10 rounded-full blur-3xl"></div>
      
      <CardContent className="p-0 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-20 text-primary mb-2">
            Pro Feature
          </span>
          <h3 className="text-lg font-semibold mb-1">Unlock all AI tools with Lyra Pro</h3>
          <p className="text-muted-foreground">Get unlimited access to all 5 AI tools and advanced features</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/subscribe">
            <Button className="py-2 px-4 bg-primary text-black font-medium hover:shadow-[0_0_10px_rgba(252,238,9,0.5)] transition-all duration-200">
              Upgrade to Pro - $19/month
            </Button>
          </Link>
          <Button variant="outline" className="py-2 px-4 bg-background border border-border text-foreground font-medium hover:bg-muted transition-all duration-200">
            View all features
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProBanner;
