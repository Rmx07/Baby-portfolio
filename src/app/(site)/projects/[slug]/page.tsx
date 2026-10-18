import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ART_IMAGES, ACCENTS, DREAM_ROUTE } from "@/lib/content";
import { getProjectBySlug, getProjects } from "@/lib/data";
import { DreamRoute, MusicBoxPanel } from "@/components/site/Interactives";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const all = await getProjects();
  const art = ART_IMAGES[project.artKey] ?? ART_IMAGES.dispatch;
  const accent = ACCENTS[project.accent] ?? ACCENTS.pink!;
  const others = all.filter((item) => item.id !== project.id).slice(0, 3);

  return (
    <div className="space-y-5 pb-4">
      <nav aria-label="Breadcrumb" className="font-[family-name:var(--font-mono-retro)] text-base">
        <Link href="/" className="link-underline">← back to the dispatch</Link>
        <span className="mx-2">/</span>
        <span>dream archive</span>
        <span className="mx-2">/</span>
        <span>{project.slug}</span>
      </nav>

      <article className="panel overflow-hidden">
        <div className="window-bar">
          <span>DREAM_FILE_{project.year}.HTM</span>
          <span aria-hidden>✦</span>
        </div>
        <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
          <div className="relative aspect-[16/11] w-full overflow-hidden border-b-[3px] border-[#3d1c4e] lg:border-b-0 lg:border-r-[3px]">
            <Image src={art.src} alt={art.alt} fill sizes="(max-width: 1024px) 92vw, 560px" className="object-cover" priority />
          </div>
          <div className="space-y-3 p-4 sm:p-5" style={{ background: accent.bg }}>
            <div className="flex flex-wrap gap-2">
              <span className="chip">{project.year}</span>
              <span className="chip">{project.dreamType}</span>
              <span className="chip">{project.accent}</span>
            </div>
            <h1 className="text-base leading-relaxed text-[#3d1c4e] sm:text-xl">{project.title}</h1>
            <p className="font-[family-name:var(--font-mono-retro)] text-xl font-bold leading-snug text-[#3d1c4e]">
              {project.tagline}
            </p>
            <p className="whitespace-pre-wrap font-[family-name:var(--font-mono-retro)] text-lg leading-snug text-[#3d1c4e]/90">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/#projects" className="btn btn-sm btn-ghost">All dreams</Link>
              <Link href="/guestbook" className="btn btn-sm btn-pink">Sign the guestbook</Link>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <DreamRoute />
        <div className="space-y-4">
          <MusicBoxPanel />
          <div className="panel p-4">
            <h2 className="text-sm">Night-shift notes</h2>
            <ul className="mt-2 space-y-1 font-[family-name:var(--font-mono-retro)] text-base leading-snug">
              <li>✦ Routing rules: {DREAM_ROUTE.length} stops, five soft landings, zero scary corners.</li>
              <li>✦ Safe for small dreamers and tired grown-ups alike.</li>
              <li>✦ Written by Pudding Mallowmoon and typed on a beige keyboard.</li>
            </ul>
          </div>
        </div>
      </div>

      {others.length > 0 ? (
        <section aria-labelledby="other-dreams">
          <h2 id="other-dreams" className="mb-2 text-sm">Other dream files</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {others.map((item) => (
              <Link key={item.id} href={`/projects/${item.slug}`} className="panel p-3 transition-transform hover:-translate-y-0.5">
                <p className="font-[family-name:var(--font-pixel)] text-[0.45rem]">{item.dreamType}</p>
                <p className="mt-1 text-xs">{item.title}</p>
                <p className="mono-retro mt-1 line-clamp-3 text-base">{item.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
