import { AccountForm } from "@/components/dashboard/CommunityManagers";
import { requireKeeperPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountDashboardPage() {
  const user = await requireKeeperPage();
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-sm sm:text-base">Keeper account</h1>
        <p className="mono-retro mt-1 text-lg text-ink/80">Update your display name or rotate your password.</p>
      </div>
      <AccountForm user={{ email: user.email, displayName: user.displayName, role: user.role }} />
    </div>
  );
}
