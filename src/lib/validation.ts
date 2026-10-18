import { z } from "zod";

export const guestbookSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "A dream name of at least 2 letters, please.")
    .max(40, "Keep your dream name under 40 letters."),
  message: z
    .string()
    .trim()
    .min(4, "Tell us at least a little dream (4+ characters).")
    .max(420, "Keep it under 420 characters — the guestbook paper is small."),
  mood: z.enum(["sleepy", "sparkly", "giddy", "cozy", "dreamy"]).default("sleepy"),
});

export type GuestbookInput = z.infer<typeof guestbookSchema>;

export const scoreSchema = z.object({
  playerName: z.string().trim().min(2, "Name your dream catcher (2+ letters).").max(20),
  score: z.number().int().min(0).max(500),
});

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only."),
  title: z.string().trim().min(2, "Give the dream a title.").max(90),
  tagline: z.string().trim().min(2, "Add a short tagline.").max(140),
  description: z.string().trim().min(10, "Describe the dream project (10+ chars).").max(1800),
  dreamType: z.string().trim().min(2).max(40).default("dream"),
  accent: z.enum(["pink", "cyan", "lavender", "yellow", "peach", "mint"]).default("pink"),
  artKey: z.enum(["dispatch", "bakery", "library", "party", "portrait"]).default("dispatch"),
  year: z.string().trim().min(4).max(9).default("1996"),
  sortOrder: z.number().int().min(0).max(999).default(0),
  published: z.boolean().default(true),
});

export const storySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only."),
  title: z.string().trim().min(2, "Title your bedtime story.").max(90),
  summary: z.string().trim().min(4).max(280),
  accent: z.enum(["pink", "cyan", "lavender", "yellow", "peach", "mint"]).default("lavender"),
  emoji: z.string().trim().min(1).max(8).default("🌙"),
  published: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(999).default(0),
});

export const storyPageSchema = z.object({
  body: z.string().trim().min(4, "Every page needs a little story.").max(700),
  art: z.string().trim().min(1).max(8).default("✨"),
});

export const noteSchema = z.object({
  message: z.string().trim().min(2).max(600),
  kind: z.enum(["story", "dream", "question"]).default("dream"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("That email looks sleepy — try again."),
  password: z.string().min(8, "Passwords are at least 8 characters."),
});

export const registerSchema = loginSchema.extend({
  displayName: z.string().trim().min(2, "Add a keeper name.").max(40),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(40),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

export const preferencesSchema = z.object({
  theme: z.enum(["day", "night"]).default("day"),
  sound: z.boolean().default(false),
  sparkles: z.boolean().default(true),
  chaos: z.boolean().default(false),
  reduceMotion: z.boolean().default(false),
});

export const settingsSchema = z.object({
  siteTitle: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(2).max(160),
  aboutBlurb: z.string().trim().min(2).max(600),
  dispatchNote: z.string().trim().min(2).max(300),
});

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "That looked a little dreamy — please try again.";
}
