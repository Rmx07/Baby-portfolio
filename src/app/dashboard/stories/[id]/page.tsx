import Link from "next/link";
import { requireKeeperPage } from "@/lib/auth";
import { notFound } from "next/navigation";
import { StoryPagesEditor } from "@/components/dashboard/ContentManagers";
import { getStoryById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function StoryPagesPage({ params }: { params: Promise<{ id: string }> }) {
  await requireKeeperPage();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const story = await getStoryById(id);
  if (!story) notFound();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-sm sm:text-base">Pages · {story.title}</h1>
          <p className="mono-retro mt-1 text-lg text-ink/80">
            {story.summary}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/stories/${story.slug}`} className="btn btn-sm btn-cyan">Preview</Link>
          <Link href="/dashboard/stories" className="btn btn-sm btn-ghost">← All stories</Link>
        </div>
      </div>
      <StoryPagesEditor storyId={story.id} storyTitle={story.title} initialPages={story.pages} />
    </div>
  );
}
