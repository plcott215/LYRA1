import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateBriefFromVoice, VoiceToBriefRequest } from "@/lib/openai";

const VoiceToBrief = () => {
  const [text, setText] = useState("");
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleGenerate = async () => {
    if (!text) {
      toast({
        title: "Missing information",
        description: "Please enter text to generate a brief",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setBrief(null);

    try {
      const result = await generateBriefFromVoice({ text });
      setBrief(result.text);
      setGenerationTime(result.generationTime || null);
    } catch (error: any) {
      toast({
        title: "Error generating brief",
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
    if (brief) {
      navigator.clipboard.writeText(brief);
      toast({
        title: "Copied to clipboard!",
        description: "Your brief has been copied to your clipboard",
      });
    }
  };

  return (
    <>
      <Card className="bg-card rounded-lg p-4 mb-8 shadow-[0_0_10px_rgba(252,238,9,0.2)]">
        <CardContent className="p-0 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold mb-1">Voice-to-Brief</h2>
            <p className="text-muted-foreground text-sm">Convert your spoken ideas into structured project briefs</p>
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
            <h3 className="text-lg font-medium mb-4">Voice Transcription</h3>

            <div className="space-y-5">
              <div className="text-center p-6 border border-dashed border-border rounded-lg bg-background text-muted-foreground mb-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-3 text-muted-foreground">
                  <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.35 9.65V11.35C4.35 15.57 7.78 19 12 19C16.22 19 19.65 15.57 19.65 11.35V9.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.61 6.43C11.51 6.1 12.49 6.1 13.39 6.43" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11.2 8.55C11.73 8.41 12.28 8.41 12.81 8.55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="mb-3">Voice upload feature coming soon in the next update.</p>
                <p className="text-sm">For now, please type your ideas below.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Your Ideas</label>
                <Textarea
                  value={text}
                  onChange={handleTextChange}
                  rows={8}
                  className="w-full bg-background border-border focus:ring-primary resize-none"
                  placeholder="Type what you would have said about the project..."
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
                    Generating...
                  </div>
                ) : (
                  "Generate Brief"
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
              <h3 className="text-lg font-medium">Structured Brief</h3>

              <div className="flex space-x-2">
                <Button
                  onClick={copyToClipboard}
                  disabled={!brief}
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
                {brief ? (
                  <div className="brief-content" dangerouslySetInnerHTML={{ __html: brief.replace(/\n/g, '<br/>') }}></div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 text-muted-foreground">
                      <path d="M3 4.5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 9.5H12.55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 14.5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 19.5H12.55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 9.5C16 8.12 17.12 7 18.5 7C19.88 7 21 8.12 21 9.5C21 10.88 19.88 12 18.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16.5 19.5C16.5 18.12 17.62 17 19 17C20.38 17 21.5 18.12 21.5 19.5C21.5 20.88 20.38 22 19 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Enter your project ideas and click "Generate Brief" to convert them into a structured project brief.</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-between items-center">
              {brief && generationTime && (
                <span className="text-xs text-accent">Generated in {generationTime.toFixed(1)} seconds with GPT-4 Turbo</span>
              )}
              {brief && (
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

export default VoiceToBrief;
