import { useState } from "react";
import { Button } from "@/components/ui/button"
import { 
  CopyIcon, 
  RefreshCwIcon,
  Sparkles,
  FileText, 
  Share2,
  Download
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { explainContract, ContractExplainRequest } from "@/lib/openai";
import { Input } from "@/components/ui/input";
import { formatMarkdown } from "@/lib/utils";

const ContractExplainer = () => {
  const [formData, setFormData] = useState<ContractExplainRequest>({
    contractText: "",
    focusAreas: [],
  });

  const [focusInput, setFocusInput] = useState("");
  const [contractExplanation, setContractExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const { toast } = useToast();

  const handleContractTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      contractText: e.target.value,
    }));
  };

  const handleFocusInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFocusInput(e.target.value);
  };

  const addFocusArea = () => {
    if (focusInput.trim() === "") return;

    setFormData((prev) => ({
      ...prev,
      focusAreas: [...(prev.focusAreas || []), focusInput.trim()],
    }));
    setFocusInput("");
  };

  const removeFocusArea = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas?.filter((_, i) => i !== index),
    }));
  };

  const handleExplain = async () => {
    if (!formData.contractText) {
      toast({
        title: "Missing information",
        description: "Please enter the contract text to explain",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setContractExplanation(null);

    try {
      const result = await explainContract(formData);
      setContractExplanation(result.text);
      setGenerationTime(result.generationTime || null);
    } catch (error: any) {
      toast({
        title: "Error explaining contract",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleExplain();
  };

  const copyToClipboard = () => {
    if (contractExplanation) {
      navigator.clipboard.writeText(contractExplanation);
      toast({
        title: "Copied to clipboard!",
        description: "The contract explanation has been copied to your clipboard",
      });
    }
  };

  return (
    <>
      <Card className="bg-card rounded-lg p-4 mb-8 shadow-[0_0_10px_rgba(252,238,9,0.2)]">
        <CardContent className="p-0 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold mb-1">Contract Explainer</h2>
            <p className="text-muted-foreground text-sm">Understand complex legal language in plain English</p>
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
            <h3 className="text-lg font-medium mb-4">Contract Text</h3>

            <div className="space-y-5">
              <div>
                <Textarea
                  value={formData.contractText}
                  onChange={handleContractTextChange}
                  rows={10}
                  className="w-full bg-background border-border focus:ring-primary resize-none"
                  placeholder="Paste your contract or legal text here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Focus Areas (Optional)</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={focusInput}
                    onChange={handleFocusInputChange}
                    className="flex-1 bg-background border-border focus:ring-primary"
                    placeholder="E.g., payment terms, liability clauses"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFocusArea();
                      }
                    }}
                  />
                  <Button 
                    onClick={addFocusArea}
                    type="button"
                    variant="outline"
                    className="bg-background border-border hover:border-primary"
                  >
                    Add
                  </Button>
                </div>

                {formData.focusAreas && formData.focusAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.focusAreas.map((area, index) => (
                      <div key={index} className="flex items-center bg-background rounded-full pl-3 pr-1.5 py-1 border border-border text-sm">
                        {area}
                        <button
                          onClick={() => removeFocusArea(index)}
                          className="ml-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleExplain}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary text-black font-medium hover:shadow-[0_0_10px_rgba(252,238,9,0.5)] transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  "Explain in Plain English"
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
              <h3 className="text-lg font-medium">Plain English Explanation</h3>

              <div className="flex space-x-2">
                <Button
                  onClick={copyToClipboard}
                  disabled={!contractExplanation}
                  size="icon"
                  variant="outline"
                  className="p-1.5 bg-background border-border hover:border-accent transition-colors"
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleRegenerate}
                  disabled={loading}
                  size="icon"
                  variant="outline"
                  className="p-1.5 bg-background border-border hover:border-accent transition-colors"
                >
                  <RefreshCwIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Skeleton Loader */}
            {loading && (
              <div className="bg-background rounded-lg p-5 mb-4">
                <div className="h-6 w-1/2 rounded mb-3 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-4/5 rounded mb-6 bg-card animate-pulse"></div>
                
                <div className="h-6 w-1/2 rounded mb-3 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-3/4 rounded mb-6 bg-card animate-pulse"></div>
                
                <div className="h-6 w-1/2 rounded mb-3 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-5/6 rounded bg-card animate-pulse"></div>
              </div>
            )}

            {/* Generated Content */}
            {!loading && (
              <div className="bg-background rounded-lg p-5 h-[calc(100%-4rem)] overflow-y-auto">
                {contractExplanation ? (
                  <div className="contract-explanation" dangerouslySetInnerHTML={{ __html: formatMarkdown(contractExplanation) }}></div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 text-muted-foreground">
                      <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.5 9.09H20.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15.6947 13.7H15.7037" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15.6947 16.7H15.7037" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.9955 13.7H12.0045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.9955 16.7H12.0045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.29431 13.7H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.29431 16.7H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Paste your contract text and click "Explain in Plain English" to decode legal jargon into simple language.</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-between items-center">
              {contractExplanation && generationTime && (
                <span className="text-xs text-accent">Generated in {generationTime.toFixed(1)} seconds with GPT-4 Turbo</span>
              )}
              {contractExplanation && (
                <Button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="py-1.5 px-3 bg-accent text-black text-sm font-medium rounded-lg hover:shadow-[0_0_10px_rgba(0,255,157,0.5)] transition-all duration-200"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
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

export default ContractExplainer;
