import Link from "next/link";
import { requireKeeperPage } from "@/lib/auth";
import { SettingsForm } from "@/components/dashboard/CommunityManagers";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SettingsDashboardPage() {
  await requireKeeperPage();
  const settings = await getSiteSettings();
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-sm sm:text-base">Site settings</h1>
        <p className="mono-retro mt-1 text-lg text-ink/80">
          These four fields feed the public homepage header, intro and postbox note. Saved to the site_settings table.
        </p>
      </div>
      <SettingsForm initialSettings={settings} />
      <div className="panel space-y-2 p-4">
        <h2 className="text-sm">Environment &amp; integrations</h2>
        <ul className="space-y-1 font-[family-name:var(--font-mono-retro)] text-base">
          <li>Gemini key: server-side <code>GEMINI_API_KEY</code> only. The chat panel reports the real status.</li>
          <li>Supabase SQL, RLS policies and Edge Function source live in <code>/supabase</code>.</li>
          <li>Database: PostgreSQL + Drizzle ORM. Sessions and passwords never leave the server.</li>
        </ul>
        <Link href="/dashboard/account" className="btn btn-sm btn-cyan">Account settings →</Link>
      </div>
    </div>
  );
}
