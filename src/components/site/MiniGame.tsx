"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useExperience } from "@/components/experience/ExperienceProvider";

export type HighScore = { id: number; playerName: string; score: number };

const HOLE_COUNT = 9;
const ROUND_SECONDS = 30;

type Bubble = { hole: number; id: number; kind: "star" | "bubble" | "rainbow" };
type GameState = "idle" | "playing" | "over";

export function DreamBubbleGame({ initialScores }: { initialScores: HighScore[] }) {
  const { playSfx, pushToast, reduceMotion, sound } = useExperience();
  const [state, setState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [scores, setScores] = useState<HighScore[]>(initialScores);
  const [playerName, setPlayerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [best, setBest] = useState(0);
  const spawnTimer = useRef<number | null>(null);
  const bubbleId = useRef(0);
  const spawned = useRef(0);

  useEffect(() => {
    try {
      setBest(Number(window.localStorage.getItem("starloom-game-best") ?? "0"));
    } catch {
      /* ignore */
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (spawnTimer.current) {
      window.clearTimeout(spawnTimer.current);
      spawnTimer.current = null;
    }
  }, []);

  const spawn = useCallback(() => {
    const kinds: Bubble["kind"][] = ["star", "bubble", "rainbow", "bubble", "star"];
    bubbleId.current += 1;
    spawned.current += 1;
    const createdId = bubbleId.current;
    const hole = Math.floor(Math.random() * HOLE_COUNT);
    const kind = kinds[Math.floor(Math.random() * kinds.length)] ?? "bubble";
    setBubbles((current) => {
      const filtered = current.filter((item) => item.hole !== hole).slice(-4);
      return [...filtered, { hole, id: createdId, kind }];
    });
    const speed = Math.max(420, 1000 - spawned.current * 28);
    spawnTimer.current = window.setTimeout(() => {
      setBubbles((current) => current.filter((item) => item.id !== createdId));
      spawn();
    }, speed + 900);
  }, []);

  useEffect(() => {
    if (state !== "playing") return;
    const countdown = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(countdown);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(countdown);
  }, [state]);

  useEffect(() => {
    if (timeLeft === 0 && state === "playing") {
      setState("over");
      clearTimers();
      setBubbles([]);
      setBest((current) => {
        const next = Math.max(current, score);
        try {
          window.localStorage.setItem("starloom-game-best", String(next));
        } catch {
          /* ignore */
        }
        return next;
      });
      playSfx("ok");
    }
  }, [clearTimers, playSfx, score, state, timeLeft]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const start = () => {
    clearTimers();
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setBubbles([]);
    setSubmitError(null);
    spawned.current = 0;
    setState("playing");
    playSfx("ok");
    spawn();
  };

  const pop = (bubble: Bubble) => {
    if (state !== "playing") return;
    const points = bubble.kind === "rainbow" ? 3 : bubble.kind === "star" ? 2 : 1;
    setScore((current) => current + points);
    setBubbles((current) => current.filter((item) => item.id !== bubble.id));
    playSfx(bubble.kind === "rainbow" ? "sparkle" : "pop");
  };

  const submitScore = async () => {
    if (playerName.trim().length < 2) {
      setSubmitError("Give your dream catcher a name (2+ letters).");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const optimistic: HighScore = { id: -Date.now(), playerName: playerName.trim(), score };
    setScores((current) => [...current, optimistic].sort((a, b) => b.score - a.score).slice(0, 10));
    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: playerName.trim(), score }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; scores?: HighScore[] };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "The scoreboard is jammed.");
      if (payload.scores) setScores(payload.scores);
      pushToast("Score pinned to the arcade board.", "ok");
      setPlayerName("");
    } catch (error) {
      setScores((current) => current.filter((item) => item.id !== optimistic.id));
      setSubmitError(error instanceof Error ? error.message : "Could not save the score.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <div className="panel overflow-hidden">
        <div className="window-bar">
          <span>DREAM_BUBBLE_POP.EXE</span>
          <span aria-hidden>🫧 🕹️ ⭐</span>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <span className="chip">⏱ {timeLeft}s</span>
              <span className="chip">⭐ {score} pts</span>
              <span className="chip">🏆 best {best}</span>
            </div>
            <span className="font-[family-name:var(--font-mono-retro)] text-sm" aria-live="polite">
              {state === "playing"
                ? bubbles.length > 0
                  ? "Pop the bubbles before they drift away!"
                  : "Bubbles are gathering…"
                : state === "over"
                  ? score >= 25
                    ? "Tibby says that was outstanding."
                    : "Lovely popping. One more round?"
                  : "Ready when you are."}
            </span>
          </div>

          <div
            className="grid grid-cols-3 gap-2 rounded-lg border-[3px] border-[#3d1c4e] bg-[linear-gradient(160deg,#ffe3f1,#e9d9ff_55%,#ccfbf1)] p-2"
            role="group"
            aria-label="Dream bubble playfield. Nine holes; bubbles appear inside them."
          >
            {Array.from({ length: HOLE_COUNT }).map((_, hole) => {
              const bubble = bubbles.find((item) => item.hole === hole);
              return (
                <button
                  key={hole}
                  type="button"
                  disabled={!bubble || state !== "playing"}
                  onClick={() => bubble && pop(bubble)}
                  aria-label={
                    bubble
                      ? `Pop ${bubble.kind} bubble in hole ${hole + 1}, worth ${bubble.kind === "rainbow" ? 3 : bubble.kind === "star" ? 2 : 1} points`
                      : `Empty dream hole ${hole + 1}`
                  }
                  className={`relative grid aspect-square place-items-center rounded-lg border-[3px] border-[#3d1c4e] transition-colors ${
                    bubble ? "cursor-pointer bg-white shadow-[3px_3px_0_#7a3f8f]" : "cursor-default bg-[#fff6df]/70"
                  }`}
                >
                  {bubble ? (
                    <span
                      className={`text-3xl sm:text-4xl ${reduceMotion ? "" : "animate-pop"}`}
                      aria-hidden
                    >
                      {bubble.kind === "rainbow" ? "🌈" : bubble.kind === "star" ? "⭐" : "🫧"}
                    </span>
                  ) : (
                    <span className="font-[family-name:var(--font-mono-retro)] text-xs text-[#6b3fa0]/50" aria-hidden>
                      zzz
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {state === "playing" ? (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  clearTimers();
                  setState("idle");
                  setBubbles([]);
                  playSfx("page");
                }}
              >
                ⏹ Stop round
              </button>
            ) : (
              <button type="button" className="btn btn-pink" onClick={start}>
                {state === "over" ? "🔁 Play again" : "▶ Start popping"}
              </button>
            )}
            <span className="font-[family-name:var(--font-mono-retro)] text-sm opacity-80">
              30 seconds · ⭐ stars = 2 pts · 🌈 rainbow = 3 pts · every hole is a real button, so tab + enter works
              {sound ? "" : " · sounds are off"}
            </span>
          </div>

          {state === "over" ? (
            <div className="panel-soft space-y-2 p-3">
              <p className="text-sm font-bold">Score: {score} points</p>
              <label htmlFor="player-name" className="block font-[family-name:var(--font-mono-retro)] text-base">
                Pin it to the leaderboard as:
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  id="player-name"
                  className="retro-input max-w-[16rem] flex-1"
                  placeholder="dream catcher name"
                  value={playerName}
                  maxLength={20}
                  onChange={(event) => setPlayerName(event.target.value)}
                />
                <button type="button" className="btn btn-sm btn-mint" onClick={submitScore} disabled={submitting}>
                  {submitting ? "Pinning…" : "📌 Save score"}
                </button>
                <button type="button" className="btn btn-sm" onClick={start}>
                  🔁 Restart
                </button>
              </div>
              {submitError ? (
                <p role="alert" className="text-sm font-bold text-[#a3143c]">
                  {submitError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="window-bar">
          <span>ARCADE_BOARD.HTM</span>
          <span aria-hidden>🏆</span>
        </div>
        <div className="p-4">
          <h3 className="text-sm">Dream catcher hall of fame</h3>
          {scores.length === 0 ? (
            <p className="mono-retro mt-2 text-base">Nobody has popped a bubble yet. Be the very first legend.</p>
          ) : (
            <ol className="mt-2 space-y-1.5">
              {scores.map((entry, index) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-2 rounded-md border-2 border-[#3d1c4e] bg-[#fff6df] px-2 py-1 font-[family-name:var(--font-mono-retro)] text-base text-[#3d1c4e]"
                >
                  <span>
                    {index === 0 ? "👑" : `${index + 1}.`} {entry.playerName}
                  </span>
                  <strong>{entry.score}</strong>
                </li>
              ))}
            </ol>
          )}
          <p className="mono-retro mt-3 text-sm opacity-75">
            Scores are stored in PostgreSQL (top 10 by score). Submissions are rate-limited to 10 per minute per visitor.
          </p>
        </div>
      </div>
    </div>
  );
}
