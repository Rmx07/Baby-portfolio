import Link from "next/link";
import { notFound } from "next/navigation";
import { Flipbook } from "@/components/site/Flipbook";
import { getStories, getStoryBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story || !story.published) notFound();
  const all = await getStories(false);
  const others = all.filter((item) => item.id !== story.id);

  return (
    <div className="space-y-5 pb-4">
      <nav aria-label="Breadcrumb" className="font-[family-name:var(--font-mono-retro)] text-base">
        <Link href="/stories" className="link-underline">← the library</Link>
        <span className="mx-2">/</span>
        <span>{story.slug}</span>
      </nav>
      <Flipbook
        stories={[
          {
            id: story.id,
            slug: story.slug,
            title: story.title,
            summary: story.summary,
            emoji: story.emoji,
            accent: story.accent,
            pages: story.pages.map((page) => ({ id: page.id, pageNumber: page.pageNumber, body: page.body, art: page.art })),
          },
        ]}
        heading={story.title}
      />
      {others.length > 0 ? (
        <section aria-labelledby="more-stories">
          <h2 id="more-stories" className="mb-2 text-sm">More from the shelf</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {others.map((item) => (
              <Link key={item.id} href={`/stories/${item.slug}`} className="panel p-3">
                <p aria-hidden className="text-2xl">{item.emoji}</p>
                <p className="mt-1 text-xs">{item.title}</p>
                <p className="mono-retro line-clamp-2 text-base">{item.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
