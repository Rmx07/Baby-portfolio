"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/components/experience/ExperienceProvider";

const SPARK_COLORS = ["#ff4fa3", "#35e1e8", "#ffd84d", "#c9a7ff", "#ffa53d", "#2fd3b4"];

export function SparkleCursor() {
  const { sparkles, reduceMotion } = useExperience();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const last = useRef(0);

  useEffect(() => {
    if (!sparkles || reduceMotion) return;
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.pointerEvents = "none";
    host.style.zIndex = "60";
    document.body.appendChild(host);
    containerRef.current = host;

    const onMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - last.current < 45) return;
      last.current = now;
      const dot = document.createElement("span");
      dot.className = "sparkle-dot";
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
      dot.style.background = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]!;
      dot.style.width = dot.style.height = `${6 + Math.round(Math.random() * 10)}px`;
      host.appendChild(dot);
      window.setTimeout(() => dot.remove(), 800);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      host.remove();
      containerRef.current = null;
    };
  }, [sparkles, reduceMotion]);

  return null;
}

export function Flashlight() {
  const { flashlight, reduceMotion, pushToast } = useExperience();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!flashlight) return;
    const setFromEvent = (event: PointerEvent) => {
      const x = Math.round(event.clientX);
      const y = Math.round(event.clientY);
      setPosition({ x, y });
      document.documentElement.style.setProperty("--fx", `${x}px`);
      document.documentElement.style.setProperty("--fy", `${y}px`);
    };
    const center = () => {
      const x = Math.round(window.innerWidth / 2);
      const y = Math.round(window.innerHeight / 2);
      setPosition({ x, y });
      document.documentElement.style.setProperty("--fx", `${x}px`);
      document.documentElement.style.setProperty("--fy", `${y}px`);
    };
    center();
    const onKey = (event: KeyboardEvent) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      const step = event.shiftKey ? 60 : 24;
      setPosition((current) => {
        const next = {
          x: Math.min(window.innerWidth, Math.max(0, current.x + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0))),
          y: Math.min(window.innerHeight, Math.max(0, current.y + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0))),
        };
        document.documentElement.style.setProperty("--fx", `${next.x}px`);
        document.documentElement.style.setProperty("--fy", `${next.y}px`);
        return next;
      });
    };
    window.addEventListener("pointermove", setFromEvent, { passive: true });
    window.addEventListener("pointerdown", setFromEvent, { passive: true });
    window.addEventListener("keydown", onKey);
    pushToast("Torch on. Move your pointer (or arrow keys) to peek around the dream.", "ok");
    return () => {
      window.removeEventListener("pointermove", setFromEvent);
      window.removeEventListener("pointerdown", setFromEvent);
      window.removeEventListener("keydown", onKey);
    };
  }, [flashlight, pushToast]);

  if (!flashlight || reduceMotion) return null;

  return (
    <>
      <div
        className="flashlight-layer"
        style={{ ["--fx" as string]: `${position.x}px`, ["--fy" as string]: `${position.y}px` }}
        aria-hidden="true"
      />
      <p className="pointer-events-none fixed bottom-24 left-1/2 z-[65] -translate-x-1/2 rounded-full border-2 border-[#3d1c4e] bg-[#fff6df] px-3 py-1 text-xs font-bold text-[#3d1c4e] shadow-[3px_3px_0_#3d1c4e]">
        🔦 Torch mode — move to peek. Turn it off in Dream Settings.
      </p>
    </>
  );
}

export function EasterEggModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

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
    <div className="fixed inset-0 z-[95] grid place-items-center bg-[rgba(61,28,78,0.72)] p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="egg-title" className="panel animate-pop w-full max-w-xl overflow-hidden">
        <div className="window-bar">
          <span>SECRET FILE_FOUND.TXT</span>
          <span aria-hidden>✦ ✦ ✦</span>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <p className="chip">🏆 Easter egg unlocked</p>
          <h2 id="egg-title" className="text-lg text-ink sm:text-xl">
            The hidden fourth rule
          </h2>
          <div className="ruled space-y-3 rounded-lg border-2 border-dashed border-purple/60 p-4 text-lg leading-relaxed">
            <p>
              Pudding keeps a rule that is not on the postbox plaque, written in pencil on the inside of the lid:
            </p>
            <p className="font-bold">
              “Leave the light on for whoever comes next — even if they arrive at a strange hour, even if they only
              want to look.”
            </p>
            <p>
              That is you, by the way. You read all the way here, which means the porch light is already on. There is a
              peach on the windowsill with your name on it. Tibby says hello and then pretends he didn&apos;t.
            </p>
          </div>
          <p className="mono-retro text-base opacity-80">
            Hint for collectors: the sleepy letters <strong>z z z</strong> open this file too, and Pudding&apos;s nightcap
            star has a little secret if you click it five times.
          </p>
          <button type="button" ref={closeRef} onClick={onClose} className="btn btn-pink w-full">
            Tuck the secret back in
          </button>
        </div>
      </div>
    </div>
  );
}

export function EasterEggWatcher() {
  const { eggUnlocked } = useExperience();
  const [open, setOpen] = useState(false);
  const previous = useRef(false);

  useEffect(() => {
    // Opening the modal is a reaction to an external event (the egg unlocking),
    // not derived render state, so a guarded setState is intentional here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (eggUnlocked && !previous.current) setOpen(true);
    previous.current = eggUnlocked;
  }, [eggUnlocked]);

  return <EasterEggModal open={open} onClose={() => setOpen(false)} />;
}

export function EasterEggButton() {
  const { eggUnlocked } = useExperience();
  const [open, setOpen] = useState(false);
  if (!eggUnlocked) return null;
  return (
    <>
      <button type="button" className="chip" onClick={() => setOpen(true)}>
        🏆 Found secret
      </button>
      <EasterEggModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
