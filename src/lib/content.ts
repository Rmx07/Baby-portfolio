export const CHARACTER = {
  name: "Pudding Mallowmoon",
  nickname: "Pud",
  role: "Dream Engineer, First Class",
  workplace: "The Starloom Dream Dispatch",
  pronouns: "she / her",
  height: "two and a half teacups",
  birthday: "the 32nd of Someday (observed on the first foggy October morning)",
  favouriteSound: "rain on a tin roof",
  favouriteSnack: "a peach that has been warmed by a windowsill",
  bestAt: "tying dream envelopes with star thread",
  worstAt: "staying awake through the last page of a book",
  accessory: "Tibby, a not-quite-finished star who lives on the tip of her nightcap",
  bio: "Pudding Mallowmoon is a cloud-soft dream engineer with a crescent nightcap, a bubble wand full of sleepy stars, and a postbag that never quite closes. She has been quietly running the night shift since 1996 — sorting dreams, mending storybooks, and making sure nobody has to fall asleep alone.",
  tagline: "Every sleepy head deserves good mail.",
  hoverReactions: [
    "oh! hello there. i was just counting yawns.",
    "careful — that tickles my nightcap.",
    "you're awake! i'm so sorry. shall i fix that?",
    "tibby says you have a very nice aura. he's shy.",
    "would you like a dream? we have lavender or brave.",
    "shh — the moon is napping behind that cloud.",
    "i saved you a seat on the 9:47 delivery.",
    "you smell like a good story. tell me later?",
  ],
  stats: [
    { label: "Dreams sorted", value: "4,096" },
    { label: "Yawns per hour", value: "12" },
    { label: "Stories mended", value: "311" },
    { label: "Nights on duty", value: "10,660" },
  ],
} as const;

export const ORIGIN_CHAPTERS = [
  {
    id: "chapter-1",
    kicker: "Chapter 01 — A hiccup in the weather",
    title: "She arrived with the fog",
    stamp: "☁️",
    body: "Pudding Mallowmoon was not born so much as condensed. On a foggy October morning in 1996, a cloud over the Starloom Valley sneezed, and out fell a small round person wrapped in a lavender nightcap, holding a note that read: 'Please deliver before morning. Contains one (1) dreamer. Handle gently.' Nobody claimed her and everybody did.",
  },
  {
    id: "chapter-2",
    kicker: "Chapter 02 — Tibby",
    title: "The star who wasn't finished",
    stamp: "⭐",
    body: "The first thing Pudding ever rescued was a star that had fallen out of a constellation's pocket. It had only four and a half points and a terrible self-esteem problem. She named it Tibby, stitched it to her nightcap so it would never fall again, and promised to let it sleep on the pillow when it got big enough. Tibby still glows brighter whenever someone says thank you.",
  },
  {
    id: "chapter-3",
    kicker: "Chapter 03 — The first route",
    title: "A lighthouse keeper and a very bad dream",
    stamp: "🗝️",
    body: "The night the Starloom lighthouse keeper wrote in her journal that she was too tired to dream, Pudding filled her bubble wand with sleepy stars and delivered the very first parcel by hand: a dream about a warm kitchen and someone humming. The keeper slept eleven hours. The Dispatch has run every night since, and the porch light above the postbox has never once been switched off.",
  },
  {
    id: "chapter-4",
    kicker: "Chapter 04 — The rules",
    title: "Three rules of the night shift",
    stamp: "📜",
    body: "Rule one: no dream is too small. Rule two: no dreamer is unreachable. Rule three: every envelope must be sealed with a yawn. There is a fourth rule, handwritten in the margin, that Pudding will only read to visitors who make it all the way to the bottom of the page.",
  },
  {
    id: "chapter-5",
    kicker: "Chapter 05 — Tonight",
    title: "The postbox is still open",
    stamp: "🌙",
    body: "These days Pudding keeps a small web porch for visitors who are awake at odd hours. You can borrow a story, pop a dream bubble, leave a note in the guestbook, or ask her sleepy assistant for a made-up dream idea. She is not a morning person. She is also not really an evening person. She is, at heart, a 9:47pm person.",
  },
] as const;

export type NavLink = { href: string; label: string; emoji: string };

export const SITE_NAV: NavLink[] = [
  { href: "/#pudding", label: "The Dreamer", emoji: "🌷" },
  { href: "/#origin", label: "Origin", emoji: "📖" },
  { href: "/#projects", label: "Projects", emoji: "🛠️" },
  { href: "/stories", label: "Story Corner", emoji: "🌙" },
  { href: "/#play", label: "Arcade", emoji: "🕹️" },
  { href: "/guestbook", label: "Guestbook", emoji: "💌" },
  { href: "/#chat", label: "Dream Chat", emoji: "💤" },
];

