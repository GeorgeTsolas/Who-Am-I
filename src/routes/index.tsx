import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PEOPLE, type Category, type Person } from "@/data/people";
import { CATEGORY_META, LANG_OPTIONS, TRANSLATIONS, type LangCode } from "@/data/game";

export const Route = createFileRoute("/")({
  component: WhoAmI,
  head: () => ({
    meta: [
      { title: "Who Am I? — Heads Up Party Game" },
      { name: "description", content: "A beautiful mobile party game. Guess the famous name on your forehead before time runs out. 250+ names, 10 categories, 7 languages." },
      { property: "og:title", content: "Who Am I? — Heads Up Party Game" },
      { property: "og:description", content: "Guess the celebrity, character, or myth. 250+ names across 10 categories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#141c35" },
    ],
  }),
});

const NO_LIMIT = "none" as const;
type Duration = 30 | 60 | 90 | typeof NO_LIMIT;

type CustomEntry = { name: string; enabled: boolean };
type Screen = "setup" | "ready" | "playing" | "results";

const CUSTOM_KEY = "whoami_custom_names";
const LANG_KEY = "whoami_lang";

const ALL_CATS: Category[] = ["actors", "music", "sports", "science", "history", "tech", "art", "games", "fiction", "myth"];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function WhoAmI() {
  const [lang, setLang] = useState<LangCode>("en");
  const [langOpen, setLangOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("setup");
  const [duration, setDuration] = useState<Duration>(60);
  const [selectedCats, setSelectedCats] = useState<Set<Category>>(new Set(ALL_CATS));
  const [customs, setCustoms] = useState<CustomEntry[]>([]);
  const [customInput, setCustomInput] = useState("");

  const [deck, setDeck] = useState<Person[]>([]);
  const [current, setCurrent] = useState<Person | null>(null);
  const [correct, setCorrect] = useState<Person[]>([]);
  const [skips, setSkips] = useState<Person[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [flash, setFlash] = useState<"correct" | "skip" | null>(null);
  const langWrapRef = useRef<HTMLDivElement | null>(null);

  const t = useCallback(
    (key: string) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key,
    [lang],
  );
  const catLabel = useCallback((k: Category) => t(`catLabel_${k}`), [t]);

  // Init
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY) as LangCode | null;
      const supported = LANG_OPTIONS.map((o) => o.code);
      if (saved && supported.includes(saved)) setLang(saved);
      else {
        const b = (navigator.language || "en").slice(0, 2) as LangCode;
        if (supported.includes(b)) setLang(b);
      }
      const rawCustom = localStorage.getItem(CUSTOM_KEY);
      if (rawCustom) setCustoms(JSON.parse(rawCustom));
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {}
  }, [lang]);
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(customs));
    } catch {}
  }, [customs]);

  // Close lang menu on outside click
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (!langWrapRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen]);

  const pool = useMemo(() => {
    const base = PEOPLE.filter((p) => selectedCats.has(p.cat));
    const cs: Person[] =
      customs.length > 0 ? customs.filter((c) => c.enabled).map((c) => ({ name: c.name, cat: "custom" as Category })) : [];
    return [...base, ...cs];
  }, [selectedCats, customs]);

  const toggleCat = (k: Category) => {
    setSelectedCats((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  };

  const addCustom = () => {
    const v = customInput.trim();
    if (!v) return;
    setCustoms((prev) => [...prev, { name: v, enabled: true }]);
    setCustomInput("");
  };
  const toggleCustom = (i: number) =>
    setCustoms((prev) => prev.map((c, idx) => (idx === i ? { ...c, enabled: !c.enabled } : c)));
  const removeCustom = (i: number) => setCustoms((prev) => prev.filter((_, idx) => idx !== i));

  const beginRound = () => {
    if (pool.length === 0) return;
    setScreen("ready");
  };

  const startRound = () => {
    const d = shuffle(pool);
    setDeck(d.slice(1));
    setCurrent(d[0] ?? null);
    setCorrect([]);
    setSkips([]);
    setElapsed(0);
    if (duration !== NO_LIMIT) setTimeLeft(duration);
    setScreen("playing");
  };

  // timer
  useEffect(() => {
    if (screen !== "playing") return;
    const id = window.setInterval(() => {
      if (duration === NO_LIMIT) {
        setElapsed((e) => e + 1);
      } else {
        setTimeLeft((tl) => {
          if (tl <= 1) {
            window.clearInterval(id);
            setScreen("results");
            return 0;
          }
          return tl - 1;
        });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [screen, duration]);

  const drawNext = (updater: (d: Person[]) => Person[]) => {
    setDeck((d) => {
      const nd = updater(d);
      const [next, ...rest] = nd.length > 0 ? nd : shuffle(pool);
      setCurrent(next ?? null);
      return rest;
    });
  };

  const handleCorrect = () => {
    if (!current) return;
    setFlash("correct");
    setCorrect((c) => [...c, current]);
    drawNext((d) => d);
    window.setTimeout(() => setFlash(null), 450);
  };
  const handleSkip = () => {
    if (!current) return;
    setFlash("skip");
    setSkips((s) => [...s, current]);
    drawNext((d) => [...d, current]);
    window.setTimeout(() => setFlash(null), 450);
  };

  const currentLangOpt = LANG_OPTIONS.find((o) => o.code === lang) ?? LANG_OPTIONS[0];

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      {/* flash overlay */}
      {flash && (
        <div
          className={`pointer-events-none fixed inset-0 z-50 ${flash === "correct" ? "flash-correct" : "flash-skip"}`}
        />
      )}

      {screen === "setup" && (
        <SetupScreen
          t={t}
          catLabel={catLabel}
          duration={duration}
          setDuration={setDuration}
          selectedCats={selectedCats}
          toggleCat={toggleCat}
          customs={customs}
          customInput={customInput}
          setCustomInput={setCustomInput}
          addCustom={addCustom}
          toggleCustom={toggleCustom}
          removeCustom={removeCustom}
          poolSize={pool.length}
          onStart={beginRound}
          lang={lang}
          setLang={setLang}
          langOpen={langOpen}
          setLangOpen={setLangOpen}
          langWrapRef={langWrapRef}
          currentLangOpt={currentLangOpt}
        />
      )}

      {screen === "ready" && (
        <ReadyScreen t={t} duration={duration} onStart={startRound} onBack={() => setScreen("setup")} />
      )}

      {screen === "playing" && current && (
        <PlayScreen
          t={t}
          catLabel={catLabel}
          current={current}
          timeLeft={timeLeft}
          elapsed={elapsed}
          duration={duration}
          correctCount={correct.length}
          onCorrect={handleCorrect}
          onSkip={handleSkip}
          onEnd={() => setScreen("results")}
        />
      )}

      {screen === "results" && (
        <ResultsScreen
          t={t}
          catLabel={catLabel}
          correct={correct}
          skips={skips}
          onPlayAgain={startRound}
          onSettings={() => setScreen("setup")}
        />
      )}
    </div>
  );
}

/* ---------- SETUP ---------- */

function SetupScreen(props: {
  t: (k: string) => string;
  catLabel: (k: Category) => string;
  duration: Duration;
  setDuration: (d: Duration) => void;
  selectedCats: Set<Category>;
  toggleCat: (k: Category) => void;
  customs: CustomEntry[];
  customInput: string;
  setCustomInput: (v: string) => void;
  addCustom: () => void;
  toggleCustom: (i: number) => void;
  removeCustom: (i: number) => void;
  poolSize: number;
  onStart: () => void;
  lang: LangCode;
  setLang: (l: LangCode) => void;
  langOpen: boolean;
  setLangOpen: (b: boolean) => void;
  langWrapRef: React.MutableRefObject<HTMLDivElement | null>;
  currentLangOpt: (typeof LANG_OPTIONS)[number];
}) {
  const {
    t, catLabel, duration, setDuration, selectedCats, toggleCat, customs, customInput,
    setCustomInput, addCustom, toggleCustom, removeCustom, poolSize, onStart,
    lang, setLang, langOpen, setLangOpen, langWrapRef, currentLangOpt,
  } = props;

  const canStart = poolSize > 0;
  const durations: Duration[] = [30, 60, 90, NO_LIMIT];

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-6">
      {/* header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Heads Up · {poolSize} names
          </div>
        </div>
        <div ref={langWrapRef} className="relative shrink-0">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-sm backdrop-blur active:scale-95"
          >
            <span className="text-base leading-none">{currentLangOpt.flag}</span>
            <span className="text-xs font-medium uppercase tracking-wider">{lang}</span>
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl">
              {LANG_OPTIONS.map((o) => (
                <button
                  key={o.code}
                  onClick={() => {
                    setLang(o.code);
                    setLangOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-secondary ${
                    o.code === lang ? "bg-secondary/70" : ""
                  }`}
                >
                  <span className="text-base">{o.flag}</span>
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* title */}
      <div className="mt-6 flex flex-col items-start">
        <div className="mb-4 flex gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className="dot-anim inline-block h-1.5 w-1.5 rounded-full bg-primary/70"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
        <h1 className="display text-[44px] leading-[0.95] font-semibold text-foreground">
          {t("appTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* duration */}
      <section className="card-glass mt-6 p-4">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {t("roundDuration")}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {durations.map((d) => {
            const active = duration === d;
            const label = d === NO_LIMIT ? "∞" : `${d}s`;
            return (
              <button
                key={String(d)}
                onClick={() => setDuration(d)}
                className={`h-11 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.82_0.15_78_/_0.6)]"
                    : "bg-surface/60 text-foreground/80 hover:bg-surface"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* categories */}
      <section className="card-glass mt-4 p-4">
        <div className="mb-1 flex items-baseline justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("categories")}
          </p>
          <span className="text-xs text-muted-foreground/80">{selectedCats.size}/10</span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground/80">{t("catsHint")}</p>
        <div className="flex flex-wrap gap-2">
          {ALL_CATS.map((k) => {
            const m = CATEGORY_META[k];
            const sel = selectedCats.has(k);
            return (
              <button
                key={k}
                onClick={() => toggleCat(k)}
                className="rounded-full px-3.5 py-2 text-sm font-medium transition-all active:scale-95"
                style={{
                  border: `1px solid ${sel ? m.color : m.color + "55"}`,
                  color: sel ? "#0b1226" : m.color,
                  background: sel ? m.color : "transparent",
                  boxShadow: sel ? `0 6px 20px -8px ${m.color}80` : "none",
                }}
              >
                <span className="mr-1.5">{m.emoji}</span>
                {catLabel(k)}
              </button>
            );
          })}
        </div>
      </section>

      {/* custom names */}
      <section className="card-glass mt-4 p-4">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {t("addNames")}
        </p>
        <div className="flex gap-2">
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addCustom();
            }}
            placeholder={t("customPlaceholder")}
            className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-surface/60 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={addCustom}
            className="btn-primary h-11 shrink-0 rounded-xl px-4 text-sm font-semibold"
          >
            {t("add")}
          </button>
        </div>
        {customs.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1.5">
            {customs.map((c, i) => (
              <li
                key={i}
                className={`flex items-center gap-3 rounded-xl border border-border bg-surface/40 px-3 py-2 text-sm ${
                  c.enabled ? "" : "opacity-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={c.enabled}
                  onChange={() => toggleCustom(i)}
                  className="h-4 w-4 accent-[oklch(0.82_0.15_78)]"
                />
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
                <button
                  onClick={() => removeCustom(i)}
                  className="shrink-0 rounded-full px-2 py-0.5 text-muted-foreground hover:text-destructive"
                  aria-label="Remove"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* start */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          disabled={!canStart}
          onClick={onStart}
          className="btn-primary h-14 w-full rounded-2xl text-base font-semibold tracking-wide"
        >
          {t("start")}
          <span className="ml-2 opacity-70">→</span>
        </button>
        {!canStart && <p className="text-xs text-destructive">{t("warnSelect")}</p>}
        <p className="mt-1 max-w-[34ch] text-center text-xs leading-relaxed text-muted-foreground/80">
          {t("hintPlay")}
        </p>
      </div>
    </div>
  );
}

/* ---------- READY ---------- */

function ReadyScreen({
  t, duration, onStart, onBack,
}: {
  t: (k: string) => string;
  duration: Duration;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 flex gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className="dot-anim inline-block h-2 w-2 rounded-full bg-primary"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        {duration === NO_LIMIT ? "∞" : `${duration}s`}
      </p>
      <h2 className="display mt-3 text-5xl font-semibold">{t("getReady")}</h2>
      <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-muted-foreground">
        {t("hintPlay")}
      </p>
      <button
        onClick={onStart}
        className="btn-primary mt-10 h-16 w-full rounded-2xl text-lg font-semibold"
      >
        {t("tapToStart")}
      </button>
      <button
        onClick={onBack}
        className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← {t("changeSettings")}
      </button>
    </div>
  );
}

/* ---------- PLAY ---------- */

function PlayScreen({
  t, catLabel, current, timeLeft, elapsed, duration, correctCount, onCorrect, onSkip, onEnd,
}: {
  t: (k: string) => string;
  catLabel: (k: Category) => string;
  current: Person;
  timeLeft: number;
  elapsed: number;
  duration: Duration;
  correctCount: number;
  onCorrect: () => void;
  onSkip: () => void;
  onEnd: () => void;
}) {
  const isUnlimited = duration === NO_LIMIT;
  const meta = CATEGORY_META[current.cat];
  const pct = !isUnlimited && duration !== NO_LIMIT ? (timeLeft / (duration as number)) * 100 : 100;
  const timerNum = isUnlimited ? elapsed : timeLeft;
  const warn = !isUnlimited && timeLeft <= 10;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-6 pt-6">
      {/* top row */}
      <div className="flex items-center justify-between">
        <div className={`flex items-baseline gap-1.5 ${warn ? "text-destructive" : "text-foreground"}`}>
          <span className="display text-4xl font-semibold tabular-nums">{timerNum}</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("sec")}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="display text-4xl font-semibold tabular-nums text-primary">{correctCount}</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">score</span>
        </div>
      </div>

      {/* progress */}
      {!isUnlimited ? (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface/70">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              background: warn
                ? "linear-gradient(90deg, oklch(0.65 0.22 20), oklch(0.7 0.16 340))"
                : "linear-gradient(90deg, oklch(0.85 0.16 82), oklch(0.72 0.18 45))",
            }}
          />
        </div>
      ) : (
        <div className="h-8" />
      )}

      {/* name card */}
      <div className="mt-8 flex flex-1 items-center justify-center">
        <div
          key={current.name}
          className="card-in card-glass relative flex w-full flex-col items-center justify-center gap-5 rounded-3xl px-6 py-14 text-center"
          style={{ boxShadow: `0 30px 80px -20px ${meta.color}30, 0 0 0 1px ${meta.color}22` }}
        >
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              color: meta.color,
              background: meta.color + "1c",
              border: `1px solid ${meta.color}55`,
            }}
          >
            {meta.emoji} {catLabel(current.cat)}
          </span>
          <h2 className="display text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            {current.name}
          </h2>
        </div>
      </div>

      {/* buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={onSkip}
          className="h-16 rounded-2xl border border-border bg-surface/70 text-base font-semibold text-foreground/90 backdrop-blur transition active:scale-95"
        >
          <span className="mr-1.5">↺</span>
          {t("reroll")}
        </button>
        <button
          onClick={onCorrect}
          className="btn-primary h-16 rounded-2xl text-base font-semibold"
        >
          <span className="mr-1.5">✓</span>
          {t("gotIt")}
        </button>
      </div>

      {isUnlimited && (
        <button
          onClick={onEnd}
          className="mt-3 text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {t("endRound")}
        </button>
      )}
    </div>
  );
}

/* ---------- RESULTS ---------- */

function ResultsScreen({
  t, catLabel, correct, skips, onPlayAgain, onSettings,
}: {
  t: (k: string) => string;
  catLabel: (k: Category) => string;
  correct: Person[];
  skips: Person[];
  onPlayAgain: () => void;
  onSettings: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-10">
      <div className="flex flex-col items-center text-center">
        <div className="text-6xl">🏆</div>
        <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          {t("roundOver")}
        </p>
        <h2 className="display mt-2 text-7xl font-semibold text-primary">{correct.length}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {correct.length} {t("correctGuesses")} · {skips.length} {t("rerolls")}
        </p>
      </div>

      {(correct.length > 0 || skips.length > 0) && (
        <div className="card-glass mt-8 divide-y divide-white/5">
          {correct.map((p, i) => {
            const m = CATEGORY_META[p.cat];
            return (
              <div key={"c" + i} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="text-lg" style={{ color: m.color }}>✓</span>
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                <span className="text-xs" style={{ color: m.color }}>{m.emoji} {catLabel(p.cat)}</span>
              </div>
            );
          })}
          {skips.map((p, i) => {
            const m = CATEGORY_META[p.cat];
            return (
              <div key={"s" + i} className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
                <span className="text-lg text-destructive/80">↺</span>
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                <span className="text-xs">{m.emoji} {catLabel(p.cat)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={onPlayAgain}
          className="btn-primary h-14 w-full rounded-2xl text-base font-semibold"
        >
          {t("playAgain")}
        </button>
        <button
          onClick={onSettings}
          className="h-12 w-full rounded-2xl border border-border bg-surface/60 text-sm text-foreground/85"
        >
          {t("changeSettings")}
        </button>
      </div>
    </div>
  );
}
