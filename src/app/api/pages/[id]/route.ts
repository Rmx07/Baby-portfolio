import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storyPages } from "@/db/schema";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { badRequest, serverError } from "@/lib/http";
import { describeDbError } from "@/lib/dbErrors";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return badRequest("Unknown story page.");
    const body = (await request.json()) as { body?: string; art?: string; pageNumber?: number };
    const updates: { body?: string; art?: string; pageNumber?: number } = {};
    if (typeof body.body === "string") {
      if (body.body.trim().length < 4 || body.body.length > 700) return badRequest("Pages need 4–700 characters.");
      updates.body = body.body.trim();
    }
    if (typeof body.art === "string" && body.art.length > 0 && body.art.length <= 8) updates.art = body.art.trim();
    if (typeof body.pageNumber === "number" && Number.isInteger(body.pageNumber)) updates.pageNumber = body.pageNumber;
    if (Object.keys(updates).length === 0) return badRequest("Nothing to change on that page.");
    const [page] = await db.update(storyPages).set(updates).where(eq(storyPages.id, id)).returning();
    if (!page) return badRequest("That page has fluttered away.");
    return Response.json({ ok: true, page });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "page"));
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return badRequest("Unknown story page.");
    await db.delete(storyPages).where(eq(storyPages.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "page"));
  }
}
