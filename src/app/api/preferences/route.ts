import { eq } from "drizzle-orm";
import { db } from "@/db";
import { visitorPreferences } from "@/db/schema";
import { getVisitorId, badRequest, serverError } from "@/lib/http";
import { checkToken } from "@/lib/tokens";
import { preferencesSchema } from "@/lib/validation";
import { describeDbError } from "@/lib/dbErrors";

export async function GET() {
  try {
    const { id } = await getVisitorId();
    const rows = await db
      .select()
      .from(visitorPreferences)
      .where(eq(visitorPreferences.visitorId, id))
      .limit(1);
    const saved = rows[0];
    return Response.json({
      ok: true,
      visitorId: id,
      preferences: saved
        ? {
            theme: saved.theme,
            sound: saved.sound,
            sparkles: saved.sparkles,
            chaos: saved.chaos,
            reduceMotion: saved.reduceMotion,
            savedAt: saved.updatedAt,
          }
        : null,
    });
  } catch (error) {
    return serverError(describeDbError(error, "preferences"));
  }
}

export async function PUT(request: Request) {
  try {
    const { id } = await getVisitorId();
    const parsed = preferencesSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest("Those dream settings did not look right.");
    const consents = checkToken(request);
    if (!consents) return Response.json({ ok: false, error: "Confirm the consent box before saving." }, { status: 400 });
    await db
      .insert(visitorPreferences)
      .values({ visitorId: id, ...parsed.data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: visitorPreferences.visitorId,
        set: { ...parsed.data, updatedAt: new Date() },
      });
    return Response.json({ ok: true, saved: true });
  } catch (error) {
    return serverError(describeDbError(error, "preferences"));
  }
}

export async function DELETE() {
  try {
    const { id } = await getVisitorId();
    await db.delete(visitorPreferences).where(eq(visitorPreferences.visitorId, id));
    return Response.json({ ok: true, cleared: true });
  } catch (error) {
    return serverError(describeDbError(error, "preferences"));
  }
}
