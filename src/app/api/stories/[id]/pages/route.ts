import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { storyPages, stories } from "@/db/schema";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { badRequest, serverError } from "@/lib/http";
import { firstError, storyPageSchema } from "@/lib/validation";
import { describeDbError } from "@/lib/dbErrors";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const storyId = Number((await params).id);
    if (!Number.isInteger(storyId)) return badRequest("Unknown story.");
    const storyRows = await db.select({ id: stories.id }).from(stories).where(eq(stories.id, storyId)).limit(1);
    if (!storyRows[0]) return badRequest("That story has left the library.");
    const parsed = storyPageSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(firstError(parsed.error));
    const [last] = await db
      .select({ pageNumber: storyPages.pageNumber })
      .from(storyPages)
      .where(eq(storyPages.storyId, storyId))
      .orderBy(desc(storyPages.pageNumber))
      .limit(1);
    const [page] = await db
      .insert(storyPages)
      .values({
        storyId,
        pageNumber: (last?.pageNumber ?? 0) + 1,
        body: parsed.data.body,
        art: parsed.data.art,
      })
      .returning();
    return Response.json({ ok: true, page }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "page"));
  }
}
