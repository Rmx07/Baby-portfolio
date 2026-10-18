import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** Admin / site-owner accounts (the dashboard is protected by a DB-backed session). */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("keeper"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Dream projects = the portfolio's core resource. */
export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    dreamType: text("dream_type").notNull().default("dream"),
    accent: text("accent").notNull().default("pink"),
    artKey: text("art_key").notNull().default("dispatch"),
    year: text("year").notNull().default("1996"),
    sortOrder: integer("sort_order").notNull().default(0),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("projects_slug_unique").on(table.slug)],
);

/** Bedtime-story flipbooks. */
export const stories = pgTable(
  "stories",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    accent: text("accent").notNull().default("lavender"),
    emoji: text("emoji").notNull().default("🌙"),
    published: boolean("published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("stories_slug_unique").on(table.slug)],
);

export const storyPages = pgTable("story_pages", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id")
    .notNull()
    .references(() => stories.id, { onDelete: "cascade" }),
  pageNumber: integer("page_number").notNull(),
  body: text("body").notNull(),
  art: text("art").notNull().default("✨"),
});

export const guestbookEntries = pgTable("guestbook_entries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  message: text("message").notNull(),
  mood: text("mood").notNull().default("sleepy"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** AI bedtime chat transcript (per anonymous visitor cookie). */
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  visitorId: text("visitor_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  source: text("source").notNull().default("local"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Consent-based visitor preferences (theme, sound, sparkles, chaos, motion). */
export const visitorPreferences = pgTable(
  "visitor_preferences",
  {
    id: serial("id").primaryKey(),
    visitorId: text("visitor_id").notNull(),
    theme: text("theme").notNull().default("day"),
    sound: boolean("sound").notNull().default(false),
    sparkles: boolean("sparkles").notNull().default(true),
    chaos: boolean("chaos").notNull().default(false),
    reduceMotion: boolean("reduce_motion").notNull().default(false),
    consentedAt: timestamp("consented_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("visitor_preferences_visitor_unique").on(table.visitorId)],
);

/** Simple counters for the nostalgic visitor / click counters. */
export const siteStats = pgTable("site_stats", {
  key: text("key").primaryKey(),
  value: integer("value").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Editable site copy shown on the public homepage. */
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type StoryPage = typeof storyPages.$inferSelect;
export type GuestbookEntry = typeof guestbookEntries.$inferSelect;
export type Score = typeof scores.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type VisitorPreference = typeof visitorPreferences.$inferSelect;
