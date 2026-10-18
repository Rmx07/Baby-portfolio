import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  guestbookEntries,
  projects,
  scores,
  siteSettings,
  siteStats,
  stories,
  storyPages,
  users,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";

export const DEMO_EMAIL = "keeper@starloom.dream";
export const DEMO_PASSWORD = "dreamer123";

const projectSeed = [
  {
    slug: "dream-dispatch-3000",
    title: "Dream Dispatch 3000",
    tagline: "A cloudtop post office that routes dreams to the exact sleeper who needs them.",
    description:
      "Every night at 9:47pm, the Half-Sleep Hour opens its postbox. Pudding sorts drifting dream envelopes by feeling rather than address: one spoonful of courage for a nervous first-grader, a lavender balloon for someone missing their grandmother, a tiny brass marching band for a very tired night nurse. The Dispatch runs on three rules: no dream is too small, no dreamer is unreachable, and all envelopes must be sealed with a yawn. Visitors can trace a delivery route, peek inside the sorting room, and leave a note for a stranger's dream.",
    dreamType: "delivery",
    accent: "pink",
    artKey: "dispatch",
    year: "1996",
    sortOrder: 1,
  },
  {
    slug: "star-bakery",
    title: "The Star Bakery",
    tagline: "Lullaby loaves, memory tarts, and cookies that hum you back to sleep.",
    description:
      "Tucked behind a frosting waterfall, the Star Bakery bakes the snacks that dreams eat. Pudding's signature bake is the Three-Minute Lullaby Loaf: one cup of moonsugar, two spoonfuls of somebody's favourite rainy afternoon, and a pinch of glitter that remembers your name. The oven is a retired crescent moon who only works when someone is yawning nearby. The bakery's menu changes with the weather of the dreamer — stormy nights get cinnamon, homesick nights get warm peach, and first-day-of-school nights get a very brave little lemon star.",
    dreamType: "bakery",
    accent: "yellow",
    artKey: "bakery",
    year: "1997",
    sortOrder: 2,
  },
  {
    slug: "lullaby-library",
    title: "The Lullaby Library",
    tagline: "Borrow a bedtime story, return it with the ending you actually wanted.",
    description:
      "A floating library where the shelves are made of candy ribbon and every book is checked out by a dream. Pudding is the night librarian: she mends torn pages with star thread, files runaway characters back into their chapters, and lets readers write their own final page in the margin. The collection includes 4,001 stories about the moon, seventeen about a very shy comet, and one handwritten book that only appears when someone cannot fall asleep. Reading here is always quiet, always safe, and always ends with the lights low.",
    dreamType: "story",
    accent: "lavender",
    artKey: "library",
    year: "1998",
    sortOrder: 3,
  },
  {
    slug: "pocket-nebula-radio",
    title: "Pocket Nebula Radio",
    tagline: "A tiny radio station broadcasting lullabies from a comet's tail.",
    description:
      "Pocket Nebula Radio is a two-watt station that only comes in when you are nearly asleep. Pudding hosts the midnight hour, playing music-box lullabies, weather reports from other people's dreams, and listener dedications whispered into a tin can. The transmitter is a soda bottle full of starlight, and the antenna is a knitting needle she borrowed from a cloud. If you tune in on a quiet night, you can hear her say your name between songs.",
    dreamType: "sound",
    accent: "cyan",
    artKey: "party",
    year: "1999",
    sortOrder: 4,
  },
];

