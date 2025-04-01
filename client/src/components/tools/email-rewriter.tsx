import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { rewriteEmail, EmailRewriteRequest } from "@/lib/openai";
import { formatMarkdown } from "@/lib/utils";
import { Copy as CopyIcon, RefreshCw as RefreshIcon, Sparkles } from "lucide-react";

const tones = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "urgent", label: "Urgent" },
  { value: "apologetic", label: "Apologetic" },
];

const EmailRewriter = () => {
  const [formData, setFormData] = useState<EmailRewriteRequest>({
    originalEmail: "",
    tone: "professional",
    context: "",
  });

  const [rewrittenEmail, setRewrittenEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToneSelect = (tone: "professional" | "friendly" | "urgent" | "apologetic") => {
    setFormData((prev) => ({
      ...prev,
      tone,
    }));
  };

  const handleRewrite = async () => {
    if (!formData.originalEmail) {
      toast({
        title: "Missing information",
        description: "Please enter the email you want to rewrite",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setRewrittenEmail(null);

    try {
      const result = await rewriteEmail(formData);
      setRewrittenEmail(result.text);
      setGenerationTime(result.generationTime || null);
    } catch (error: any) {
      toast({
        title: "Error rewriting email",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleRewrite();
  };

  const copyToClipboard = () => {
    if (rewrittenEmail) {
      navigator.clipboard.writeText(rewrittenEmail);
      toast({
        title: "Copied to clipboard!",
        description: "Your email has been copied to your clipboard",
      });
    }
  };

  return (
    <>
      <Card className="bg-card rounded-lg p-4 mb-8 shadow-[0_0_10px_rgba(252,238,9,0.2)]">
        <CardContent className="p-0 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold mb-1">Email Rewriter</h2>
            <p className="text-muted-foreground text-sm">Transform your draft emails into polished, professional messages</p>
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
            <h3 className="text-lg font-medium mb-4">Original Email</h3>

            <div className="space-y-4">
              <div>
                <Textarea
                  name="originalEmail"
                  value={formData.originalEmail}
                  onChange={handleChange}
                  rows={10}
                  className="w-full bg-background border-border focus:ring-primary resize-none"
                  placeholder="Paste your draft email here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Additional Context (Optional)</label>
                <Textarea
                  name="context"
                  value={formData.context}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-background border-border focus:ring-primary resize-none"
                  placeholder="E.g., This is for a potential client who requested a quote last week..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Email Tone</label>
                <div className="flex flex-wrap gap-2">
                  {tones.map((tone) => (
                    <Button
                      key={tone.value}
                      type="button"
                      variant={formData.tone === tone.value ? "outline" : "ghost"}
                      className={`px-3 py-1.5 bg-background border ${
                        formData.tone === tone.value ? "border-primary text-primary" : "border-border"
                      } rounded-lg text-sm`}
                      onClick={() => handleToneSelect(tone.value as "professional" | "friendly" | "urgent" | "apologetic")}
                    >
                      {tone.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleRewrite}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary text-black font-medium hover:shadow-[0_0_10px_rgba(252,238,9,0.5)] transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Rewriting...
                  </div>
                ) : (
                  "Rewrite Email"
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
              <h3 className="text-lg font-medium">Rewritten Email</h3>

              <div className="flex space-x-2">
                <Button
                  onClick={copyToClipboard}
                  disabled={!rewrittenEmail}
                  size="icon"
                  variant="outline"
                  className="p-1.5 bg-background border-border hover:border-accent transition-colors"
                  title="Copy to clipboard"
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleRegenerate}
                  disabled={loading}
                  size="icon"
                  variant="outline"
                  className="p-1.5 bg-background border-border hover:border-accent transition-colors"
                  title="Regenerate email"
                >
                  <RefreshIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Skeleton Loader */}
            {loading && (
              <div className="bg-background rounded-lg p-5 mb-4">
                <div className="h-4 w-1/2 rounded mb-6 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-4/5 rounded mb-6 bg-card animate-pulse"></div>
                
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-4/5 rounded mb-6 bg-card animate-pulse"></div>
                
                <div className="h-4 w-full rounded mb-2 bg-card animate-pulse"></div>
                <div className="h-4 w-2/3 rounded mb-6 bg-card animate-pulse"></div>
                
                <div className="h-4 w-1/3 rounded bg-card animate-pulse"></div>
              </div>
            )}

            {/* Generated Content */}
            {!loading && (
              <div className="bg-background rounded-lg p-5 h-[calc(100%-4rem)] overflow-y-auto">
                {rewrittenEmail ? (
                  <div className="email-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(rewrittenEmail) }}></div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 text-muted-foreground">
                      <path d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Paste your email draft and click "Rewrite Email" to transform it into a polished, professional message.</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-between items-center">
              {rewrittenEmail && generationTime && (
                <span className="text-xs text-accent">Generated in {generationTime.toFixed(1)} seconds with GPT-4 Turbo</span>
              )}
              {rewrittenEmail && (
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

export default EmailRewriter;
