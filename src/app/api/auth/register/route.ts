import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { ensureSeed } from "@/db/seed";
import { badRequest, clientIp, rateLimit, serverError, tooMany } from "@/lib/http";
import { firstError, registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    if (!rateLimit(`register:${clientIp(request)}`, 4, 300_000)) return tooMany();
    await ensureSeed();
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(firstError(parsed.error));
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
    if (existing.length > 0) return badRequest("A keeper with that email already exists. Try signing in.");
    const [created] = await db
      .insert(users)
      .values({
        email: parsed.data.email,
        displayName: parsed.data.displayName,
        passwordHash: hashPassword(parsed.data.password),
        role: "keeper",
      })
      .returning();
    if (!created) return serverError("Could not create that account.");
    await createSession(created.id);
    return Response.json({
      ok: true,
      user: { id: created.id, email: created.email, displayName: created.displayName, role: created.role },
    });
  } catch {
    return serverError();
  }
}
