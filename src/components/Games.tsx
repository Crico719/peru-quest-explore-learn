import { useEffect, useMemo, useState } from "react";
import { DEPARTMENTS, type Department } from "@/data/departments";
import { useGame } from "@/lib/game";
import { t } from "@/lib/i18n";

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

function Done({ score, max, xp, onAgain }: { score: number; max: number; xp: number; onAgain: () => void }) {
  const { lang } = useGame();
  return (
    <div className="py-6 text-center">
      <p className="text-5xl">🎉</p>
      <p className="mt-2 text-2xl font-bold text-primary">{t(lang, "done")}</p>
      <p className="mt-1 font-semibold">{t(lang, "score")}: {score}/{max} · +{xp} XP</p>
      <button onClick={onAgain} className="btn-3d mt-4 px-5 py-2">{t(lang, "again")}</button>
    </div>
  );
}

export function Quiz({ d }: { d: Department }) {
  const g = useGame();
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const q = d.quiz[i]!;
  const order = useMemo(() => shuffle(q.o.map((_, k) => k)), [q]);

  if (result !== null)
    return <Done score={score} max={d.quiz.length} xp={result} onAgain={() => { setI(0); setScore(0); setResult(null); setSel(null); setChecked(false); }} />;

  const ok = sel === q.a;
  return (
    <div>
      <div className="mb-3 h-3 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${(i / d.quiz.length) * 100}%` }} />
      </div>
      <p className="text-xl font-semibold">{q.q}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {order.map((k, n) => (
          <button
            key={k}
            disabled={checked}
            aria-label={`Opción ${["A","B","C","D"][n]}: ${q.o[k]}`}
            onClick={() => setSel(k)}
            className={`card-3d flex items-center gap-3 px-4 py-4 text-left text-base font-semibold transition active:scale-[0.98] ${sel === k ? "border-primary bg-secondary" : ""} ${checked && k === q.a ? "border-success bg-secondary" : ""} ${checked && sel === k && k !== q.a ? "border-destructive" : ""}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
              {["A", "B", "C", "D"][n]}
            </span>
            {q.o[k]}
          </button>
        ))}
      </div>
      {checked && (
        <>
          <p className={`mt-3 font-semibold ${ok ? "text-primary" : "text-destructive"}`}>
            {ok ? t(g.lang, "correct") : `${t(g.lang, "wrong")} — ${q.o[q.a]}`}
          </p>
          {q.e && (
            <p className="mt-2 rounded-2xl bg-secondary p-3 text-sm text-muted-foreground">{q.e}</p>
          )}
        </>
      )}
      <button
        disabled={sel === null}
        className="btn-3d mt-4 w-full py-3"
        onClick={() => {
          if (!checked) { setChecked(true); if (ok) setScore((s) => s + 1); return; }
          if (i + 1 < d.quiz.length) { setI(i + 1); setSel(null); setChecked(false); }
          else setResult(g.complete(d.id, "quiz", score, d.quiz.length));
        }}
      >
        {!checked ? t(g.lang, "check") : i + 1 < d.quiz.length ? t(g.lang, "next") : t(g.lang, "finish")}
      </button>
    </div>
  );
}

const PLACE_EMOJI = ["🏛️", "🌄", "🏞️"];
const FOOD_EMOJI = ["🍲", "🥘", "🍮"];

export function Memory({ d }: { d: Department }) {
  const g = useGame();
  const build = () =>
    shuffle([
      ...d.places.flatMap((p, k) => [{ key: `p${k}`, label: p }, { key: `p${k}`, label: PLACE_EMOJI[k] ?? "📍" }]),
      ...d.food.slice(0, 1).flatMap((f) => [{ key: "f0", label: f }, { key: "f0", label: FOOD_EMOJI[0] }]),
    ]).map((c, id) => ({ ...c, id }));
  const [cards, setCards] = useState(build);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [xp, setXp] = useState<number | null>(null);

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map((id) => cards[id]!);
    const tm = setTimeout(() => {
      if (a && b && a.key === b.key) setFound((f) => [...f, a.key]);
      setOpen([]);
    }, 700);
    return () => clearTimeout(tm);
  }, [open, cards]);

  useEffect(() => {
    if (found.length === 4 && xp === null) setXp(g.complete(d.id, "memory", moves <= 8 ? 4 : 3, 4));
  }, [found, xp, g, d.id, moves]);

  if (xp !== null)
    return <Done score={moves <= 8 ? 4 : 3} max={4} xp={xp} onAgain={() => { setCards(build()); setFound([]); setMoves(0); setXp(null); }} />;

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">{t(g.lang, "memoryHelp")}</p>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {cards.map((c) => {
          const show = open.includes(c.id) || found.includes(c.key);
          return (
            <button
              key={c.id}
              onClick={() => { if (!show && open.length < 2) { setOpen([...open, c.id]); setMoves((m) => m + 0.5); } }}
              className={`flex aspect-square items-center justify-center rounded-2xl p-1 text-center text-xs font-semibold transition active:scale-95 sm:text-sm ${
                found.includes(c.key) ? "bg-secondary text-secondary-foreground ring-2 ring-primary" : show ? "card-3d scale-105" : "bg-primary text-3xl text-primary-foreground shadow-[0_4px_0_var(--primary-shadow)]"
              }`}
            >
              {show ? <span className={(c.label ?? "").length < 3 ? "text-4xl" : ""}>{c.label}</span> : "❓"}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-muted-foreground">🎴 {Math.floor(moves)} {t(g.lang, "moves")}</p>
    </div>
  );
}

export function TapGame({ d }: { d: Department }) {
  const g = useGame();
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(12);
  const [score, setScore] = useState(0);
  const [item, setItem] = useState<{ label: string; good: boolean } | null>(null);
  const [xp, setXp] = useState<number | null>(null);
  const others = useMemo(() => DEPARTMENTS.filter((o) => o.id !== d.id).flatMap((o) => o.food.filter((f) => !d.food.includes(f))), [d]);
  const next = () => {
    const good = Math.random() < 0.5;
    setItem({ label: (good ? d.food[Math.floor(Math.random() * d.food.length)] : others[Math.floor(Math.random() * others.length)]) ?? "", good });
  };

  useEffect(() => {
    if (!running) return;
    if (time <= 0) { setRunning(false); setXp(g.complete(d.id, "tap", Math.min(score, 8), 8)); return; }
    const tm = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(tm);
  }, [running, time, score, g, d.id]);

  if (xp !== null)
    return <Done score={Math.min(score, 8)} max={8} xp={xp} onAgain={() => { setXp(null); setScore(0); setTime(12); }} />;

  if (!running)
    return (
      <div className="text-center">
        <p className="mb-2 text-sm text-muted-foreground">{t(g.lang, "tapHelp")}</p>
        <p className="mb-4 text-sm font-semibold">{t(g.lang, "dishesOf")}: {d.food.join(" · ")}</p>
        <button className="btn-3d px-6 py-3" onClick={() => { setRunning(true); next(); }}>{t(g.lang, "start2")}</button>
      </div>
    );

  const answer = (yes: boolean) => {
    if (item && yes === item.good) setScore((s) => s + 1);
    else setScore((s) => Math.max(0, s - 1));
    next();
  };

  return (
    <div className="text-center">
      <div className="flex justify-between font-semibold"><span>⏱ {time}s</span><span>⭐ {score}</span></div>
      <div className="mb-1 mt-2 h-3 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${(time / 12) * 100}%` }} />
      </div>
      <div className="card-3d my-4 min-h-28 px-4 py-8 text-2xl font-bold">{item?.label}</div>
      <div className="grid grid-cols-2 gap-3">
        <button className="btn-3d py-5 text-2xl" onClick={() => answer(true)}>✅ {d.name}</button>
        <button className="rounded-2xl bg-destructive py-5 text-2xl font-semibold text-destructive-foreground" onClick={() => answer(false)}>❌</button>
      </div>
    </div>
  );
}

export function OrderGame({ d }: { d: Department }) {
  const g = useGame();
  const [pool, setPool] = useState(() => shuffle(d.steps));
  const [picked, setPicked] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);
  const [shake, setShake] = useState<string | null>(null);
  const [xp, setXp] = useState<number | null>(null);
  const [showRecipe, setShowRecipe] = useState(false);

  if (xp !== null)
    return <Done score={Math.max(0, 4 - errors)} max={4} xp={xp} onAgain={() => { setPool(shuffle(d.steps)); setPicked([]); setErrors(0); setXp(null); }} />;

  const pick = (s: string) => {
    if (s === d.steps[picked.length]) {
      const np = [...picked, s];
      setPicked(np);
      setPool(pool.filter((p) => p !== s));
      if (np.length === d.steps.length) setXp(g.complete(d.id, "order", Math.max(0, 4 - errors), 4));
    } else { setErrors((e) => e + 1); setShake(s); setTimeout(() => setShake(null), 400); }
  };

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">{t(g.lang, "orderHelp")}</p>
      <button onClick={() => setShowRecipe((v) => !v)} className="mb-3 rounded-2xl border-2 border-border px-4 py-2 text-sm font-semibold">
        📖 {showRecipe ? t(g.lang, "hideRecipe") : t(g.lang, "showRecipe")}
      </button>
      {showRecipe && (
        <ol className="mb-3 space-y-1 rounded-2xl bg-secondary p-4">
          {d.steps.map((s, k) => <li key={k} className="text-sm font-medium">{k + 1}. {s}</li>)}
        </ol>
      )}
      <ol className="mb-4 space-y-2">
        {d.steps.map((_, k) => (
          <li key={k} className={`rounded-2xl border-2 border-dashed px-4 py-2 ${picked[k] ? "border-primary bg-secondary font-semibold" : "border-border text-muted-foreground"}`}>
            {k + 1}. {picked[k] ?? "…"}
          </li>
        ))}
      </ol>
      <div className="grid gap-2 sm:grid-cols-2">
        {pool.map((s) => (
          <button key={s} onClick={() => pick(s)} className={`card-3d px-4 py-3 text-left font-medium ${shake === s ? "border-destructive animate-pulse" : ""}`}>{s}</button>
        ))}
      </div>
    </div>
  );
}
