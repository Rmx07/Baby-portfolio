import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { badRequest, serverError } from "@/lib/http";
import { getSiteSettings } from "@/lib/data";
import { firstError, settingsSchema } from "@/lib/validation";
import { describeDbError } from "@/lib/dbErrors";

export async function GET() {
  try {
    return Response.json({ ok: true, settings: await getSiteSettings() });
  } catch (error) {
    return serverError(describeDbError(error, "settings"));
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const parsed = settingsSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(firstError(parsed.error));
    for (const [key, value] of Object.entries(parsed.data)) {
      await db
        .insert(siteSettings)
        .values({ key, value })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
    }
    return Response.json({ ok: true, settings: await getSiteSettings() });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "settings"));
  }
}
