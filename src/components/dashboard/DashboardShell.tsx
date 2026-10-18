"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { DASHBOARD_NAV } from "@/lib/content";

export function DashboardShell({
  user,
  children,
}: {
  user: { displayName: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside
        className={`border-b-[3px] border-[#3d1c4e] bg-[#3d1c4e] text-[#fff6df] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r-[3px] ${
          open ? "" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b-2 border-dashed border-[#ffd84d]/40 p-3 lg:block">
          <div>
            <p className="font-[family-name:var(--font-pixel)] text-[0.55rem] leading-relaxed text-[#ffd84d]">
              ★ STARLOOM
              <br />
              KEEPER DESK
            </p>
            <p className="mt-1 font-[family-name:var(--font-mono-retro)] text-base text-[#35e1e8]">{user.displayName}</p>
            <p className="font-[family-name:var(--font-mono-retro)] text-sm opacity-70">{user.email}</p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-cyan lg:hidden"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="dashboard-nav"
          >
            {open ? "✕" : "☰"} Menu
          </button>
        </div>
        <nav id="dashboard-nav" aria-label="Keeper dashboard" className={`${open ? "block" : "hidden"} p-2 lg:block`}>
          <ul className="space-y-1">
            {DASHBOARD_NAV.map((item) => {
              const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-[40px] items-center gap-2 rounded-md border-2 px-2 py-1 text-sm font-bold transition-colors ${
                      active
                        ? "border-[#3d1c4e] bg-[#ffd84d] text-[#3d1c4e]"
                        : "border-transparent text-[#fff6df] hover:border-[#ffd84d] hover:bg-[#4b2775]"
                    }`}
                  >
                    <span aria-hidden>{item.emoji}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 space-y-2 border-t-2 border-dashed border-[#ffd84d]/40 pt-3">
            <Link href="/" className="btn btn-sm btn-cyan w-full">
              🌙 View public site
            </Link>
            <button type="button" className="btn btn-sm btn-pink w-full" onClick={logout} disabled={loggingOut}>
              {loggingOut ? "Signing out…" : "🚪 Sign out"}
            </button>
          </div>
          <p className="mt-3 px-1 font-[family-name:var(--font-mono-retro)] text-sm leading-snug opacity-60">
            Dashboard copy is intentionally cleaner than the public site, but it still gets a pixel font and a pink
            button. House rules.
          </p>
        </nav>
      </aside>

      <div className="min-w-0 bg-[#fff6df] text-[#3d1c4e]">
        <header className="sticky top-0 z-20 border-b-[3px] border-[#3d1c4e] bg-[#ffd3e8] px-4 py-2">
          <p className="font-[family-name:var(--font-pixel)] text-[0.55rem] text-[#3d1c4e]">
            KEEPER DASHBOARD · every change here is saved to PostgreSQL
          </p>
        </header>
        <main id="main" className="mx-auto w-full max-w-5xl space-y-4 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
