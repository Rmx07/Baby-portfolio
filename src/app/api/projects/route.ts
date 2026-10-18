import { db } from "@/db";
import { projects } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { badRequest, serverError } from "@/lib/http";
import { firstError, projectSchema } from "@/lib/validation";
import { getProjects } from "@/lib/data";
import { describeDbError } from "@/lib/dbErrors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ ok: true, projects: await getProjects(false) });
  } catch (error) {
    return serverError(describeDbError(error, "project"));
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await ensureSeed();
    const parsed = projectSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(firstError(parsed.error));
    const [project] = await db.insert(projects).values(parsed.data).returning();
    return Response.json({ ok: true, project }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "project"));
  }
}
