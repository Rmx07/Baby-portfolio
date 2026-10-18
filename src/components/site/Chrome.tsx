"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { EasterEggButton } from "@/components/experience/Effects";
import { SITE_NAV } from "@/lib/content";

export function openDreamSettings() {
  window.dispatchEvent(new CustomEvent("starloom:open-settings"));
}

function DigitCounter({ value, digits = 6, label }: { value: number; digits?: number; label: string }) {
  const padded = String(Math.max(0, Math.floor(value))).padStart(digits, "0").slice(-digits);
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`${label}: ${value}`}>
      {padded.split("").map((digit, index) => (
        <span
          key={`${digit}-${index}`}
          aria-hidden="true"
          className="inline-grid h-7 w-5 place-items-center border-2 border-[#3d1c4e] bg-[#3d1c4e] font-[family-name:var(--font-pixel)] text-[0.6rem] text-[#ffd84d]"
        >
          {digit}
        </span>
      ))}
    </span>
  );
}

export function RetroBadge({ children, tone = "#ff4fa3" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 border-2 border-[#3d1c4e] px-2 py-1 font-[family-name:var(--font-pixel)] text-[0.45rem] uppercase leading-none tracking-wide text-[#3d1c4e] shadow-[2px_2px_0_#3d1c4e]"
      style={{ background: tone }}
    >
      {children}
    </span>
  );
}

function Controls() {
  const {
    theme,
    toggleTheme,
    chaos,
    setChaos,
    musicPlaying,
    toggleMusic,
    musicMuted,
    toggleMute,
    playSfx,
  } = useExperience();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggleTheme}
        className={`btn btn-sm ${theme === "night" ? "btn-lav" : "btn-cyan"}`}
        aria-pressed={theme === "night"}
        aria-label={`Switch to ${theme === "day" ? "night" : "day"} mode. Currently ${theme} mode.`}
      >
        {theme === "night" ? "☀️ Day" : "🌙 Night"}
      </button>
      <button
        type="button"
        onClick={toggleMusic}
        className="btn btn-sm btn-pink"
        aria-pressed={musicPlaying}
        aria-label={musicPlaying ? "Pause the music-box lullaby" : "Play the music-box lullaby"}
      >
        {musicPlaying ? "⏸ Pause" : "🎵 Music"}
      </button>
      <button
        type="button"
        onClick={toggleMute}
        className="btn btn-sm btn-ghost"
        aria-pressed={musicMuted}
        aria-label={musicMuted ? "Unmute the music box" : "Mute the music box"}
        title="Mute / unmute the music box"
      >
        {musicMuted ? "🔇" : "🔊"}
      </button>
      <button
        type="button"
        onClick={() => setChaos(!chaos)}
        className={`btn btn-sm ${chaos ? "btn-mint" : "btn-lav"}`}
        aria-pressed={chaos}
        aria-label="Toggle dream party mode"
      >
        {chaos ? "🎊 Party ON" : "🎈 Party"}
      </button>
      <button
        type="button"
        className="btn btn-sm"
        onClick={() => {
          playSfx("click");
          openDreamSettings();
        }}
      >
        ⚙️ Settings
      </button>
    </div>
  );
}

