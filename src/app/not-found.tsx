import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto grid min-h-screen w-full max-w-2xl place-items-center px-4">
      <div className="panel overflow-hidden">
        <div className="window-bar">
          <span>404_DREAM_LOST.HTM</span>
          <span aria-hidden>🌫️</span>
        </div>
        <div className="space-y-3 p-6 text-center">
          <p className="text-5xl" aria-hidden>☁️🔍</p>
          <h1 className="text-base leading-relaxed">This dream drifted off the route</h1>
          <p className="mono-retro text-lg leading-snug">
            The page you asked for is not in the postbag. Pudding checked twice, then had a small nap about it. Try the
            homepage, the story library, or the guestbook.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/" className="btn btn-pink">🌙 Back to the dispatch</Link>
            <Link href="/stories" className="btn btn-cyan">📚 Story library</Link>
            <Link href="/guestbook" className="btn btn-lav">💌 Guestbook</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
