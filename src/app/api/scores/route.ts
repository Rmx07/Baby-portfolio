import { db } from "@/db";
import { scores } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { getScores } from "@/lib/data";
import { badRequest, clientIp, rateLimit, serverError, tooMany } from "@/lib/http";
import { firstError, scoreSchema } from "@/lib/validation";
import { describeDbError } from "@/lib/dbErrors";

export async function GET() {
  try {
    return Response.json({ ok: true, scores: await getScores(10) });
  } catch (error) {
    return serverError(describeDbError(error, "score"));
  }
}

export async function POST(request: Request) {
  try {
    if (!rateLimit(`scores:${clientIp(request)}`, 10, 60_000)) return tooMany();
    await ensureSeed();
    const parsed = scoreSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(firstError(parsed.error));
    const [score] = await db.insert(scores).values(parsed.data).returning();
    return Response.json({ ok: true, score, scores: await getScores(10) }, { status: 201 });
  } catch (error) {
    return serverError(describeDbError(error, "score"));
  }
}
