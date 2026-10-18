/**
 * Offline dream generator — Pudding's own sleepy little engine.
 * Used when GEMINI_API_KEY is not configured (or the upstream call fails) so the
 * chat UI always has something honest and labelled to answer with.
 */

const openings = [
  "Ooh, I have just the thing. Tuck this one behind your ear:",
  "Right, let me unbutton my postbag. Here is what I found:",
  "Mmm, that reminds me of a parcel we never delivered. Listen:",
  "Tibby just woke up and he has an idea. He says:",
  "Let me stir the dream pot for a moment... ah, there it is:",
];

const settings = [
  "a lighthouse that only switches on when somebody is homesick",
  "a bakery that sells one-minute holidays wrapped in wax paper",
  "a train station where the trains are all enormous friendly cats",
  "a library where every book is a door you can knock on",
  "a post office balanced on three clouds and one very patient tortoise",
  "a town where the streetlamps are jars of fireflies on summer loan",
  "a laundromat that washes away the day's small embarrassments",
  "a conservatory of sleeping instruments that hum when it rains",
  "a night bus that stops wherever someone is having a bad dream",
  "a picnic blanket the size of a valley, with room for everyone",
];

const characters = [
  "a retired comet named Cedric who is learning to water succulents",
  "a very small cloud who collects rainbows but is learning to share",
  "a reluctant lighthouse keeper with a satchel of unsent apologies",
  "a moonlight cat who is allergic to being told what to do",
  "a jellyfish librarian who labels things by feeling",
  "a sleepy giant made of warm bread who just wants a chair that fits",
  "an apprentice star who has not finished growing all of its points",
];

const endings = [
  "Everyone gets a blanket. Nothing is urgent. The porch light stays on.",
  "In the morning, there is toast, and nobody is in trouble.",
  "They fall asleep in a pile, and the sky politely keeps watch.",
  "The last page is blank because the reader gets to write it.",
  "The dream is filed under 'soft', and delivered by nine forty-seven sharp.",
  "All the clocks agree to be ten minutes slow, just for tonight.",
];

const storyBeats = [
  "Once there was {setting}.",
  "Nobody had visited in a long while, except {character}.",
  "One foggy night the bell above the door rang, and a stranger asked for the softest thing in the shop.",
  "The stranger was given a pillow full of someone else's lullaby, and promptly fell asleep standing up.",
  "So {character} did the brave, ordinary thing: they sat down beside the sleeper and kept the lights low.",
  "{ending}",
];

const dreamPrompts = [
  "a dream about {setting}, where {character} keeps you company",
  "you are small enough to ride a paper boat through {setting}",
  "you open a door in your own house and find {setting}",
  "you are the night-shift keeper of {setting}, and you have exactly one visitor",
];

function pick<T>(list: readonly T[], seed: number): T {
  return list[Math.abs(seed) % list.length] as T;
}

function hash(input: string): number {
  let value = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export type DreamKind = "story" | "dream" | "question";

export function offlineDream(input: string, kind: DreamKind = "dream"): string {
  const seed = hash(input.trim().toLowerCase() || "starloom");
  const opening = pick(openings, seed);
  const setting = pick(settings, seed >>> 3);
  const character = pick(characters, seed >>> 7);
  const ending = pick(endings, seed >>> 11);

  if (kind === "story") {
    const beats = storyBeats.map((beat) =>
      beat
        .replace("{setting}", setting)
        .replace("{character}", character)
        .replace("{ending}", ending),
    );
    return `${opening}\n\n${beats.join(" ")}\n\nYawn when you are ready for the next one.`;
  }

  if (kind === "question") {
    return `${opening}\n\nI only know three things for certain: dreams are mostly weather, everyone is allowed to be tired, and ${character} is probably involved somehow. Try me again with a feeling instead of a question — feelings make better postcodes. (Pudding's offline generator answered this one; Gemini is not configured on this deployment.)`;
  }

  const idea = pick(dreamPrompts, seed >>> 5).replace("{setting}", setting).replace("{character}", character);
  return `${opening}\n\nTonight's dream: ${idea}. ${ending}\n\n(Pudding's offline generator wrote this one. Add a Gemini API key to get live AI dreams instead.)`;
}
