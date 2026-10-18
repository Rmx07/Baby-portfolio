import { StoriesManager } from "@/components/dashboard/ContentManagers";
import { requireKeeperPage } from "@/lib/auth";
import { getStories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function StoriesDashboardPage() {
  await requireKeeperPage();
  const stories = await getStories(true);
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-sm sm:text-base">Bedtime stories</h1>
        <p className="mono-retro mt-1 text-lg text-ink/80">
          Stories power the public flipbook. Open “Pages” on any story to write, reorder and delete its pages.
        </p>
      </div>
      <StoriesManager initialStories={stories} />
    </div>
  );
}
