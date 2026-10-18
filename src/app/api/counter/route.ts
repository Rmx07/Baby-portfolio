import { sql } from "drizzle-orm";
import { db } from "@/db";
import { siteStats } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { getSiteStats } from "@/lib/data";
import { clientIp, rateLimit, serverError, tooMany } from "@/lib/http";

const allowed = new Set(["visit_count", "click_count", "dreams_delivered", "yawns_shared", "easter_eggs"]);

export async function GET() {
  try {
    return Response.json({ ok: true, stats: await getSiteStats() });
  } catch {
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    if (!rateLimit(`counter:${clientIp(request)}`, 90, 60_000)) return tooMany();
    const body = (await request.json().catch(() => ({}))) as { key?: string };
    const key = body.key && allowed.has(body.key) ? body.key : "click_count";
    await ensureSeed();
    const rows = await db
      .insert(siteStats)
      .values({ key, value: 1 })
      .onConflictDoUpdate({
        target: siteStats.key,
        set: { value: sql`${siteStats.value} + 1`, updatedAt: new Date() },
      })
      .returning({ value: siteStats.value });
    return Response.json({ ok: true, key, value: rows[0]?.value ?? 1 });
  } catch {
    return serverError();
  }
}
