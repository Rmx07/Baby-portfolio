import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/press-start-2p/400.css";
import "@fontsource/vt323/400.css";
import "@fontsource/baloo-2/400.css";
import "@fontsource/baloo-2/600.css";
import "@fontsource/baloo-2/700.css";
import "./globals.css";
import { ExperienceProvider } from "@/components/experience/ExperienceProvider";
import { EasterEggWatcher, Flashlight, SparkleCursor } from "@/components/experience/Effects";

export const metadata: Metadata = {
  title: "Pudding's Starloom Dream Dispatch — a retro dream-world portfolio",
  description:
    "A hand-built 1990s-style dream portfolio starring Pudding Mallowmoon, an original sleepy dream engineer. Bedtime stories, dream projects, a mini game, a guestbook and a music-box lullaby.",
  icons: { icon: "/favicon.svg" },
  keywords: [
    "retro website",
    "pixel art portfolio",
    "dream world",
    "bedtime stories",
    "original character",
    "90s homepage",
  ],
  openGraph: {
    title: "Pudding's Starloom Dream Dispatch",
    description:
      "Original character portfolio and interactive dream world: lullaby music box, bedtime-story flipbook, arcade and guestbook.",
    type: "website",
    images: ["/images/pudding-portrait.webp"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="day" data-chaos="false" data-motion="on" suppressHydrationWarning>
      <body className="antialiased">
        <ExperienceProvider>
          {children}
          <SparkleCursor />
          <Flashlight />
          <EasterEggWatcher />
        </ExperienceProvider>
      </body>
    </html>
  );
}
