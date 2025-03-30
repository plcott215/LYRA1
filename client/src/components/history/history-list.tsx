import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ToolHistory } from "@shared/schema";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportMenu } from "@/components/export/export-menu";
import { Calendar, Clock, FileText, Mail, DollarSign, FileCheck, Mic } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { format, parseISO } from "date-fns";

type ToolType = "proposal" | "email" | "pricing" | "contract" | "brief" | "all";

interface HistoryItemProps {
  history: ToolHistory;
}

const HistoryItem = ({ history }: HistoryItemProps) => {
  const getToolIcon = (type: string) => {
    switch (type) {
      case "proposal":
        return <FileText className="h-5 w-5" />;
      case "email":
        return <Mail className="h-5 w-5" />;
      case "pricing":
        return <DollarSign className="h-5 w-5" />;
      case "contract":
        return <FileCheck className="h-5 w-5" />;
      case "brief":
        return <Mic className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getToolLabel = (type: string) => {
    switch (type) {
      case "proposal":
        return "Proposal";
      case "email":
        return "Email";
      case "pricing":
        return "Pricing";
      case "contract":
        return "Contract";
      case "brief":
        return "Brief";
      default:
        return type;
    }
  };

  // Parse JSON from metadata if it exists
  const metadata = history.metadata ? JSON.parse(history.metadata) : {};
  const title = metadata.title || `${getToolLabel(history.toolType)} Generation`;
  
  // Generate a condensed display of input data
  const inputPreview = history.input.length > 150 
    ? history.input.substring(0, 150) + "..." 
    : history.input;
    
  // Parse dates safely
  const createdAt = history.createdAt ? parseISO(history.createdAt.toString()) : new Date();

  return (
    <Card className="mb-4" hoverEffect={true}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium" highlightOnHover={true}>{title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Calendar className="h-3.5 w-3.5 opacity-70" />
              <span>{format(createdAt, "MMM d, yyyy")}</span>
              <span className="mx-1">•</span>
              <Clock className="h-3.5 w-3.5 opacity-70" />
              <span>{format(createdAt, "h:mm a")}</span>
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 transition-all duration-200 hover:bg-primary/10 hover:border-primary/50">
            {getToolIcon(history.toolType)}
            <span>{getToolLabel(history.toolType)}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <div className="font-semibold mb-1">Input:</div>
          <p className="whitespace-pre-wrap">{inputPreview}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          {history.generationTime 
            ? `Generated in ${(history.generationTime / 1000).toFixed(1)}s` 
            : ""}
        </div>
        <ExportMenu 
          contentId={history.id.toString()} 
          title={title}
          content={history.output}
          type={history.toolType}
        />
      </CardFooter>
    </Card>
  );
};

export function HistoryList() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<ToolType>("all");
  
  interface HistoryResponse {
    history: ToolHistory[];
  }
  
  const { data, isLoading, isError } = useQuery<HistoryResponse>({
    queryKey: ["/api/history"],
    enabled: !!user,
  });

  const historyItems = data?.history || [];
  
  const filteredHistory = historyItems.filter((item) => 
    filter === "all" || item.toolType === filter
  );

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Generation History</h1>
          <div className="w-40">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-1/4" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Error Loading History</h1>
        <p className="text-muted-foreground">Could not load your generation history. Please try again later.</p>
      </div>
    );
  }

  if (!historyItems.length) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">No History Found</h1>
        <p className="text-muted-foreground">Your generation history will appear here after you use any of the AI tools.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Generation History</h1>
        <div className="w-40">
          <Select value={filter} onValueChange={(value) => setFilter(value as ToolType)}>
            <SelectTrigger className="hover-glow">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="proposal">Proposals</SelectItem>
              <SelectItem value="email">Emails</SelectItem>
              <SelectItem value="pricing">Pricing</SelectItem>
              <SelectItem value="contract">Contracts</SelectItem>
              <SelectItem value="brief">Briefs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        {filteredHistory.map((history: ToolHistory) => (
          <HistoryItem key={history.id} history={history} />
        ))}
      </div>
    </div>
  );
}