export function RetroHeader({ siteTitle, tagline }: { siteTitle: string; tagline: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { playSfx } = useExperience();

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("starloom:open-settings", handler);
    return () => window.removeEventListener("starloom:open-settings", handler);
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to the dream content
      </a>
      <div className="border-b-[3px] border-[#3d1c4e] bg-[#ff4fa3] text-[#fff6df]">
        <div className="marquee py-1.5 font-[family-name:var(--font-mono-retro)] text-base">
          <span className="marquee-track">
            ★ WELCOME TO THE STARLOOM DREAM DISPATCH ★ new bedtime story in the Story Corner ★ 4,096 dreams delivered
            and counting ★ sign the guestbook, Pudding reads every note ★ try typing z-z-z somewhere on this page ★
            best viewed with a warm drink and lowered eyelids ★
          </span>
        </div>
      </div>

      <header className="mx-auto w-full max-w-6xl px-3 pt-4 sm:px-5">
        <div className="panel overflow-hidden">
          <div className="window-bar">
            <span className="truncate">★ {siteTitle} ★</span>
            <span className="window-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </div>
          <div className="flex flex-col gap-3 p-3 sm:p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-shadow-hard font-[family-name:var(--font-pixel)] text-[0.85rem] leading-relaxed sm:text-lg">
                  <span className="rainbow-text">Pudding&apos;s</span> Starloom Dream Dispatch
                </p>
                <p className="mono-retro mt-1 text-base opacity-80 sm:text-lg">{tagline}</p>
              </div>
              <Controls />
            </div>
            <nav aria-label="Main dream navigation" className="-mx-1 overflow-x-auto pb-1">
              <ul className="flex min-w-max items-center gap-2 px-1">
                {SITE_NAV.map((link) => {
                  const active = pathname === link.href.split("#")[0] && !link.href.includes("#");
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => playSfx("page")}
                        aria-current={active ? "page" : undefined}
                        className={`btn btn-sm ${active ? "btn-pink" : "btn-ghost"}`}
                      >
                        <span aria-hidden>{link.emoji}</span> {link.label}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <Link href="/dashboard" className="btn btn-sm btn-mint" onClick={() => playSfx("page")}>
                    🗂 Keeper
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="flex flex-wrap items-center gap-2">
              <RetroBadge tone="#ffd84d">🌙 since 1996</RetroBadge>
              <RetroBadge tone="#35e1e8">handmade dreams</RetroBadge>
              <RetroBadge tone="#c9a7ff">kid-safe</RetroBadge>
              <RetroBadge tone="#8df0c8">no pop-ups, ever</RetroBadge>
            </div>
          </div>
        </div>
      </header>
      <PreferencesDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (value: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border-2 border-dashed border-[#6b3fa0]/50 p-2.5">
      <span>
        <span className="block text-sm font-bold">{label}</span>
        {hint ? <span className="mono-retro block text-sm opacity-75">{hint}</span> : null}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="block h-7 w-14 rounded-full border-[3px] border-[#3d1c4e] bg-[#fff1d6] transition-colors peer-checked:bg-[#2fd3b4] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-dashed peer-focus-visible:outline-[#ff4fa3] peer-focus-visible:outline-offset-2" />
        <span className="pointer-events-none absolute top-1 left-1 h-4 w-4 rounded-full border-2 border-[#3d1c4e] bg-[#ff4fa3] transition-transform peer-checked:translate-x-7 peer-checked:bg-[#ffd84d]" />
      </span>
    </label>
  );
}

function PreferencesDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const experience = useExperience();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[92] flex justify-end bg-[rgba(61,28,78,0.6)]">
      <button type="button" aria-label="Close dream settings" className="flex-1 cursor-pointer" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="h-full w-full max-w-md overflow-y-auto border-l-[3px] border-[#3d1c4e] bg-[#fff6df]"
      >
        <div className="window-bar sticky top-0 z-10">
          <span id="settings-title">DREAM SETTINGS</span>
          <button type="button" ref={closeRef} onClick={onClose} className="chip" aria-label="Close settings">
            ✕ close
          </button>
        </div>
        <div className="space-y-4 p-4 text-[#3d1c4e]">
          <section className="panel-soft space-y-3 p-3" aria-labelledby="feelings-heading">
            <h2 id="feelings-heading" className="text-sm">
              Atmosphere
            </h2>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Colour theme">
              <button
                type="button"
                className={`btn btn-sm ${experience.theme === "day" ? "btn-pink" : "btn-ghost"}`}
                aria-pressed={experience.theme === "day"}
                onClick={() => experience.setTheme("day")}
              >
                ☀️ Day
              </button>
              <button
                type="button"
                className={`btn btn-sm ${experience.theme === "night" ? "btn-lav" : "btn-ghost"}`}
                aria-pressed={experience.theme === "night"}
                onClick={() => experience.setTheme("night")}
              >
                🌙 Night
              </button>
            </div>
            <Toggle
              label="Sparkle cursor"
              hint="Little stars follow your pointer."
              checked={experience.sparkles}
              onChange={(value) => experience.setSparkles(value)}
            />
            <Toggle
              label="Dream party mode"
              hint="Confetti colours, bunting, extra chaos. Reversible."
              checked={experience.chaos}
              onChange={(value) => experience.setChaos(value)}
            />
            <Toggle
              label="Reduce motion"
              hint="Stops every animation, torch and sparkle. Also respects your OS setting."
              checked={experience.reduceMotion}
              onChange={(value) => experience.setReduceMotion(value)}
            />
            <Toggle
              label="Flashlight cursor"
              hint="Peek around the dream with a torch. On touch, drag to move it."
              checked={experience.flashlight}
              onChange={(value) => experience.setFlashlight(value)}
            />
            <Toggle
              label="Interaction sounds"
              hint="Gentle clicks, pops and page turns. The music box has its own mute."
              checked={experience.sound}
              onChange={(value) => experience.setSound(value)}
            />
          </section>

          <section className="panel-soft space-y-3 p-3" aria-labelledby="music-heading">
            <h2 id="music-heading" className="text-sm">
              Music box
            </h2>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={experience.toggleMusic} className="btn btn-sm btn-pink" aria-pressed={experience.musicPlaying}>
                {experience.musicPlaying ? "⏸ Pause lullaby" : "▶ Play lullaby"}
              </button>
              <button type="button" onClick={experience.toggleMute} className="btn btn-sm" aria-pressed={experience.musicMuted}>
                {experience.musicMuted ? "🔇 Unmute" : "🔊 Mute"}
              </button>
            </div>
            <label className="block text-sm font-bold" htmlFor="volume-range">
              Volume
            </label>
            <input
              id="volume-range"
              className="retro-range"
              type="range"
              min={0}
              max={100}
              value={Math.round(experience.volume * 100)}
              onChange={(event) => experience.setVolume(Number(event.target.value) / 100)}
            />
            <p className="mono-retro text-sm opacity-75">
              {experience.audioUnlocked ? "Audio engine ready." : "The music box winds up on your first press."}
            </p>
          </section>

          <section className="panel-soft space-y-3 p-3" aria-labelledby="consent-heading">
            <h2 id="consent-heading" className="text-sm">
              Remember me?
            </h2>
            <p className="text-sm">
              With your consent we save your theme, sound and motion choices (plus a random visitor id) in our database
              and in a cookie jar. No ads, no tracking pixels, no selling anything.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-sm btn-mint"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  await experience.saveConsent();
                  setSaving(false);
                }}
              >
                {saving ? "Tucking away…" : experience.consented ? "✓ Saved — re-save" : "Save my dream settings"}
              </button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => void experience.clearSaved()}>
                Clear saved data
              </button>
            </div>
            <p className="mono-retro text-sm opacity-75" aria-live="polite">
              {experience.consented ? "Saved: preferences + chat history can be cleared any time." : "Not saved yet — everything is session-only."}
            </p>
          </section>

          <p className="mono-retro text-sm opacity-75">
            Tip: the secret fourth rule is hidden on this page. Try the sleepy letters.
            <br />
            <EasterEggButton />
          </p>
        </div>
      </div>
    </div>
  );
}

