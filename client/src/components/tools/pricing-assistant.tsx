import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPricingEstimate, PricingRequest } from "@/lib/openai";

const PricingAssistant = () => {
  const [formData, setFormData] = useState<PricingRequest>({
    projectType: "",
    scope: "",
    timeline: "",
    experience: "intermediate",
    region: "",
  });

  const [pricingEstimate, setPricingEstimate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerate = async () => {
    if (!formData.projectType || !formData.scope) {
      toast({
        title: "Missing information",
        description: "Please fill in the project type and scope",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPricingEstimate(null);

    try {
      const result = await getPricingEstimate(formData);
      setPricingEstimate(result.text);
      setGenerationTime(result.generationTime || null);
    } catch (error: any) {
      toast({
        title: "Error generating pricing estimate",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const copyToClipboard = () => {
    if (pricingEstimate) {
      navigator.clipboard.writeText(pricingEstimate);
      toast({
        title: "Copied to clipboard!",
        description: "Your pricing estimate has been copied to your clipboard",
      });
    }
  };

  return (
    <>
      <Card className="bg-card rounded-lg p-4 mb-8 shadow-[0_0_10px_rgba(252,238,9,0.2)]">
        <CardContent className="p-0 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold mb-1">Pricing Assistant</h2>
            <p className="text-muted-foreground text-sm">Get data-driven price recommendations for your projects</p>
          </div>

          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-20 text-primary mr-2">
              <span className="w-2 h-2 rounded-full bg-primary mr-1"></span>
              AI Powered
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent bg-opacity-20 text-accent">
              Pro Feature
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-card rounded-xl p-5 shadow-[0_0_10px_rgba(252,238,9,0.2)]">
          <CardContent className="p-0">
            <h3 className="text-lg font-medium mb-4">Project Details</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Project Type</label>
                <Input
                  type="text"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="w-full bg-background border-border focus:ring-primary"
                  placeholder="E.g., Website Design, Logo Design, Content Writing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Project Scope</label>
                <Textarea
                  name="scope"
                  value={formData.scope}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-background border-border focus:ring-primary resize-none"
                  placeholder="Describe the deliverables, features, and requirements..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Timeline</label>
                <Input
                  type="text"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  className="w-full bg-background border-border focus:ring-primary"
                  placeholder="E.g., 2 weeks, 1 month"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Experience Level</label>
                <Select
                  value={formData.experience}
                  onValueChange={(value) => handleSelectChange("experience", value)}
                >
                  <SelectTrigger className="w-full bg-background border-border focus:ring-primary">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                    <SelectItem value="expert">Expert (6+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Region</label>
                <Input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full bg-background border-border focus:ring-primary"
                  placeholder="E.g., North America, Europe, Asia"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium hover:shadow-[0_0_10px_rgba(252,238,9,0.5)] transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Calculating...
                  </div>
                ) : (
                  "Get Pricing Estimate"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-card rounded-xl p-5 shadow-[0_0_10px_rgba(0,255,157,0.2)] relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent opacity-10 rounded-full blur-3xl"></div>

          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Pricing Recommendation</h3>

              <div className="flex space-x-2">
                <Button
                  onClick={copyToClipboard}
                  disabled={!pricingEstimate}
                  size="icon"
                  variant="outline"
                  className="p-1.5 bg-background border-border hover:border-accent transition-colors"
                >
                  <i className="ri-file-copy-line text-sm"></i>
                </Button>
                <Button
                  onClick={handleRegenerate}
                  disabled={loading}
                  size="icon"
                  variant="outline"
                  className="p-1.5 bg-background border-border hover:border-accent transition-colors"
                >
                  <i className="ri-refresh-line text-sm"></i>
                </Button>
              </div>
            </div>

            {/* Skeleton Loader */}
            {loading && (
              <div className="bg-background rounded-lg p-5 mb-4">
                <div className="h-8 w-2/3 rounded mb-6 bg-card animate-pulse"></div>
                
                <div className="h-20 w-full rounded mb-6 bg-card animate-pulse"></div>
                
                <div className="h-6 w-1/2 rounded mb-3 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-4/5 rounded mb-6 bg-card animate-pulse"></div>
                
                <div className="h-6 w-1/2 rounded mb-3 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-3/4 rounded bg-card animate-pulse"></div>
              </div>
            )}

            {/* Generated Content */}
            {!loading && (
              <div className="bg-background rounded-lg p-5 h-[calc(100%-4rem)] overflow-y-auto">
                {pricingEstimate ? (
                  <div className="pricing-content" dangerouslySetInnerHTML={{ __html: pricingEstimate.replace(/\n/g, '<br/>') }}></div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 text-muted-foreground">
                      <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 17V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 12H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Describe your project details to get data-driven pricing recommendations for your freelance work.</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-between items-center">
              {pricingEstimate && generationTime && (
                <span className="text-xs text-accent">Generated in {generationTime.toFixed(1)} seconds with GPT-4 Turbo</span>
              )}
              {pricingEstimate && (
                <Button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="py-1.5 px-3 bg-accent text-black text-sm font-medium rounded-lg hover:shadow-[0_0_10px_rgba(0,255,157,0.5)] transition-all duration-200"
                >
                  <i className="ri-magic-line mr-1"></i>
                  Regenerate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PricingAssistant;
