import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DEPARTMENTS, REGION_EMOJI, locDept } from "@/data/departments";
import { MAP_UNITS, MAP_VIEWBOX, type MapUnit } from "@/data/peru-map";
import { CALLAO_INFO } from "@/data/callao";
import { useGame } from "@/lib/game";
import { PeruMap } from "@/components/PeruMap";
import { GeoGame } from "@/components/GeoGame";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/practica")({
  head: () => ({
    meta: [
      { title: "Mapa y práctica — PERÚ QUEST" },
      {
        name: "description",
        content:
          "Mapa interactivo del Perú con los 24 departamentos y la Provincia Constitucional del Callao, fichas culturales y juego de localización.",
      },
    ],
  }),
  component: PracticaPage,
});

type Mode = "explorar" | "practicar" | "contrarreloj";

function ordinalPosition(u: MapUnit, lang: "es" | "en") {
  const t = u.cy / MAP_VIEWBOX.h;
  if (u.id === "callao") return lang === "es" ? "costa central" : "central coast";
  if (t < 0.33) return lang === "es" ? "norte del país" : "north of the country";
  if (t < 0.66) return lang === "es" ? "centro del país" : "center of the country";
  return lang === "es" ? "sur del país" : "south of the country";
}

function Ficha({ unit, onClose }: { unit: MapUnit; onClose: () => void }) {
  const g = useGame();
  const es = g.lang === "es";
  const base = DEPARTMENTS.find((d) => d.id === unit.id);
  const d = base ? locDept(base, g.lang) : undefined;
  const info = CALLAO_INFO[g.lang];
  const crowns = base ? g.crowns(unit.id) : null;

  return (
    <aside className="card-3d pop-in rounded-3xl p-5" aria-label={es ? "Ficha de " + unit.name : unit.name + " card"}>
      <div className="flex items-start gap-3">
        <span className="text-4xl">{base?.emoji ?? "⚓"}</span>
        <div className="flex-1">
          <h3 className="text-2xl font-bold">{unit.name}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span
              className={cn(
                "rounded-full border-2 px-2 py-0.5 text-[10px] font-bold uppercase",
                unit.category === "Provincia Constitucional"
                  ? "border-gem text-gem"
                  : "border-border text-muted-foreground"
              )}
            >
              {unit.category}
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-secondary-foreground">
              {REGION_EMOJI[unit.region]} {unit.region}
            </span>
            {crowns !== null && <span className="text-[10px] font-bold text-gold">👑 {crowns}/4</span>}
          </div>
        </div>
        <button onClick={onClose} aria-label={es ? "Cerrar ficha" : "Close card"} className="text-2xl hover:text-primary">
          ✕
        </button>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="font-bold">{es ? "Capital" : "Capital"}:</dt>
          <dd>{d ? d.capital : info.capital}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-bold">{es ? "Ubicación" : "Location"}:</dt>
          <dd className="text-muted-foreground">{ordinalPosition(unit, g.lang)}</dd>
        </div>
      </dl>

      {d ? (
        <div className="mt-3 space-y-2 text-sm">
          <p>
            <span className="font-bold">🍽️ </span>
            {d.food.slice(0, 3).join(" · ")}
          </p>
          <p>
            <span className="font-bold">🎉 </span>
            {d.fiestas[0]}
          </p>
          <p className="rounded-2xl bg-muted p-2">
            <span className="font-bold">ℹ️ {d.facts[0]!.t}: </span>
            <span className="text-muted-foreground">{d.facts[0]!.d}</span>
          </p>
          <Link to="/departamento/$id" params={{ id: unit.id }} className="btn-3d mt-2 block rounded-2xl py-3 text-center">
            {es ? "EXPLORAR DEPARTAMENTO ▶" : "EXPLORE DEPARTMENT ▶"}
          </Link>
        </div>
      ) : (
        <div className="mt-3 space-y-2 text-sm">
          <p>{info.history}</p>
          <p>
            <span className="font-bold">🍽️ </span>
            {info.food.join(" · ")}
          </p>
          <p className="rounded-2xl bg-muted p-2">
            <span className="font-bold">ℹ️ {info.facts[0]!.t}: </span>
            <span className="text-muted-foreground">{info.facts[0]!.d}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {es
              ? "La Provincia Constitucional del Callao no forma parte del camino de coronas."
              : "The Constitutional Province of Callao is not part of the crown path."}
          </p>
        </div>
      )}
    </aside>
  );
}

