"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useExperience } from "@/components/experience/ExperienceProvider";

export type FlipStory = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  emoji: string;
  accent: string;
  pages: { id: number; pageNumber: number; body: string; art: string }[];
};

const COVER_COLORS: Record<string, string> = {
  pink: "#ffd3e8",
  cyan: "#ccfbf1",
  lavender: "#e9d9ff",
  yellow: "#fff3bf",
  peach: "#ffe0cf",
  mint: "#d6f8e4",
};

export function Flipbook({ stories, heading = "The bedtime-story flipbook" }: { stories: FlipStory[]; heading?: string }) {
  const { playSfx, reduceMotion } = useExperience();
  const [storyIndex, setStoryIndex] = useState(0);
  const story = stories[storyIndex] ?? stories[0];
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const frameRef = useRef<HTMLDivElement | null>(null);
  const touchStart = useRef<number | null>(null);
  const total = story?.pages.length ?? 0;
  const page = story?.pages[pageIndex];

  const go = useCallback(
    (delta: number) => {
      if (!story) return;
      const nextIndex = Math.min(total - 1, Math.max(0, pageIndex + delta));
      if (nextIndex === pageIndex) {
        playSfx("err");
        return;
      }
      setDirection(delta > 0 ? "next" : "prev");
      setPageIndex(nextIndex);
      playSfx("page");
    },
    [pageIndex, playSfx, story, total],
  );

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      }
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [go]);

  if (!story) {
    return (
      <div className="panel p-5">
        <p className="pixel-label">The library is empty</p>
        <p className="mono-retro mt-2 text-lg">
          No bedtime stories are published yet. The keeper can add one from the dashboard in about a minute.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs sm:text-sm">{heading}</h3>
        {stories.length > 1 ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a bedtime story">
            {stories.map((option, index) => (
              <button
                key={option.id}
                type="button"
                className={`btn btn-sm ${index === storyIndex ? "btn-pink" : "btn-ghost"}`}
                aria-pressed={index === storyIndex}
                onClick={() => {
                  setStoryIndex(index);
                  setPageIndex(0);
                  playSfx("page");
                }}
              >
                {option.emoji} {option.title.split(" ").slice(0, 2).join(" ")}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div
        ref={frameRef}
        tabIndex={0}
        role="group"
        aria-label={`Flipbook: ${story.title}. Use the previous and next buttons, or the left and right arrow keys.`}
        className="panel overflow-hidden focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-dashed focus-visible:outline-[#ff4fa3]"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return;
          const end = event.changedTouches[0]?.clientX ?? touchStart.current;
          const dx = end - touchStart.current;
          if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
          touchStart.current = null;
        }}
      >
        <div className="window-bar">
          <span className="truncate">STORYBOOK.EXE — {story.title}</span>
          <span aria-hidden>▶ ◀</span>
        </div>
        <div className="grid gap-0 md:grid-cols-[0.9fr_1.4fr]">
          <div
            className="relative flex min-h-[200px] flex-col items-center justify-center gap-2 border-b-[3px] border-[#3d1c4e] p-5 text-center md:border-b-0 md:border-r-[3px]"
            style={{ background: COVER_COLORS[story.accent] ?? "#e9d9ff" }}
          >
            <div className="absolute inset-0 checker opacity-40" aria-hidden />
            <span className={`relative text-6xl ${reduceMotion ? "" : "animate-bob"}`} aria-hidden>
              {page?.art ?? story.emoji}
            </span>
            <p className="relative font-[family-name:var(--font-pixel)] text-[0.5rem] leading-relaxed text-[#3d1c4e]">
              {story.title}
            </p>
            <p className="relative font-[family-name:var(--font-mono-retro)] text-base text-[#3d1c4e]">{story.summary}</p>
          </div>

          <div key={`${story.id}-${pageIndex}`} className={`ruled p-4 sm:p-6 ${reduceMotion ? "" : direction === "next" ? "animate-pop" : "animate-pop"}`}>
            <p className="pixel-label opacity-70">
              Page {pageIndex + 1} of {total}
            </p>
            <p className="mt-3 font-[family-name:var(--font-mono-retro)] text-xl leading-snug sm:text-2xl" style={{ minHeight: "7.5rem" }}>
              {page?.body}
            </p>
            <div className="mt-4 grid gap-2">
              <div className="h-3 w-full overflow-hidden rounded-full border-2 border-[#3d1c4e] bg-[#fff6df]">
                <div
                  className="h-full bg-[#ff4fa3] transition-[width] duration-300"
                  style={{ width: `${((pageIndex + 1) / total) * 100}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button type="button" className="btn btn-sm" onClick={() => go(-1)} disabled={pageIndex === 0}>
                    ◀ Back
                  </button>
                  <button type="button" className="btn btn-sm btn-pink" onClick={() => go(1)} disabled={pageIndex >= total - 1}>
                    Turn page ▶
                  </button>
                </div>
                <span className="font-[family-name:var(--font-mono-retro)] text-sm opacity-70" aria-live="polite">
                  {pageIndex === total - 1 ? "The end. Yawn for one more." : "Arrow keys turn pages too."}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Jump to a story page">
                {story.pages.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPageIndex(index);
                      playSfx("page");
                    }}
                    aria-label={`Go to page ${index + 1}`}
                    aria-current={index === pageIndex ? "page" : undefined}
                    className={`h-8 w-8 rounded-md border-2 border-[#3d1c4e] font-[family-name:var(--font-pixel)] text-[0.5rem] ${
                      index === pageIndex ? "bg-[#ffd84d]" : "bg-[#fff6df]"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
