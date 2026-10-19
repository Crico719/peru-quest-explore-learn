import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DEPARTMENTS, PERU, REGION_EMOJI } from "@/data/departments";
import { useGame, exportEvidence } from "@/lib/game";
import { t } from "@/lib/i18n";
import { useWikiImage } from "@/lib/wiki";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { PracticeModal } from "@/components/PracticeModal";
import { IntiMascot } from "@/components/IntiMascot";

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

const REGION_THEME: Record<"Costa" | "Sierra" | "Selva", { border: string; bar: string; blob: string }> = {
  Costa: { border: "hover:border-sky-400", bar: "from-sky-400 to-blue-500", blob: "from-sky-400/25 to-cyan-300/10" },
  Sierra: { border: "hover:border-amber-400", bar: "from-amber-400 to-orange-500", blob: "from-amber-400/25 to-orange-300/10" },
  Selva: { border: "hover:border-emerald-400", bar: "from-emerald-400 to-green-600", blob: "from-emerald-400/25 to-green-300/10" },
};

function Index() {
  const g = useGame();
  const { data: hero } = useWikiImage("Machu_Picchu");
  const [q, setQ] = useState("");
  const [practiceMode, setPracticeMode] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
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
  const current = currentIdx >= 0 ? DEPARTMENTS[currentIdx]! : undefined;
  const curP = current ? g.progress[current.id] ?? {} : undefined;
  const missionGames = current
    ? [
        { icon: "❓", done: (curP?.quiz ?? 0) >= 2 },
        { icon: "🃏", done: !!curP?.memory },
        { icon: "👆", done: !!curP?.tap },
        { icon: "🔢", done: !!curP?.order },
      ]
    : [];
  const tip = TIPS[g.lang][new Date().getDate() % TIPS[g.lang].length];
  const regions: ("Costa" | "Sierra" | "Selva")[] = ["Costa", "Sierra", "Selva"];
  const filtering = q.trim() !== "";
  const navigate = useNavigate();
  const handleNodeSelect = (id: string) => {
    if (practiceMode) setSelectedDept(id);
    else navigate({ to: "/departamento/$id", params: { id } });
  };
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
        <button onClick={() => handleNodeSelect(d.id)} aria-label={d.name} className="group relative cursor-pointer transition-transform duration-200 motion-safe:hover:scale-105">
          <div className={cn("relative rounded-full", isCurrent && "node-current-ring")}>
            {/* Círculo progresivo (aro como Duolingo) */}
            <svg className="h-28 w-28" viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="22" cy="22" r="18" style={{ stroke: "var(--muted)" }} strokeWidth="4" fill="none" />
              {done
                ? <circle cx="22" cy="22" r="18" style={{ stroke: "var(--gold)" }} strokeWidth="4" strokeLinecap="round" transform="rotate(-90 22 22)" strokeDasharray="113.1" />
                : <circle cx="22" cy="22" r="18" style={{ stroke: "var(--primary)", strokeDasharray: `${(c / 4) * 113.1}, 113.1` }} strokeWidth="4" strokeLinecap="round" transform="rotate(-90 22 22)" />}
            </svg>
            {/* Emoji encima del anillo */}
            <div className="absolute inset-0 flex items-center justify-center">
              {img
                ? <img src={img} alt={d.name} className="h-20 w-20 rounded-full object-cover ring-2 ring-offset-2 ring-primary/20" />
                : <span className="text-[36px] filter drop-shadow-md">{d.emoji}</span>}
              {isCurrent && <span className="absolute -top-1 -right-1 text-2xl animate-pulse" aria-label="Departamento actual">🔥</span>}
              {done && <span className="absolute -bottom-1 -right-1 text-xl" aria-label="Completado">🏆</span>}
            </div>
          </div>
          <span className="mt-2 text-sm font-bold transition-colors group-hover:text-primary">{d.name}</span>
          <div
            className="mt-1 h-2 w-16 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={pctDept}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${d.name}: ${pctDept}%`}
          >
            <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all" style={{ width: `${pctDept}%` }} />
          </div>
          <span className="text-[10px] font-bold">{pctDept}%</span>
        </button>
      </div>
    );
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24">
      {/* Hero */}
      <section className="relative mt-4 overflow-hidden rounded-3xl text-white shadow-xl hero-anim">
        {hero && <img src={hero} alt="Machu Picchu" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
        <div className="relative grid gap-6 p-6 sm:p-10 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
              🇵🇪 {g.lang === "es" ? "Nivel" : "Level"} {g.level}
            </span>
            <div className="mt-3 flex items-center gap-4">
              <h1 className="text-4xl font-bold drop-shadow-sm sm:text-5xl">PERÚ QUEST</h1>
              <div className="relative cursor-pointer transition-transform duration-300 hover:scale-110" title="Inti tu mascota">
                <IntiMascot size={64} expression="happy" float alt="Inti, la mascota de PERÚ QUEST" />
              </div>
            </div>
            <p className="mt-2 text-lg font-medium drop-shadow-sm">{t(g.lang, "tagline")}</p>
            <p className="mt-2 inline-flex rounded-2xl bg-black/25 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">🦉 {t(g.lang, "tip")}: {tip}</p>
            <button onClick={() => setPracticeMode(v => !v)} className="mt-2 btn-3d rounded-2xl px-4 py-2 text-sm font-bold">
              {practiceMode ? "🎯 Práctica: ON (toca un departamento)" : "🎯 Modo práctica: localización"}
            </button>
            <Link to="/practica" className="mt-2 inline-block rounded-2xl border-2 border-white/40 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
              🗺️ {g.lang === "es" ? "Mapa interactivo del Perú" : "Interactive map of Peru"}
            </Link>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {info.map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/20 bg-card/90 p-3 text-card-foreground shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                <dt className="text-xs font-semibold uppercase text-muted-foreground">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
</div>

{/* Estadísticas */}
<section className="mt-6 grid gap-4 md:grid-cols-2">
  <div className="card-3d rounded-3xl p-5 flex flex-col gap-2">
    <h3 className="text-sm font-bold uppercase text-muted-foreground">{t(g.lang, "progress")}</h3>
    <p className="text-2xl font-bold">👑 {totalCrowns} / {maxCrowns} coronas</p>
    <Progress value={pct} className="mt-3 h-3" aria-label={`${t(g.lang, "progress")}: ${pct}%`} />
    <p className="mt-1 text-xs text-muted-foreground">{pct}% completado</p>
  </div>
  <div className="card-3d rounded-3xl p-5 flex flex-wrap gap-1.5 justify-center items-center">
    <span className="chip text-streak" title="Racha">🔥 {g.streak}</span>
    <span className="chip text-gem" title="Gemas">💎 {g.gems}</span>
    <span className="chip text-gold" title="XP">⚡ {g.xp} XP</span>
  </div>
</section>

        {current ? (
          <div className="card-3d pop-in rounded-3xl p-5 md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">🎯 {g.lang === "es" ? "Misión de hoy" : "Today's mission"}</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-bold">{current.emoji} {current.name}</h3>
              <div className="flex gap-1.5" aria-label={g.lang === "es" ? "Estado de las actividades" : "Activity status"}>
                {missionGames.map((mg, k) => (
                  <span
                    key={k}
                    title={mg.done ? (g.lang === "es" ? "Completado" : "Completed") : (g.lang === "es" ? "Pendiente" : "Pending")}
                    className={cn(
                      "grid size-9 place-items-center rounded-xl border-2 text-base",
                      mg.done ? "border-success bg-primary/10" : "border-border bg-muted opacity-70"
                    )}
                  >
                    {mg.done ? "✅" : mg.icon}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              👑 {g.crowns(current.id)}/4 · {g.lang === "es" ? "Completa las actividades pendientes" : "Complete the pending activities"}
            </p>
            <Link to="/departamento/$id" params={{ id: current.id }} className="btn-3d mt-4 inline-block rounded-2xl px-6 py-3 text-center">
              {t(g.lang, "start2").toUpperCase()} ▶
            </Link>
          </div>
        ) : (
          <div className="card-3d rounded-3xl p-5 text-center md:col-span-2 md:self-center">
            <p className="text-5xl">🎉</p>
            <h3 className="mt-2 text-xl font-bold">{g.lang === "es" ? "¡Conociste todo el Perú!" : "You've explored all of Peru!"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{g.lang === "es" ? "Juega de nuevo para mejorar tus puntajes" : "Play again to improve your scores"}</p>
          </div>
        )}
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
            const theme = REGION_THEME[r];
            return (
              <div key={r} className={cn("group relative flex items-center gap-4 overflow-hidden rounded-3xl border-2 border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-6", theme.border)}>
                <div className={cn("pointer-events-none absolute -right-6 -top-6 size-32 rounded-full bg-gradient-to-br blur-2xl", theme.blob)} aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">{depts.length} departamentos</p>
                  <h3 className="mt-1 text-2xl font-bold">{emoji} {label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div
                      className="h-4 flex-1 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuenow={pctR}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${label}: ${pctR}%`}
                    >
                      <div className={cn("h-full rounded-full bg-gradient-to-r transition-all", theme.bar)} style={{ width: `${pctR}%` }} />
                    </div>
                    <span className="text-xs font-bold">{pctR}%</span>
                    <span className="text-sm font-semibold">👑 {crowns}/{max}</span>
                  </div>
                  <button
                    onClick={() => setRegion(r)}
                    className="btn-3d mt-4 w-full rounded-2xl py-3 text-center font-bold focus-visible:outline-primary sm:w-56"
                    aria-label={`${started ? t(g.lang, "start2") : "Continuar"} — ${label}`}
                  >
                    {started ? "CONTINUAR" : t(g.lang, "start2").toUpperCase()}
                  </button>
                </div>
                <div className="hidden text-7xl transition-transform duration-300 group-hover:scale-110 motion-safe:group-hover:rotate-3 sm:block" aria-hidden="true">{emoji}</div>
              </div>
            );
          })}
        </div>
      )}
      {filtering ? (
        <div className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
          {visible.map(({ d }) => (
            <div key={d.id} className="flex flex-col items-center rounded-2xl bg-card p-3 transition-transform hover:scale-[1.02] hover:shadow-md">
              <Link to="/departamento/$id" params={{ id: d.id }} aria-label={d.name} className="block">
                {deptImages[d.id] ? (
                  <img src={deptImages[d.id]} alt={d.name} className="h-20 w-20 rounded-full object-cover ring-2 ring-offset-2 ring-primary/20" />
                ) : (
                  <span className="text-4xl">{d.emoji}</span>
                )}
              </Link>
              <span className="mt-1 text-sm font-semibold">{d.name}</span>
              <span className="text-xs text-muted-foreground">{REGION_EMOJI[d.region]} {d.region}</span>
            </div>
          ))}
          {visible.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed p-8 text-center">
              <p className="text-2xl">🔍</p>
              <p className="mt-2 font-semibold">No se encontraron departamentos</p>
              <p className="text-sm text-muted-foreground">Intenta con otro término o limpia el filtro</p>
              <button onClick={() => setQ("")} className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Limpiar filtro</button>
            </div>
          )}
        </div>
      ) : (
        region === null && (
        <div className="relative mx-auto mt-6 flex max-w-md flex-col items-center gap-6">
          <button onClick={() => setRegion(null)} className="self-start text-sm font-bold text-muted-foreground hover:text-foreground">
            ← {t(g.lang, "back")}
          </button>
          {DEPARTMENTS.map((d, i) => node(d, i))}
          <div className="text-5xl">🏆</div>
        </div>
        )
      )}
      {sel && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setSelected(null)}>
          <div className="pop-in w-full max-w-md rounded-3xl bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
      <PracticeModal open={!!selectedDept} onClose={() => setSelectedDept(null)} deptId={selectedDept} />
    </main>
  );
}
