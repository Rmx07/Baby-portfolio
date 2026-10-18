import Link from "next/link";
import { Flipbook } from "@/components/site/Flipbook";
import { getStoriesWithPages } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const stories = await getStoriesWithPages();
  return (
    <div className="space-y-5 pb-4">
      <header className="panel overflow-hidden">
        <div className="window-bar">
          <span>LULLABY_LIBRARY.HTM</span>
          <span aria-hidden>📚 🌙</span>
        </div>
        <div className="p-4">
          <h1 className="text-base leading-relaxed sm:text-xl">The Lullaby Library</h1>
          <p className="mono-retro mt-2 max-w-3xl text-lg leading-snug">
            Borrow a story, return it with the ending you wanted. Every story here is original, written to be read out
            loud, and ends softly. Turn pages with the buttons, a swipe, or the arrow keys.
          </p>
        </div>
      </header>

      {stories.length === 0 ? (
        <div className="panel p-6 text-center">
          <p className="text-3xl" aria-hidden>🫙</p>
          <p className="mt-2 font-[family-name:var(--font-pixel)] text-[0.6rem]">No stories published yet</p>
          <p className="mono-retro mt-1 text-lg">The keeper can add one from the dashboard story manager.</p>
          <Link href="/dashboard/stories" className="btn btn-sm btn-pink mt-2">Open story manager</Link>
        </div>
      ) : (
        <>
          <Flipbook stories={stories} heading="Choose a book, then turn the pages" />
          <section aria-labelledby="shelf-heading">
            <h2 id="shelf-heading" className="mb-2 text-sm">On the shelf</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <Link key={story.id} href={`/stories/${story.slug}`} className="panel p-4 transition-transform hover:-translate-y-0.5">
                  <p className="text-3xl" aria-hidden>{story.emoji}</p>
                  <h3 className="mt-1 text-xs">{story.title}</h3>
                  <p className="mono-retro mt-1 text-base leading-snug">{story.summary}</p>
                  <p className="mt-2 font-[family-name:var(--font-pixel)] text-[0.45rem]">{story.pages.length} pages · read →</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
