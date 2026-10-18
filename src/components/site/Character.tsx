"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { CHARACTER } from "@/lib/content";

const BUBBLES = [
  { left: "12%", size: 26, delay: 0, duration: 10 },
  { left: "28%", size: 16, delay: 2.5, duration: 12 },
  { left: "44%", size: 34, delay: 5, duration: 9 },
  { left: "66%", size: 20, delay: 1.2, duration: 13 },
  { left: "82%", size: 28, delay: 4, duration: 11 },
];

export function DreamlingCharacter({ compact = false }: { compact?: boolean }) {
  const { reduceMotion, playSfx, unlockEgg, pushToast } = useExperience();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [reactionIndex, setReactionIndex] = useState(0);
  const [starBoops, setStarBoops] = useState(0);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (event: PointerEvent) => {
      const node = frameRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.42;
      const dx = (event.clientX - centerX) / (rect.width / 2);
      const dy = (event.clientY - centerY) / (rect.height / 2);
      setPupil({ x: Math.max(-1, Math.min(1, dx)) * 3.4, y: Math.max(-1, Math.min(1, dy)) * 2.6 });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = window.setInterval(() => {
      setBlinking(true);
      window.setTimeout(() => setBlinking(false), 180);
    }, 6200);
    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  const react = () => {
    const next = (reactionIndex + 1) % CHARACTER.hoverReactions.length;
    setReactionIndex(next);
    playSfx("pop");
  };

  const boopStar = () => {
    const count = starBoops + 1;
    setStarBoops(count);
    playSfx("sparkle");
    if (count === 3) pushToast("Tibby the star wiggled. Two more boops?", "ok");
    if (count >= 5) {
      setStarBoops(0);
      unlockEgg("booped the nightcap star five times");
    }
  };

  const line = CHARACTER.hoverReactions[reactionIndex] ?? CHARACTER.hoverReactions[0];

  return (
    <div className="relative">
      <div
        ref={frameRef}
        className="relative mx-auto w-full max-w-sm"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <div className="absolute inset-x-4 top-6 bottom-10 rounded-full halo" aria-hidden="true" />
        {!reduceMotion ? (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {BUBBLES.map((bubble, index) => (
              <span
                key={index}
                className="bubble absolute bottom-16 rounded-full"
                style={{
                  left: bubble.left,
                  width: bubble.size,
                  height: bubble.size,
                  animationDelay: `${bubble.delay}s`,
                  animationDuration: `${bubble.duration}s`,
                }}
              />
            ))}
          </div>
        ) : null}

        <div className={reduceMotion ? "relative" : "character-sway relative"}>
          <svg
            viewBox="0 0 320 380"
            role="img"
            aria-labelledby="pudding-svg-title pudding-svg-desc"
            className="relative w-full drop-shadow-[6px_8px_0_rgba(107,63,160,0.35)]"
          >
            <title id="pudding-svg-title">Pudding Mallowmoon, a sleepy dream engineer</title>
            <desc id="pudding-svg-desc">
              Original pixel-art style illustration: a round peach marshmallow person with half-lidded lavender eyes,
              rosy cheeks, star freckles, a periwinkle crescent-moon nightcap with a golden star on a string, a
              stitched apron, mismatched socks and a bubble wand.
            </desc>

            {/* shadow */}
            <ellipse cx="160" cy="352" rx="86" ry="15" fill="#c9a7ff" opacity="0.6" />
            <ellipse cx="160" cy="352" rx="58" ry="9" fill="#6b3fa0" opacity="0.25" />

            {/* body */}
            <path
              d="M160 96c58 0 96 44 96 112 0 74-40 128-96 128S64 282 64 208C64 140 102 96 160 96Z"
              fill="#ffe0c9"
              stroke="#3d1c4e"
              strokeWidth="6"
            />
            {/* marshmallow lump highlights */}
            <ellipse cx="120" cy="150" rx="22" ry="16" fill="#fff4e8" opacity="0.85" />
            <ellipse cx="212" cy="196" rx="16" ry="11" fill="#fff4e8" opacity="0.6" />

            {/* feet / mismatched socks */}
            <ellipse cx="120" cy="330" rx="26" ry="16" fill="#6ce7d6" stroke="#3d1c4e" strokeWidth="5" />
            <path d="M112 322l8-10 8 10" fill="none" stroke="#3d1c4e" strokeWidth="4" />
            <ellipse cx="198" cy="330" rx="26" ry="16" fill="#ff9ecb" stroke="#3d1c4e" strokeWidth="5" />
            <circle cx="198" cy="326" r="4" fill="#fff4e8" />

            {/* arms */}
            <path d="M76 210c-26 6-38 24-34 42 3 12 14 16 22 10 10-8 12-26 24-34Z" fill="#ffe0c9" stroke="#3d1c4e" strokeWidth="6" strokeLinejoin="round" />
            <path d="M244 208c26 8 36 26 30 44-4 12-16 14-23 7-9-9-9-26-20-33Z" fill="#ffe0c9" stroke="#3d1c4e" strokeWidth="6" strokeLinejoin="round" />

            {/* apron */}
            <path d="M128 238h64l10 82c-24 10-60 10-84 0Z" fill="#c9a7ff" stroke="#3d1c4e" strokeWidth="5" />
            <path d="M136 262c22 10 26 10 48 0" fill="none" stroke="#ff4fa3" strokeWidth="6" strokeLinecap="round" />
            <path d="M136 276c22 10 26 10 48 0" fill="none" stroke="#ffd84d" strokeWidth="6" strokeLinecap="round" />
            <path d="M136 290c22 10 26 10 48 0" fill="none" stroke="#35e1e8" strokeWidth="6" strokeLinecap="round" />
            <circle cx="160" cy="312" r="7" fill="#ffd84d" stroke="#3d1c4e" strokeWidth="4" />

            {/* pockets with stars */}
            <rect x="150" y="222" width="20" height="14" rx="4" fill="#b78cff" stroke="#3d1c4e" strokeWidth="4" />

            {/* face */}
            <ellipse cx="160" cy="190" rx="66" ry="58" fill="#fff0dd" />

            {/* eyes */}
            <ellipse cx="132" cy="184" rx="21" ry="19" fill="#fffaf0" stroke="#3d1c4e" strokeWidth="5" />
            <ellipse cx="188" cy="184" rx="21" ry="19" fill="#fffaf0" stroke="#3d1c4e" strokeWidth="5" />
            <g className={blinking ? "character-blink" : ""} style={{ transformOrigin: "160px 184px" }}>
              <circle
                cx={132 + pupil.x}
                cy={184 + pupil.y}
                r="12"
                fill="#6b3fa0"
                className={reduceMotion ? "eye-pupil" : "eye-pupil"}
              />
              <circle cx={188 + pupil.x} cy={184 + pupil.y} r="12" fill="#6b3fa0" />
              <circle cx={135 + pupil.x} cy={179 + pupil.y} r="4.5" fill="#fffaf0" />
              <circle cx={191 + pupil.x} cy={179 + pupil.y} r="4.5" fill="#fffaf0" />
              <circle cx={128 + pupil.x} cy={190 + pupil.y} r="2" fill="#ffd84d" />
              <circle cx={184 + pupil.x} cy={190 + pupil.y} r="2" fill="#ffd84d" />
            </g>
            {/* half-lidded sleepy eyelids */}
            <path d="M111 168c12-10 30-10 42 0" fill="none" stroke="#3d1c4e" strokeWidth="6" strokeLinecap="round" />
            <path d="M167 168c12-10 30-10 42 0" fill="none" stroke="#3d1c4e" strokeWidth="6" strokeLinecap="round" />

            {/* cheeks and freckle stars */}
            <ellipse cx="110" cy="208" rx="15" ry="9" fill="#ff9ecb" opacity="0.75" />
            <ellipse cx="212" cy="208" rx="15" ry="9" fill="#ff9ecb" opacity="0.75" />
            <path d="M96 168l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#ffd84d" stroke="#3d1c4e" strokeWidth="1.5" />
            <path d="M228 176l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#ffd84d" stroke="#3d1c4e" strokeWidth="1.5" />

            {/* mouth */}
            <path d="M150 208c6 8 14 8 20 0" fill="none" stroke="#3d1c4e" strokeWidth="5" strokeLinecap="round" />
            {hovered ? (
              <ellipse cx="160" cy="212" rx="7" ry="6" fill="#ff4fa3" opacity="0.85" />
            ) : null}

            {/* nightcap */}
            <path
              d="M92 128C80 78 106 36 156 28c42-7 76 18 80 58 2 24-14 40-36 42Z"
              fill="#b78cff"
              stroke="#3d1c4e"
              strokeWidth="7"
              strokeLinejoin="round"
            />
            <path d="M96 120c22-26 62-38 96-28" fill="none" stroke="#e9d9ff" strokeWidth="9" strokeLinecap="round" />
            <path d="M232 74c14 2 24 14 26 28" fill="none" stroke="#6b3fa0" strokeWidth="7" strokeLinecap="round" />
            {/* cap brim */}
            <path d="M82 124c34 22 108 26 150 2 8 20-8 38-36 40-42 3-94-4-114-22-4-4-4-14 0-20Z" fill="#ffd3e8" stroke="#3d1c4e" strokeWidth="6" strokeLinejoin="round" />

            {/* dangling star / easter egg button */}
            <g
              role="button"
              tabIndex={0}
              aria-label="Boop the star on Pudding's nightcap (secret!)"
              onClick={boopStar}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  boopStar();
                }
              }}
              className="cursor-pointer"
              style={{ transformOrigin: "160px 176px" }}
            >
              <path d="M258 100c8 14 6 30-4 40" fill="none" stroke="#3d1c4e" strokeWidth="3" strokeDasharray="4 5" />
              <path
                d="M262 118l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2Z"
                fill="#ffd84d"
                stroke="#3d1c4e"
                strokeWidth="4"
                className={reduceMotion ? "" : "animate-twinkle"}
              />
              <circle cx="256" cy="128" r="2.5" fill="#3d1c4e" />
              <circle cx="266" cy="128" r="2.5" fill="#3d1c4e" />
              <path d="M258 133c3 3 6 3 9 0" fill="none" stroke="#3d1c4e" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* bubble wand */}
            <path d="M250 250c20 10 30 34 34 62" fill="none" stroke="#ff4fa3" strokeWidth="9" strokeLinecap="round" />
            <path d="M250 250c20 10 30 34 34 62" fill="none" stroke="#fff6df" strokeWidth="3" strokeDasharray="8 10" strokeLinecap="round" />
            <circle cx="288" cy="306" r="19" fill="none" stroke="#35e1e8" strokeWidth="6" />
            <circle cx="288" cy="306" r="11" fill="#ffd3e8" opacity="0.75" />
            <path d="M282 300l3 7 8 2-8 2-3 7-3-7-8-2 8-2Z" fill="#fffaf0" stroke="#3d1c4e" strokeWidth="2" />
          </svg>
        </div>

        <div
          className="panel absolute -top-2 right-0 max-w-[15rem] px-3 py-2 text-sm font-semibold sm:-right-4"
          aria-live="polite"
          style={{ background: hovered ? "#fff0b8" : "#fffaf0" }}
        >
          <span aria-hidden>💬 </span>
          {hovered ? line : "psst — move your pointer near me, then boop my nose."}
        </div>
      </div>

      {!compact ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button type="button" className="btn btn-sm btn-pink" onClick={react}>
            🫧 Boop Pudding
          </button>
          <button type="button" className="btn btn-sm btn-cyan" onClick={boopStar}>
            ⭐ Boop the nightcap star ({Math.max(0, 5 - starBoops)} to go)
          </button>
        </div>
      ) : null}
    </div>
  );
}
