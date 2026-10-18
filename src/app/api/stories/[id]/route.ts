import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { badRequest, serverError } from "@/lib/http";
import { firstError, storySchema } from "@/lib/validation";
import { describeDbError } from "@/lib/dbErrors";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return badRequest("Unknown story.");
    const parsed = storySchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(firstError(parsed.error));
    const [story] = await db
      .update(stories)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(stories.id, id))
      .returning();
    if (!story) return badRequest("That story has left the library.");
    return Response.json({ ok: true, story });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "story"));
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return badRequest("Unknown story.");
    await db.delete(stories).where(eq(stories.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "story"));
  }
}
