import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generateProposal, ProposalRequest } from "@/lib/openai";
import { Card, CardContent } from "@/components/ui/card";
import { formatMarkdown } from "@/lib/utils";
import { exportToPDF } from "@/lib/export";
import { 
  Copy as CopyIcon, 
  Download as DownloadIcon, 
  RefreshCcw as RefreshIcon,
  FileText as FileTextIcon,
  FileUp as FileUpIcon, 
  Share2 as ShareIcon
} from "lucide-react";

const tones = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "persuasive", label: "Persuasive" },
];

const industries = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance" },
  { value: "other", label: "Other" },
];

const ProposalWriter = () => {
  const [formData, setFormData] = useState<ProposalRequest>({
    title: "",
    industry: "",
    scope: "",
    startDate: "",
    endDate: "",
    minBudget: "",
    maxBudget: "",
    tone: "professional",
  });

  const [proposal, setProposal] = useState<string | null>(null);
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

  const handleToneSelect = (tone: "professional" | "friendly" | "persuasive") => {
    setFormData((prev) => ({
      ...prev,
      tone,
    }));
  };

  const handleGenerate = async () => {
    if (!formData.title || !formData.industry || !formData.scope) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProposal(null);

    try {
      const result = await generateProposal(formData);
      setProposal(result.text);
      setGenerationTime(result.generationTime || null);
    } catch (error: any) {
      toast({
        title: "Error generating proposal",
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
    if (proposal) {
      navigator.clipboard.writeText(proposal);
      toast({
        title: "Copied to clipboard!",
        description: "Your proposal has been copied to your clipboard",
      });
    }
  };

  const handleExportPDF = async () => {
    if (!proposal) return;
    
    try {
      const contentId = `proposal-content-${Date.now()}`;
      const success = await exportToPDF(contentId, `lyra-proposal-${Date.now()}`);
      
      if (success) {
        toast({
          title: "Export Successful",
          description: "Your proposal has been exported to PDF",
        });
        
        // Record export in history
        try {
          await fetch('/api/history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              toolType: 'proposal',
              action: 'export',
              format: 'PDF',
              content: { title: formData.title, content: proposal }
            }),
          });
        } catch (err) {
          console.error('Failed to record export in history:', err);
        }
      } else {
        toast({
          title: "Export Failed",
          description: "There was an error exporting to PDF",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "There was an error exporting to PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="bg-card rounded-lg p-4 mb-8 shadow-[0_0_10px_rgba(252,238,9,0.2)]">
        <CardContent className="p-0 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold mb-1">Proposal Writer</h2>
            <p className="text-muted-foreground text-sm">Create polished, professional client proposals in seconds</p>
          </div>

          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary mr-2">
              <span className="w-2 h-2 rounded-full bg-primary mr-1"></span>
              AI Powered
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
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
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Project Title</label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-background border-border focus:ring-primary"
                  placeholder="E.g., E-commerce Website Redesign"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Client Industry</label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleSelectChange("industry", value)}
                >
                  <SelectTrigger className="w-full bg-background border-border focus:ring-primary">
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Project Scope</label>
                <Textarea
                  name="scope"
                  value={formData.scope}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-background border-border focus:ring-primary resize-none"
                  placeholder="Describe the project scope, deliverables, and goals..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Timeline</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="text"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full bg-background border-border focus:ring-primary"
                      placeholder="Start date"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full bg-background border-border focus:ring-primary"
                      placeholder="End date"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Budget Range (Optional)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="text"
                      name="minBudget"
                      value={formData.minBudget}
                      onChange={handleChange}
                      className="w-full bg-background border-border focus:ring-primary"
                      placeholder="Min budget"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      name="maxBudget"
                      value={formData.maxBudget}
                      onChange={handleChange}
                      className="w-full bg-background border-border focus:ring-primary"
                      placeholder="Max budget"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Proposal Tone</label>
                <div className="flex space-x-3">
                  {tones.map((tone) => (
                    <Button
                      key={tone.value}
                      type="button"
                      variant={formData.tone === tone.value ? "outline" : "ghost"}
                      className={`px-3 py-1.5 bg-background border ${
                        formData.tone === tone.value ? "border-primary text-primary" : "border-border"
                      } rounded-lg text-sm`}
                      onClick={() => handleToneSelect(tone.value as "professional" | "friendly" | "persuasive")}
                    >
                      {tone.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary text-black font-medium hover:shadow-[0_0_10px_rgba(252,238,9,0.5)] transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  "Generate Proposal"
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
              <h3 className="text-lg font-medium">Generated Proposal</h3>

              <div className="flex space-x-2">
                <Button
                  onClick={copyToClipboard}
                  disabled={!proposal}
                  size="icon"
                  variant="outline"
                  className="p-1.5 bg-background border-border hover:border-accent transition-colors"
                  title="Copy to clipboard"
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleExportPDF}
                  disabled={!proposal}
                  size="icon"
                  variant="outline"
                  className="p-1.5 bg-background border-border hover:border-accent transition-colors"
                  title="Download as PDF"
                >
                  <FileTextIcon className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleRegenerate}
                  disabled={loading}
                  size="icon"
                  variant="outline"
                  className="p-1.5 bg-background border-border hover:border-accent transition-colors"
                  title="Regenerate proposal"
                >
                  <RefreshIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Skeleton Loader */}
            {loading && (
              <div className="bg-background rounded-lg p-5 mb-4">
                <div className="h-8 w-3/4 rounded mb-4 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-2/3 rounded mb-6 bg-card animate-pulse"></div>
                
                <div className="h-6 w-1/2 rounded mb-3 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-4/5 rounded mb-6 bg-card animate-pulse"></div>
                
                <div className="h-6 w-1/2 rounded mb-3 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-3/4 rounded mb-6 bg-card animate-pulse"></div>
                
                <div className="h-6 w-1/2 rounded mb-3 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-1/2 rounded bg-card animate-pulse"></div>
              </div>
            )}

            {/* Generated Content */}
            {!loading && (
              <div className="bg-background rounded-lg p-5 h-[calc(100%-4rem)] overflow-y-auto">
                {proposal ? (
                  <div className="proposal-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(proposal) }}></div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 text-muted-foreground">
                      <path d="M9 2H15C20 2 22 4 22 9V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6H8V11.5C8 13.71 9.79 15.5 12 15.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 11H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 6C8 4.9 7.1 4 6 4V6H8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 6C16 4.9 16.9 4 18 4V6H16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9.5 19H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Fill in your project details and click "Generate Proposal" to create a professional project proposal.</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-between items-center">
              {proposal && generationTime && (
                <span className="text-xs text-accent">Generated in {generationTime.toFixed(1)} seconds with GPT-4 Turbo</span>
              )}
              {proposal && (
                <Button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="py-1.5 px-3 bg-accent text-black text-sm font-medium rounded-lg hover:shadow-[0_0_10px_rgba(0,255,157,0.5)] transition-all duration-200"
                >
                  <RefreshIcon className="h-4 w-4 mr-1" />
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

export default ProposalWriter;
