import { eq } from "drizzle-orm";
import { db } from "@/db";
import { guestbookEntries } from "@/db/schema";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { badRequest, serverError } from "@/lib/http";
import { describeDbError } from "@/lib/dbErrors";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return badRequest("Unknown guestbook note.");
    const body = (await request.json()) as { status?: string };
    const status = body.status === "approved" ? "approved" : body.status === "pending" ? "pending" : null;
    if (!status) return badRequest("Status must be approved or pending.");
    const [updated] = await db
      .update(guestbookEntries)
      .set({ status })
      .where(eq(guestbookEntries.id, id))
      .returning();
    if (!updated) return badRequest("That note has already fluttered away.");
    return Response.json({ ok: true, entry: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "guestbook"));
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return badRequest("Unknown guestbook note.");
    await db.delete(guestbookEntries).where(eq(guestbookEntries.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "guestbook"));
  }
}
