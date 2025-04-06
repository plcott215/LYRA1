import { apiRequest } from "./queryClient";

// OpenAI API interface
interface OpenAIResponse {
  text: string;
  generationTime?: number;
}

// Tool-specific interfaces
export interface ProposalRequest {
  title: string;
  industry: string;
  scope: string;
  startDate: string;
  endDate: string;
  minBudget?: string;
  maxBudget?: string;
  tone: 'professional' | 'friendly' | 'persuasive';
}

export interface EmailRewriteRequest {
  originalEmail: string;
  tone: 'professional' | 'friendly' | 'urgent' | 'apologetic';
  context?: string;
}

export interface PricingRequest {
  projectType: string;
  scope: string;
  timeline: string;
  experience: 'beginner' | 'intermediate' | 'expert';
  region: string;
}

export interface ContractExplainRequest {
  contractText: string;
  focusAreas?: string[];
}

export interface VoiceToBriefRequest {
  text: string;
}

export interface ClientOnboardingRequest {
  clientName: string;
  businessType: string;
  projectType: string;
  timeline: string;
  budget: string;
  tone: 'professional' | 'friendly' | 'detailed';
  additionalInfo?: string;
}

// API client functions
export const generateProposal = async (data: ProposalRequest): Promise<OpenAIResponse> => {
  return await apiRequest({
    url: '/api/tools/proposal',
    method: 'POST',
    body: data
  });
};

export const rewriteEmail = async (data: EmailRewriteRequest): Promise<OpenAIResponse> => {
  return await apiRequest({
    url: '/api/tools/email',
    method: 'POST',
    body: data
  });
};

export const getPricingEstimate = async (data: PricingRequest): Promise<OpenAIResponse> => {
  return await apiRequest({
    url: '/api/tools/pricing',
    method: 'POST',
    body: data
  });
};

export const explainContract = async (data: ContractExplainRequest): Promise<OpenAIResponse> => {
  return await apiRequest({
    url: '/api/tools/contract',
    method: 'POST',
    body: data
  });
};

export const generateBriefFromVoice = async (data: VoiceToBriefRequest): Promise<OpenAIResponse> => {
  return await apiRequest({
    url: '/api/tools/brief',
    method: 'POST',
    body: data
  });
};

export const generateClientOnboarding = async (data: ClientOnboardingRequest): Promise<OpenAIResponse> => {
  return await apiRequest({
    url: '/api/tools/onboarding',
    method: 'POST',
    body: data
  });
};
