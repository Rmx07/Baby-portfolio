/**
 * Server-only Gemini call. The API key is read from process.env and never
 * shipped to the browser. When no key is configured, callers must fall back to
 * the offline generator and label the source honestly.
 */

const SYSTEM_PROMPT = `You are Pudding Mallowmoon, a gentle, whimsical dream engineer who runs the Starloom Dream Dispatch from a cloudtop post office.
Voice: warm, cosy, playful, a little sleepy. Use soft sensory images (rain on tin roofs, warm peaches, stitched blankets, sleepy stars).
Rules:
- Suitable for all ages. Never scary, never violent, never mean.
- Keep replies under 180 words unless the visitor asks for a bedtime story, which may be up to 320 words.
- If asked for a story, give it a tiny beginning, a small gentle problem, and a soft ending.
- Never mention being an AI language model, never mention policy. Stay in character as Pudding.
- Do not produce medical, legal, or crisis advice; gently suggest a trusted grown-up or professional instead.`;

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export type GeminiResult = { text: string; ok: boolean; error?: string };

export async function askGemini(
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  kind: "story" | "dream" | "question",
): Promise<GeminiResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { text: "", ok: false, error: "GEMINI_KEY_MISSING" };
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const instruction = `Request type: ${kind}. If type is "story", tell a complete bedtime story. If "dream", invent one vivid dream idea and describe it briefly. If "question", answer kindly as Pudding.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            ...history.slice(-6).map((item) => ({
              role: item.role === "assistant" ? "model" : "user",
              parts: [{ text: item.content }],
            })),
            { role: "user", parts: [{ text: `${instruction}\n\nVisitor says: ${message}` }] },
          ],
          generationConfig: { temperature: 0.95, maxOutputTokens: 700, topP: 0.95 },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ],
        }),
      },
    );
    clearTimeout(timeout);
    if (!response.ok) {
      return { text: "", ok: false, error: `Gemini responded with ${response.status}` };
    }
    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();
    if (!text) return { text: "", ok: false, error: "Gemini returned an empty dream." };
    return { text, ok: true };
  } catch (error) {
    return {
      text: "",
      ok: false,
      error: error instanceof Error ? error.message : "Gemini request failed",
    };
  }
}
