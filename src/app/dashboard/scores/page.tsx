import { ScoresManager } from "@/components/dashboard/CommunityManagers";
import { requireKeeperPage } from "@/lib/auth";
import { getScores } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ScoresDashboardPage() {
  await requireKeeperPage();
  const scores = await getScores(200);
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-sm sm:text-base">Arcade scores</h1>
        <p className="mono-retro mt-1 text-lg text-ink/80">
          Every Dream Bubble Pop submission, newest first by rank. Delete any run to tidy the board.
        </p>
      </div>
      <ScoresManager initialScores={scores} />
    </div>
  );
}
