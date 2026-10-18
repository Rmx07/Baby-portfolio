import { eq } from "drizzle-orm";
import { db } from "@/db";
import { scores } from "@/db/schema";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { serverError } from "@/lib/http";
import { describeDbError } from "@/lib/dbErrors";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const id = Number((await params).id);
    await db.delete(scores).where(eq(scores.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "score"));
  }
}
