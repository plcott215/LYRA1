import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"),
  authProvider: text("auth_provider").default("email"),
  providerId: text("provider_id"),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tool Generation History
export const toolHistory = pgTable("tool_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  toolType: text("tool_type").notNull(), // proposal, email, pricing, contract, brief
  action: text("action").default("generate"), // generate, export
  format: text("format"), // PDF, Notion (for exports)
  input: text("input").notNull(),
  output: text("output").notNull(),
  generationTime: integer("generation_time"),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription model
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  stripeSubscriptionId: text("stripe_subscription_id").notNull(),
  status: text("status").notNull(), // active, canceled, past_due
  plan: text("plan").notNull(), // pro
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  trialEndDate: timestamp("trial_end_date"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Validation Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  authProvider: true,
  providerId: true,
  displayName: true,
  photoURL: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export const insertToolHistorySchema = createInsertSchema(toolHistory).pick({
  userId: true,
  toolType: true,
  action: true,
  format: true,
  input: true,
  output: true,
  generationTime: true,
  metadata: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  stripeSubscriptionId: true,
  status: true,
  plan: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
  trialEndDate: true,
  cancelAtPeriodEnd: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertToolHistory = z.infer<typeof insertToolHistorySchema>;
export type ToolHistory = typeof toolHistory.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