const storySeed = [
  {
    slug: "the-moon-that-forgot-to-nap",
    title: "The Moon That Forgot to Nap",
    summary:
      "The moon has been awake for four billion years. Pudding packs a picnic of cloud sandwiches and teaches it how to take a nap.",
    accent: "yellow",
    emoji: "🌙",
    sortOrder: 1,
    pages: [
      {
        art: "🌛",
        body: "Once, the moon stayed up for four billion years without a single nap. It was very proud of this, and very, very tired. Its edges had gone all soft and its light kept flickering like a birthday candle in a draft.",
      },
      {
        art: "🧺",
        body: "Pudding Mallowmoon climbed the Starloom Staircase with a picnic basket full of cloud sandwiches, one warm peach, and a blanket stitched from old night skies. \"I have come,\" she said politely, \"to teach you how to nap.\"",
      },
      {
        art: "🌌",
        body: "\"I am far too important to nap,\" said the moon. But it yawned so wide that three stars fell out of its pocket. Pudding pretended not to notice, which is what good friends do.",
      },
      {
        art: "🌠",
        body: "So Pudding made a lullaby out of the sound of rain on a tin roof, and the moon listened with one eye and then with both, and then with no eyes at all. It napped for exactly nine minutes and woke up so shiny that the whole sky had to wear sunglasses.",
      },
      {
        art: "💤",
        body: "Now, every night, the moon takes one small nap behind the clouds. If you look very carefully at 9:47pm, you can see Pudding tuck it in. And if you yawn just then — that is the moon saying thank you.",
      },
    ],
  },
  {
    slug: "the-cloud-that-collected-rainbows",
    title: "The Cloud That Collected Rainbows",
    summary:
      "A small cloud hoards every rainbow it meets — until Pudding shows it that a rainbow is only a rainbow if someone else can see it.",
    accent: "pink",
    emoji: "🌈",
    sortOrder: 2,
    pages: [
      {
        art: "☁️",
        body: "High above the Star Bakery lived a small cloud named Nimbly. Nimbly collected rainbows the way other clouds collect rain: carefully, greedily, and in a very large jar.",
      },
      {
        art: "🫙",
        body: "Nimbly's jar was so full of colours that it glowed at night. But Nimbly never opened it. \"If I let them out,\" it explained to Pudding, \"someone might take one, and then I would be an ordinary grey cloud.\"",
      },
      {
        art: "🎨",
        body: "Pudding thought about this for three whole yawns. Then she painted a tiny rainbow on Nimbly's grey corner with a frosting brush. \"There,\" she said. \"Now you are a rainbow cloud even if you share.\"",
      },
      {
        art: "🌦️",
        body: "Slowly, Nimbly unscrewed the lid. The colours poured out across the whole valley — hot pink over the bakery, turquoise over the library, a stripe of sunny yellow right over a grumpy cat who immediately felt better.",
      },
      {
        art: "✨",
        body: "And Nimbly discovered the very best secret of rainbows: the ones you give away stretch further than the ones you keep. That is why, after a storm, you can often see a small cloud holding a jar — waiting for someone to share the next one with.",
      },
    ],
  },
  {
    slug: "the-very-small-parade",
    title: "A Very Small Parade",
    summary:
      "When the big parade is rained off, Pudding throws a parade that is exactly one millimetre wide — with a thousand participants.",
    accent: "cyan",
    emoji: "🎉",
    sortOrder: 3,
    pages: [
      {
        art: "🎺",
        body: "The Annual Big Dream Parade was cancelled because of a drizzle. One thousand dreamers went home in their paper hats. One thousand drumsticks went quiet.",
      },
      {
        art: "🐛",
        body: "\"Then we will have a very small parade,\" said Pudding, and she invited everyone who had ever felt too small for a big day: beetles, dewdrops, commas, first teeth, and one shy amoeba named Kevin.",
      },
      {
        art: "🎈",
        body: "They marched along the rim of a teacup. The beetles played tiny trumpets made of grass. The dew wore water balloons. Kevin, who had never been in a parade before, carried the flag and glowed with pride.",
      },
      {
        art: "🌈",
        body: "Then someone tipped the teacup, and the parade slid cheerfully into a puddle, where it became a parade of splashes. Nobody minded. Splashes are excellent marchers.",
      },
      {
        art: "💛",
        body: "If your day gets rained off tomorrow, remember Pudding's rule: a parade does not have to be big. It only has to be yours. Bring a grass trumpet. Invite the clouds. Begin.",
      },
    ],
  },
];

