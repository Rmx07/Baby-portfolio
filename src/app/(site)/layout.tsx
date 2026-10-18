import type { ReactNode } from "react";
import { RetroFooter, RetroHeader } from "@/components/site/Chrome";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <div className="min-h-screen">
      <RetroHeader siteTitle={settings.siteTitle} tagline={settings.tagline} />
      <main id="main" className="mx-auto w-full max-w-6xl px-3 pt-5 sm:px-5">
        {children}
      </main>
      <RetroFooter siteTitle={settings.siteTitle} />
    </div>
  );
}
