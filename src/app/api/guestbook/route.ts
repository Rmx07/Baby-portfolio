import { db } from "@/db";
import { guestbookEntries } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { getGuestbook } from "@/lib/data";
import { badRequest, clientIp, rateLimit, serverError, tooMany } from "@/lib/http";
import { firstError, guestbookSchema } from "@/lib/validation";
import { describeDbError } from "@/lib/dbErrors";

export async function GET() {
  try {
    const entries = await getGuestbook(true);
    return Response.json({ ok: true, entries });
  } catch (error) {
    return serverError(describeDbError(error, "guestbook"));
  }
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    if (!rateLimit(`guestbook:${ip}`, 3, 120_000)) return tooMany();
    await ensureSeed();
    const parsed = guestbookSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(firstError(parsed.error));
    const [entry] = await db
      .insert(guestbookEntries)
      .values({ ...parsed.data, status: "approved" })
      .returning();
    return Response.json({ ok: true, entry }, { status: 201 });
  } catch (error) {
    return serverError(describeDbError(error, "guestbook"));
  }
}
