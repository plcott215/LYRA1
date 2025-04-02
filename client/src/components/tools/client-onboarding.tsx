import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Sparkles, FileText, Copy, Download, Send, Info, Loader2 } from "lucide-react";
import { apiRequest } from "../../lib/queryClient";
import { useAuth } from "../../context/auth-context";
import { useToast } from "../../hooks/use-toast";
import { ExportMenu } from "../../components/export/export-menu";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useSubscription } from "../../context/subscription-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { formatMarkdown } from "../../lib/utils";
import ProBanner from "../../components/pro-banner";

const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  businessType: z.string().min(1, "Business type is required"),
  projectType: z.string().min(1, "Project type is required"),
  timeline: z.string().min(1, "Timeline is required"),
  budget: z.string().min(1, "Budget information is required"),
  tone: z.enum(["professional", "friendly", "detailed"]),
  additionalInfo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ClientOnboarding() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const { toast } = useToast();
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      businessType: "",
      projectType: "",
      timeline: "",
      budget: "",
      tone: "professional",
      additionalInfo: "",
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use this tool.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setResult("");
    
    try {
      const response = await apiRequest('POST', '/api/tools/onboarding', data);
      const result = await response.json();
      
      setResult(result.text);
      if (result.generationTime) {
        setGenerationTime(result.generationTime);
      }
      
      // Save to history
      try {
        await apiRequest('POST', '/api/history', {
          toolType: "onboarding",
          input: JSON.stringify(data),
          output: result.text,
        });
      } catch (error) {
        console.error("Failed to save to history:", error);
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate onboarding document.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: "Copied!",
      description: "Onboarding document copied to clipboard",
    });
  };
  
  const regenerateContent = () => {
    onSubmit(form.getValues());
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="create" className="text-base py-3">
            <FileText className="h-4 w-4 mr-2" />
            Create Onboarding
          </TabsTrigger>
          <TabsTrigger value="result" className="text-base py-3" disabled={!result}>
            <FileText className="h-4 w-4 mr-2" />
            View Document
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Client Onboarding Assistant
                </CardTitle>
                <CardDescription>
                  Create professional client onboarding documents that streamline your process
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client/Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Acme Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client's Business Type</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. E-commerce, Real Estate, SaaS" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Type</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Website Redesign, Branding, Consulting" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="timeline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Timeline</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 4 weeks, 3 months" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget Range</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. $5,000-$10,000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Tone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="friendly">Friendly</SelectItem>
                              <SelectItem value="detailed">Detailed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="additionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Information (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add any other details that might be helpful..." 
                              className="resize-none h-24"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Create Onboarding Document
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Tips for Effective Onboarding</CardTitle>
                <CardDescription>
                  Maximize client satisfaction with these best practices
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-primary/10 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-primary" />
                    About Client Onboarding
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    A proper onboarding document helps to set expectations, establish communication patterns, and define project parameters. It gives your clients clarity and confidence in your process.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">What to Include</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Welcome message and introduction to your services</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Project scope and deliverables</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Communication expectations and channels</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Timeline with key milestones</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Payment schedule and methods</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Required materials and information from client</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Pro Tips</h4>
                  <div className="space-y-2">
                    <Badge variant="outline" className="bg-primary/20 hover:bg-primary/30 text-primary-foreground border-primary/30">Personalize for each client</Badge>
                    <Badge variant="outline" className="bg-primary/20 hover:bg-primary/30 text-primary-foreground border-primary/30 ml-2">Include next steps</Badge>
                    <Badge variant="outline" className="bg-primary/20 hover:bg-primary/30 text-primary-foreground border-primary/30 ml-2">Set boundaries</Badge>
                  </div>
                </div>
              </CardContent>
              
              {!isPro && <CardFooter className="px-0 pb-0">
                <ProBanner />
              </CardFooter>}
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="result">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <Card className="md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-xl">Onboarding Document</CardTitle>
                      <CardDescription>
                        {form.getValues().clientName} - {form.getValues().projectType}
                      </CardDescription>
                    </div>
                    {generationTime && (
                      <Badge variant="outline" className="bg-accent/20 text-accent-foreground border-accent/30">
                        Generated in {generationTime.toFixed(2)}s
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: formatMarkdown(result) }} />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-6">
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" onClick={copyToClipboard}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ExportMenu
                              contentId={`onboarding-${Date.now()}`}
                              title={`${form.getValues().clientName} Onboarding`}
                              content={result}
                              type="onboarding"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Export document</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" onClick={regenerateContent}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Regenerate
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Generate a new version</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Form Summary</CardTitle>
                    <CardDescription>Details you provided</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">CLIENT</p>
                      <p className="text-sm">{form.getValues().clientName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">BUSINESS TYPE</p>
                      <p className="text-sm">{form.getValues().businessType}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">PROJECT</p>
                      <p className="text-sm">{form.getValues().projectType}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">TIMELINE</p>
                        <p className="text-sm">{form.getValues().timeline}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">BUDGET</p>
                        <p className="text-sm">{form.getValues().budget}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">TONE</p>
                      <p className="text-sm capitalize">{form.getValues().tone}</p>
                    </div>
                    {form.getValues().additionalInfo && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">ADDITIONAL INFO</p>
                        <p className="text-sm">{form.getValues().additionalInfo}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}