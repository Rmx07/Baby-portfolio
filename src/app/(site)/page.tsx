import Image from "next/image";
import Link from "next/link";
import { CHARACTER, ART_IMAGES, FAQS } from "@/lib/content";
import { getGuestbook, getProjects, getScores, getSiteSettings, getSiteStats, getStoriesWithPages } from "@/lib/data";
import { DreamlingCharacter } from "@/components/site/Character";
import { ScrollStory } from "@/components/site/ScrollStory";
import { Flipbook } from "@/components/site/Flipbook";
import { DreamBubbleGame } from "@/components/site/MiniGame";
import { GuestbookBoard } from "@/components/site/GuestbookBoard";
import { BedtimeChat } from "@/components/site/BedtimeChat";
import { ThreeDreamling } from "@/components/site/ThreeDreamling";
import { ClickCounter, DreamRoute, ExperienceConsole, MusicBoxPanel } from "@/components/site/Interactives";
import { RetroBadge } from "@/components/site/Chrome";
import { ACCENTS } from "@/lib/content";

export const dynamic = "force-dynamic";

function SectionHeading({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <p className="mb-1 inline-flex items-center gap-2 rounded-full border-2 border-[#3d1c4e] bg-[#ffd84d] px-2 py-0.5 font-[family-name:var(--font-pixel)] text-[0.45rem] text-[#3d1c4e]">
          {kicker}
        </p>
        <h2 id={id} className="text-sm leading-relaxed sm:text-lg">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export default async function HomePage() {
  const [settings, projects, stories, guestbook, scores, stats] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getStoriesWithPages(),
    getGuestbook(true),
    getScores(8),
    getSiteStats(),
  ]);

  return (
    <div className="space-y-10 pb-4">
      {/* ---------------- HERO / CHARACTER ---------------- */}
      <section aria-labelledby="pudding-heading" id="pudding" className="grid scroll-mt-4 gap-4 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="panel overflow-hidden">
          <div className="window-bar">
            <span>CHARACTER.SWF — meet the dreamer</span>
            <span aria-hidden>✦ ♡ ✦</span>
          </div>
          <div className="checker p-3 sm:p-4">
            <DreamlingCharacter />
            <p className="mt-2 text-center font-[family-name:var(--font-mono-retro)] text-base text-[#3d1c4e]">
              Live eye tracking, hover reactions, mismatched socks. Boop responsibly.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel overflow-hidden">
            <div className="window-bar">
              <span>WELCOME.TXT</span>
              <span aria-hidden>🌷</span>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <RetroBadge tone="#ffd84d">original character</RetroBadge>
                <RetroBadge tone="#35e1e8">dream dispatch</RetroBadge>
                <RetroBadge tone="#c9a7ff">since 1996</RetroBadge>
              </div>
              <h1 id="pudding-heading" className="text-base leading-relaxed sm:text-xl">
                <span className="rainbow-text">{CHARACTER.name}</span>
              </h1>
              <p className="font-[family-name:var(--font-pixel)] text-[0.55rem] leading-relaxed text-ink">
                {CHARACTER.role} · {CHARACTER.workplace}
              </p>
              <p className="font-[family-name:var(--font-mono-retro)] text-lg leading-snug text-ink sm:text-xl">
                {settings.aboutBlurb}
              </p>
              <p className="font-[family-name:var(--font-mono-retro)] text-lg leading-snug text-ink">
                {CHARACTER.bio}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="#origin" className="btn btn-sm btn-pink">
                  📖 Read her origin
                </Link>
                <Link href="#stories" className="btn btn-sm btn-cyan">
                  🌙 Borrow a story
                </Link>
                <Link href="#chat" className="btn btn-sm btn-lav">
                  💤 Ask for a dream
                </Link>
              </div>
            </div>
          </div>

          <div className="panel-invert p-4">
            <p className="font-[family-name:var(--font-pixel)] text-[0.5rem] text-[#ffd84d]">TONIGHT&apos;S POSTBOX</p>
            <p className="mt-2 font-[family-name:var(--font-mono-retro)] text-lg leading-snug text-[#fff6df]">
              {settings.dispatchNote}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CHARACTER.stats.map((stat) => (
                <div key={stat.label} className="rounded-md border-2 border-[#ffd84d] bg-[#3d1c4e] p-2 text-center">
                  <p className="font-[family-name:var(--font-pixel)] text-[0.55rem] text-[#35e1e8]">{stat.value}</p>
                  <p className="font-[family-name:var(--font-mono-retro)] text-sm leading-tight text-[#fff6df]">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 font-[family-name:var(--font-mono-retro)] text-base text-[#fff6df]/85">
              Visitor <strong className="text-[#ffd84d]">{stats.visit_count ?? 0}</strong> · clicks{" "}
              <strong className="text-[#35e1e8]">{stats.click_count ?? 0}</strong> · yawns shared{" "}
              <strong className="text-[#ff8fc5]">{stats.yawns_shared ?? 0}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- ORIGIN ---------------- */}
      <section aria-labelledby="origin-heading" id="origin" className="scroll-mt-4">
        <SectionHeading id="origin-heading" kicker="origin story" title="How a cloud sneezed a dream engineer into being">
          <p className="max-w-sm font-[family-name:var(--font-mono-retro)] text-base opacity-90">
            A scroll-driven story in five small chapters. Motion is optional; reading is not.
          </p>
        </SectionHeading>
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <ScrollStory />
          <aside className="space-y-4">
            <div className="panel overflow-hidden">
              <div className="window-bar">
                <span>FACT_SHEET.DOC</span>
                <span aria-hidden>🌷</span>
              </div>
              <dl className="divide-y-2 divide-dashed divide-[#c9a7ff] p-4 text-ink">
                {[
                  ["Also known as", CHARACTER.nickname],
                  ["Pronouns", CHARACTER.pronouns],
                  ["Height", CHARACTER.height],
                  ["Birthday", CHARACTER.birthday],
                  ["Favourite sound", CHARACTER.favouriteSound],
                  ["Favourite snack", CHARACTER.favouriteSnack],
                  ["Best at", CHARACTER.bestAt],
                  ["Worst at", CHARACTER.worstAt],
                  ["Accessory", CHARACTER.accessory],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[0.8fr_1.2fr] gap-2 py-2">
                    <dt className="font-[family-name:var(--font-pixel)] text-[0.45rem] leading-relaxed">{label}</dt>
                    <dd className="font-[family-name:var(--font-mono-retro)] text-base leading-snug">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="panel overflow-hidden">
              <div className="window-bar">
                <span>PORTRAIT.PNG</span>
                <span aria-hidden>🎨</span>
              </div>
              <Image
                src="/images/pudding-hero.webp"
                alt="Full-body pixel art of Pudding Mallowmoon holding a candy-striped bubble wand, surrounded by sleepy dream bubbles"
                width={1024}
                height={1024}
                sizes="(max-width: 1024px) 92vw, 380px"
                className="w-full bg-[#fff0dd] object-contain"
              />
              <p className="border-t-[3px] border-[#3d1c4e] bg-[#fffaf0] p-3 font-[family-name:var(--font-mono-retro)] text-base text-[#3d1c4e]">
                Original character artwork, made for this site. Pudding is not related to any existing dream baby —
                she has her own nightcap, her own star, and her own opinions about toast.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------- PROJECTS ---------------- */}
      <section aria-labelledby="projects-heading" id="projects" className="scroll-mt-4">
        <SectionHeading id="projects-heading" kicker="dream projects" title="Three (and a bit) imaginative projects from the night shift">
          <p className="font-[family-name:var(--font-mono-retro)] text-base opacity-90">
            {projects.length} published · managed from the keeper dashboard
          </p>
        </SectionHeading>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project, index) => {
            const art = ART_IMAGES[project.artKey] ?? ART_IMAGES.dispatch;
            const accent = ACCENTS[project.accent] ?? ACCENTS.pink!;
            return (
              <article key={project.id} className={`panel overflow-hidden ${index === 0 ? "md:col-span-2" : ""}`}>
                <div className="window-bar">
                  <span className="truncate">
                    {project.year} · {project.dreamType.toUpperCase()}
                  </span>
                  <span aria-hidden>✦</span>
                </div>
                <div className={`grid gap-0 ${index === 0 ? "md:grid-cols-[1.05fr_1fr]" : ""}`}>
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b-[3px] border-[#3d1c4e] md:border-b-0 md:border-r-[3px]">
                    <Image src={art.src} alt={art.alt} fill sizes="(max-width: 768px) 92vw, 520px" className="object-cover" />
                  </div>
                  <div className="space-y-2 p-4" style={{ background: accent.bg }}>
                    <p className="chip">{project.dreamType} dream</p>
                    <h3 className="text-sm text-[#3d1c4e] sm:text-base">{project.title}</h3>
                    <p className="font-[family-name:var(--font-mono-retro)] text-lg font-semibold leading-snug text-[#3d1c4e]">
                      {project.tagline}
                    </p>
                    <p className="line-clamp-4 font-[family-name:var(--font-mono-retro)] text-base leading-snug text-[#3d1c4e]/85">
                      {project.description}
                    </p>
                    <Link href={`/projects/${project.slug}`} className="btn btn-sm btn-pink">
                      Open dream file →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---------------- ROUTE + AUDIO + CONSOLE ---------------- */}
      <section aria-labelledby="journey-heading" id="journey" className="scroll-mt-4 space-y-4">
        <SectionHeading id="journey-heading" kicker="interactive" title="The dream-delivery route, the music box & your comfort controls" />
        <DreamRoute />
        <div className="grid gap-4 lg:grid-cols-3">
          <MusicBoxPanel />
          <ExperienceConsole />
          <ClickCounter />
        </div>
      </section>

      {/* ---------------- STORIES ---------------- */}
      <section aria-labelledby="stories-heading" id="stories" className="scroll-mt-4">
        <SectionHeading id="stories-heading" kicker="story corner" title="The bedtime-story flipbook">
          <Link href="/stories" className="btn btn-sm btn-cyan">
            📚 Visit the library
          </Link>
        </SectionHeading>
        <Flipbook stories={stories} heading="Turn a page with a button, a swipe, or the arrow keys" />
      </section>

      {/* ---------------- ARCADE ---------------- */}
      <section aria-labelledby="play-heading" id="play" className="scroll-mt-4">
        <SectionHeading id="play-heading" kicker="arcade" title="Dream Bubble Pop — instructions, scoring and restart">
          <p className="font-[family-name:var(--font-mono-retro)] text-base opacity-90">
            Actually playable. Scores persist in PostgreSQL.
          </p>
        </SectionHeading>
        <DreamBubbleGame
          initialScores={scores.map((score) => ({ id: score.id, playerName: score.playerName, score: score.score }))}
        />
      </section>

      {/* ---------------- 3D ---------------- */}
      <section aria-labelledby="three-heading" id="three" className="scroll-mt-4">
        <SectionHeading id="three-heading" kicker="interactive 3d" title="Pudding, spun from triangles (Three.js, on demand)" />
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel overflow-hidden">
            <div className="window-bar">
              <span>DREAMLING_3D.WRL</span>
              <span aria-hidden>🧊</span>
            </div>
            <div className="p-4">
              <ThreeDreamling />
            </div>
          </div>
          <div className="panel space-y-3 p-4">
            <h3 className="text-sm">About the 3D dreamling</h3>
            <p className="font-[family-name:var(--font-mono-retro)] text-lg leading-snug">
              A hand-modelled low-poly Pudding: peach sphere body, lavender cone nightcap, glowing octahedron star, and
              pupils that chase your pointer. Wave her arm, spin her around, or put her back to sleep.
            </p>
            <ul className="space-y-1 font-[family-name:var(--font-mono-retro)] text-base">
              <li>✦ Loaded lazily — the Three.js bundle never blocks first paint.</li>
              <li>✦ Unplug her any time with “Tuck the 3D scene away”.</li>
              <li>✦ Animation freezes automatically when reduce-motion is on.</li>
              <li>✦ Keyboard: use the arm and spin buttons, which are real buttons.</li>
            </ul>
            <div className="rounded-lg border-2 border-dashed border-[#6b3fa0] bg-[#fff0b8] p-3">
              <p className="font-[family-name:var(--font-pixel)] text-[0.45rem]">CAN&apos;T SEE HER?</p>
              <p className="mt-1 font-[family-name:var(--font-mono-retro)] text-base">
                Some older devices cannot run WebGL. The button will tell you and the SVG Pudding above always works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- GUESTBOOK ---------------- */}
      <section aria-labelledby="guestbook-heading" id="guestbook" className="scroll-mt-4">
        <SectionHeading id="guestbook-heading" kicker="guestbook" title="Sign the guestbook (it saves for real)">
          <Link href="/guestbook" className="btn btn-sm btn-lav">
            💌 Open the full guestbook
          </Link>
        </SectionHeading>
        <GuestbookBoard initialEntries={guestbook.slice(0, 8)} />
        <p className="mt-2 font-[family-name:var(--font-mono-retro)] text-base opacity-80">
          Showing the newest {Math.min(guestbook.length, 8)} of {guestbook.length} approved notes — the full wall lives on the
          guestbook page.
        </p>
      </section>

      {/* ---------------- CHAT ---------------- */}
      <section aria-labelledby="chat-heading" id="chat" className="scroll-mt-4">
        <SectionHeading id="chat-heading" kicker="ai bedtime chat" title="Ask Pudding for a dream idea or a tiny story" />
        <BedtimeChat />
      </section>

      {/* ---------------- HONEST BUILD NOTES ---------------- */}
      <section aria-labelledby="notes-heading" className="scroll-mt-4">
        <SectionHeading
          id="notes-heading"
          kicker="small print"
          title="What is real, what needs a key, and how the backend works"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="panel space-y-2 p-4">
            <h3 className="text-sm">Working right now</h3>
            <ul className="space-y-1 font-[family-name:var(--font-mono-retro)] text-base leading-snug">
              <li>✅ Guestbook saves to PostgreSQL and renders from it.</li>
              <li>✅ Arcade scores save and rank from the database.</li>
              <li>✅ Dream settings save with consent and can be cleared.</li>
              <li>✅ Music box, mute, sound effects, day/night, party mode, torch and sparkles.</li>
              <li>✅ Flipbook, mini-game, 3D model, route animation, easter egg.</li>
              <li>✅ Keeper dashboard with authentication and full CRUD for projects, stories, pages, guestbook and settings.</li>
            </ul>
          </div>
          <div className="panel space-y-2 p-4">
            <h3 className="text-sm">Needs manual configuration</h3>
            <ul className="space-y-1 font-[family-name:var(--font-mono-retro)] text-base leading-snug">
              <li>
                🔑 <strong>Gemini:</strong> set <code>GEMINI_API_KEY</code> on the server. Until then the offline dream
                generator answers and labels itself honestly.
              </li>
              <li>
                🗄 <strong>Supabase path:</strong> SQL migrations, RLS policies and an Edge Function are included in{" "}
                <code>/supabase</code>. This preview runs on the project&apos;s PostgreSQL + Drizzle backend.
              </li>
              <li>
                📮 <strong>Email:</strong> no newsletter or transactional email is included, so none is claimed.
              </li>
            </ul>
            <Link href="/dashboard" className="btn btn-sm btn-mint mt-1">
              Open the keeper dashboard
            </Link>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {FAQS.map((faq) => (
            <details key={faq.q} className="panel p-3">
              <summary className="cursor-pointer font-[family-name:var(--font-pixel)] text-[0.55rem] leading-relaxed">
                {faq.q}
              </summary>
              <p className="mt-2 font-[family-name:var(--font-mono-retro)] text-lg leading-snug">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
