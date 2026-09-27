import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const aiVisitorSessions = pgTable("ai_visitor_sessions", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const aiUsageBuckets = pgTable("ai_usage_buckets", {
  bucketKey: text("bucket_key").primaryKey(),
  messageCount: integer("message_count").notNull(),
  bucketStart: timestamp("bucket_start", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const aiActiveTurns = pgTable("ai_active_turns", {
  sessionId: text("session_id").primaryKey(),
  ipHash: text("ip_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const aiThreadOwners = pgTable("ai_thread_owners", {
  threadId: text("thread_id").primaryKey(),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
