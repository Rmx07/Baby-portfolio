export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4" role="status" aria-live="polite">
      <div className="panel max-w-md p-6 text-center">
        <p className="animate-bob text-4xl" aria-hidden>✉️</p>
        <p className="mt-3 text-sm">Sorting the dream post…</p>
        <div className="mt-3 flex justify-center gap-1" aria-hidden>
          {[0, 1, 2, 3].map((dot) => (
            <span
              key={dot}
              className="animate-bob h-3 w-3 rounded-full border-2 border-[#3d1c4e] bg-[#ff4fa3]"
              style={{ animationDelay: `${dot * 0.15}s` }}
            />
          ))}
        </div>
        <p className="mono-retro mt-3 text-base opacity-80">One moment — Pudding is licking an envelope.</p>
      </div>
    </div>
  );
}
