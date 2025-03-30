import { useState } from 'react';
import { ToolHistory } from '@shared/schema';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatMarkdown } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ExportMenu } from '@/components/export/export-menu';

interface HistoryDetailProps {
  history: ToolHistory;
  open: boolean;
  onClose: () => void;
}

const HistoryDetail = ({ history, open, onClose }: HistoryDetailProps) => {
  // Parse JSON from metadata if it exists
  const metadata = history.metadata ? JSON.parse(history.metadata) : {};
  const title = metadata.title || getToolLabel(history.toolType);
  
  // Parse dates safely
  const createdAt = history.createdAt ? parseISO(history.createdAt.toString()) : new Date();
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="flex items-center gap-1 mt-1">
            <Calendar className="h-3.5 w-3.5 opacity-70" />
            <span>{format(createdAt, "MMM d, yyyy")}</span>
            <span className="mx-1">•</span>
            <Clock className="h-3.5 w-3.5 opacity-70" />
            <span>{format(createdAt, "h:mm a")}</span>
            <span className="mx-1">•</span>
            <span className="capitalize">{getToolLabel(history.toolType)}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Input:</h3>
            <div className="bg-card p-3 rounded text-sm whitespace-pre-wrap">{history.input}</div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2">Output:</h3>
            <div className="bg-card p-3 rounded text-sm">
              <div 
                className="output-content" 
                dangerouslySetInnerHTML={{ __html: formatMarkdown(history.output) }}
              ></div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {history.generationTime 
              ? `Generated in ${(history.generationTime / 1000).toFixed(1)} seconds` 
              : ""}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <ExportMenu 
              contentId={history.id.toString()} 
              title={title}
              content={history.output}
              type={history.toolType}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function getToolLabel(type: string) {
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
}

export default HistoryDetail;