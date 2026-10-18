"use client";

import { useState } from "react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { MOODS } from "@/lib/content";

export type GuestEntry = {
  id: number;
  name: string;
  message: string;
  mood: string;
  status: string;
  createdAt: string | Date;
  pending?: boolean;
};

const MOOD_EMOJI: Record<string, string> = {
  sleepy: "😴",
  sparkly: "✨",
  giddy: "🤸",
  cozy: "🧸",
  dreamy: "☁️",
};

function formatDate(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function GuestbookBoard({ initialEntries }: { initialEntries: GuestEntry[] }) {
  const { playSfx, pushToast } = useExperience();
  const [entries, setEntries] = useState<GuestEntry[]>(initialEntries);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [mood, setMood] = useState<string>("sleepy");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (honeypot.trim().length > 0) {
      setError("The paper smelled the spam. Try again without the hidden field.");
      return;
    }
    if (name.trim().length < 2) {
      setError("A dream name of at least 2 letters, please.");
      return;
    }
    if (message.trim().length < 4) {
      setError("Tell us at least a little dream (4+ characters).");
      return;
    }
    setSubmitting(true);
    const optimistic: GuestEntry = {
      id: -Date.now(),
      name: name.trim(),
      message: message.trim(),
      mood,
      status: "approved",
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setEntries((current) => [optimistic, ...current]);
    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim(), mood }),
      });
      const payload = (await response.json()) as { ok?: boolean; entry?: GuestEntry; error?: string };
      if (!response.ok || !payload.ok || !payload.entry) {
        throw new Error(payload.error ?? "The guestbook page jammed. Try again in a moment.");
      }
      setEntries((current) => current.map((item) => (item.id === optimistic.id ? payload.entry! : item)));
      setName("");
      setMessage("");
      setMood("sleepy");
      setSuccess("Pinned to the guestbook! Pudding will read it with her evening cocoa.");
      playSfx("ok");
      pushToast("Guestbook note pinned.", "ok");
    } catch (caught) {
      setEntries((current) => current.filter((item) => item.id !== optimistic.id));
      setError(caught instanceof Error ? caught.message : "The guestbook page jammed.");
      playSfx("err");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <form onSubmit={submit} className="panel overflow-hidden" noValidate>
        <div className="window-bar">
          <span>GUESTBOOK_FORM.CGI</span>
          <span aria-hidden>💌 ✒️</span>
        </div>
        <div className="space-y-3 p-4">
          <p className="mono-retro text-base">
            Leave a note for Pudding and future visitors. Notes appear immediately and can be hidden by the keeper from
            the dashboard. Be kind — small dreamers read this.
          </p>
          <div>
            <label htmlFor="guest-name" className="mb-1 block font-[family-name:var(--font-pixel)] text-[0.5rem]">
              Dream name
            </label>
            <input
              id="guest-name"
              className="retro-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={40}
              placeholder="e.g. moth.exe, Grandma Pearl…"
              autoComplete="nickname"
              required
            />
          </div>
          <div>
            <label htmlFor="guest-message" className="mb-1 block font-[family-name:var(--font-pixel)] text-[0.5rem]">
              Your note
            </label>
            <textarea
              id="guest-message"
              className="retro-textarea min-h-[110px]"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={420}
              placeholder="What did you dream about? Which story did you like?"
              required
            />
            <p className="mt-1 text-right font-[family-name:var(--font-mono-retro)] text-sm opacity-70">
              {message.length}/420
            </p>
          </div>
          <fieldset>
            <legend className="mb-1 font-[family-name:var(--font-pixel)] text-[0.5rem]">Today&apos;s mood</legend>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((option) => (
                <label
                  key={option.value}
                  className={`chip cursor-pointer ${mood === option.value ? "!bg-[#ffd84d]" : ""}`}
                >
                  <input
                    type="radio"
                    name="mood"
                    value={option.value}
                    checked={mood === option.value}
                    onChange={() => setMood(option.value)}
                    className="sr-only"
                  />
                  {option.emoji} {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="hidden" aria-hidden="true">
            <label htmlFor="guest-website">Website</label>
            <input id="guest-website" tabIndex={-1} value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
          </div>

          <button type="submit" className="btn btn-pink w-full" disabled={submitting}>
            {submitting ? "Pinning your note…" : "📌 Pin my note to the guestbook"}
          </button>
          {error ? (
            <p role="alert" className="rounded-md border-2 border-[#a3143c] bg-[#ffe0e6] p-2 text-sm font-bold text-[#7b0f2c]">
              {error}
            </p>
          ) : null}
          {success ? (
            <p role="status" className="rounded-md border-2 border-[#12855f] bg-[#dcffe9] p-2 text-sm font-bold text-[#0b5c42]">
              {success}
            </p>
          ) : null}
          <p className="mono-retro text-sm opacity-70">
            Stored in PostgreSQL. Rate limited to 3 notes per 2 minutes per visitor. No email required, ever.
          </p>
        </div>
      </form>

      <div className="panel overflow-hidden">
        <div className="window-bar">
          <span>GUESTBOOK.HTM — {entries.length} notes</span>
          <span aria-hidden>📖</span>
        </div>
        <div className="max-h-[620px] space-y-3 overflow-y-auto p-4">
          {entries.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-[#6b3fa0] p-6 text-center">
              <p className="text-3xl" aria-hidden>
                🫙
              </p>
              <p className="mt-2 font-[family-name:var(--font-pixel)] text-[0.6rem]">The guestbook is empty</p>
              <p className="mono-retro mt-1 text-base">Be the first dreamer to sign it. Pudding will do a little dance.</p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <article
                key={entry.id}
                className={`rounded-lg border-[3px] border-[#3d1c4e] p-3 shadow-[4px_4px_0_rgba(122,63,143,0.45)] ${
                  index % 3 === 0 ? "bg-[#fff0b8]" : index % 3 === 1 ? "bg-[#ffe3f1]" : "bg-[#e2fbf8]"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-[family-name:var(--font-pixel)] text-[0.6rem] text-[#3d1c4e]">
                    {MOOD_EMOJI[entry.mood] ?? "✨"} {entry.name}
                  </p>
                  <p className="font-[family-name:var(--font-mono-retro)] text-sm text-[#3d1c4e] opacity-70">
                    {entry.pending ? "pinning…" : formatDate(entry.createdAt)}
                  </p>
                </div>
                <p className="mt-1 font-[family-name:var(--font-mono-retro)] text-lg leading-snug text-[#3d1c4e]">{entry.message}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
