"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/components/experience/ExperienceProvider";

type ChatEntry = { id: number; role: string; content: string; source?: string };
type Kind = "dream" | "story" | "question";

const EXAMPLES: { label: string; text: string; kind: Kind }[] = [
  { label: "A cozy dream idea", text: "Invent a dream about a bakery that only opens when it rains.", kind: "dream" },
  { label: "A 1-minute story", text: "Tell me a very short bedtime story about a shy comet.", kind: "story" },
  { label: "Something brave", text: "I have a big day tomorrow. Can you make me a brave little dream?", kind: "question" },
];

export function BedtimeChat() {
  const { playSfx, reduceMotion } = useExperience();
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [text, setText] = useState("");
  const [kind, setKind] = useState<Kind>("dream");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/chat", { cache: "no-store" });
        const payload = (await response.json()) as {
          ok?: boolean;
          messages?: ChatEntry[];
          aiConfigured?: boolean;
          error?: string;
        };
        if (cancelled) return;
        if (payload.ok) {
          setMessages(payload.messages ?? []);
          setAiConfigured(Boolean(payload.aiConfigured));
        } else {
          setError(payload.error ?? "The chat mailbag is stuck.");
        }
      } catch {
        if (!cancelled) setError("Could not reach the chat mailbag. Check your connection.");
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (liveRef.current) liveRef.current.scrollTop = liveRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const clean = text.trim();
    if (clean.length < 2) {
      setError("Write a few words first (2+ characters).");
      return;
    }
    setError(null);
    setNotice(null);
    setSending(true);
    const tempId = -Date.now();
    setMessages((current) => [...current, { id: tempId, role: "user", content: clean, source: "visitor" }]);
    setText("");
    playSfx("pop");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, kind }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        reply?: ChatEntry;
        source?: string;
        notice?: string;
        aiConfigured?: boolean;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.reply) {
        throw new Error(payload.error ?? "Pudding dropped the envelope.");
      }
      setMessages((current) => [...current, payload.reply as ChatEntry]);
      setAiConfigured(Boolean(payload.aiConfigured));
      setNotice(payload.notice ?? null);
      playSfx("ok");
    } catch (caught) {
      setMessages((current) => current.filter((item) => item.id !== tempId));
      setError(caught instanceof Error ? caught.message : "Pudding dropped the envelope.");
      playSfx("err");
    } finally {
      setSending(false);
    }
  };

  const clear = async () => {
    setError(null);
    try {
      const response = await fetch("/api/chat", { method: "DELETE" });
      if (!response.ok) throw new Error("Could not clear the chat history.");
      setMessages([]);
      setNotice("Chat history cleared from the database.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not clear the chat history.");
    }
  };

  return (
    <div className="panel overflow-hidden">
      <div className="window-bar">
        <span>PUDDING_CHAT.EXE — dream ideas &amp; bedtime stories</span>
        <span aria-hidden>💤 ✦</span>
      </div>
      <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
        <div className="flex min-h-[360px] flex-col border-b-[3px] border-[#3d1c4e] md:border-b-0 md:border-r-[3px]">
          <div ref={liveRef} className="max-h-[380px] min-h-[260px] flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {loadingHistory ? (
              <p className="mono-retro text-base opacity-80">Opening the mailbag…</p>
            ) : messages.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-[#6b3fa0] p-4 text-center">
                <p className="text-3xl" aria-hidden>
                  💤
                </p>
                <p className="mt-1 font-[family-name:var(--font-pixel)] text-[0.55rem]">The chat is sleepy-quiet</p>
                <p className="mono-retro mt-1 text-base">
                  Ask for a dream idea, a story, or a tiny bit of courage. Pick an example on the right if you like.
                </p>
              </div>
            ) : (
              messages.map((entry) => (
                <div
                  key={entry.id}
                  className={`max-w-[92%] rounded-lg border-[3px] border-[#3d1c4e] p-3 ${
                    entry.role === "user"
                      ? "ml-auto bg-[#e2fbf8] shadow-[3px_3px_0_#7a3f8f]"
                      : "bg-[#fff0b8] shadow-[3px_3px_0_#7a3f8f]"
                  }`}
                >
                  <p className="font-[family-name:var(--font-pixel)] text-[0.45rem] text-[#3d1c4e]">
                    {entry.role === "user" ? "🧑 YOU" : "🌙 PUDDING"}
                    {entry.role !== "user" ? (
                      <span className="ml-2 rounded bg-[#3d1c4e] px-1 py-0.5 text-[0.4rem] text-[#ffd84d]">
                        {entry.source === "gemini" ? "GEMINI LIVE" : "OFFLINE GENERATOR"}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap font-[family-name:var(--font-mono-retro)] text-lg leading-snug text-[#3d1c4e]">
                    {entry.content}
                  </p>
                </div>
              ))
            )}
            {sending ? (
              <div className="flex items-center gap-2 rounded-lg border-[3px] border-[#3d1c4e] bg-[#ffe3f1] p-3">
                <span className={reduceMotion ? "" : "animate-bob"}>✉️</span>
                <span className="mono-retro text-base">Pudding is folding your reply into an envelope…</span>
              </div>
            ) : null}
          </div>

          <form onSubmit={send} className="space-y-2 border-t-[3px] border-dashed border-[#c9a7ff] p-3">
            <label htmlFor="chat-text" className="block font-[family-name:var(--font-pixel)] text-[0.5rem]">
              Ask Pudding for a dream
            </label>
            <textarea
              id="chat-text"
              className="retro-textarea min-h-[80px]"
              maxLength={600}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="e.g. a dream for someone who is nervous about tomorrow"
            />
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="chat-kind" className="font-[family-name:var(--font-mono-retro)] text-base">
                Type:
              </label>
              <select
                id="chat-kind"
                className="retro-select max-w-[10rem]"
                value={kind}
                onChange={(event) => setKind(event.target.value as Kind)}
              >
                <option value="dream">Dream idea</option>
                <option value="story">Bedtime story</option>
                <option value="question">Little question</option>
              </select>
              <button type="submit" className="btn btn-sm btn-pink" disabled={sending}>
                {sending ? "Sending…" : "💌 Send"}
              </button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={clear} disabled={sending || messages.length === 0}>
                🧹 Clear my chat
              </button>
            </div>
            {error ? (
              <p role="alert" className="rounded border-2 border-[#a3143c] bg-[#ffe0e6] p-2 text-sm font-bold text-[#7b0f2c]">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p role="status" className="rounded border-2 border-dashed border-[#6b3fa0] bg-[#f1e8ff] p-2 text-sm font-semibold text-[#3d1c4e]">
                {notice}
              </p>
            ) : null}
          </form>
        </div>

        <div className="space-y-3 bg-[#fffaf0] p-4 text-[#3d1c4e]">
          <p className="pixel-label">How this works</p>
          <p className="mono-retro text-base leading-snug">
            Replies are generated by Google Gemini through a server-side route; the key never reaches your browser. If
            no key is configured, Pudding&apos;s offline generator answers instead and every reply is labelled with its
            real source.
          </p>
          <p
            className={`rounded-md border-2 p-2 font-[family-name:var(--font-mono-retro)] text-base ${
              aiConfigured ? "border-[#12855f] bg-[#dcffe9]" : "border-[#b26a00] bg-[#fff0c8]"
            }`}
          >
            {aiConfigured === null
              ? "Checking the Gemini connection…"
              : aiConfigured
                ? "✅ Gemini API key detected on the server. Replies may be live AI."
                : "⚠️ No Gemini API key on this deployment. Replies come from the offline generator."}
          </p>
          <div className="space-y-2">
            {EXAMPLES.map((example) => (
              <button
                key={example.label}
                type="button"
                className="btn btn-sm w-full justify-start btn-ghost"
                onClick={() => {
                  setText(example.text);
                  setKind(example.kind);
                  playSfx("click");
                }}
              >
                ✨ {example.label}
              </button>
            ))}
          </div>
          <p className="font-[family-name:var(--font-mono-retro)] text-sm opacity-75">
            Messages are stored per anonymous visitor cookie so you can come back to them. Kid-safe prompting, 8
            requests per minute, and a clear-history button are built in.
          </p>
        </div>
      </div>
    </div>
  );
}
