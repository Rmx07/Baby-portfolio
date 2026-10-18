import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, requireAdmin, unauthorized, verifyPassword } from "@/lib/auth";
import { badRequest, serverError } from "@/lib/http";
import { firstError, profileSchema } from "@/lib/validation";
import { describeDbError } from "@/lib/dbErrors";

export async function PATCH(request: Request) {
  try {
    const current = await requireAdmin();
    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(firstError(parsed.error));
    const updates: { displayName: string; passwordHash?: string } = {
      displayName: parsed.data.displayName,
    };
    if (parsed.data.newPassword && parsed.data.newPassword.length > 0) {
      if (parsed.data.newPassword.length < 8) return badRequest("New passwords need 8+ characters.");
      const rows = await db.select().from(users).where(eq(users.id, current.id)).limit(1);
      const user = rows[0];
      if (!user || !parsed.data.currentPassword || !verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
        return badRequest("Your current password did not match.");
      }
      updates.passwordHash = hashPassword(parsed.data.newPassword);
    }
    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, current.id))
      .returning({ id: users.id, displayName: users.displayName, email: users.email });
    return Response.json({ ok: true, user: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return serverError(describeDbError(error, "profile"));
  }
}
