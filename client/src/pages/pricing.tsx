import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: string;
  priceDetail: string;
  features: string[];
  popularFeature?: string;
  isPopular?: boolean;
  buttonText: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic access to AI tools for freelancers",
    price: "$0",
    priceDetail: "forever",
    features: [
      "Limited access to all 5 AI tools",
      "Generate up to 10 proposals per month",
      "Generate up to 15 emails per month",
      "Basic pricing recommendations",
      "Simple contract explanations",
      "1-minute voice-to-brief transcription"
    ],
    buttonText: "Continue with Free"
  },
  {
    id: "pro",
    name: "Pro",
    description: "Full access to all tools with advanced features",
    price: "$19",
    priceDetail: "per month",
    features: [
      "Unlimited access to all 5 AI tools",
      "No daily generation limits",
      "Priority processing",
      "Advanced customization options",
      "Save and export history",
      "Email notifications",
      "Priority customer support"
    ],
    isPopular: true,
    popularFeature: "Most Popular",
    buttonText: "Subscribe to Pro"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for teams and agencies",
    price: "$49",
    priceDetail: "per month",
    features: [
      "Everything in Pro plan",
      "Team collaboration features",
      "Admin dashboard",
      "Customizable templates",
      "API access",
      "Dedicated account manager",
      "Priority 24/7 support",
      "Custom integrations"
    ],
    buttonText: "Contact Sales"
  }
];

const PricingPage = () => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSelectPlan = (tierId: string) => {
    if (!user) {
      // If user is not logged in, redirect to auth page with info about selected plan
      setLocation(`/auth?plan=${tierId}`);
      return;
    }

    if (tierId === "free") {
      setLocation("/dashboard");
      return;
    }

    if (tierId === "enterprise") {
      toast({
        title: "Enterprise Plan",
        description: "Please contact sales@lyra.io for enterprise pricing",
      });
      return;
    }

    // For pro plan
    setLocation("/subscribe");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">
              <span className="text-primary">Lyra</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Button onClick={() => setLocation("/dashboard")} variant="outline">
                Dashboard
              </Button>
            ) : (
              <>
                <Button onClick={() => setLocation("/auth")} variant="outline">
                  Sign In
                </Button>
                <Button onClick={() => setLocation("/auth?signup=true")} className="bg-primary text-primary-foreground">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Choose the Right <span className="text-primary">Plan</span> for You
          </h1>
          <p className="text-muted-foreground text-lg">
            Get access to AI-powered tools designed specifically for freelancers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative overflow-hidden ${tier.isPopular ? 'border-primary ring-2 ring-primary ring-opacity-20' : ''}`}
            >
              {tier.isPopular && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-primary text-primary-foreground m-4">
                    {tier.popularFeature}
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground ml-1">{tier.priceDetail}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSelectPlan(tier.id)} 
                  className={`w-full ${tier.isPopular ? 'bg-primary text-primary-foreground hover:shadow-[0_0_10px_rgba(252,238,9,0.5)]' : ''}`}
                  variant={tier.isPopular ? "default" : "outline"}
                >
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">Still not sure?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Try Lyra with our 3-day free trial on any paid plan. No credit card required to start.
          </p>
          <Button onClick={() => setLocation("/auth")} className="bg-primary text-primary-foreground px-8">
            Start Free Trial
          </Button>
        </div>
      </div>

      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Lyra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;