const guestbookSeed = [
  { name: "moth.exe", message: "i came for the flashing stars and stayed for the little cloud gal. my inner child just did a kartwheel.", mood: "giddy", status: "approved" },
  { name: "Grandma Pearl", message: "The bakery story made me call my sister. We talked for an hour. Thank you, Pudding.", mood: "cozy", status: "approved" },
  { name: "sleepydan", message: "used the lullaby player at 2am during a night shift. worked a charm. 10/10 dream bubbles.", mood: "sleepy", status: "approved" },
  { name: "PixelRyn", message: "found the secret!! i won't spoil it but type the sleepy letters, you'll see. also this site is SO pink and i love it.", mood: "sparkly", status: "approved" },
  { name: "Moon Unit 7", message: "Pudding delivered me a dream about a library with a ladder made of ribbon. Best mail I ever got.", mood: "dreamy", status: "approved" },
  { name: "tired teacher", message: "the mini game got 41 bubbles out of me on a monday. restored my will to live, honestly.", mood: "giddy", status: "approved" },
  { name: "cloudwren", message: "please add more stories!! my kid asks for 'the rainbow cloud one' every single night now.", mood: "cozy", status: "pending" },
  { name: "anon_star", message: "testing the guestbook... beep boop. also the eye tracking is delightfully unsettling in the cutest way.", mood: "dreamy", status: "pending" },
];

const scoreSeed = [
  { playerName: "moth.exe", score: 62 },
  { playerName: "PixelRyn", score: 58 },
  { playerName: "Grandma Pearl", score: 51 },
  { playerName: "sleepydan", score: 47 },
  { playerName: "Moon Unit 7", score: 39 },
  { playerName: "tiny amoeba", score: 24 },
];

const settingsSeed = [
  ["siteTitle", "Pudding's Starloom Dream Dispatch"],
  ["tagline", "Hand-built dreams, delivered nightly from a cloudtop post office since 1996."],
  [
    "aboutBlurb",
    "Hi! I'm Pudding Mallowmoon — dream engineer, night librarian, and professional yawner. I run the Starloom Dream Dispatch from a post office balanced on three clouds. This is my little corner of the web: stories, dream projects, and one very small parade.",
  ],
  [
    "dispatchNote",
    "The postbox is open. Tonight's route: 14 dreams, 3 tiny parades, 1 extra-soft landing.",
  ],
];

let seedPromise: Promise<void> | null = null;

async function runSeed(): Promise<void> {
  const [{ count: userCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);
  if (userCount === 0) {
    await db
      .insert(users)
      .values({
        email: DEMO_EMAIL,
        displayName: "Pudding Mallowmoon",
        passwordHash: hashPassword(DEMO_PASSWORD),
        role: "keeper",
      })
      .onConflictDoNothing();
  }

  const [{ count: projectCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects);
  if (projectCount === 0) {
    await db.insert(projects).values(projectSeed).onConflictDoNothing();
  }

  const [{ count: storyCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(stories);
  if (storyCount === 0) {
    for (const story of storySeed) {
      const [created] = await db
        .insert(stories)
        .values({
          slug: story.slug,
          title: story.title,
          summary: story.summary,
          accent: story.accent,
          emoji: story.emoji,
          sortOrder: story.sortOrder,
          published: true,
        })
        .returning({ id: stories.id });
      if (created) {
        await db.insert(storyPages).values(
          story.pages.map((page, index) => ({
            storyId: created.id,
            pageNumber: index + 1,
            body: page.body,
            art: page.art,
          })),
        );
      }
    }
  }

  const [{ count: guestCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(guestbookEntries);
  if (guestCount === 0) {
    await db.insert(guestbookEntries).values(guestbookSeed);
  }

  const [{ count: scoreCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scores);
  if (scoreCount === 0) {
    await db.insert(scores).values(scoreSeed);
  }

  await db
    .insert(siteStats)
    .values([
      { key: "visit_count", value: 12847 },
      { key: "click_count", value: 30914 },
      { key: "dreams_delivered", value: 4096 },
      { key: "yawns_shared", value: 8123 },
    ])
    .onConflictDoNothing();

  for (const [key, value] of settingsSeed) {
    await db.insert(siteSettings).values({ key, value }).onConflictDoNothing();
  }
}

/** Idempotent demo seed so the experience feels alive on first load. */
export function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      console.error("Seed failed", error);
    });
  }
  return seedPromise;
}
