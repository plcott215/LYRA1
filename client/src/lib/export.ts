import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Client } from "@notionhq/client";
import { formatMarkdown } from "./utils";

// PDF Export functionality
export const exportToPDF = async (
  elementId: string,
  filename: string = "lyra-export"
): Promise<boolean> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      return false;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    return false;
  }
};

// Notion Export functionality
type ExportToNotionParams = {
  title: string;
  content: string;
  type: string;
  notionToken: string;
  databaseId?: string;
};

export const exportToNotion = async ({
  title,
  content,
  type,
  notionToken,
  databaseId
}: ExportToNotionParams): Promise<{ success: boolean; message: string; pageUrl?: string }> => {
  if (!notionToken) {
    return {
      success: false,
      message: "Notion integration token is required"
    };
  }

  try {
    const notion = new Client({ auth: notionToken });
    
    // Create a simpler Notion block structure
    const blocks = [
      {
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: title } }]
        }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: `Type: ${type}` } }]
        }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: content } }]
        }
      }
    ];
    
    // If we have a database ID, create a page in that database
    if (databaseId && databaseId.length > 0 && databaseId.indexOf('-') !== -1) {
      // This looks like a database ID
      try {
        const response = await notion.pages.create({
          parent: { database_id: databaseId },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: title
                  }
                }
              ]
            },
            Type: {
              select: {
                name: type
              }
            }
          },
          children: blocks
        });
        
        return {
          success: true,
          message: "Successfully exported to Notion database",
          pageUrl: `https://notion.so/${response.id.replace(/-/g, '')}`
        };
      } catch (dbError) {
        // If database creation fails, try as a page ID
        console.error("Failed to create in database, trying as page:", dbError);
        
        const response = await notion.pages.create({
          parent: { page_id: databaseId },
          properties: {
            title: {
              title: [
                {
                  text: {
                    content: title
                  }
                }
              ]
            }
          },
          children: blocks
        });
        
        return {
          success: true,
          message: "Successfully exported to Notion",
          pageUrl: `https://notion.so/${response.id.replace(/-/g, '')}`
        };
      }
    } 
    // Otherwise, create a standalone page
    else {
      // This is a page ID or not provided
      if (!databaseId) {
        return {
          success: false,
          message: "A database ID or page ID is required. Please provide one in the export dialog."
        };
      }
      
      const response = await notion.pages.create({
        parent: {
          page_id: databaseId
        },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: title
                }
              }
            ]
          }
        },
        children: blocks
      });
      
      return {
        success: true,
        message: "Successfully exported to Notion",
        pageUrl: `https://notion.so/${response.id.replace(/-/g, '')}`
      };
    }
  } catch (error: any) {
    console.error("Error exporting to Notion:", error);
    return {
      success: false,
      message: error.message || "Failed to export to Notion"
    };
  }
};