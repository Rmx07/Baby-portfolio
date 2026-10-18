"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiJson } from "@/lib/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState(mode === "login" ? "keeper@starloom.dream" : "");
  const [password, setPassword] = useState(mode === "login" ? "dreamer123" : "");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiJson(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(mode === "login" ? { email, password } : { email, password, displayName }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="panel overflow-hidden">
        <div className="window-bar">
          <span>KEEPER_LOGIN.SHTML</span>
          <span aria-hidden>🔑</span>
        </div>
        <form onSubmit={submit} className="space-y-3 p-4">
          <h1 className="text-sm leading-relaxed sm:text-base">
            {mode === "login" ? "Welcome back to the night shift" : "Become a Starloom keeper"}
          </h1>
          <p className="mono-retro text-base leading-snug text-ink/80">
            {mode === "login"
              ? "Sign in to manage dream projects, bedtime stories, the guestbook and site copy."
              : "Create a keeper account. It is stored in this project's PostgreSQL database with a scrypt-hashed password."}
          </p>
          {mode === "register" ? (
            <label className="block text-sm font-bold">
              Display name
              <input
                className="retro-input mt-1"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
                autoComplete="nickname"
              />
            </label>
          ) : null}
          <label className="block text-sm font-bold">
            Email
            <input
              type="email"
              className="retro-input mt-1"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="block text-sm font-bold">
            Password (8+ characters)
            <input
              type="password"
              className="retro-input mt-1"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>
          {error ? (
            <p role="alert" className="rounded-md border-2 border-[#a3143c] bg-[#ffe0e6] p-2 text-sm font-bold text-[#7b0f2c]">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn btn-pink w-full" disabled={busy}>
            {busy ? "Opening the postbox…" : mode === "login" ? "🔑 Sign in" : "✨ Create keeper account"}
          </button>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href={mode === "login" ? "/register" : "/login"} className="link-underline font-[family-name:var(--font-mono-retro)] text-base">
              {mode === "login" ? "Need an account? Register" : "Already a keeper? Sign in"}
            </Link>
            <Link href="/" className="font-[family-name:var(--font-mono-retro)] text-base link-underline">
              ← back to the dream
            </Link>
          </div>
          {mode === "login" ? (
            <p className="mono-retro rounded-md border-2 border-dashed border-[#6b3fa0] bg-[#fff0b8] p-2 text-sm text-[#3d1c4e]">
              Demo keeper: <strong>keeper@starloom.dream</strong> / <strong>dreamer123</strong> (already filled in).
              Change it from the account page after deployment.
            </p>
          ) : null}
          <p className="mono-retro text-sm text-ink/70">
            Sessions use a random httpOnly cookie token stored in the database. Registration is rate limited to 4 tries
            per five minutes.
          </p>
        </form>
      </div>

      <div className="panel overflow-hidden">
        <div className="window-bar">
          <span>NIGHT_SHIFT.BMP</span>
          <span aria-hidden>🌙</span>
        </div>
        <Image
          src="/images/pudding-portrait.webp"
          alt="Pudding Mallowmoon, sleepy dream engineer, in her crescent-moon nightcap"
          width={800}
          height={800}
          className="w-full object-cover"
          priority
        />
        <div className="space-y-2 border-t-[3px] border-[#3d1c4e] bg-[#fff0b8] p-4">
          <p className="font-[family-name:var(--font-pixel)] text-[0.5rem] text-[#3d1c4e]">What keepers can do</p>
          <ul className="space-y-1 font-[family-name:var(--font-mono-retro)] text-base text-[#3d1c4e]">
            <li>✦ Create, edit, publish and delete dream projects.</li>
            <li>✦ Write bedtime stories and reorder their flipbook pages.</li>
            <li>✦ Approve, hide or delete guestbook notes.</li>
            <li>✦ Curate the arcade leaderboard and dream-chat log.</li>
            <li>✦ Edit the homepage copy and the postbox note.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
