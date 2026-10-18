import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { ensureSeed } from "@/db/seed";
import { badRequest, clientIp, rateLimit, serverError, tooMany } from "@/lib/http";
import { firstError, loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    if (!rateLimit(`login:${clientIp(request)}`, 8, 60_000)) return tooMany();
    await ensureSeed();
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(firstError(parsed.error));
    const rows = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
    const user = rows[0];
    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return badRequest("That email and password do not match a keeper account.");
    }
    await createSession(user.id);
    return Response.json({
      ok: true,
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    });
  } catch {
    return serverError();
  }
}
