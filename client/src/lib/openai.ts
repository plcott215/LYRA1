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
  const response = await apiRequest('POST', '/api/tools/proposal', data);
  return response.json();
};

export const rewriteEmail = async (data: EmailRewriteRequest): Promise<OpenAIResponse> => {
  const response = await apiRequest('POST', '/api/tools/email', data);
  return response.json();
};

export const getPricingEstimate = async (data: PricingRequest): Promise<OpenAIResponse> => {
  const response = await apiRequest('POST', '/api/tools/pricing', data);
  return response.json();
};

export const explainContract = async (data: ContractExplainRequest): Promise<OpenAIResponse> => {
  const response = await apiRequest('POST', '/api/tools/contract', data);
  return response.json();
};

export const generateBriefFromVoice = async (data: VoiceToBriefRequest): Promise<OpenAIResponse> => {
  const response = await apiRequest('POST', '/api/tools/brief', data);
  return response.json();
};

export const generateClientOnboarding = async (data: ClientOnboardingRequest): Promise<OpenAIResponse> => {
  const response = await apiRequest('POST', '/api/tools/onboarding', data);
  return response.json();
};
