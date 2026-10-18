import Link from "next/link";
import { GuestbookBoard } from "@/components/site/GuestbookBoard";
import { getGuestbook, getSiteStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function GuestbookPage() {
  const [entries, stats] = await Promise.all([getGuestbook(true), getSiteStats()]);
  return (
    <div className="space-y-4 pb-4">
      <header className="panel overflow-hidden">
        <div className="window-bar">
          <span>THE_GUESTBOOK.HTM</span>
          <span aria-hidden>💌</span>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h1 className="text-base leading-relaxed sm:text-xl">The Starloom guestbook</h1>
            <p className="mono-retro mt-2 text-lg leading-snug">
              {entries.length} notes pinned to the wall, {stats.visitor_count ?? stats.visit_count ?? 0} visitors, and one
              very nosy keeper who reads every single message. Say hello, tell Pudding about a dream, or recommend a
              story.
            </p>
          </div>
          <div className="rounded-lg border-2 border-dashed border-[#6b3fa0] bg-[#fff0b8] p-3">
            <p className="font-[family-name:var(--font-pixel)] text-[0.45rem] text-[#3d1c4e]">HOUSE RULES</p>
            <ul className="mt-1 space-y-1 font-[family-name:var(--font-mono-retro)] text-base text-[#3d1c4e]">
              <li>✦ Small dreamers read this: keep it gentle.</li>
              <li>✦ No links, no spam, no scary things.</li>
              <li>✦ The keeper can hide any note.</li>
            </ul>
            <Link href="/dashboard" className="btn btn-sm btn-cyan mt-2">Keeper? Moderate here</Link>
          </div>
        </div>
      </header>
      <GuestbookBoard initialEntries={entries} />
    </div>
  );
}
