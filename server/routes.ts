import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { validateFirebaseToken } from "./middleware/auth";
import OpenAI from "openai";
import Stripe from "stripe";
import { differenceInDays } from "date-fns";
import { insertToolHistorySchema } from "@shared/schema";
import { z } from "zod";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

// Initialize Stripe client with the latest API version
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia', // Using the latest API version
      typescript: true,
    })
  : null;

// Middleware to ensure OpenAI API key is provided
const ensureOpenAIKey = (req: Request, res: Response, next: Function) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      message: "OpenAI API key is not configured" 
    });
  }
  next();
};

// Middleware to ensure Stripe keys are provided
const ensureStripeKeys = (req: Request, res: Response, next: Function) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return res.status(500).json({ 
      message: "Stripe keys are not configured" 
    });
  }
  next();
};

// Extract user from Firebase token
const getUserFromRequest = async (req: Request) => {
  const tokenUser = req.body.user;
  if (!tokenUser || !tokenUser.email) {
    throw new Error("Authentication required");
  }

  // Check if user exists
  let user = await storage.getUserByEmail(tokenUser.email);
  
  // Create user if they don't exist
  if (!user) {
    const username = tokenUser.email.split('@')[0];
    user = await storage.createUser({
      username,
      email: tokenUser.email,
      displayName: tokenUser.displayName || username,
      photoURL: tokenUser.photoURL || "",
      authProvider: tokenUser.providerId || "firebase",
      providerId: tokenUser.uid,
      password: null, // Firebase handles auth
      stripeCustomerId: null,
      stripeSubscriptionId: null
    });
  }
  
  return user;
};

