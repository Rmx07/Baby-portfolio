import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { badRequest, serverError } from "@/lib/http";
import { firstError, projectSchema } from "@/lib/validation";
import { describeDbError } from "@/lib/dbErrors";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return badRequest("Unknown dream project.");
    const parsed = projectSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(firstError(parsed.error));
    const [project] = await db
      .update(projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    if (!project) return badRequest("That project has drifted away.");
    return Response.json({ ok: true, project });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "project"));
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return badRequest("Unknown dream project.");
    await db.delete(projects).where(eq(projects.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "project"));
  }
}