export function RetroFooter({ siteTitle }: { siteTitle: string }) {
  const { stats, clicks, playSfx } = useExperience();
  return (
    <footer className="mt-10 border-t-[3px] border-[#3d1c4e] bg-[#3d1c4e] pb-6 text-[#fff6df]">
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="pixel-label text-[#ffd84d]">The post office</p>
          <p className="mt-2 font-[family-name:var(--font-mono-retro)] text-lg leading-snug">
            {siteTitle}. Open every night at 9:47pm. Three clouds above the Starloom Valley. Bring a stamp, leave with
            a dream.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <RetroBadge tone="#ff4fa3">HTML 3.2-ish</RetroBadge>
            <RetroBadge tone="#35e1e8">pixel proud</RetroBadge>
            <RetroBadge tone="#ffd84d">best at 800×600</RetroBadge>
          </div>
        </div>
        <div>
          <p className="pixel-label text-[#ffd84d]">Doorways</p>
          <ul className="mt-2 space-y-1 font-[family-name:var(--font-mono-retro)] text-lg">
            {SITE_NAV.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link-underline" onClick={() => playSfx("page")}>
                  {link.emoji} {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/dashboard" className="link-underline">
                🗂 Keeper dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="pixel-label text-[#ffd84d]">Visitors &amp; yawns</p>
          <div className="mt-2 space-y-2">
            <p className="font-[family-name:var(--font-mono-retro)] text-base">You are visitor number</p>
            <DigitCounter value={stats.visit_count ?? 0} label="Visitor count" />
            <p className="font-[family-name:var(--font-mono-retro)] text-base">
              Dreams delivered: <strong className="text-[#ffd84d]">{stats.dreams_delivered ?? 0}</strong>
            </p>
            <p className="font-[family-name:var(--font-mono-retro)] text-base">
              Your clicks this visit: <strong className="text-[#35e1e8]">{clicks}</strong> · Site-wide:{" "}
              <strong className="text-[#ffd84d]">{stats.click_count ?? 0}</strong>
            </p>
          </div>
          <div className="mt-3 border-2 border-dashed border-[#c9a7ff] p-2 font-[family-name:var(--font-mono-retro)] text-sm">
            <p className="text-[#ffd84d]">★ STARLOOM WEBRING ★</p>
            <p className="opacity-80">← previous dream · random dream · next dream →</p>
            <p className="opacity-60">(a decorative webring, as tradition demands)</p>
          </div>
        </div>
        <div>
          <p className="pixel-label text-[#ffd84d]">Small print</p>
          <p className="mt-2 font-[family-name:var(--font-mono-retro)] text-base leading-snug">
            © 1996–2026 {siteTitle}. Original character, stories and pixel art by the keeper. Fiction only — no real
            dreams were harmed.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" className="chip" onClick={openDreamSettings}>
              ⚙️ Dream settings &amp; privacy
            </button>
            <EasterEggButton />
          </div>
          <p className="mt-2 font-[family-name:var(--font-mono-retro)] text-sm opacity-75">
            Made with Next.js, PostgreSQL, Drizzle, Three.js and far too much pink. Guestbook notes are moderated from
            the keeper dashboard.
          </p>
        </div>
      </div>
      <p className="mx-auto mt-6 w-full max-w-6xl px-4 text-center font-[family-name:var(--font-pixel)] text-[0.5rem] leading-relaxed text-[#ffd84d]">
        THIS SITE IS BEST VIEWED WITH LOW LIGHTING, A WARM DRINK, AND ONE (1) YAWN.
      </p>
    </footer>
  );
}
