"use client";

import { useEffect, useState } from "react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { DREAM_ROUTE } from "@/lib/content";

export function MusicBoxPanel() {
  const { musicPlaying, toggleMusic, musicMuted, toggleMute, volume, setVolume, playSfx } = useExperience();

  return (
    <div className="panel overflow-hidden">
      <div className="window-bar">
        <span>MUSIC_BOX.EXE — “The 9:47 Delivery”</span>
        <span aria-hidden>♪ ♫ ♪</span>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-4">
          <div
            aria-hidden
            className={`grid h-20 w-20 shrink-0 place-items-center rounded-full border-[3px] border-[#3d1c4e] bg-[radial-gradient(circle_at_35%_30%,#fff6df,#ffd84d_45%,#ffa53d)] text-3xl shadow-[4px_4px_0_#7a3f8f] ${musicPlaying && !musicMuted ? "animate-spin-slow" : ""}`}
          >
            🎠
          </div>
          <div className="flex-1">
            <p className="font-[family-name:var(--font-pixel)] text-[0.55rem] leading-relaxed">
              {musicPlaying ? (musicMuted ? "playing (muted)" : "now playing") : "music box at rest"}
            </p>
            <div className="mt-2 flex h-8 items-end gap-1" aria-hidden>
              {[10, 16, 24, 12, 20, 28, 14, 22, 18, 26, 12, 20].map((height, index) => (
                <span
                  key={index}
                  className={`w-2 rounded-t border-2 border-[#3d1c4e] ${musicPlaying && !musicMuted ? "animate-bob" : ""}`}
                  style={{
                    height: musicPlaying && !musicMuted ? height + 4 : 6,
                    background: ["#ff4fa3", "#35e1e8", "#ffd84d", "#c9a7ff"][index % 4],
                    animationDelay: `${index * 0.09}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-sm btn-pink" onClick={toggleMusic} aria-pressed={musicPlaying}>
            {musicPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button type="button" className="btn btn-sm" onClick={toggleMute} aria-pressed={musicMuted}>
            {musicMuted ? "🔇 Unmute" : "🔊 Mute"}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-lav"
            onClick={() => {
              playSfx("sparkle");
              setVolume(0.4);
            }}
          >
            🎚 Reset volume
          </button>
        </div>

        <label htmlFor="music-volume" className="block font-[family-name:var(--font-mono-retro)] text-base">
          Volume: {Math.round(volume * 100)}%
        </label>
        <input
          id="music-volume"
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(event) => setVolume(Number(event.target.value) / 100)}
          className="retro-range"
        />

        <p className="mono-retro text-base leading-snug opacity-80">
          Every note is synthesised live with the Web Audio API — no audio files, no autoplay, no surprise noise. Pause
          and mute work even if you started the lullaby from the header.
        </p>
      </div>
    </div>
  );
}

export function DreamRoute() {
  const { reduceMotion, playSfx } = useExperience();
  const [active, setActive] = useState(0);
  const [deliveryKey, setDeliveryKey] = useState(0);
  const [status, setStatus] = useState("The parcel is waiting in the sorting room.");
  const station = DREAM_ROUTE[active] ?? DREAM_ROUTE[0];

  const path = "M8 62 C 18 20, 22 18, 30 26 C 40 45, 44 72, 54 64 C 64 56, 68 20, 74 22 C 82 26, 84 56, 92 58";

  return (
    <div className="panel overflow-hidden">
      <div className="window-bar">
        <span>DREAM_ROUTE.MAP — tonight&apos;s deliveries</span>
        <span aria-hidden>✉ ✈ ✦</span>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-[1.4fr_1fr]">
        <div className="relative h-[260px] overflow-hidden rounded-lg border-[3px] border-[#3d1c4e] bg-[linear-gradient(180deg,#ffe8f4,#e9d9ff_60%,#ccfbf1)]">
          <div className="absolute inset-0 checker opacity-60" aria-hidden />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <path d={path} fill="none" stroke="#3d1c4e" strokeWidth="2.6" strokeLinecap="round" opacity="0.35" />
            <path
              d={path}
              fill="none"
              stroke="#ff4fa3"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeDasharray="4 4"
              className={reduceMotion ? "" : "animate-[dash-move_6s_linear_infinite]"}
            />
            {DREAM_ROUTE.map((stop, index) => (
              <circle
                key={stop.id}
                cx={stop.x}
                cy={stop.y}
                r={active === index ? 2.6 : 1.7}
                fill={active === index ? "#ffd84d" : "#fff6df"}
                stroke="#3d1c4e"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <g key={deliveryKey}>
              {!reduceMotion ? (
                <>
                  <circle r="3" fill="#ffd84d" stroke="#3d1c4e" strokeWidth="1" vectorEffect="non-scaling-stroke">
                    <animateMotion dur="7s" repeatCount="indefinite" path={path} />
                  </circle>
                  <circle r="1.4" fill="#ff4fa3">
                    <animateMotion dur="7s" repeatCount="indefinite" path={path} begin="0.4s" />
                  </circle>
                </>
              ) : null}
            </g>
          </svg>
          {DREAM_ROUTE.map((stop, index) => (
            <button
              key={stop.id}
              type="button"
              onClick={() => {
                setActive(index);
                setStatus(`${stop.label}: ${stop.note}`);
                playSfx("pop");
              }}
              aria-pressed={active === index}
              aria-label={`Dream route stop ${index + 1}: ${stop.label}. ${stop.note}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border-[3px] border-[#3d1c4e] px-1.5 py-1 text-center font-[family-name:var(--font-pixel)] text-[0.4rem] leading-tight text-[#3d1c4e] shadow-[2px_2px_0_#3d1c4e] transition-transform hover:-translate-y-[55%] ${
                active === index ? "bg-[#ffd84d]" : "bg-[#fff6df]"
              }`}
              style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
            >
              <span aria-hidden className="block text-base">
                {stop.emoji}
              </span>
              {stop.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <p className="chip">✉️ parcel #{4096 + deliveryKey}</p>
          <h3 className="text-sm">{station.label}</h3>
          <p className="text-lg leading-snug">{station.note}</p>
          <p className="mono-retro text-base" aria-live="polite">
            {status}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-sm btn-pink"
              onClick={() => {
                setDeliveryKey((key) => key + 1);
                setStatus(reduceMotion ? "Route static (reduced motion is on). All five stops are listed below." : "Parcel in flight! Follow the little gold star.");
                playSfx("ok");
              }}
            >
              🚚 Deliver again
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                setActive(4);
                setStatus(`Pillow landing confirmed. ${DREAM_ROUTE[4]?.note}`);
                playSfx("sparkle");
              }}
            >
              🛏️ Skip to pillow
            </button>
          </div>
          <ol className="space-y-1 font-[family-name:var(--font-mono-retro)] text-base">
            {DREAM_ROUTE.map((stop, index) => (
              <li key={stop.id} className={index === active ? "font-bold" : "opacity-80"}>
                {index + 1}. {stop.label} {index === active ? "← you are here" : ""}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export function ClickCounter() {
  const { clicks, registerClick, stats, playSfx } = useExperience();
  const [localBest, setLocalBest] = useState(0);

  /* eslint-disable react-hooks/set-state-in-effect -- one-time localStorage sync, guarded */
  useEffect(() => {
    // Reading browser storage after hydration is a one-time external sync.
    if (localBest === 0) {
      try {
        const stored = Number(window.localStorage.getItem("starloom-click-best") ?? "0");
        setLocalBest(Number.isFinite(stored) && stored > 0 ? stored : 0);
      } catch {
        /* ignore */
      }
    }
    if (clicks > localBest) {
        setLocalBest(clicks);
      try {
        window.localStorage.setItem("starloom-click-best", String(clicks));
      } catch {
        /* ignore */
      }
    }
  }, [clicks, localBest]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="pixel-label">The official dream counter</p>
          <p className="mono-retro mt-1 text-lg">
            Your clicks: <strong>{clicks}</strong> · Best: <strong>{localBest}</strong> · Everyone:{" "}
            <strong>{stats.click_count ?? 0}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-pink" onClick={registerClick}>
            ✨ Add a click
          </button>
          <button
            type="button"
            className="btn btn-cyan"
            onClick={() => {
              playSfx("sparkle");
              registerClick();
            }}
          >
            🫧 Sparkle click
          </button>
        </div>
      </div>
      <p className="mono-retro mt-2 text-sm opacity-75">
        A completely honest counter: your clicks update instantly in the browser and are added to the PostgreSQL total.
        The visitor number in the footer is seeded demo data plus real visits since this build.
      </p>
    </div>
  );
}

export function ExperienceConsole() {
  const experience = useExperience();
  return (
    <div className="panel overflow-hidden">
      <div className="window-bar">
        <span>DREAM_SETTINGS.CPL — make yourself comfortable</span>
        <span aria-hidden>⚙️</span>
      </div>
      <div className="space-y-3 p-4">
        <p className="mono-retro text-base leading-snug">
          Every switch here does something real. Settings stay in this browser unless you tick the consent box, in which
          case they are saved to our database too.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            className={`btn btn-sm ${experience.theme === "night" ? "btn-lav" : "btn-cyan"}`}
            onClick={experience.toggleTheme}
            aria-pressed={experience.theme === "night"}
          >
            {experience.theme === "night" ? "☀️ Day shift" : "🌙 Night shift"}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${experience.flashlight ? "btn-pink" : "btn-ghost"}`}
            onClick={() => experience.setFlashlight(!experience.flashlight)}
            aria-pressed={experience.flashlight}
          >
            🔦 Torch {experience.flashlight ? "on" : "off"}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${experience.sparkles ? "btn-mint" : "btn-ghost"}`}
            onClick={() => experience.setSparkles(!experience.sparkles)}
            aria-pressed={experience.sparkles}
          >
            ✨ Sparkle cursor {experience.sparkles ? "on" : "off"}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${experience.sound ? "btn-lav" : "btn-ghost"}`}
            onClick={() => experience.setSound(!experience.sound)}
            aria-pressed={experience.sound}
          >
            {experience.sound ? "🔔 Sounds on" : "🔕 Sounds off"}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${experience.reduceMotion ? "btn-pink" : "btn-ghost"}`}
            onClick={() => experience.setReduceMotion(!experience.reduceMotion)}
            aria-pressed={experience.reduceMotion}
          >
            🐢 Reduce motion {experience.reduceMotion ? "on" : "off"}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${experience.chaos ? "btn-mint" : "btn-ghost"}`}
            onClick={() => experience.setChaos(!experience.chaos)}
            aria-pressed={experience.chaos}
          >
            🎊 Dream party {experience.chaos ? "on" : "off"}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-sm btn-pink" onClick={() => void experience.saveConsent()}>
            💾 Save my settings
          </button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => void experience.clearSaved()}>
            🗑 Clear my saved data
          </button>
          <span className="chip">{experience.consented ? "saved with consent" : "not saved"}</span>
        </div>
      </div>
    </div>
  );
}
