"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Theme = "day" | "night";

type Prefs = {
  theme: Theme;
  sound: boolean;
  sparkles: boolean;
  chaos: boolean;
  reduceMotion: boolean;
};

type Toast = { id: number; message: string; tone: "ok" | "err" | "party" };

type ExperienceValue = Prefs & {
  hydrated: boolean;
  consented: boolean;
  visitorId: string | null;
  clicks: number;
  stats: Record<string, number>;
  musicPlaying: boolean;
  musicMuted: boolean;
  volume: number;
  flashlight: boolean;
  eggUnlocked: boolean;
  audioUnlocked: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSound: (value: boolean) => void;
  setSparkles: (value: boolean) => void;
  setChaos: (value: boolean) => void;
  setReduceMotion: (value: boolean) => void;
  setFlashlight: (value: boolean) => void;
  saveConsent: () => Promise<void>;
  clearSaved: () => Promise<void>;
  toggleMusic: () => void;
  toggleMute: () => void;
  setVolume: (value: number) => void;
  playSfx: (kind?: "click" | "pop" | "ok" | "err" | "sparkle" | "page") => void;
  registerClick: () => void;
  pushToast: (message: string, tone?: Toast["tone"]) => void;
  unlockEgg: (source?: string) => void;
  refreshStats: () => Promise<void>;
};

const ExperienceContext = createContext<ExperienceValue | null>(null);
const PREFS_KEY = "starloom-prefs-v1";
const CONSENT_KEY = "starloom-consent-v1";
const EGG_KEY = "starloom-egg-v1";
const TOKEN = "starloom-consent-v1";

const DEFAULT_PREFS: Prefs = {
  theme: "day",
  sound: true,
  sparkles: true,
  chaos: false,
  reduceMotion: false,
};

