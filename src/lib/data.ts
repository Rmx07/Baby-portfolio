import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  chatMessages,
  guestbookEntries,
  projects,
  scores,
  siteSettings,
  siteStats,
  stories,
  storyPages,
} from "@/db/schema";
import { ensureSeed } from "@/db/seed";

export type SiteSettingsMap = {
  siteTitle: string;
  tagline: string;
  aboutBlurb: string;
  dispatchNote: string;
};

const DEFAULT_SETTINGS: SiteSettingsMap = {
  siteTitle: "Pudding's Starloom Dream Dispatch",
  tagline: "Hand-built dreams, delivered nightly from a cloudtop post office since 1996.",
  aboutBlurb:
    "Hi! I'm Pudding Mallowmoon — dream engineer, night librarian, and professional yawner.",
  dispatchNote: "The postbox is open. Tonight's route is being stitched together.",
};

export async function getSiteSettings(): Promise<SiteSettingsMap> {
  await ensureSeed();
  const rows = await db.select().from(siteSettings);
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return {
    siteTitle: map.siteTitle ?? DEFAULT_SETTINGS.siteTitle,
    tagline: map.tagline ?? DEFAULT_SETTINGS.tagline,
    aboutBlurb: map.aboutBlurb ?? DEFAULT_SETTINGS.aboutBlurb,
    dispatchNote: map.dispatchNote ?? DEFAULT_SETTINGS.dispatchNote,
  };
}

export async function getSiteStats(): Promise<Record<string, number>> {
  await ensureSeed();
  const rows = await db.select().from(siteStats);
  const map: Record<string, number> = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export async function getProjects(includeDrafts = false) {
  await ensureSeed();
  const query = db
    .select()
    .from(projects)
    .orderBy(asc(projects.sortOrder), asc(projects.id));
  if (!includeDrafts) return query.where(eq(projects.published, true));
  return query;
}

export async function getProjectBySlug(slug: string) {
  await ensureSeed();
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.published, true)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getStories(includeDrafts = false) {
  await ensureSeed();
  const rows = await db
    .select({
      id: stories.id,
      slug: stories.slug,
      title: stories.title,
      summary: stories.summary,
      accent: stories.accent,
      emoji: stories.emoji,
      published: stories.published,
      sortOrder: stories.sortOrder,
      updatedAt: stories.updatedAt,
      pageCount: sql<number>`count(${storyPages.id})::int`,
    })
    .from(stories)
    .leftJoin(storyPages, eq(storyPages.storyId, stories.id))
    .groupBy(stories.id)
    .orderBy(asc(stories.sortOrder), asc(stories.id));
  return includeDrafts ? rows : rows.filter((story) => story.published);
}

export async function getStoryBySlug(slug: string) {
  await ensureSeed();
  const rows = await db.select().from(stories).where(eq(stories.slug, slug)).limit(1);
  const story = rows[0];
  if (!story) return null;
  const pages = await db
    .select()
    .from(storyPages)
    .where(eq(storyPages.storyId, story.id))
    .orderBy(asc(storyPages.pageNumber));
  return { ...story, pages };
}


export async function getStoriesWithPages() {
  const rows = await getStories(false);
  const allPages = await db.select().from(storyPages).orderBy(asc(storyPages.pageNumber));
  return rows.map((story) => ({
    id: story.id,
    slug: story.slug,
    title: story.title,
    summary: story.summary,
    emoji: story.emoji,
    accent: story.accent,
    pages: allPages
      .filter((page) => page.storyId === story.id)
      .map((page) => ({ id: page.id, pageNumber: page.pageNumber, body: page.body, art: page.art })),
  }));
}

export async function getStoryById(id: number) {
  await ensureSeed();
  const rows = await db.select().from(stories).where(eq(stories.id, id)).limit(1);
  const story = rows[0];
  if (!story) return null;
  const pages = await db
    .select()
    .from(storyPages)
    .where(eq(storyPages.storyId, story.id))
    .orderBy(asc(storyPages.pageNumber));
  return { ...story, pages };
}

export async function getGuestbook(onlyApproved = true) {
  await ensureSeed();
  const query = db
    .select()
    .from(guestbookEntries)
    .orderBy(desc(guestbookEntries.createdAt), desc(guestbookEntries.id));
  if (!onlyApproved) return query;
  return query.where(eq(guestbookEntries.status, "approved"));
}

export async function getScores(limit = 10) {
  await ensureSeed();
  return db.select().from(scores).orderBy(desc(scores.score), asc(scores.id)).limit(limit);
}

export async function getChatMessages(limit = 40) {
  await ensureSeed();
  return db
    .select()
    .from(chatMessages)
    .orderBy(desc(chatMessages.createdAt), desc(chatMessages.id))
    .limit(limit);
}

export async function getDashboardCounts() {
  await ensureSeed();
  const [projectRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects);
  const [storyRow] = await db.select({ count: sql<number>`count(*)::int` }).from(stories);
  const [pageRow] = await db.select({ count: sql<number>`count(*)::int` }).from(storyPages);
  const [guestRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(guestbookEntries);
  const [pendingRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(guestbookEntries)
    .where(eq(guestbookEntries.status, "pending"));
  const [scoreRow] = await db.select({ count: sql<number>`count(*)::int` }).from(scores);
  const [chatRow] = await db.select({ count: sql<number>`count(*)::int` }).from(chatMessages);
  return {
    projects: projectRow?.count ?? 0,
    stories: storyRow?.count ?? 0,
    pages: pageRow?.count ?? 0,
    guestbook: guestRow?.count ?? 0,
    pending: pendingRow?.count ?? 0,
    scores: scoreRow?.count ?? 0,
    chats: chatRow?.count ?? 0,
  };
}
