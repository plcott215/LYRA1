import { users, User, InsertUser, toolHistory, ToolHistory, InsertToolHistory, subscriptions, Subscription, InsertSubscription } from "@shared/schema";
import { addDays } from "date-fns";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByProviderId(providerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;
  
  // Subscription operations
  getSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: number, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User>;
  
  // Tool history operations
  getToolHistory(userId: number, toolType?: string): Promise<ToolHistory[]>;
  createToolHistory(history: InsertToolHistory): Promise<ToolHistory>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private toolHistory: Map<number, ToolHistory>;
  private subscriptions: Map<number, Subscription>;
  private currentUserId: number;
  private currentToolHistoryId: number;
  private currentSubscriptionId: number;
  
  // Default values for nullable fields
  private defaultUser: Partial<User> = {
    password: null,
    authProvider: null,
    providerId: null,
    displayName: null,
    photoURL: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    trialEndsAt: null,
    createdAt: null
  };
  
  private defaultToolHistory: Partial<ToolHistory> = {
    action: "generate",
    format: null,
    generationTime: null,
    metadata: null,
    createdAt: null
  };
  
  private defaultSubscription: Partial<Subscription> = {
    trialEndDate: null,
    cancelAtPeriodEnd: false,
    createdAt: null
  };

  constructor() {
    this.users = new Map();
    this.toolHistory = new Map();
    this.subscriptions = new Map();
    this.currentUserId = 1;
    this.currentToolHistoryId = 1;
    this.currentSubscriptionId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByProviderId(providerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.providerId === providerId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    // Set trial to end in 3 days
    const trialEndsAt = addDays(now, 3);
    
    const user: User = { 
      ...this.defaultUser,
      ...insertUser, 
      id, 
      createdAt: now,
      trialEndsAt
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Subscription operations
  async getSubscription(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (sub) => sub.userId === userId
    );
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentSubscriptionId++;
    const now = new Date();
    
    const subscription: Subscription = { 
      ...this.defaultSubscription,
      ...insertSubscription, 
      id, 
      createdAt: now 
    };
    
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription> {
    const subscription = Array.from(this.subscriptions.values()).find(
      (sub) => sub.id === id
    );
    
    if (!subscription) {
      throw new Error(`Subscription with id ${id} not found`);
    }

    const updatedSubscription = { ...subscription, ...data };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    const updatedUser = { ...user, stripeCustomerId: customerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(userId: number, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    const updatedUser = { 
      ...user, 
      stripeCustomerId: data.stripeCustomerId, 
      stripeSubscriptionId: data.stripeSubscriptionId 
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Tool history operations
  async getToolHistory(userId: number, toolType?: string, action?: string): Promise<ToolHistory[]> {
    return Array.from(this.toolHistory.values())
      .filter((history) => {
        if (history.userId !== userId) return false;
        if (toolType && history.toolType !== toolType) return false;
        if (action && history.action !== action) return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date();
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date();
        return dateB.getTime() - dateA.getTime();
      });
  }

  async createToolHistory(insertHistory: InsertToolHistory): Promise<ToolHistory> {
    const id = this.currentToolHistoryId++;
    const now = new Date();
    
    const history: ToolHistory = { 
      ...this.defaultToolHistory,
      ...insertHistory, 
      id, 
      createdAt: now 
    };
    
    this.toolHistory.set(id, history);
    return history;
  }
}

export const storage = new MemStorage();
