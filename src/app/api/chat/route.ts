import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { badRequest, clientIp, getVisitorId, rateLimit, serverError, tooMany } from "@/lib/http";
import { firstError, noteSchema } from "@/lib/validation";
import { askGemini, geminiConfigured } from "@/lib/gemini";
import { offlineDream } from "@/lib/dreamEngine";
import { describeDbError } from "@/lib/dbErrors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSeed();
    const { id } = await getVisitorId();
    const rows = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.visitorId, id))
      .orderBy(asc(chatMessages.createdAt), asc(chatMessages.id))
      .limit(40);
    return Response.json({ ok: true, messages: rows, aiConfigured: geminiConfigured() });
  } catch (error) {
    return serverError(describeDbError(error, "chat"));
  }
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    if (!rateLimit(`chat:${ip}`, 8, 60_000)) return tooMany();
    await ensureSeed();
    const parsed = noteSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(firstError(parsed.error));
    const { id: visitorId } = await getVisitorId();

    const history = await db
      .select({ role: chatMessages.role, content: chatMessages.content })
      .from(chatMessages)
      .where(eq(chatMessages.visitorId, visitorId))
      .orderBy(asc(chatMessages.createdAt), asc(chatMessages.id))
      .limit(12);

    await db.insert(chatMessages).values({
      visitorId,
      role: "user",
      content: parsed.data.message,
      source: "visitor",
    });

    const normalized = history
      .filter((item) => item.role === "user" || item.role === "assistant")
      .map((item) => ({ role: item.role as "user" | "assistant", content: item.content }));

    let reply = "";
    let source: "gemini" | "local" = "local";
    let notice: string | undefined;

    if (geminiConfigured()) {
      const result = await askGemini(parsed.data.message, normalized, parsed.data.kind);
      if (result.ok) {
        reply = result.text;
        source = "gemini";
      } else {
        reply = offlineDream(parsed.data.message, parsed.data.kind);
        notice = `Pudding's offline generator answered because the Gemini call failed (${result.error}).`;
      }
    } else {
      reply = offlineDream(parsed.data.message, parsed.data.kind);
      notice = "This deployment has no Gemini API key, so Pudding's offline generator answered. Add GEMINI_API_KEY to enable live AI replies.";
    }

    const [assistant] = await db
      .insert(chatMessages)
      .values({ visitorId, role: "assistant", content: reply, source })
      .returning();

    return Response.json({
      ok: true,
      source,
      notice,
      aiConfigured: geminiConfigured(),
      reply: assistant,
    });
  } catch (error) {
    return serverError(describeDbError(error, "chat"));
  }
}

export async function DELETE(request: Request) {
  try {
    if (!rateLimit(`chat-clear:${clientIp(request)}`, 6, 60_000)) return tooMany();
    const { id } = await getVisitorId();
    await db.delete(chatMessages).where(and(eq(chatMessages.visitorId, id)));
    return Response.json({ ok: true, cleared: true });
  } catch (error) {
    return serverError(describeDbError(error, "chat"));
  }
}
