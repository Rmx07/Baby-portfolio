# Pudding's Starloom Dream Dispatch

An original-character, retro dream-world portfolio and interactive experience. Hand-built pixel styling, bedtime
stories, a music-box lullaby, a playable arcade game, a real guestbook, and a keeper dashboard with authentication and
full CRUD.

**Character:** Pudding Mallowmoon — dream engineer, first class, at the cloudtop Starloom Dream Dispatch. Round peach
marshmallow body, half-lidded lavender eyes, star freckles, periwinkle crescent nightcap with a dangling four-and-a-half
point star named Tibby, stitched rainbow apron, mismatched socks, candy-striped bubble wand full of sleepy stars. She is
an original creation for this project; no existing character or asset was copied, traced, or reused.

---

## 1. Stack (and one honest deviation)

| Layer | What is used |
| --- | --- |
| UI | React 19 + TypeScript, App Router components (server + client split) |
| Styling | Tailwind CSS v4 + a hand-written retro design system in `src/app/globals.css` |
| Fonts | Local `@fontsource` packages (Press Start 2P, VT323, Baloo 2) — no build-time network fetch |
| 3D | Three.js via `@react-three/fiber`, lazy-loaded client-only |
| Audio | Web Audio API synthesis (no audio files, no autoplay) |
| Database | PostgreSQL + Drizzle ORM (`src/db/schema.ts`, idempotent seed in `src/db/seed.ts`) |
| Auth | DB-backed sessions, scrypt password hashing, httpOnly cookies |
| AI | Gemini REST call from a server route, with an honest offline generator fallback |
| Supabase path | SQL migration + RLS policies + Edge Function source in `/supabase` |

> **Deviation from the brief:** the brief asked for React + TypeScript + **Vite**. This repository runs in a
> Next.js App Router fullstack runtime, so the application is built with React + TypeScript on Next.js. All components
> are portable: the site UI lives in `src/components/site`, the dashboard in `src/components/dashboard`, and the data
> layer is isolated in `src/lib` + `src/db`. The Supabase SQL/RLS/Edge Function deliverables are included unchanged so
> the backend can be ported without touching the component tree.

## 2. Running locally

```bash
npm install
cp .env.example .env            # set DATABASE_URL (and optionally GEMINI_API_KEY)
npx drizzle-kit push           # create tables from src/db/schema.ts
npm run dev                    # http://localhost:3000
```

The database seeds itself on first request with realistic demo content: 4 dream projects, 3 original bedtime stories
(15 flipbook pages), 8 guestbook notes (2 pending), 6 arcade scores and site copy. `src/db/seed.ts` is idempotent.

**Demo keeper account**

```
email:    keeper@starloom.dream
password: dreamer123
```

Change the password from **Dashboard → Keeper account** after deploying. You can also create a new keeper from
`/register`.

### Environment variables (see `.env.example`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string used by Drizzle |
| `GEMINI_API_KEY` | no | Enables live Gemini replies; never exposed to the browser |
| `GEMINI_MODEL` | no | Defaults to `gemini-2.5-flash` |
| `NEXT_PUBLIC_SUPABASE_URL` | only for a Supabase port | Public Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | only for a Supabase port | Public anon key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | only for Edge Functions/server | **Never** ship to the client |

## 3. Supabase configuration path

The preview runs on PostgreSQL + Drizzle. To move to Supabase:

1. Create a project at supabase.com, then run `supabase/migrations/0001_init.sql` in the SQL editor (tables, checks,
   indexes, RLS policies, `is_keeper()` helper).
2. Enable Supabase Auth (email/password) and map keeper accounts to `public.users` rows with `role = 'keeper'`, or keep
   the existing custom session flow using the service role from server-only code.
3. Deploy the Edge Function:
   ```bash
   supabase functions deploy dream-chat
   supabase secrets set GEMINI_API_KEY=your_key GEMINI_MODEL=gemini-2.5-flash
   ```
   The function validates input, rate-limits per IP (8/min), calls Gemini with the key from Edge secrets, falls back to
   the offline generator, and stores transcripts with the service role. The browser only calls the function with the
   anon key.