// A gentle original music-box lullaby ("The 9:47 Delivery").
const MELODY: [number, number][] = [
  [659.25, 0.5], [783.99, 0.5], [880, 1], [783.99, 0.5], [659.25, 0.5],
  [587.33, 0.5], [523.25, 1], [0, 0.5], [587.33, 0.5], [659.25, 0.5],
  [783.99, 0.5], [659.25, 0.5], [587.33, 1], [523.25, 0.5], [440, 0.5],
  [392, 1.5], [0, 0.5],
];
const BASS: [number, number][] = [
  [130.81, 2], [164.81, 2], [174.61, 2], [130.81, 2],
  [196, 2], [164.81, 2], [174.61, 2], [146.83, 2],
];
const BEAT = 0.56;
const MELODY_BEATS = MELODY.reduce((total, [, beats]) => total + beats, 0) * BEAT;
const BASS_BEATS = BASS.reduce((total, [, beats]) => total + beats, 0) * BEAT;

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);
  const [consented, setConsented] = useState(false);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [clicks, setClicks] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.32);
  const [flashlight, setFlashlight] = useState(false);
  const [eggUnlocked, setEggUnlocked] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const sfxGainRef = useRef<GainNode | null>(null);
  const activeNodes = useRef<Set<OscillatorNode>>(new Set());
  const loopTimer = useRef<number | null>(null);
  const playingRef = useRef(false);
  const mutedRef = useRef(false);
  const volumeRef = useRef(0.32);
  const soundRef = useRef(true);
  const prefsRef = useRef<Prefs>(DEFAULT_PREFS);
  const consentedRef = useRef(false);
  const saveTimer = useRef<number | null>(null);
  const buffer = useRef("");

  prefsRef.current = prefs;
  soundRef.current = prefs.sound;
  volumeRef.current = volume;
  mutedRef.current = musicMuted;

  const pushToast = useCallback((message: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }].slice(-4));
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 5200);
  }, []);

  const ensureAudio = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return null;
      const ctx = new AudioCtor();
      const musicGain = ctx.createGain();
      musicGain.gain.value = mutedRef.current ? 0 : volumeRef.current;
      musicGain.connect(ctx.destination);
      const sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.18;
      sfxGain.connect(ctx.destination);
      ctxRef.current = ctx;
      musicGainRef.current = musicGain;
      sfxGainRef.current = sfxGain;
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    setAudioUnlocked(true);
    return ctxRef.current;
  }, []);

  const tone = useCallback(
    (frequency: number, start: number, duration: number, gainValue: number, type: OscillatorType, destination: GainNode) => {
      const ctx = ctxRef.current;
      if (!ctx || frequency <= 0) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(start);
      osc.stop(start + duration + 0.05);
      activeNodes.current.add(osc);
      osc.onended = () => activeNodes.current.delete(osc);
    },
    [],
  );

  const scheduleLoop = useCallback(function scheduleLoopTick() {
    const ctx = ctxRef.current;
    const musicGain = musicGainRef.current;
    if (!ctx || !musicGain || !playingRef.current) return;
    let time = ctx.currentTime + 0.12;
    for (const [frequency, beats] of MELODY) {
      tone(frequency, time, beats * BEAT * 1.5, 0.22, "triangle", musicGain);
      if (frequency > 0) tone(frequency * 2, time, beats * BEAT, 0.05, "sine", musicGain);
      time += beats * BEAT;
    }
    let bassTime = ctx.currentTime + 0.12;
    for (const [frequency, beats] of BASS) {
      tone(frequency, bassTime, beats * BEAT * 1.1, 0.12, "sine", musicGain);
      bassTime += beats * BEAT;
    }
    const loopMs = Math.max(MELODY_BEATS, BASS_BEATS) * 1000;
    loopTimer.current = window.setTimeout(scheduleLoopTick, loopMs);
  }, [tone]);

  const stopMusicNodes = useCallback(() => {
    if (loopTimer.current) {
      window.clearTimeout(loopTimer.current);
      loopTimer.current = null;
    }
    activeNodes.current.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    });
    activeNodes.current.clear();
  }, []);

  const toggleMusic = useCallback(() => {
    const ctx = ensureAudio();
    if (!ctx) {
      pushToast("This browser will not let me wind the music box.", "err");
      return;
    }
    if (playingRef.current) {
      playingRef.current = false;
      stopMusicNodes();
      setMusicPlaying(false);
      pushToast("Music box paused. Tibby is snoring.", "ok");
    } else {
      if (musicGainRef.current) {
        musicGainRef.current.gain.value = mutedRef.current ? 0 : volumeRef.current;
      }
      playingRef.current = true;
      setMusicPlaying(true);
      scheduleLoop();
      pushToast("Lullaby playing — pause whenever you like.", "ok");
    }
  }, [ensureAudio, pushToast, scheduleLoop, stopMusicNodes]);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMusicMuted(next);
    if (musicGainRef.current) {
      musicGainRef.current.gain.value = next ? 0 : volumeRef.current;
    }
    pushToast(next ? "Music box muted." : "Music box unmuted.", "ok");
  }, [pushToast]);

  const setVolume = useCallback((value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    if (musicGainRef.current && !mutedRef.current) {
      musicGainRef.current.gain.value = clamped;
    }
  }, []);

  const playSfx = useCallback(
    (kind: "click" | "pop" | "ok" | "err" | "sparkle" | "page" = "click") => {
      if (!soundRef.current) return;
      const ctx = ensureAudio();
      const destination = sfxGainRef.current;
      if (!ctx || !destination) return;
      const now = ctx.currentTime + 0.01;
      const patterns: Record<string, [number, number, number][]> = {
        click: [[660, 0, 0.06]],
        pop: [[520, 0, 0.05], [880, 0.05, 0.08]],
        ok: [[523, 0, 0.09], [784, 0.09, 0.12]],
        err: [[220, 0, 0.12], [180, 0.1, 0.16]],
        sparkle: [[1046, 0, 0.05], [1318, 0.05, 0.05], [1568, 0.1, 0.08]],
        page: [[420, 0, 0.04], [340, 0.04, 0.05]],
      };
      for (const [frequency, offset, duration] of patterns[kind] ?? patterns.click!) {
        tone(frequency, now + offset, duration, 0.16, kind === "err" ? "square" : "triangle", destination);
      }
    },
    [ensureAudio, tone],
  );

  const applyPrefs = useCallback((next: Prefs) => {
    setPrefs(next);
    document.documentElement.dataset.theme = next.theme;
    document.documentElement.dataset.chaos = String(next.chaos);
    document.documentElement.dataset.motion = next.reduceMotion ? "off" : "on";
  }, []);

  const persistPrefs = useCallback((next: Prefs) => {
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      /* storage may be blocked */
    }
  }, []);

  const syncRemote = useCallback((next: Prefs) => {
    if (!consentedRef.current) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-starloom-consent": TOKEN },
        body: JSON.stringify({
          theme: next.theme,
          sound: next.sound,
          sparkles: next.sparkles,
          chaos: next.chaos,
          reduceMotion: next.reduceMotion,
        }),
      }).catch(() => undefined);
    }, 450);
  }, []);

  const updatePrefs = useCallback(
    (patch: Partial<Prefs>) => {
      const next = { ...prefsRef.current, ...patch };
      prefsRef.current = next;
      applyPrefs(next);
      persistPrefs(next);
      syncRemote(next);
    },
    [applyPrefs, persistPrefs, syncRemote],
  );

  const refreshStats = useCallback(async () => {
    try {
      const response = await fetch("/api/counter", { cache: "no-store" });
      const payload = (await response.json()) as { ok: boolean; stats?: Record<string, number> };
      if (payload.ok && payload.stats) setStats(payload.stats);
    } catch {
      /* counters are decorative; ignore */
    }
  }, []);

  const registerClick = useCallback(() => {
    setClicks((current) => current + 1);
    playSfx("click");
    void fetch("/api/counter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "click_count" }),
    })
      .then((response) => response.json())
      .then((payload: { ok: boolean; stats?: Record<string, number> }) => {
        if (payload.ok) setStats((current) => ({ ...current, click_count: (current.click_count ?? 0) + 1 }));
      })
      .catch(() => undefined);
  }, [playSfx]);

  const unlockEgg = useCallback(
    (source = "secret") => {
      setEggUnlocked(true);
      try {
        window.localStorage.setItem(EGG_KEY, "found");
      } catch {
        /* ignore */
      }
      void fetch("/api/counter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "easter_eggs" }),
      }).catch(() => undefined);
      playSfx("sparkle");
      pushToast(`You found the hidden fourth rule (${source}). Pudding is impressed.`, "party");
    },
    [playSfx, pushToast],
  );

  const saveConsent = useCallback(async () => {
    consentedRef.current = true;
    setConsented(true);
    try {
      window.localStorage.setItem(CONSENT_KEY, "yes");
    } catch {
      /* ignore */
    }
    const response = await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-starloom-consent": TOKEN },
      body: JSON.stringify({
        theme: prefsRef.current.theme,
        sound: prefsRef.current.sound,
        sparkles: prefsRef.current.sparkles,
        chaos: prefsRef.current.chaos,
        reduceMotion: prefsRef.current.reduceMotion,
      }),
    });
    const payload = (await response.json().catch(() => ({ ok: false }))) as { ok?: boolean; error?: string };
    if (payload.ok) {
      pushToast("Dream settings tucked safely into your cookie jar.", "ok");
      playSfx("ok");
    } else {
      pushToast(payload.error ?? "The settings box jammed. Try again.", "err");
    }
  }, [playSfx, pushToast]);

  const clearSaved = useCallback(async () => {
    consentedRef.current = false;
    setConsented(false);
    try {
      window.localStorage.removeItem(PREFS_KEY);
      window.localStorage.removeItem(CONSENT_KEY);
    } catch {
      /* ignore */
    }
    const next = { ...DEFAULT_PREFS, reduceMotion: prefsRef.current.reduceMotion };
    prefsRef.current = next;
    applyPrefs(next);
    await fetch("/api/preferences", { method: "DELETE" }).catch(() => undefined);
    await fetch("/api/chat", { method: "DELETE" }).catch(() => undefined);
    pushToast("Saved preferences and chat history cleared.", "ok");
  }, [applyPrefs, pushToast]);

  // Hydrate from localStorage + server (server only wins when nothing local is saved).
  useEffect(() => {
    let cancelled = false;
    const localConsent = (() => {
      try {
        return window.localStorage.getItem(CONSENT_KEY) === "yes";
      } catch {
        return false;
      }
    })();
    const localPrefs = (() => {
      try {
        const raw = window.localStorage.getItem(PREFS_KEY);
        return raw ? ({ ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) } as Prefs) : null;
      } catch {
        return null;
      }
    })();
    const osReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const egg = (() => {
      try {
        return window.localStorage.getItem(EGG_KEY) === "found";
      } catch {
        return false;
      }
    })();
    if (egg) setEggUnlocked(true);

    if (localPrefs) {
      if (!localPrefs.reduceMotion && osReduced) localPrefs.reduceMotion = true;
      prefsRef.current = localPrefs;
      consentedRef.current = localConsent;
      applyPrefs(localPrefs);
      setConsented(localConsent);
    } else {
      const initial = { ...DEFAULT_PREFS, reduceMotion: osReduced };
      prefsRef.current = initial;
      applyPrefs(initial);
    }
    setHydrated(true);

    void (async () => {
      try {
        const response = await fetch("/api/preferences", { cache: "no-store" });
        const payload = (await response.json()) as {
          ok: boolean;
          visitorId?: string;
          preferences?: { theme?: Theme; sound?: boolean; sparkles?: boolean; chaos?: boolean; reduceMotion?: boolean } | null;
        };
        if (cancelled || !payload.ok) return;
        if (payload.visitorId) setVisitorId(payload.visitorId);
        if (payload.preferences && !localPrefs) {
          const next = { ...prefsRef.current, ...payload.preferences } as Prefs;
          prefsRef.current = next;
          applyPrefs(next);
        }
      } catch {
        /* offline is fine */
      }
    })();

    void refreshStats();
    try {
      if (!window.sessionStorage.getItem("starloom-visited")) {
        window.sessionStorage.setItem("starloom-visited", "yes");
        void fetch("/api/counter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "visit_count" }),
        })
          .then((response) => response.json())
          .then((payload: { ok: boolean; value?: number }) => {
            if (payload.ok && typeof payload.value === "number") {
              setStats((current) => ({ ...current, visit_count: payload.value ?? current.visit_count }));
            }
          })
          .catch(() => undefined);
      }
    } catch {
      /* ignore */
    }
    return () => {
      cancelled = true;
    };
  }, [applyPrefs, refreshStats]);

  // Hidden keyboard Easter egg: type the sleepy letters anywhere outside a form field.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) {
        return;
      }
      if (event.key.toLowerCase() === "z") {
        buffer.current = (buffer.current + "z").slice(-3);
        if (buffer.current === "zzz") {
          buffer.current = "";
          unlockEgg("typed z-z-z");
        }
      } else {
        buffer.current = "";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlockEgg]);

  // Cleanup audio nodes on unmount.
  useEffect(() => {
    const nodes = activeNodes.current;
    return () => {
      if (loopTimer.current) window.clearTimeout(loopTimer.current);
      nodes.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          /* ignore */
        }
      });
    };
  }, []);

  const setChaos = useCallback(
    (chaos: boolean) => {
      updatePrefs({ chaos });
      pushToast(chaos ? "DREAM PARTY MODE. The bunting is out." : "Party tidied away. Tea instead?", chaos ? "party" : "ok");
      playSfx(chaos ? "sparkle" : "page");
    },
    [playSfx, pushToast, updatePrefs],
  );

  const value = useMemo<ExperienceValue>(
    () => ({
      ...prefs,
      hydrated,
      consented,
      visitorId,
      clicks,
      stats,
      musicPlaying,
      musicMuted,
      volume,
      flashlight,
      eggUnlocked,
      audioUnlocked,
      setTheme: (theme: Theme) => updatePrefs({ theme }),
      toggleTheme: () => {
        const next = prefsRef.current.theme === "day" ? "night" : "day";
        updatePrefs({ theme: next });
        pushToast(next === "night" ? "Night shift engaged. The stars came out." : "Morning shift! Pass the peaches.", "ok");
      },
      setSound: (soundEnabled: boolean) => {
        updatePrefs({ sound: soundEnabled });
        if (soundEnabled) playSfx("ok");
      },
      setSparkles: (sparkles: boolean) => updatePrefs({ sparkles }),
      setChaos,
      setReduceMotion: (reduceMotion: boolean) => updatePrefs({ reduceMotion }),
      setFlashlight,
      saveConsent,
      clearSaved,
      toggleMusic,
      toggleMute,
      setVolume,
      playSfx,
      registerClick,
      pushToast,
      unlockEgg,
      refreshStats,
    }),
    [
      prefs,
      hydrated,
      consented,
      visitorId,
      clicks,
      stats,
      musicPlaying,
      musicMuted,
      volume,
      flashlight,
      eggUnlocked,
      audioUnlocked,
      updatePrefs,
      setChaos,
      pushToast,
      playSfx,
      saveConsent,
      clearSaved,
      toggleMusic,
      toggleMute,
      setVolume,
      registerClick,
      unlockEgg,
      refreshStats,
    ],
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
      <div className="fixed bottom-3 left-1/2 z-[90] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2" aria-live="polite">
        {toasts.map((item) => (
          <div
            key={item.id}
            className="panel animate-pop flex items-start gap-2 px-3 py-2 text-sm font-semibold"
            style={{ background: item.tone === "err" ? "#ffd6cf" : item.tone === "party" ? "#fff0b8" : "#e7ffe4" }}
          >
            <span aria-hidden>{item.tone === "err" ? "🌧️" : item.tone === "party" ? "🎉" : "🌟"}</span>
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </ExperienceContext.Provider>
  );
}

export function useExperience(): ExperienceValue {
  const context = useContext(ExperienceContext);
  if (!context) throw new Error("useExperience must be used inside ExperienceProvider");
  return context;
}
