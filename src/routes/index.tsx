import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DEPARTMENTS, PERU, REGION_EMOJI } from "@/data/departments";
import { useGame, exportEvidence } from "@/lib/game";
import { t } from "@/lib/i18n";
import { useWikiImage } from "@/lib/wiki";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PERÚ QUEST — Aprende los 24 departamentos del Perú" },
      { name: "description", content: "Camino tipo Duolingo por los departamentos del Perú: historia, gastronomía, quizzes y minijuegos." },
      { property: "og:title", content: "PERÚ QUEST — Aprende el Perú jugando" },
      { property: "og:description", content: "Gana XP, gemas y coronas recorriendo los 24 departamentos del Perú." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TIPS = {
  es: [
    "🦉 Toca cada dato curioso: suma +2 XP.",
    "🦉 El quiz perfecto da +2 gemas extra.",
    "🦉 Vuelve mañana y tu racha 🔥 seguirá subiendo.",
    "🦉 Usa 🔊 para escuchar en español o inglés.",
    "🦉 Exporta tu evidencia para tu profesor.",
  ],
  en: [
    "🦉 Tap each fun fact: +2 XP.",
    "🦉 A perfect quiz gives +2 bonus gems.",
    "🦉 Come back tomorrow to keep your 🔥 streak.",
    "🦉 Use 🔊 to listen in Spanish or English.",
    "🦉 Export your evidence for your teacher.",
  ],
};

function Index() {
  const g = useGame();
  const { data: hero } = useWikiImage("Machu_Picchu");
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<"Costa" | "Sierra" | "Selva" | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [deptImages, setDeptImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    DEPARTMENTS.forEach(async (d) => {
      try {
        const r = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(d.wiki)}`);
        if (!r.ok) return;
        const j = await r.json();
        const src = j.thumbnail?.source ?? j.originalimage?.source;
        if (src && !cancelled) setDeptImages((m) => ({ ...m, [d.id]: src }));
      } catch {
        /* fallback to emoji */
      }
    });
    return () => { cancelled = true; };
  }, []);

  const info: [string, string][] = [
    [t(g.lang, "capital"), PERU.capital],
    [t(g.lang, "population"), PERU.population],
    [t(g.lang, "area"), PERU.area],
    [t(g.lang, "languages"), PERU.languages],
    [t(g.lang, "currency"), PERU.currency],
    [t(g.lang, "independence"), PERU.independence],
    [t(g.lang, "regions"), PERU.regions],
  ];

  const totalCrowns = DEPARTMENTS.reduce((n, d) => n + g.crowns(d.id), 0);
  const maxCrowns = DEPARTMENTS.length * 4;
  const pct = Math.round((totalCrowns / maxCrowns) * 100);
  const currentIdx = DEPARTMENTS.findIndex((d, i) => g.unlocked(i) && g.crowns(d.id) < 4);
  const tip = TIPS[g.lang][new Date().getDate() % TIPS[g.lang].length];
  const regions: ("Costa" | "Sierra" | "Selva")[] = ["Costa", "Sierra", "Selva"];
  const filtering = q.trim() !== "";
  const visible = DEPARTMENTS.map((d, i) => ({ d, i })).filter(
    (x) => (!region || x.d.region === region) &&
      x.d.name.toLowerCase().includes(q.trim().toLowerCase())
  );
  const sel = selected ? DEPARTMENTS.find((d) => d.id === selected) : undefined;

  const node = (d: (typeof DEPARTMENTS)[number], i: number) => {
    const c = g.crowns(d.id);
    const isCurrent = i === currentIdx;
    const offset = Math.round(Math.sin(i * 0.9) * 90);
    const pctDept = Math.round((c / 4) * 100);
    const done = c === 4;
    const img = deptImages[d.id];

    return (
      <div key={d.id} style={{ transform: `translateX(${offset}px)` }} className="flex flex-col items-center gap-2">
        <Link to="/departamento/$id" params={{ id: d.id }} aria-label={d.name} className="relative group cursor-pointer">
          <div className="relative">
            {/* Círculo progresivo (aro como Duolingo) */}
            <svg className="w-28 h-28" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" stroke="#e2e8f0" strokeWidth="4" fill="none" />
              {done
                ? <circle cx="22" cy="22" r="18" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" transform="rotate(-90 22 22)" strokeDasharray="113.1" />
                : <circle cx="22" cy="22" r="18" stroke={done ? "#fbbf24" : "#3b82f6"} strokeWidth="4" strokeLinecap="round" style={{ strokeDasharray: `${(c / 4) * 113.1}, 113.1` }} transform="rotate(-90 22 22)" />}
            </svg>
            {/* Emoji encima del anillo */}
            <div className="absolute inset-0 flex items-center justify-center">
              {img
                ? <img src={img} alt={d.name} className="h-20 w-20 rounded-full object-cover" />
                : <span className="text-[36px] filter drop-shadow-md">{d.emoji}</span>}
              {isCurrent && <span className="absolute -top-1 -right-1 text-2xl animate-pulse">🔥</span>}
            </div>
          </div>
          <span className="mt-2 text-sm font-bold">{d.name}</span>
          <div className="mt-1 w-16 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-600" style={{ width: `${pctDept}%` }} />
          </div>
          <span className="text-[10px] font-bold">{pctDept}%</span>
        </Link>
      </div>
    );
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24">
      {/* Hero */}
      <section className="relative mt-4 overflow-hidden rounded-3xl text-white hero-anim">
        {hero && <img src={hero} alt="Machu Picchu" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
        <div className="relative grid gap-6 p-6 sm:p-10 md:grid-cols-2">
          <div>
            <p className="text-5xl">🇵🇪</p>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-4xl font-bold sm:text-5xl">PERÚ QUEST</h1>
              <div className="relative cursor-pointer" title="Inti tu mascota">
                <svg viewBox="0 0 200 200" width="48" height="48" className="block">
                  <defs>
                    <linearGradient id="intiBodyRoot" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#e7e5e4" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="95" cy="142" rx="40" ry="30" fill="url(#intiBodyRoot)" stroke="#d6d3d1" strokeWidth="2" />
                  <ellipse cx="70" cy="132" rx="26" ry="25" fill="#e7e5e4" />
                  <ellipse cx="140" cy="92" rx="20" ry="22" fill="url(#intiBodyRoot)" stroke="#d6d3d1" strokeWidth="2" />
                  <ellipse cx="114" cy="106" rx="12" ry="24" fill="url(#intiBodyRoot)" stroke="#d6d3d1" strokeWidth="2" />
                  <ellipse cx="128" cy="80" rx="6" ry="13" fill="url(#intiBodyRoot)" stroke="#d6d3d1" strokeWidth="2" transform="rotate(-30 128 80)" />
                  <ellipse cx="152" cy="76" rx="6" ry="13" fill="url(#intiBodyRoot)" stroke="#d6d3d1" strokeWidth="2" transform="rotate(30 152 76)" />
                  <circle cx="130" cy="88" rx="4" fill="#1a202c" />
                  <circle cx="132" cy="86" rx="2" fill="white" />
                  <circle cx="150" cy="88" rx="4" fill="#1a202c" />
                  <circle cx="152" cy="86" rx="2" fill="white" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-lg font-medium">{t(g.lang, "tagline")}</p>
            <p className="mt-2 text-sm font-semibold">🦉 {t(g.lang, "tip")}: {tip}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-[14px] font-semibold">👑 {totalCrowns} / {maxCrowns}</span>
              <span className="flex items-center gap-1 text-[14px] font-semibold">🔥 {g.streak}</span>
              <span className="flex items-center gap-1 text-sm font-semibold text-gold">💎 {g.gems}</span>
              <span className="flex items-center gap-1 text-sm font-bold text-gold">⚡ {g.xp}</span>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {info.map(([k, v]) => (
              <div key={k} className="rounded-xl bg-card/90 p-3 text-card-foreground">
                <dt className="text-xs font-semibold uppercase text-muted-foreground">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Mapa */}
      <h2 id="camino" className="mt-10 text-center text-2xl font-bold">{t(g.lang, "path")}</h2>
      <div className="mx-auto mt-4 flex max-w-md flex-col gap-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t(g.lang, "search")}
          aria-label={t(g.lang, "search")}
          className="rounded-2xl border-2 border-input bg-card px-4 py-3 font-semibold outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </div>
      {!filtering && region === null && (
        <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-6">
          {regions.map((r) => {
            const label = r === "Costa" ? t(g.lang, "coast") : r === "Sierra" ? t(g.lang, "highlands") : t(g.lang, "jungle");
            const desc = r === "Costa" ? "Litoral pacífico, desiertos y playas" : r === "Sierra" ? "Andes, valles y altiplano" : "Amazonía, selva y ríos";
            const emoji = REGION_EMOJI[r];
            const depts = DEPARTMENTS.filter((d) => d.region === r);
            const crowns = depts.reduce((n, d) => n + g.crowns(d.id), 0);
            const max = depts.length * 4;
            const pctR = Math.round((crowns / max) * 100);
            const started = crowns > 0;
            return (
              <div key={r} className="flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-5 sm:p-6">
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">{depts.length} departamentos</p>
                  <h3 className="mt-1 text-2xl font-bold">{emoji} {label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all" style={{ width: `${pctR}%` }} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">{pctR}%</span>
                    <span className="text-xl">🏆</span>
                  </div>
                  <button
                    onClick={() => setRegion(r)}
                    className="btn-3d mt-4 w-full py-3 text-center sm:w-56"
                  >
                    {started ? "CONTINUAR" : t(g.lang, "start2").toUpperCase()}
                  </button>
                </div>
                <div className="hidden text-7xl sm:block">{emoji}</div>
              </div>
            );
          })}
        </div>
      )}
      {filtering ? (
        <div className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
          {visible.map(({ d }) => (
            <div key={d.id} className="flex flex-col items-center rounded-2xl bg-card p-3">
              <Link to="/departamento/$id" params={{ id: d.id }} aria-label={d.name} className="block">
                {deptImages[d.id] ? (
                  <img src={deptImages[d.id]} alt={d.name} className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <span className="text-4xl">{d.emoji}</span>
                )}
              </Link>
              <span className="mt-1 text-sm font-semibold">{d.name}</span>
              <span className="text-xs text-muted-foreground">{REGION_EMOJI[d.region]} {d.region}</span>
            </div>
          ))}
          {visible.length === 0 && <p className="col-span-full text-center text-muted-foreground">🔍 …</p>}
        </div>
      ) : (
        region !== null && (
        <div className="relative mx-auto mt-6 flex max-w-md flex-col items-center gap-6">
          <button onClick={() => setRegion(null)} className="self-start text-sm font-bold text-muted-foreground hover:text-foreground">
            ← {t(g.lang, "back")}
          </button>
          {DEPARTMENTS.filter(d => d.region === region).map((d, i) => node(d, i))}
          <div className="text-5xl">🏆</div>
        </div>
        )
      )}
      {sel && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-3xl bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className="text-5xl">{sel.emoji}</span>
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{sel.name}</h3>
                <p className="text-sm text-muted-foreground">{REGION_EMOJI[sel.region]} {sel.region} · 👑 {g.crowns(sel.id)}/4 · {Math.round((g.crowns(sel.id) / 4) * 100)}%</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-2xl" aria-label="Cerrar">✕</button>
            </div>
            <p className="mt-3 text-sm">{sel.history}</p>
            <p className="mt-2 text-xs text-muted-foreground">🍽️ {sel.food.join(" · ")}</p>
            <Link to="/departamento/$id" params={{ id: sel.id }} className="btn-3d mt-4 block w-full py-3 text-center">
              {t(g.lang, "start2")}
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
