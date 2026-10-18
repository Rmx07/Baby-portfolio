import Link from "next/link";
import { getDashboardCounts, getGuestbook, getScores, getSiteSettings, getSiteStats, getStories } from "@/lib/data";
import { requireKeeperPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const user = await requireKeeperPage();
  const [counts, settings, stats, pendingEntries, scores, stories] = await Promise.all([
    getDashboardCounts(),
    getSiteSettings(),
    getSiteStats(),
    getGuestbook(false),
    getScores(5),
    getStories(true),
  ]);
  const pending = pendingEntries.filter((entry) => entry.status === "pending").slice(0, 4);
  const cards = [
    { label: "Dream projects", value: counts.projects, href: "/dashboard/projects", emoji: "🛠️", note: "full CRUD" },
    { label: "Bedtime stories", value: counts.stories, href: "/dashboard/stories", emoji: "📚", note: `${counts.pages} pages` },
    { label: "Guestbook notes", value: counts.guestbook, href: "/dashboard/guestbook", emoji: "💌", note: `${counts.pending} pending` },
    { label: "Arcade runs", value: counts.scores, href: "/dashboard/scores", emoji: "🕹️", note: "leaderboard" },
    { label: "Dream chats", value: counts.chats, href: "/dashboard/chat", emoji: "💬", note: "AI + offline" },
    { label: "Visitor count", value: stats.visit_count ?? 0, href: "/dashboard/settings", emoji: "👀", note: "seeded + live" },
  ];

  return (
    <div className="space-y-4">
      <section className="panel overflow-hidden">
        <div className="window-bar">
          <span>KEEPER_OVERVIEW.EXE</span>
          <span aria-hidden>📊</span>
        </div>
        <div className="p-4">
          <h1 className="text-sm leading-relaxed sm:text-base">Good evening, {user.displayName}.</h1>
          <p className="mono-retro mt-1 text-lg leading-snug">
            The Starloom Dream Dispatch is live with <strong>{settings.siteTitle}</strong>. Everything on the public site
            reads from this PostgreSQL database, so edits appear as soon as the next visitor loads a page.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/" className="btn btn-sm btn-pink">🌙 View the public site</Link>
            <Link href="/dashboard/projects" className="btn btn-sm btn-cyan">＋ Add a dream project</Link>
            <Link href="/dashboard/guestbook" className="btn btn-sm btn-mint">Moderate guestbook ({counts.pending})</Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="stats-heading" className="space-y-2">
        <h2 id="stats-heading" className="text-sm">At a glance</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.label} href={card.href} className="panel p-3 transition-transform hover:-translate-y-0.5">
              <p className="flex items-center justify-between font-[family-name:var(--font-pixel)] text-[0.5rem] text-ink">
                <span>{card.label}</span>
                <span aria-hidden>{card.emoji}</span>
              </p>
              <p className="mt-1 font-[family-name:var(--font-pixel)] text-lg text-[#a3143c]">{card.value}</p>
              <p className="mono-retro text-sm text-ink/70">{card.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel overflow-hidden" aria-labelledby="pending-heading">
          <div className="window-bar">
            <span id="pending-heading">AWAITING_YOUR_EYE.LOG</span>
            <span aria-hidden>💌</span>
          </div>
          <div className="space-y-2 p-3">
            {pending.length === 0 ? (
              <p className="mono-retro text-base">No pending guestbook notes. The wall is tidy.</p>
            ) : (
              pending.map((entry) => (
                <div key={entry.id} className="rounded-md border-2 border-[#3d1c4e] bg-[#fff0b8] p-2">
                  <p className="font-[family-name:var(--font-pixel)] text-[0.45rem]">{entry.name} · {entry.mood}</p>
                  <p className="mono-retro text-base leading-snug">{entry.message}</p>
                </div>
              ))
            )}
            <Link href="/dashboard/guestbook" className="btn btn-sm btn-cyan">Open moderation →</Link>
          </div>
        </section>

        <section className="panel overflow-hidden" aria-labelledby="top-heading">
          <div className="window-bar">
            <span id="top-heading">ARCADE_TOP5.LOG</span>
            <span aria-hidden>🏆</span>
          </div>
          <div className="p-3">
            <ol className="space-y-1">
              {scores.map((score, index) => (
                <li key={score.id} className="flex justify-between font-[family-name:var(--font-mono-retro)] text-base">
                  <span>{index + 1}. {score.playerName}</span>
                  <strong>{score.score}</strong>
                </li>
              ))}
              {scores.length === 0 ? <li className="mono-retro text-base">No runs yet.</li> : null}
            </ol>
            <Link href="/dashboard/scores" className="btn btn-sm btn-pink mt-2">Manage scores →</Link>
          </div>
        </section>
      </div>

      <section className="panel overflow-hidden" aria-labelledby="stories-heading">
        <div className="window-bar">
          <span id="stories-heading">LIBRARY_STATUS.LOG</span>
          <span aria-hidden>📚</span>
        </div>
        <div className="grid gap-2 p-3 sm:grid-cols-2">
          {stories.length === 0 ? (
            <p className="mono-retro text-base">No stories yet — add one from the stories manager.</p>
          ) : (
            stories.map((story) => (
              <div key={story.id} className="flex items-center justify-between gap-2 rounded-md border-2 border-[#3d1c4e] bg-[#fffaf0] p-2">
                <span className="mono-retro text-base">
                  {story.emoji} {story.title} · {story.pageCount} pages · {story.published ? "live" : "draft"}
                </span>
                <Link href={`/dashboard/stories/${story.id}`} className="btn btn-sm btn-mint">Pages</Link>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
