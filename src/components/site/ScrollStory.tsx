"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { ORIGIN_CHAPTERS } from "@/lib/content";

export function ScrollStory() {
  const { reduceMotion } = useExperience();
  const [seen, setSeen] = useState<number[]>([0]);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-origin-chapter]"));
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number((entry.target as HTMLElement).dataset.originChapter);
          setSeen((current) => (current.includes(index) ? current : [...current, index].sort((a, b) => a - b)));
        });
      },
      { threshold: 0.25, rootMargin: "-10% 0px -20% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));

    const onScroll = () => {
      const node = sectionRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)));
      setProgress(scrolled);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative">
      <div className="sticky top-2 z-20 mx-auto mb-4 w-full max-w-md" aria-hidden>
        <div className="h-3 overflow-hidden rounded-full border-2 border-[#3d1c4e] bg-[#fff6df] shadow-[2px_2px_0_#7a3f8f]">
          <div className="h-full bg-[linear-gradient(90deg,#ff4fa3,#ffd84d,#35e1e8)]" style={{ width: `${Math.max(4, progress * 100)}%` }} />
        </div>
        <p className="mt-1 text-center font-[family-name:var(--font-pixel)] text-[0.4rem] text-ink/70">
          ORIGIN STORY — SCROLL TO READ · {Math.round(progress * 100)}%
        </p>
      </div>

      {!reduceMotion ? (
        <div className="pointer-events-none absolute top-16 bottom-0 left-4 z-0 hidden w-1 rounded-full border border-[#6b3fa0] bg-[#fff6df] sm:block" aria-hidden>
          <div
            className="w-full rounded-full bg-[#ff4fa3]"
            style={{ height: `${Math.max(2, progress * 100)}%`, transition: "height 120ms linear" }}
          />
        </div>
      ) : null}

      <div className="space-y-5 sm:pl-10">
        {ORIGIN_CHAPTERS.map((chapter, index) => {
          const isSeen = seen.includes(index);
          return (
            <article
              key={chapter.id}
              data-origin-chapter={index}
              className="panel overflow-hidden transition-all duration-500"
              style={{
                opacity: reduceMotion || isSeen ? 1 : 0.35,
                transform: reduceMotion || isSeen ? "none" : "translateY(14px)",
              }}
            >
              <div className="window-bar">
                <span>{chapter.kicker}</span>
                <span aria-hidden>{chapter.stamp}</span>
              </div>
              <div className={`grid gap-4 p-4 sm:p-5 ${index === 1 ? "md:grid-cols-[1fr_0.7fr]" : ""}`}>
                <div>
                  <h3 className="text-sm text-ink sm:text-base">{chapter.title}</h3>
                  <p className="mt-2 font-[family-name:var(--font-mono-retro)] text-lg leading-snug text-ink sm:text-xl">
                    {chapter.body}
                  </p>
                  <p className="mt-3 font-[family-name:var(--font-pixel)] text-[0.42rem] text-ink/60">
                    CHAPTER {String(index + 1).padStart(2, "0")} OF {String(ORIGIN_CHAPTERS.length).padStart(2, "0")} ·{" "}
                    {isSeen ? "READ ✓" : "SCROLLING…"}
                  </p>
                </div>
                {index === 1 ? (
                  <figure className="relative overflow-hidden rounded-lg border-[3px] border-[#3d1c4e] bg-[#ffe3f1]">
                    <Image
                      src="/images/pudding-portrait.webp"
                      alt="Pixel-art portrait of Pudding Mallowmoon yawning, with a crescent nightcap and a dream bubble"
                      width={640}
                      height={640}
                      sizes="(max-width: 768px) 90vw, 280px"
                      className="h-full w-full object-cover"
                    />
                    <figcaption className="border-t-[3px] border-[#3d1c4e] bg-[#fff6df] p-2 font-[family-name:var(--font-mono-retro)] text-sm text-[#3d1c4e]">
                      Pudding, modelling the four-and-a-half-point star known as Tibby.
                    </figcaption>
                  </figure>
                ) : null}
                {index === 3 ? (
                  <div className="rounded-lg border-2 border-dashed border-[#6b3fa0] bg-[#fff0b8] p-3 sm:col-span-2">
                    <p className="font-[family-name:var(--font-pixel)] text-[0.45rem] text-[#3d1c4e]">THE FOURTH RULE</p>
                    <p className="mt-1 font-[family-name:var(--font-mono-retro)] text-lg text-[#3d1c4e]">
                      Kept in a secret file. Three sleepy letters (z-z-z) or five boops of the nightcap star will open it
                      for you. That is not a placeholder — it actually works.
                    </p>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