// Check if user has a pro subscription
// Check if user has a Pro subscription
const checkProSubscription = async (userId: number, userEmail: string) => {
  // Special case for our demo Pro account
  if (userEmail === "demo@lyra.app") {
    return true;
  }
  
  // For everyone else, check subscription status in database
  try {
    const subscription = await storage.getSubscription(userId);
    return subscription && subscription.status === "active";
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
};

// Calculate remaining trial days
const getRemainingTrialDays = async (userId: number) => {
  // Get user from storage to check trial end date
  try {
    const user = await storage.getUser(userId);
    if (user && user.trialEndsAt) {
      const today = new Date();
      const trialEnd = new Date(user.trialEndsAt);
      
      // Calculate days left in trial
      if (trialEnd > today) {
        return Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    
    // No trial days left
    return 0;
  } catch (error) {
    console.error("Error calculating trial days:", error);
    return 0;
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  app.use('/api/*', validateFirebaseToken);

  // Subscription status endpoint
  app.get('/api/subscription', async (req: Request, res: Response) => {
    try {
      const user = req.body.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = user.id;
      const userEmail = user.email || "";
      
      // Check if user has Pro access
      const isPro = await checkProSubscription(userId, userEmail);
      const trialDaysLeft = await getRemainingTrialDays(userId);
      
      // Special case for our demo Pro user
      if (userEmail === "demo@lyra.app") {
        // For demo Pro account, return active subscription with long expiry
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 5); // 5 years in the future
        
        return res.json({
          isPro: true,
          trialDaysLeft: 0,
          subscriptionData: {
            status: "active",
            startDate: startDate,
            endDate: endDate,
            trialEnd: null
          }
        });
      }
      
      // Get subscription data if it exists
      const subscription = await storage.getSubscription(userId);
      
      res.json({
        isPro,
        trialDaysLeft,
        subscriptionData: subscription ? {
          status: subscription.status,
          startDate: subscription.currentPeriodStart,
          endDate: subscription.currentPeriodEnd,
          trialEnd: subscription.trialEndDate,
        } : null
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Proposal writer endpoint
  app.post('/api/tools/proposal', ensureOpenAIKey, async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const userId = req.body.user.id;
      const { title, industry, scope, startDate, endDate, minBudget, maxBudget, tone } = req.body;
      
      // Check inputs
      if (!title || !industry || !scope) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Create the prompt
      const prompt = `
        Generate a professional project proposal with the following details:
        
        Project Title: ${title}
        Client Industry: ${industry}
        Project Scope: ${scope}
        ${startDate ? `Start Date: ${startDate}` : ''}
        ${endDate ? `End Date: ${endDate}` : ''}
        ${minBudget && maxBudget ? `Budget Range: $${minBudget} - $${maxBudget}` : ''}
        
        Tone: ${tone || 'professional'}
        
        The proposal should include the following sections:
        1. Introduction and project understanding
        2. Detailed scope of work
        3. Timeline and milestones
        4. Pricing and payment terms
        5. About me/my team
        6. Next steps
        
        Format the response with proper section headers and professional language.
      `;

      // Generate the proposal with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const generatedText = response.choices[0].message.content;
      const generationTime = (Date.now() - startTime) / 1000; // in seconds

      // Save to history
      await storage.createToolHistory({
        userId,
        toolType: "proposal",
        input: JSON.stringify({ title, industry, scope, startDate, endDate, minBudget, maxBudget, tone }),
        output: generatedText || "",
        generationTime: Math.round(generationTime)
      });

      res.json({ 
        text: generatedText,
        generationTime 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Email rewriter endpoint
  app.post('/api/tools/email', ensureOpenAIKey, async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const userId = req.body.user.id;
      const { originalEmail, tone, context } = req.body;
      
      // Check inputs
      if (!originalEmail) {
        return res.status(400).json({ message: "Missing email content" });
      }

      // Create the prompt
      const prompt = `
        Rewrite the following email to sound more ${tone || 'professional'}.
        ${context ? `Additional context: ${context}` : ''}
        
        Here's the original email:
        "${originalEmail}"
        
        Please maintain the same information but improve the structure, clarity, 
        tone, and professionalism. Fix any grammar or spelling issues.
      `;

      // Generate the rewritten email with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const generatedText = response.choices[0].message.content;
      const generationTime = (Date.now() - startTime) / 1000; // in seconds

      // Save to history
      await storage.createToolHistory({
        userId,
        toolType: "email",
        input: JSON.stringify({ originalEmail, tone, context }),
        output: generatedText || "",
        generationTime: Math.round(generationTime)
      });

      res.json({ 
        text: generatedText,
        generationTime 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Pricing assistant endpoint
  app.post('/api/tools/pricing', ensureOpenAIKey, async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const userId = req.body.user.id;
      const { projectType, scope, timeline, experience, region } = req.body;
      
      // Check inputs
      if (!projectType || !scope) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Create the prompt
      const prompt = `
        Generate pricing estimates for a freelance project with the following details:
        
        Project Type: ${projectType}
        Project Scope: ${scope}
        ${timeline ? `Timeline: ${timeline}` : ''}
        Experience Level: ${experience || 'intermediate'}
        ${region ? `Region: ${region}` : ''}
        
        Provide both hourly rate and flat project rate estimates. Include:
        1. A range of prices with low, average, and high estimates
        2. Factors that influence the price
        3. How to justify the rates to clients
        4. Any recommendations for pricing structure (milestone payments, etc.)
        
        Format the response with clear sections and professional language.
      `;

      // Generate the pricing estimate with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const generatedText = response.choices[0].message.content;
      const generationTime = (Date.now() - startTime) / 1000; // in seconds

      // Save to history
      await storage.createToolHistory({
        userId,
        toolType: "pricing",
        input: JSON.stringify({ projectType, scope, timeline, experience, region }),
        output: generatedText || "",
        generationTime: Math.round(generationTime)
      });

      res.json({ 
        text: generatedText,
        generationTime 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Contract explainer endpoint
  app.post('/api/tools/contract', ensureOpenAIKey, async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const userId = req.body.user.id;
      const { contractText, focusAreas } = req.body;
      
      // Check inputs
      if (!contractText) {
        return res.status(400).json({ message: "Missing contract text" });
      }

      // Create the prompt
      const prompt = `
        Explain the following contract in simple, plain English:
        
        ${contractText}
        
        ${focusAreas && focusAreas.length > 0 ? `Please focus especially on these areas: ${focusAreas.join(', ')}` : ''}
        
        Break down the explanation into sections:
        1. Summary of the contract
        2. Key terms and obligations
        3. Potential risks or red flags
        4. Plain English explanation of legal jargon
        5. What to pay attention to before signing
        
        Format the response with clear headings and simple language that a non-lawyer can understand.
      `;

      // Generate the contract explanation with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const generatedText = response.choices[0].message.content;
      const generationTime = (Date.now() - startTime) / 1000; // in seconds

      // Save to history
      await storage.createToolHistory({
        userId,
        toolType: "contract",
        input: JSON.stringify({ contractText, focusAreas }),
        output: generatedText || "",
        generationTime: Math.round(generationTime)
      });

      res.json({ 
        text: generatedText,
        generationTime 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Voice-to-brief endpoint
  app.post('/api/tools/brief', ensureOpenAIKey, async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const userId = req.body.user.id;
      const { text } = req.body;
      
      // Check inputs
      if (!text) {
        return res.status(400).json({ message: "Missing text input" });
      }

      // Create the prompt
      const prompt = `
        Convert the following unstructured ideas into a formal creative brief:
        
        ${text}
        
        Create a structured creative brief that includes:
        1. Project overview and background
        2. Objectives and goals
        3. Target audience
        4. Key deliverables
        5. Timeline
        6. Budget considerations
        7. Constraints or special requirements
        
        Format the response as a professional document that could be shared with clients or team members.
      `;

      // Generate the brief with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const generatedText = response.choices[0].message.content;
      const generationTime = (Date.now() - startTime) / 1000; // in seconds

      // Save to history
      await storage.createToolHistory({
        userId,
        toolType: "brief",
        input: text,
        output: generatedText || "",
        generationTime: Math.round(generationTime)
      });

      res.json({ 
        text: generatedText,
        generationTime 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Client Onboarding endpoint
  app.post('/api/tools/onboarding', ensureOpenAIKey, async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const userId = req.body.user.id;
      const { clientName, businessType, projectType, timeline, budget, tone, additionalInfo } = req.body;
      
      // Check inputs
      if (!clientName || !projectType || !businessType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Create the prompt
      const prompt = `
        Generate a professional client onboarding document with the following details:
        
        Client/Company Name: ${clientName}
        Business Type: ${businessType}
        Project Type: ${projectType}
        ${timeline ? `Project Timeline: ${timeline}` : ''}
        ${budget ? `Budget Range: ${budget}` : ''}
        ${additionalInfo ? `Additional Information: ${additionalInfo}` : ''}
        
        Tone: ${tone || 'professional'}
        
        Create a structured onboarding document that includes:
        1. Welcome message and introduction to my services
        2. Project scope and deliverables
        3. Communication expectations and channels
        4. Timeline with key milestones
        5. Payment schedule and methods
        6. Required materials and information from the client
        7. Next steps
        
        Format the response with clear headings and professional language appropriate for a freelancer to share with a new client.
      `;

      // Generate the onboarding document with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const generatedText = response.choices[0].message.content;
      const generationTime = (Date.now() - startTime) / 1000; // in seconds

      // Save to history
      await storage.createToolHistory({
        userId,
        toolType: "onboarding",
        input: JSON.stringify({ clientName, businessType, projectType, timeline, budget, tone, additionalInfo }),
        output: generatedText || "",
        generationTime: Math.round(generationTime)
      });

      res.json({ 
        text: generatedText,
        generationTime 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create Stripe subscription endpoint
  app.post('/api/create-subscription', async (req: Request, res: Response) => {
    // Skip Stripe and automatically grant Pro access
    try {
      const userId = req.body.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create a demo subscription without using Stripe
      const fakeDemoId = "demo_" + Math.random().toString(36).substring(2, 15);
      
      // Update user with demo subscription ID
      await storage.updateUserStripeInfo(user.id, {
        stripeCustomerId: "demo_customer_" + userId,
        stripeSubscriptionId: fakeDemoId
      });
      
      // Create permanent subscription record
      const now = new Date();
      const futureDate = new Date();
      futureDate.setFullYear(now.getFullYear() + 10); // 10 years in the future
      
      const subscription = await storage.createSubscription({
        userId: user.id,
        stripeSubscriptionId: fakeDemoId,
        status: "active",
        plan: 'pro',
        currentPeriodStart: now,
        currentPeriodEnd: futureDate,
        cancelAtPeriodEnd: false,
      });
      
      // Return success with fake subscription data
      res.json({
        success: true,
        message: "Pro access granted",
        subscriptionId: fakeDemoId,
        status: "active",
        isPro: true
      });
      
    } catch (error: any) {
      console.error("Error creating demo subscription:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Tool history endpoint
  app.get('/api/history', validateFirebaseToken, async (req: Request, res: Response) => {
    try {
      const userId = req.body.user.id;
      const toolType = req.query.tool as string | undefined;
      const action = req.query.action as string | undefined;
      
      const history = await storage.getToolHistory(userId, toolType);
      res.json({ history });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Record export action
  app.post('/api/history', validateFirebaseToken, async (req: Request, res: Response) => {
    try {
      const userId = req.body.user.id;
      const { toolType, action, format, content } = req.body;
      
      if (!toolType || !action || !format) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Validate tool history data
      const historySchema = insertToolHistorySchema.extend({
        action: z.enum(["generate", "export"]),
        format: z.enum(["PDF", "Notion"]),
        metadata: z.string().optional()
      });
      
      // Create tool history record
      const historyData = await historySchema.parseAsync({
        userId,
        toolType,
        action,
        format,
        input: JSON.stringify(content || {}),
        output: "",  // No output for export actions
        generationTime: 0,
        metadata: content.pageUrl ? JSON.stringify({ pageUrl: content.pageUrl }) : undefined
      });
      
      const history = await storage.createToolHistory(historyData);
      res.json({ success: true, historyId: history.id });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
