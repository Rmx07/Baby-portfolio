import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { VISITOR_COOKIE } from "@/lib/auth";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Small in-memory sliding window limiter for public write endpoints. */
export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clientIp(request: Request): string {
  const header =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "local";
  return header.split(",")[0]!.trim();
}

/** Reads (or mints) the anonymous visitor id cookie used for prefs + chat. */
export async function getVisitorId(): Promise<{ id: string; isNew: boolean }> {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE)?.value;
  if (existing) return { id: existing, isNew: false };
  const id = randomUUID();
  jar.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return { id, isNew: true };
}

export function badRequest(message: string) {
  return Response.json({ ok: false, error: message }, { status: 400 });
}

export function tooMany() {
  return Response.json(
    { ok: false, error: "Whoa there, dreamer — too many requests. Try again in a minute." },
    { status: 429 },
  );
}

export function serverError(message = "Something drifted off to sleep. Please try again.") {
  return Response.json({ ok: false, error: message }, { status: 500 });
}
