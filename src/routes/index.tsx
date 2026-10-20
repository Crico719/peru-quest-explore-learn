import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { DEPARTMENTS, PERU, REGION_EMOJI } from "@/data/departments";
import { useGame, exportEvidence } from "@/lib/game";
import { t } from "@/lib/i18n";
import { useWikiImage } from "@/lib/wiki";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { PracticeModal } from "@/components/PracticeModal";
import { IntiMascot } from "@/components/IntiMascot";

const PATH_STROKE = "var(--border)";
const NODE_SIZE = 44;
const NODE_RADIUS = NODE_SIZE / 2;

function getRegionDepts(region: "Costa" | "Sierra" | "Selva") {
  return DEPARTMENTS.filter((d) => d.region === region);
}

function computeRegionPath(depts: (typeof DEPARTMENTS)[number][]) {
  const points: { x: number; y: number }[] = [];
  const startX = 70;
  const startY = 70;
  const stepY = 115;
  const amplitude = 42;

  depts.forEach((_, i) => {
    const x = startX + Math.sin(i * 0.75) * amplitude;
    const y = startY + i * stepY;
    points.push({ x, y });
  });

  let d = "";
  points.forEach((p, i) => {
    if (i === 0) {
      d += `M ${p.x} ${p.y} `;
    } else {
      const prev = points[i - 1]!;
      const cp1x = prev.x + (p.x - prev.x) * 0.45;
      const cp1y = prev.y + (p.y - prev.y) * 0.35;
      const cp2x = p.x - (p.x - prev.x) * 0.45;
      const cp2y = p.y - (p.y - prev.y) * 0.35;
      d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y} `;
    }
  });

  const maxY = points.reduce((m, p) => Math.max(m, p.y), startY) + NODE_RADIUS + 30;
  return { d, points, viewBox: `0 0 200 ${maxY}` };
}

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

  const regions: ("Costa" | "Sierra" | "Selva")[] = ["Costa", "Sierra", "Selva"];
  const regionDepts = useMemo(() => (region ? getRegionDepts(region) : []), [region]);
  const regionPath = useMemo(
    () => (region && regionDepts.length > 0 ? computeRegionPath(regionDepts) : { d: "", points: [], viewBox: "0 0 200 200" }),
    [region, regionDepts]
  );

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

  const isRegionUnlocked = (idx: number) => {
    if (idx === 0) return true;
    const prev = regionDepts[idx - 1]!;
    return g.crowns(prev.id) >= 1;
  };

  const RegionNode = ({ d, idx }: { d: (typeof DEPARTMENTS)[number]; idx: number }) => {
    const c = g.crowns(d.id);
    const pctDept = Math.round((c / 4) * 100);
    const done = c === 4;
    const locked = !isRegionUnlocked(idx);
    const img = deptImages[d.id];
    const { x, y } = regionPath.points[idx]!;

    return (
      <div
        key={d.id}
        className="pointer-events-auto"
        style={{
          position: "absolute",
          left: Math.round(x - NODE_RADIUS),
          top: Math.round(y - NODE_RADIUS),
        }}
      >
        <button
          onClick={() => handleNodeSelect(d.id)}
          disabled={locked}
          aria-label={d.name}
          className="group relative cursor-pointer transition-transform duration-200 motion-safe:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="relative rounded-full">
            <svg className="h-24 w-24 sm:h-28 sm:w-28" viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="22" cy="22" r="18" style={{ stroke: PATH_STROKE }} strokeWidth="4" fill="none" />
              {done
                ? <circle cx="22" cy="22" r="18" style={{ stroke: "var(--gold)" }} strokeWidth="4" strokeLinecap="round" transform="rotate(-90 22 22)" strokeDasharray="113.1" />
                : <circle cx="22" cy="22" r="18" style={{ stroke: "var(--primary)", strokeDasharray: `${(c / 4) * 113.1}, 113.1` }} strokeWidth="4" strokeLinecap="round" transform="rotate(-90 22 22)" />}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {img
                ? <img src={img} alt={d.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-offset-2 ring-primary/20 sm:h-20 sm:w-20" />
                : <span className="text-[32px] filter drop-shadow-md sm:text-[36px]">{d.emoji}</span>}
              {!locked && done && <span className="absolute -bottom-1 -right-1 text-xl" aria-label="Completado">🏆</span>}
              {!locked && c > 0 && c < 4 && <span className="absolute -top-1 -right-1 text-[14px]" aria-label="Progreso">👑</span>}
              {locked && <span className="absolute bottom-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20px]" aria-label="Bloqueado">🔒</span>}
            </div>
          </div>
          <span className="mt-2 text-sm font-bold transition-colors group-hover:text-primary">{d.name}</span>
          <div
            className="absolute mt-44 left-1/2 -translate-x-1/2 h-2 w-16 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={pctDept}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${d.name}: ${pctDept}%`}
          >
            <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all" style={{ width: `${pctDept}%` }} />
          </div>
          <span className="absolute mt-48 left-1/2 -translate-x-1/2 text-[10px] font-bold">{pctDept}%</span>
        </button>
      </div>
    );
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-28">
      {/* Hero */}
      <section className="relative mt-4 overflow-hidden rounded-3xl text-white shadow-xl hero-anim">
        {hero && <img src={hero} alt="Machu Picchu" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
        <div className="relative grid gap-6 p-6 sm:p-10 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
              🇵🇪 {g.lang === "es" ? "Nivel" : "Level"} {g.level}
            </span>
            <div className="mt-3 flex items-center gap-4">
              <h1 className="text-4xl font-bold tracking-tight drop-shadow-md sm:text-6xl">PERÚ QUEST</h1>
              <div className="relative shrink-0 cursor-pointer overflow-hidden rounded-full bg-card p-1 shadow-xl ring-4 ring-white/50 transition-transform duration-300 hover:scale-110" title="Inti tu mascota">
                <IntiMascot size={84} expression="happy" float alt="Inti, la mascota de PERÚ QUEST" className="drop-shadow-lg" />
              </div>
            </div>
            <p className="mt-2 text-lg font-medium drop-shadow-sm sm:text-xl">{t(g.lang, "tagline")}</p>
            <p className="mt-3 inline-flex rounded-2xl bg-black/25 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">🦉 {t(g.lang, "tip")}: {tip}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setPracticeMode(v => !v)}
                className={cn(
                  "rounded-2xl border-2 px-4 py-2 text-sm font-bold backdrop-blur-sm transition-colors",
                  practiceMode ? "border-white bg-white text-green-700" : "border-white/40 bg-white/10 text-white hover:bg-white/20"
                )}
              >
                {practiceMode ? "🎯 Práctica: ON (toca un departamento)" : "🎯 Modo práctica: localización"}
              </button>
              <Link to="/practica" className="rounded-2xl border-2 border-white/40 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                🗺️ {g.lang === "es" ? "Mapa interactivo del Perú" : "Interactive map of Peru"}
              </Link>
            </div>
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
      </section>

      {/* Estadísticas */}
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card-3d rounded-3xl p-5 flex flex-col gap-2">
          <h3 className="text-sm font-bold uppercase text-muted-foreground">{t(g.lang, "progress")}</h3>
          <p className="text-2xl font-bold">👑 {totalCrowns} / {maxCrowns} coronas</p>
          <Progress value={pct} className="mt-3 h-3" aria-label={`${t(g.lang, "progress")}: ${pct}%`} />
          <p className="mt-1 text-xs text-muted-foreground">{pct}% completado</p>
        </div>
        <div className="card-3d rounded-3xl p-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="chip px-4 py-2 text-base text-streak" title="Racha">🔥 {g.streak}</span>
          <span className="chip px-4 py-2 text-base text-gem" title="Gemas">💎 {g.gems}</span>
          <span className="chip px-4 py-2 text-base text-gold" title="XP">⚡ {g.xp} XP</span>
        </div>

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

      {/* Buscador */}
      <div className="mx-auto mt-4 max-w-md">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(g.lang, "search")}
            aria-label={t(g.lang, "search")}
            className="w-full rounded-2xl border-2 border-input bg-card py-3 pl-11 pr-4 font-semibold shadow-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>
      </div>

      {/* Pantalla A: Selector de regiones (solo cuando region === null y no hay filtro) */}
      {!filtering && region === null && (
        <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-6">
          {regions.map((r) => {
            const depts = getRegionDepts(r);
            const label = r === "Costa" ? t(g.lang, "coast") : r === "Sierra" ? t(g.lang, "highlands") : t(g.lang, "jungle");
            const desc = r === "Costa" ? "Litoral pacífico, desiertos y playas" : r === "Sierra" ? "Andes, valles y altiplano" : "Amazonía, selva y ríos";
            const emoji = REGION_EMOJI[r];
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
                    {pctR === 100 && <span className="text-lg" title={g.lang === "es" ? "Región completada" : "Region completed"}>🏆</span>}
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

      {/* Pantalla B: Camino de la región seleccionada (solo cuando region !== null y no hay filtro) */}
      {!filtering && region !== null && (
        <div className="relative mx-auto mt-6 max-w-md pb-28">
          <button
            onClick={() => setRegion(null)}
            className="self-start text-sm font-bold text-muted-foreground hover:text-foreground mb-4"
          >
            ← {t(g.lang, "back")}
          </button>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">{REGION_EMOJI[region]}</span>
            <h3 className="text-xl font-bold">
              {region === "Costa" ? t(g.lang, "coast") : region === "Sierra" ? t(g.lang, "highlands") : t(g.lang, "jungle")}
            </h3>
          </div>
          {/* SVG: solo el sendero */}
          <svg
            className="w-full max-w-md h-auto block mx-auto"
            viewBox={regionPath.viewBox}
            preserveAspectRatio="xMidYMid meet"
            aria-label={`Camino de ${region}`}
          >
            <path
              d={regionPath.d}
              stroke={PATH_STROKE}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-40"
            />
            <path
              d={regionPath.d}
              stroke="var(--primary)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-70"
            />
          </svg>
          {/* Capa HTML: nodos posicionados absolutamente sobre el SVG */}
          <div
            className="absolute inset-0 w-full max-w-md mx-auto pointer-events-none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              maxWidth: "320px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {regionDepts.map((d, i) => (
              <RegionNode key={d.id} d={d} idx={i} />
            ))}
          </div>
          <div className="text-5xl mx-auto mt-6 text-center">🏆</div>
        </div>
      )}

      {/* Pantalla C: Resultados de búsqueda (solo cuando hay filtro) */}
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
      ) : null}

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
