// Supabase Edge Function: dream-chat
// Deploy with: supabase functions deploy dream-chat
// Set the secret with: supabase secrets set GEMINI_API_KEY=... GEMINI_MODEL=gemini-2.5-flash
//
// The Gemini key lives only in the Edge Function environment. Never put it in the
// browser bundle and never expose SUPABASE_SERVICE_ROLE_KEY client-side.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
};

const SYSTEM_PROMPT = `You are Pudding Mallowmoon, a gentle, whimsical dream engineer who runs the Starloom Dream Dispatch from a cloudtop post office. Warm, cosy, playful, a little sleepy. Suitable for all ages: never scary or mean. Bedtime stories get a tiny beginning, a small gentle problem and a soft ending. Keep replies under 200 words (320 for stories). Never mention being an AI model. No medical, legal or crisis advice.`;

const buckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const visitorId = request.headers.get("x-visitor-id") ?? "anonymous";

  if (request.method === "GET") {
    const { data, error } = await admin
      .from("chat_messages")
      .select("id, role, content, source, created_at")
      .eq("visitor_id", visitorId)
      .order("created_at", { ascending: true })
      .limit(40);
    if (error) return json({ ok: false, error: "Could not read that chat." }, 500);
    return json({ ok: true, messages: data, aiConfigured: Boolean(geminiKey) });
  }

  if (request.method === "DELETE") {
    const { error } = await admin.from("chat_messages").delete().eq("visitor_id", visitorId);
    if (error) return json({ ok: false, error: "Could not clear that chat." }, 500);
    return json({ ok: true, cleared: true });
  }

  if (!rateLimit(ip)) return json({ ok: false, error: "Too many dream requests. Try again in a minute." }, 429);

  let payload: { message?: string; kind?: "story" | "dream" | "question" } = {};
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }
  const message = (payload.message ?? "").trim().slice(0, 600);
  const kind = payload.kind ?? "dream";
  if (message.length < 2) return json({ ok: false, error: "Write a few words first." }, 400);

  await admin.from("chat_messages").insert({
    visitor_id: visitorId,
    role: "user",
    content: message,
    source: "visitor",
  });

  let reply = "";
  let source = "local";

  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: `Request type: ${kind}. Visitor says: ${message}` }] }],
            generationConfig: { temperature: 0.95, maxOutputTokens: 700 },
          }),
        },
      );
      if (response.ok) {
        const data = await response.json();
        reply = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("").trim() ?? "";
        if (reply) source = "gemini";
      }
    } catch {
      reply = "";
    }
  }

  if (!reply) {
    reply = `Tonight's dream: a bakery that only opens when it rains, where a retired comet learns to water succulents and everyone gets a blanket. Nothing is urgent. The porch light stays on.\n\n(Pudding's offline generator answered this one — add a Gemini key to the Edge Function for live AI replies.)`;
  }

  const { data: saved, error } = await admin
    .from("chat_messages")
    .insert({ visitor_id: visitorId, role: "assistant", content: reply, source })
    .select("id, role, content, source, created_at")
    .single();

  if (error) return json({ ok: false, error: "Could not save that reply." }, 500);
  return json({ ok: true, reply: saved, source, aiConfigured: Boolean(geminiKey) });
});
