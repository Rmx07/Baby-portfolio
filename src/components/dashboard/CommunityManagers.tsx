"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/client";
import { useExperience } from "@/components/experience/ExperienceProvider";

type GuestEntry = { id: number; name: string; message: string; mood: string; status: string; createdAt: string | Date };
type ScoreEntry = { id: number; playerName: string; score: number; createdAt: string | Date };
type ChatEntry = { id: number; visitorId: string; role: string; content: string; source: string; createdAt: string | Date };
type SettingsMap = { siteTitle: string; tagline: string; aboutBlurb: string; dispatchNote: string };

function Feedback({ error, success }: { error: string | null; success: string | null }) {
  if (error) {
    return <p role="alert" className="rounded-md border-2 border-[#a3143c] bg-[#ffe0e6] p-2 text-sm font-bold text-[#7b0f2c]">{error}</p>;
  }
  if (success) {
    return <p role="status" className="rounded-md border-2 border-[#12855f] bg-[#dcffe9] p-2 text-sm font-bold text-[#0b5c42]">{success}</p>;
  }
  return null;
}

function formatDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
}

export function GuestbookManager({ initialEntries }: { initialEntries: GuestEntry[] }) {
  const { playSfx } = useExperience();
  const [entries, setEntries] = useState(initialEntries);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const visible = entries.filter((entry) => (filter === "all" ? true : entry.status === filter));

  const setStatus = async (entry: GuestEntry, status: "approved" | "pending") => {
    const previous = entries;
    setEntries((current) => current.map((item) => (item.id === entry.id ? { ...item, status } : item)));
    setError(null);
    try {
      await apiJson(`/api/guestbook/${entry.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setSuccess(`Note from ${entry.name} marked ${status}.`);
      playSfx("ok");
    } catch (caught) {
      setEntries(previous);
      setError(caught instanceof Error ? caught.message : "Could not update that note.");
    }
  };

  const remove = async (entry: GuestEntry) => {
    if (!window.confirm(`Delete the note from ${entry.name}?`)) return;
    const previous = entries;
    setEntries((current) => current.filter((item) => item.id !== entry.id));
    try {
      await apiJson(`/api/guestbook/${entry.id}`, { method: "DELETE" });
      setSuccess("Guestbook note deleted.");
      playSfx("ok");
    } catch (caught) {
      setEntries(previous);
      setError(caught instanceof Error ? caught.message : "Could not delete that note.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter guestbook notes">
          {(["all", "pending", "approved"] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={`btn btn-sm ${filter === option ? "btn-pink" : "btn-ghost"}`}
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
            >
              {option} ({option === "all" ? entries.length : entries.filter((entry) => entry.status === option).length})
            </button>
          ))}
        </div>
        <p className="font-[family-name:var(--font-mono-retro)] text-base text-ink">
          {entries.filter((entry) => entry.status === "pending").length} awaiting a look
        </p>
      </div>
      <Feedback error={error} success={success} />
      {visible.length === 0 ? (
        <div className="panel p-6 text-center">
          <p className="text-3xl" aria-hidden>
            💌
          </p>
          <p className="mt-2 font-[family-name:var(--font-pixel)] text-[0.6rem]">Nothing here yet</p>
          <p className="mono-retro mt-1 text-lg">Visitors can sign the public guestbook any time.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((entry) => (
            <article key={entry.id} className="panel p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-[family-name:var(--font-pixel)] text-[0.55rem] text-ink">
                  {entry.name} · {entry.mood}
                </p>
                <span className={`chip ${entry.status === "pending" ? "!bg-[#fff0b8]" : "!bg-[#d6f8e4]"}`}>{entry.status}</span>
              </div>
              <p className="mt-1 font-[family-name:var(--font-mono-retro)] text-lg leading-snug text-ink">{entry.message}</p>
              <p className="mt-1 font-[family-name:var(--font-mono-retro)] text-sm opacity-60">{formatDate(entry.createdAt)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {entry.status === "approved" ? (
                  <button type="button" className="btn btn-sm btn-lav" onClick={() => setStatus(entry, "pending")}>
                    Hide from wall
                  </button>
                ) : (
                  <button type="button" className="btn btn-sm btn-mint" onClick={() => setStatus(entry, "approved")}>
                    ✓ Approve
                  </button>
                )}
                <button type="button" className="btn btn-sm btn-pink" onClick={() => remove(entry)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScoresManager({ initialScores }: { initialScores: ScoreEntry[] }) {
  const [scores, setScores] = useState(initialScores);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const remove = async (score: ScoreEntry) => {
    if (!window.confirm(`Remove ${score.playerName}'s score of ${score.score}?`)) return;
    const previous = scores;
    setScores((current) => current.filter((item) => item.id !== score.id));
    try {
      await apiJson(`/api/scores/${score.id}`, { method: "DELETE" });
      setSuccess("Score removed from the arcade board.");
    } catch (caught) {
      setScores(previous);
      setError(caught instanceof Error ? caught.message : "Could not remove that score.");
    }
  };

  return (
    <div className="space-y-4">
      <Feedback error={error} success={success} />
      <p className="font-[family-name:var(--font-mono-retro)] text-lg text-ink">
        {scores.length} submitted runs. The public board ranks the top 10 by score.
      </p>
      {scores.length === 0 ? (
        <div className="panel p-6 text-center">
          <p className="text-3xl" aria-hidden>
            🕹️
          </p>
          <p className="mt-2 font-[family-name:var(--font-pixel)] text-[0.6rem]">No runs recorded</p>
          <p className="mono-retro mt-1 text-lg">Play a round of Dream Bubble Pop to seed the board.</p>
        </div>
      ) : (
        <ol className="grid gap-2">
          {scores.map((score, index) => (
            <li key={score.id} className="panel flex flex-wrap items-center justify-between gap-2 p-3">
              <span className="font-[family-name:var(--font-mono-retro)] text-lg text-ink">
                {index + 1}. <strong>{score.playerName}</strong> — {score.score} pts
                <span className="ml-2 text-sm opacity-60">{formatDate(score.createdAt)}</span>
              </span>
              <button type="button" className="btn btn-sm btn-pink" onClick={() => remove(score)}>
                Delete
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function ChatLogManager({ initialMessages }: { initialMessages: ChatEntry[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const remove = async (entry: ChatEntry) => {
    if (!window.confirm("Delete this chat message?")) return;
    const previous = messages;
    setMessages((current) => current.filter((item) => item.id !== entry.id));
    try {
      await apiJson(`/api/chat/${entry.id}`, { method: "DELETE" });
      setSuccess("Message deleted.");
    } catch (caught) {
      setMessages(previous);
      setError(caught instanceof Error ? caught.message : "Could not delete that message.");
    }
  };

  return (
    <div className="space-y-4">
      <Feedback error={error} success={success} />
      <div className="panel p-3">
        <p className="font-[family-name:var(--font-mono-retro)] text-lg text-ink">
          Latest {messages.length} messages · visitors are shown by anonymous cookie id only.
        </p>
        <p className="mono-retro mt-1 text-sm opacity-70">
          AI replies come from Gemini when configured; otherwise the offline generator (&ldquo;local&rdquo;) answers.
        </p>
      </div>
      {messages.length === 0 ? (
        <div className="panel p-6 text-center">
          <p className="text-3xl" aria-hidden>
            💬
          </p>
          <p className="mt-2 font-[family-name:var(--font-pixel)] text-[0.6rem]">No dream chats yet</p>
          <p className="mono-retro mt-1 text-lg">Ask Pudding for a dream on the homepage to see transcripts here.</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {messages.map((message) => (
            <article key={message.id} className={`panel p-3 ${message.role === "assistant" ? "bg-[#fff0b8]" : "bg-[#e2fbf8]"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-[family-name:var(--font-pixel)] text-[0.45rem] text-[#3d1c4e]">
                  {message.role === "assistant" ? "PUDDING" : "VISITOR"} · {message.source} · {message.visitorId.slice(0, 8)}
                </p>
                <button type="button" className="btn btn-sm btn-pink" onClick={() => remove(message)}>
                  Delete
                </button>
              </div>
              <p className="mt-1 whitespace-pre-wrap font-[family-name:var(--font-mono-retro)] text-base leading-snug text-[#3d1c4e]">
                {message.content}
              </p>
              <p className="mt-1 font-[family-name:var(--font-mono-retro)] text-sm text-[#3d1c4e] opacity-60">
                {formatDate(message.createdAt)}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function SettingsForm({ initialSettings }: { initialSettings: SettingsMap }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await apiJson<{ settings: SettingsMap }>("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      setSettings(result.settings);
      setSuccess("Site copy saved. The homepage updates on the next load.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save settings.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="panel space-y-3 p-4">
      <Feedback error={error} success={success} />
      <label className="block text-sm font-bold">
        Site title
        <input
          className="retro-input mt-1"
          value={settings.siteTitle}
          maxLength={80}
          onChange={(event) => setSettings((current) => ({ ...current, siteTitle: event.target.value }))}
          required
        />
      </label>
      <label className="block text-sm font-bold">
        Tagline
        <input
          className="retro-input mt-1"
          value={settings.tagline}
          maxLength={160}
          onChange={(event) => setSettings((current) => ({ ...current, tagline: event.target.value }))}
          required
        />
      </label>
      <label className="block text-sm font-bold">
        Homepage intro blurb
        <textarea
          className="retro-textarea mt-1 min-h-[110px]"
          value={settings.aboutBlurb}
          maxLength={600}
          onChange={(event) => setSettings((current) => ({ ...current, aboutBlurb: event.target.value }))}
          required
        />
      </label>
      <label className="block text-sm font-bold">
        Tonight&apos;s postbox note
        <textarea
          className="retro-textarea mt-1 min-h-[80px]"
          value={settings.dispatchNote}
          maxLength={300}
          onChange={(event) => setSettings((current) => ({ ...current, dispatchNote: event.target.value }))}
          required
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn btn-pink" disabled={busy}>
          {busy ? "Saving…" : "💾 Save site copy"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setSettings(initialSettings)}>
          Reset fields
        </button>
      </div>
    </form>
  );
}

export function AccountForm({ user }: { user: { email: string; displayName: string; role: string } }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await apiJson("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ displayName, currentPassword, newPassword }),
      });
      setSuccess("Keeper account updated.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update the account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={save} className="panel space-y-3 p-4">
        <h2 className="text-sm">Keeper account</h2>
        <Feedback error={error} success={success} />
        <p className="mono-retro text-base text-ink/80">
          {user.email} · role: {user.role}
        </p>
        <label className="block text-sm font-bold">
          Display name
          <input
            className="retro-input mt-1"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-bold">
          Current password (only needed to change password)
          <input
            type="password"
            className="retro-input mt-1"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
        <label className="block text-sm font-bold">
          New password (8+ characters)
          <input
            type="password"
            className="retro-input mt-1"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
          />
        </label>
        <button type="submit" className="btn btn-pink" disabled={busy}>
          {busy ? "Saving…" : "💾 Save account"}
        </button>
      </form>
      <div className="panel space-y-3 p-4">
        <h2 className="text-sm">Session &amp; security</h2>
        <ul className="space-y-1 font-[family-name:var(--font-mono-retro)] text-base leading-snug text-ink">
          <li>✦ Passwords are hashed with Node&apos;s scrypt (unique salt per account).</li>
          <li>✦ Sessions are random 256-bit tokens stored in a httpOnly cookie and the database.</li>
          <li>✦ Every dashboard write endpoint requires a valid keeper session.</li>
          <li>✦ Public write endpoints are rate limited in memory and validated with Zod.</li>
          <li>✦ No service-role key or Gemini key is ever sent to the browser.</li>
        </ul>
        <p className="mono-retro rounded-md border-2 border-dashed border-[#6b3fa0] p-2 text-sm text-ink/80">
          Demo keeper: <strong>keeper@starloom.dream</strong> / <strong>dreamer123</strong>. Change the password after
          you deploy, or create a fresh account.
        </p>
      </div>
    </div>
  );
}
