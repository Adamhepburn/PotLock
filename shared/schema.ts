import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  walletAddress: text("wallet_address").default(null),
  displayName: text("display_name").default(null),
  profileImage: text("profile_image").default(null),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Game schema
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  buyInAmount: numeric("buy_in_amount").notNull(),
  status: text("status").notNull().default("active"),
  bankerAddress: text("banker_address").default(null),
  contractAddress: text("contract_address").default(null),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  location: text("location").default(""),
  gameDate: timestamp("game_date"),
  description: text("description").default(""),
  isPrivate: boolean("is_private").default(false),
  maxPlayers: integer("max_players").default(10),
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

// Friend relationships
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  friendId: integer("friend_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userFriendIdx: uniqueIndex("user_friend_idx").on(t.userId, t.friendId),
}));

// Game invitations
export const gameInvitations = pgTable("game_invitations", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  inviterId: integer("inviter_id").notNull().references(() => users.id),
  inviteeId: integer("invitee_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  gameInviteeIdx: uniqueIndex("game_invitee_idx").on(t.gameId, t.inviteeId),
}));

// Game reservations
export const gameReservations = pgTable("game_reservations", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  userId: integer("user_id").notNull().references(() => users.id),
  depositAmount: numeric("deposit_amount").notNull(),
  transactionHash: text("transaction_hash"),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  gameUserReservationIdx: uniqueIndex("game_user_reservation_idx").on(t.gameId, t.userId),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  walletAddress: z.string().nullable().optional(),
  displayName: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
});

export const insertGameSchema = createInsertSchema(games).omit({ id: true, createdAt: true });
export const insertPlayerSchema = createInsertSchema(players).omit({ id: true, joinedAt: true });
export const insertCashOutRequestSchema = createInsertSchema(cashOutRequests).omit({ id: true, createdAt: true });
export const insertApprovalSchema = createInsertSchema(approvals).omit({ id: true, createdAt: true });
export const insertFriendshipSchema = createInsertSchema(friendships).omit({ id: true, createdAt: true });
export const insertGameInvitationSchema = createInsertSchema(gameInvitations).omit({ id: true, createdAt: true });
export const insertGameReservationSchema = createInsertSchema(gameReservations).omit({ id: true, createdAt: true });

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

export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type Friendship = typeof friendships.$inferSelect;

export type InsertGameInvitation = z.infer<typeof insertGameInvitationSchema>;
export type GameInvitation = typeof gameInvitations.$inferSelect;

export type InsertGameReservation = z.infer<typeof insertGameReservationSchema>;
export type GameReservation = typeof gameReservations.$inferSelect;