export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Overview", emoji: "📊" },
  { href: "/dashboard/projects", label: "Dream Projects", emoji: "🛠️" },
  { href: "/dashboard/stories", label: "Bedtime Stories", emoji: "📚" },
  { href: "/dashboard/guestbook", label: "Guestbook", emoji: "💌" },
  { href: "/dashboard/scores", label: "Arcade Scores", emoji: "🕹️" },
  { href: "/dashboard/chat", label: "Dream Chat Log", emoji: "💬" },
  { href: "/dashboard/settings", label: "Site Settings", emoji: "⚙️" },
  { href: "/dashboard/account", label: "Keeper Account", emoji: "🔑" },
] as const;

export const ACCENTS: Record<string, { bg: string; ink: string; chip: string }> = {
  pink: { bg: "#ffd3e8", ink: "#4b1436", chip: "#ff4fa3" },
  cyan: { bg: "#ccfbf1", ink: "#0d3f45", chip: "#35e1e8" },
  lavender: { bg: "#e9d9ff", ink: "#361a58", chip: "#b78cff" },
  yellow: { bg: "#fff3bf", ink: "#4a3300", chip: "#ffd84d" },
  peach: { bg: "#ffe0cf", ink: "#4d2415", chip: "#ffa06b" },
  mint: { bg: "#d6f8e4", ink: "#0c3d2a", chip: "#4fe0a3" },
};

export const MOODS = [
  { value: "sleepy", label: "Sleepy", emoji: "😴" },
  { value: "sparkly", label: "Sparkly", emoji: "✨" },
  { value: "giddy", label: "Giddy", emoji: "🤸" },
  { value: "cozy", label: "Cozy", emoji: "🧸" },
  { value: "dreamy", label: "Dreamy", emoji: "☁️" },
] as const;

export const ART_IMAGES: Record<string, { src: string; alt: string }> = {
  dispatch: {
    src: "/images/dream-dispatch.webp",
    alt: "Pixel art of a cloudtop dream post office with floating envelopes and a rainbow delivery route",
  },
  bakery: {
    src: "/images/star-bakery.webp",
    alt: "Pixel art of a floating dream bakery with a moon-shaped oven and star cookies",
  },
  library: {
    src: "/images/lullaby-library.webp",
    alt: "Pixel art of a bedtime-story library inside a lavender cloud",
  },
  party: {
    src: "/images/dream-party.webp",
    alt: "Pixel art of a dream party with balloons, confetti and a moon-shaped cake",
  },
  portrait: {
    src: "/images/pudding-portrait.webp",
    alt: "Pixel art portrait of Pudding Mallowmoon, a sleepy dream engineer in a crescent nightcap",
  },
};

export const DREAM_ROUTE = [
  { id: "sorting", label: "Sorting Room", emoji: "📮", note: "Dreams are read by feeling, never by postcode.", x: 8, y: 62 },
  { id: "bakery", label: "Star Bakery", emoji: "🥐", note: "A warm snack for the long flight.", x: 30, y: 26 },
  { id: "library", label: "Lullaby Library", emoji: "📚", note: "One borrowed story, tucked in the envelope.", x: 54, y: 64 },
  { id: "comet", label: "Comet Relay", emoji: "☄️", note: "Comets are fast, but they gossip.", x: 74, y: 22 },
  { id: "pillow", label: "Your Pillow", emoji: "🛏️", note: "Soft landing guaranteed. Yawn to confirm.", x: 92, y: 58 },
] as const;

export const FAQS = [
  {
    q: "Is Pudding a real dream engineer?",
    a: "The dream engineering is real to us. The cloudtop post office is a hand-built website, and every project on it is a fictional world you can walk around in. No dreams are legally binding.",
  },
  {
    q: "How does the dream chat work?",
    a: "If the server has a Gemini API key configured, replies come from Gemini through a secure server route. Without a key, the site uses Pudding's offline dream generator so the button always works — and it tells you which one answered.",
  },
  {
    q: "What do you store about visitors?",
    a: "A random visitor id, and only if you click 'save my dream settings'. Guestbook notes and arcade scores are stored. Nothing is sold, tracked, or sent to advertisers, and you can clear your saved settings any time.",
  },
  {
    q: "Can I use these stories with my kids?",
    a: "Yes, please do. The bedtime stories are original and written to be read out loud, with a page-turning pace, a small pause, and a soft ending.",
  },
] as const;
