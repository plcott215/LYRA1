import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exportToPDF, exportToNotion } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useSubscription } from "@/context/subscription-context";

interface ExportMenuProps {
  contentId: string;
  title: string;
  content: string;
  type: string;
}

const ExportMenu = ({ contentId, title, content, type }: ExportMenuProps) => {
  const { toast } = useToast();
  const { isPro } = useSubscription();
  const [notionDialogOpen, setNotionDialogOpen] = useState(false);
  const [notionToken, setNotionToken] = useState("");
  const [notionDatabaseId, setNotionDatabaseId] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handlePDFExport = async () => {
    try {
      const success = await exportToPDF(contentId, `lyra-${type.toLowerCase()}-${Date.now()}`);
      
      if (success) {
        toast({
          title: "Export Successful",
          description: "Your content has been exported to PDF",
        });
        
        // Record export in history
        await apiRequest("POST", "/api/history", {
          toolType: type,
          action: "export",
          format: "PDF",
          content: { title, content }
        });
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

  const handleNotionExport = async () => {
    if (!isPro) {
      toast({
        title: "Premium Feature",
        description: "Notion export is available for Pro subscribers only",
        variant: "destructive",
      });
      return;
    }
    
    setNotionDialogOpen(true);
  };
  
  const submitNotionExport = async () => {
    if (!notionToken) {
      toast({
        title: "Notion Token Required",
        description: "Please enter your Notion integration token",
        variant: "destructive",
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      const result = await exportToNotion({
        title,
        content,
        type,
        notionToken,
        databaseId: notionDatabaseId || undefined
      });
      
      if (result.success) {
        toast({
          title: "Export Successful",
          description: result.message,
        });
        
        // Record export in history
        await apiRequest("POST", "/api/history", {
          toolType: type,
          action: "export",
          format: "Notion",
          content: { title, content, pageUrl: result.pageUrl }
        });
        
        setNotionDialogOpen(false);
      } else {
        toast({
          title: "Export Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "There was an error exporting to Notion",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handlePDFExport}>
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleNotionExport} disabled={!isPro}>
            {isPro ? "Export to Notion" : "Export to Notion (Pro)"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={notionDialogOpen} onOpenChange={setNotionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export to Notion</DialogTitle>
            <DialogDescription>
              Enter your Notion integration token to export this content to Notion.
              <a 
                href="https://www.notion.so/my-integrations" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block mt-1"
              >
                Create a Notion integration
              </a>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notionToken">Notion Integration Token</Label>
              <Input
                id="notionToken"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                placeholder="secret_..."
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="databaseId">
                Database ID or Page ID
              </Label>
              <Input
                id="databaseId"
                value={notionDatabaseId}
                onChange={(e) => setNotionDatabaseId(e.target.value)}
                placeholder="e.g. 8abcdef123456789abcdef123456789"
              />
              <p className="text-sm text-muted-foreground">
                Provide a Notion database ID to add the content as a database entry, or a page ID to add it as a sub-page.
                <a 
                  href="https://developers.notion.com/docs/working-with-page-content#creating-a-page-with-content"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline block mt-1"
                >
                  Learn how to find your page/database ID
                </a>
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitNotionExport} disabled={isExporting}>
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportMenu;