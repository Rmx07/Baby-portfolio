"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/components/experience/ExperienceProvider";

const CanvasScene = dynamic(() => import("@/components/site/ThreeDreamlingCanvas"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[330px] place-items-center rounded-lg border-[3px] border-dashed border-[#6b3fa0] bg-[#ffe9f6] sm:h-[360px]">
      <div className="text-center">
        <p className="animate-bob text-3xl" aria-hidden>
          🧶
        </p>
        <p className="mt-2 font-[family-name:var(--font-pixel)] text-[0.55rem] text-[#3d1c4e]">winding up the 3D dreamling…</p>
      </div>
    </div>
  ),
});

export function ThreeDreamling() {
  const { reduceMotion } = useExperience();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="min-h-[200px]">
      {visible && enabled ? (
        <CanvasScene reduceMotion={reduceMotion} />
      ) : (
        <div className="grid min-h-[220px] place-items-center rounded-lg border-[3px] border-dashed border-[#6b3fa0] bg-[linear-gradient(135deg,#ffe6f3,#e9d9ff,#ccfbf1)] p-5 text-center">
          <div>
            <p className="text-4xl" aria-hidden>
              🪄☁️
            </p>
            <h3 className="mt-2 text-sm text-[#3d1c4e]">The 3D dreamling is asleep in her envelope</h3>
            <p className="mono-retro mt-1 text-base text-[#3d1c4e] opacity-80">
              A whole Three.js scene is heavy, so she only wakes up when you ask. Her eyes track your pointer once she
              does.
            </p>
            <button type="button" onClick={() => setEnabled(true)} className="btn btn-pink mt-3">
              ✨ Wake the 3D dreamling
            </button>
          </div>
        </div>
      )}
      {enabled ? (
        <button type="button" onClick={() => setEnabled(false)} className="btn btn-sm btn-ghost mt-2">
          😴 Tuck the 3D scene away (saves battery)
        </button>
      ) : null}
    </div>
  );
}
