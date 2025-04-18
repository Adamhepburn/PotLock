import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Game schema
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  buyInAmount: numeric("buy_in_amount").notNull(),
  status: text("status").notNull().default("active"),
  bankerAddress: text("banker_address"),
  contractAddress: text("contract_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdById: integer("created_by_id").notNull().references(() => users.id),
});

// Player schema (users in games)
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  userId: integer("user_id").notNull().references(() => users.id),
  walletAddress: text("wallet_address").notNull(),
  buyIn: numeric("buy_in").notNull(),
  status: text("status").notNull().default("active"),
  chipCount: numeric("chip_count"),
  paidOut: boolean("paid_out").default(false),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (t) => ({
  gameUserIdx: uniqueIndex("game_user_idx").on(t.gameId, t.userId),
}));

// Cash out requests
export const cashOutRequests = pgTable("cash_out_requests", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  playerId: integer("player_id").notNull().references(() => players.id),
  chipCount: numeric("chip_count").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Approvals for cash out requests
export const approvals = pgTable("approvals", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().references(() => cashOutRequests.id),
  approverId: integer("approver_id").notNull().references(() => users.id),
  approved: boolean("approved").notNull(),
  counterValue: numeric("counter_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  requestApproverIdx: uniqueIndex("request_approver_idx").on(t.requestId, t.approverId),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  walletAddress: z.string().optional(),
});

export const insertGameSchema = createInsertSchema(games).omit({ id: true, createdAt: true });
export const insertPlayerSchema = createInsertSchema(players).omit({ id: true, joinedAt: true });
export const insertCashOutRequestSchema = createInsertSchema(cashOutRequests).omit({ id: true, createdAt: true });
export const insertApprovalSchema = createInsertSchema(approvals).omit({ id: true, createdAt: true });

// Auth Schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Export Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertCashOutRequest = z.infer<typeof insertCashOutRequestSchema>;
export type CashOutRequest = typeof cashOutRequests.$inferSelect;

export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type Approval = typeof approvals.$inferSelect;

export type LoginData = z.infer<typeof loginSchema>;
