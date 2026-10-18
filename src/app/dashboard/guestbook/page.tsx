import { GuestbookManager } from "@/components/dashboard/CommunityManagers";
import { requireKeeperPage } from "@/lib/auth";
import { getGuestbook } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function GuestbookDashboardPage() {
  await requireKeeperPage();
  const entries = await getGuestbook(false);
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-sm sm:text-base">Guestbook moderation</h1>
        <p className="mono-retro mt-1 text-lg text-ink/80">
          Notes post live and appear immediately; hide anything unkind and it disappears from the public wall.
        </p>
      </div>
      <GuestbookManager initialEntries={entries} />
    </div>
  );
}
