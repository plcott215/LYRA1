import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateBriefFromVoice, VoiceToBriefRequest } from "@/lib/openai";
import { formatMarkdown } from "@/lib/utils";
import { 
  Copy as CopyIcon, 
  RefreshCw as RefreshIcon, 
  Sparkles, 
  Mic as MicIcon,
  MicOff as MicOffIcon,
  StopCircle as StopIcon 
} from "lucide-react";

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error: any;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const VoiceToBrief = () => {
  const [text, setText] = useState("");
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Check if browser supports Web Speech API
  useEffect(() => {
    const isSpeechRecognitionSupported = 'SpeechRecognition' in window || 
      'webkitSpeechRecognition' in window;
    
    setSpeechRecognitionSupported(isSpeechRecognitionSupported);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const startSpeechRecognition = () => {
    if (!speechRecognitionSupported) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in your browser. Try Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    // Initialize Web Speech API
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionEvent) => {
      console.error('Speech recognition error', event.error);
      stopSpeechRecognition();
      
      toast({
        title: "Recording error",
        description: event.error === 'not-allowed' 
          ? "Microphone access denied. Please check your permissions." 
          : `Error: ${event.error}`,
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "You can now edit the text or generate a brief",
      });
    }
  };

  const handleGenerate = async () => {
    if (!text) {
      toast({
        title: "Missing information",
        description: "Please enter text or record your voice to generate a brief",
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
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary mr-2">
              <span className="w-2 h-2 rounded-full bg-primary mr-1"></span>
              AI Powered
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent mr-2">
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
              <div className="flex justify-center p-6 border border-dashed border-border rounded-lg bg-background text-muted-foreground mb-4">
                {isRecording ? (
                  <Button 
                    onClick={stopSpeechRecognition} 
                    className="flex items-center justify-center p-4 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all"
                  >
                    <StopIcon className="h-8 w-8" />
                  </Button>
                ) : (
                  <Button 
                    onClick={startSpeechRecognition} 
                    disabled={!speechRecognitionSupported}
                    className={`flex items-center justify-center p-4 ${
                      speechRecognitionSupported 
                        ? 'bg-primary text-black hover:shadow-[0_0_10px_rgba(252,238,9,0.8)]' 
                        : 'bg-gray-400 text-gray-700'
                    } rounded-full shadow-lg transition-all`}
                    title={speechRecognitionSupported ? "Start recording" : "Speech recognition not supported in your browser"}
                  >
                    <MicIcon className="h-8 w-8" />
                  </Button>
                )}
                <div className="ml-4 flex flex-col justify-center">
                  {isRecording ? (
                    <div>
                      <div className="text-red-500 font-medium mb-2 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                        Recording...
                      </div>
                      <p className="text-sm">Speak clearly into your microphone</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium mb-2">{speechRecognitionSupported ? "Click to start recording" : "Speech recognition not supported"}</p>
                      <p className="text-sm">{
                        speechRecognitionSupported 
                          ? "Or type your project ideas below" 
                          : "Please use Chrome, Edge, or Safari for voice recording"
                      }</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Your Ideas</label>
                <Textarea
                  value={text}
                  onChange={handleTextChange}
                  rows={8}
                  className="w-full bg-background border-border focus:ring-primary resize-none"
                  placeholder="Type or record your ideas for the project..."
                />
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
                  title="Regenerate brief"
                >
                  <RefreshIcon className="h-4 w-4" />
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
                  <div className="brief-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(brief) }}></div>
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

export default VoiceToBrief;