function PracticaPage() {
  const g = useGame();
  const es = g.lang === "es";
  const [mode, setMode] = useState<Mode>("explorar");
  const [selected, setSelected] = useState<MapUnit | null>(null);

  const tabs: { k: Mode; icon: string; label: string }[] = [
    { k: "explorar", icon: "🗺️", label: es ? "Explorar" : "Explore" },
    { k: "practicar", icon: "🎯", label: es ? "Practicar" : "Practice" },
    { k: "contrarreloj", icon: "⏱️", label: es ? "Contrarreloj" : "Time attack" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-4">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">🗺️ {es ? "Mapa del Perú" : "Map of Peru"}</h1>
        <div className="ml-auto flex flex-wrap gap-2" role="tablist" aria-label={es ? "Modos" : "Modes"}>
          {tabs.map((tb) => (
            <button
              key={tb.k}
              role="tab"
              aria-selected={mode === tb.k}
              onClick={() => {
                setMode(tb.k);
                setSelected(null);
              }}
              className={cn(
                "rounded-2xl border-2 border-border px-4 py-2 text-sm font-bold transition-all",
                mode === tb.k ? "bg-primary text-primary-foreground shadow-[0_3px_0_var(--primary-shadow)]" : "hover:bg-muted"
              )}
            >
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>
      </header>

      {mode === "explorar" && (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {es
              ? "Toca un departamento o la Provincia Constitucional del Callao para ver su ficha. Los colores muestran tu progreso: gris sin explorar, verde en progreso, dorado completado."
              : "Tap a department or the Constitutional Province of Callao to see its card. Colors show your progress: grey unexplored, green in progress, gold completed."}
          </p>
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="card-3d rounded-3xl p-3">
              <PeruMap onSelect={(u) => setSelected(u)} lang={g.lang} className="mx-auto max-w-lg" />
            </div>
            {selected ? (
              <Ficha unit={selected} onClose={() => setSelected(null)} />
            ) : (
              <div className="card-3d flex flex-col items-center justify-center gap-2 rounded-3xl p-5 text-center">
                <p className="text-4xl">👆</p>
                <p className="font-bold">{es ? "Selecciona una unidad del mapa" : "Select a unit on the map"}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <span className="inline-block size-3 rounded-full border-2 border-border" style={{ background: "var(--muted)" }} />{" "}
                    {es ? "Sin explorar" : "Unexplored"}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block size-3 rounded-full border-2 border-border" style={{ background: "color-mix(in oklab, var(--primary) 30%, var(--card))" }} />{" "}
                    {es ? "En progreso" : "In progress"}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block size-3 rounded-full border-2 border-border" style={{ background: "color-mix(in oklab, var(--gold) 45%, var(--card))" }} />{" "}
                    {es ? "Completado" : "Completed"}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block size-3 rounded-full" style={{ background: "color-mix(in oklab, var(--gem) 30%, var(--card))" }} />{" "}
                    {es ? "Prov. Const. del Callao" : "Const. Prov. of Callao"}
                  </span>
                </div>
                <Link to="/aventura" className="btn-3d mt-3 rounded-2xl px-4 py-2 text-xs">
                  🎮 {es ? "PROTOTIPO: AVENTURA 2D" : "PROTOTYPE: 2D ADVENTURE"}
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {(mode === "practicar" || mode === "contrarreloj") && (
        <GeoGame timed={mode === "contrarreloj"} onExit={() => setMode("explorar")} />
      )}
    </main>
  );
}
