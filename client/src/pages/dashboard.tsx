import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/dashboard/layout";
import ProposalWriter from "@/components/tools/proposal-writer";
import EmailRewriter from "@/components/tools/email-rewriter";
import PricingAssistant from "@/components/tools/pricing-assistant";
import ContractExplainer from "@/components/tools/contract-explainer";
import VoiceToBrief from "@/components/tools/voice-to-brief";

const Dashboard = () => {
  const [location] = useLocation();
  
  // Determine which tool to show based on the current location
  const renderTool = () => {
    const path = location.split("/").filter(Boolean);
    
    // If we're at /dashboard with no sub-path, show the proposal writer
    if (path.length === 1 && path[0] === "dashboard") {
      return <ProposalWriter />;
    }
    
    // Otherwise, show the tool based on the sub-path
    switch (path[1]) {
      case "email":
        return <EmailRewriter />;
      case "pricing":
        return <PricingAssistant />;
      case "contract":
        return <ContractExplainer />;
      case "voice":
        return <VoiceToBrief />;
      case "history":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">History</h2>
            <p className="text-muted-foreground">Your generation history will appear here.</p>
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Account settings and preferences will appear here.</p>
          </div>
        );
      default:
        return <ProposalWriter />;
    }
  };
  
  // Get the title based on the current tool
  const getTitle = () => {
    const path = location.split("/").filter(Boolean);
    
    if (path.length === 1 && path[0] === "dashboard") {
      return "Proposal Writer";
    }
    
    switch (path[1]) {
      case "email":
        return "Email Rewriter";
      case "pricing":
        return "Pricing Assistant";
      case "contract":
        return "Contract Explainer";
      case "voice":
        return "Voice-to-Brief";
      case "history":
        return "History";
      case "settings":
        return "Settings";
      default:
        return "Proposal Writer";
    }
  };

  return (
    <DashboardLayout title={getTitle()}>
      {renderTool()}
    </DashboardLayout>
  );
};

export default Dashboard;