4. Put `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the client and keep
   `SUPABASE_SERVICE_ROLE_KEY` server-side only. No service role key or Gemini key exists anywhere in this repository's
   client code.

RLS summary: public read for published projects/stories/pages, approved guestbook notes, scores, site settings and
stats; anyone may insert a validated guestbook note or score; only keepers may update/delete; `users`, `sessions` and
`chat_messages` are keeper-only. The Supabase anon key is designed to be public — RLS is what protects the data.

## 4. Gemini setup (what is real today)

The server route `POST /api/chat` reads `process.env.GEMINI_API_KEY` and calls
`generativelanguage.googleapis.com`. Every assistant reply is labelled in the UI:

- **GEMINI LIVE** — a real Gemini response (`source: gemini`).
- **OFFLINE GENERATOR** — Pudding's deterministic local generator (`source: local`), used when no key is configured or
  the upstream call fails. The UI explicitly states which mode answered. This project never claims live AI when the key
  is missing.

## 5. Feature checklist

### Tier 1 — core
- Colourful retro homepage + full character introduction (SVG artwork, fact sheet, generated pixel-art portraits)
- Original five-chapter origin story with scroll-driven progress and reveal
- Four imaginative dream projects with individual detail pages
- Character hover reactions, live eye tracking, keyboard “boop” buttons
- Functioning day/night toggle (persisted with consent)
- Hidden Easter egg (type `z z z`, or boop the nightcap star five times)
- Responsive layouts for desktop/tablet/mobile, skip link, semantic headings, visible focus rings,
  reduced-motion support (OS media query + in-app toggle)
- Accessible navigation and keyboard support throughout

### Tier 2 — interactions
- Web Audio music-box lullaby: play, pause, mute (independent of pause), volume; original melody, no audio files
- Flashlight/spotlight cursor with touch alternative (pointer/touch drag) and arrow-key movement; off switch
- Animated dream-delivery route with five interactive stops, replays and a reduced-motion static mode
- Interactive bedtime-story flipbook: buttons, swipe, arrow keys, page dots, progress
- Playable “Dream Bubble Pop”: instructions, scoring, 30s timer, restart, keyboard-friendly holes, persistent
  PostgreSQL leaderboard with optimistic submission
- Sparkle cursor with disable option
- Click counter (per-visit + site-wide total)
- Optional interaction sounds with mute
- Reversible dream-party/chaos mode

### Tier 3 — advanced
- Interactive 3D original character (React Three Fiber): eye tracking, wave, spin, unload button, lazy loading
- Real guestbook: saves and retrieves visitor messages from PostgreSQL, optimistic posting, validation, rate limiting,
  keeper moderation (approve/hide/delete)
- Consent-based persistent preferences: cookie visitor id, database storage, save, disable and clear (also clears chat)
- Bedtime AI chat with Gemini-through-server + labelled offline fallback, transcript persistence and clear-history

### Backend / admin
- Authentication (login, registration, sign-out, password change, scrypt hashes, DB session tokens)
- Keeper dashboard with sidebar navigation: overview, projects, stories (+ page editor), guestbook, scores, chat log,
  settings, account
- Full CRUD for projects, stories and story pages; moderation CRUD for guestbook; delete for scores and chat; editable
  site copy
- Zod validation on every write, in-memory rate limits (guestbook 3/2min, chat 8/min, scores 10/min, login 8/min,
  register 4/5min), loading / empty / error / success states, optimistic updates, seeded demo data

### Deliberately not included (documented, not hidden)
- No email/newsletter or transactional email service
- No image uploads (project artwork is chosen from the included original art set)
- No payment, analytics, or third-party tracking
- Live AI requires a Gemini key; without it the offline generator answers and says so
- A Vite build (see the stack note in section 1)

## 6. Fixes applied after the first review

- **The public homepage was serving the old starter template.** The scaffold's `src/app/page.tsx` was still present
  next to `src/app/(site)/page.tsx`, so `/` resolved to the starter card. The starter page has been deleted; `/` now
  streams the full Starloom homepage (character, origin story, projects, route map, music box, flipbook, arcade, 3D,
  guestbook and chat).
- **Dashboard create forms could fail with a useless error.** Drizzle wraps driver errors, so duplicate-slug errors
  (very likely because slugs are generated from titles) fell through to "something went wrong". All API routes now map
  PostgreSQL SQLSTATE codes (`23505`, `23503`, `23514`, `23502`, `22P02`) to actionable messages, and the project/story
  forms warn about a taken slug before submitting.
- **Broken nav anchor.** The "The Dreamer" nav item pointed at `/#pudding`, which did not exist; the hero section now
  carries that id.
- **Night mode contrast** was reworked (starry plum background, bright pastel panels, dark ink inside panels) and the
  chaos-mode animation no longer uses a CSS filter that would trap fixed overlays.
- **Auth hardening:** `/dashboard/*` is protected by middleware *and* a per-page server guard, so no dashboard data is
  ever streamed to a signed-out visitor.
- **Assets:** all generated artwork was converted to WebP (12 MB → 640 KB total).

## 7. Testing & checks

```bash
npx next typegen          # regenerate route types
npm exec tsc -- --noEmit  # typecheck
npm run lint              # ESLint (Next core web vitals)
npm run build             # production build
curl localhost:3000/api/health
```

Manual verification checklist: play/pause/mute the lullaby; toggle day/night and reload (with consent saved); enable
and disable sparkles, torch, sounds and party mode; flip every story page with a keyboard; finish one arcade round and
confirm the score appears in the board and the dashboard; sign the guestbook and moderate it from the dashboard; ask the
chat for a story and read the source badge; type `z z z`; boop the star five times; create/edit/delete a project and a
story page; clear saved preferences and confirm the database row is gone.

## 8. Publishing & deployment

```bash
git init && git add . && git commit -m "Starloom Dream Dispatch"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Deploy to Vercel (or any Node host): set `DATABASE_URL` (e.g. Supabase pooled connection string) and `GEMINI_API_KEY`
in the project environment, run `npx drizzle-kit push` (or apply the Supabase SQL migration), then deploy. Set
`NODE_ENV=production` so session cookies are marked `Secure`, and rotate the demo keeper password.

## 9. Project map

```
src/app/(site)/            public homepage, project details, story library, guestbook
src/app/dashboard/         authenticated keeper dashboard (sidebar layout)
src/app/login|register/    retro auth screens
src/app/api/               auth, preferences, counter, guestbook, scores, chat, projects, stories, pages, settings, profile, health
src/components/experience/ provider (prefs, audio, counters, egg) + visual effects
src/components/site/       chrome, character, flipbook, mini-game, guestbook, chat, 3D
src/components/dashboard/  CRUD managers and dashboard shell
src/db/                    Drizzle schema + idempotent demo seed
src/lib/                   auth, validation, data access, Gemini, offline dream engine, rate limiting
public/images/             original generated pixel-art assets (Pudding hero/portrait + four dream scenes)
supabase/                  SQL migration with RLS + Edge Function source
```

All artwork, stories, copy and the character are original to this project. Any resemblance to existing dream-themed
characters is coincidental; nothing was copied or traced.
