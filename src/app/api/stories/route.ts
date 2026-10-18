import { db } from "@/db";
import { stories } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { badRequest, serverError } from "@/lib/http";
import { firstError, storySchema } from "@/lib/validation";
import { describeDbError } from "@/lib/dbErrors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await ensureSeed();
    const parsed = storySchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(firstError(parsed.error));
    const [story] = await db.insert(stories).values(parsed.data).returning();
    return Response.json({ ok: true, story }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "story"));
  }
}
