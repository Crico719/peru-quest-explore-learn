import { useGame } from "@/lib/game";
import { MAP_UNITS, MAP_VIEWBOX, MAP_SOURCE, type MapUnit } from "@/data/peru-map";
import { cn } from "@/lib/utils";

export type MapHighlight = {
  /** unidad correcta (dorado) */
  correct?: string | null;
  /** selección incorrecta (rojo) */
  wrong?: string | null;
};

type PeruMapProps = {
  onSelect?: (u: MapUnit) => void;
  highlight?: MapHighlight | null;
  /** bloquea la interacción durante el feedback del juego */
  locked?: boolean;
  /** etiquetas de nombre (se ocultan en modo juego) */
  showLabels?: boolean;
  /** relleno según coronas del estudiante */
  showProgress?: boolean;
  className?: string;
  /** idioma para aria-labels */
  lang?: "es" | "en";
};

function unitFill(u: MapUnit, crowns: number, hl: MapHighlight | null | undefined, progress: boolean) {
  if (hl?.correct === u.id) return "var(--gold)";
  if (hl?.wrong === u.id) return "var(--destructive)";
  if (u.category === "Provincia Constitucional") return "color-mix(in oklab, var(--gem) 30%, var(--card))";
  if (progress) {
    if (crowns >= 4) return "color-mix(in oklab, var(--gold) 45%, var(--card))";
    if (crowns > 0) return "color-mix(in oklab, var(--primary) 30%, var(--card))";
  }
  return "var(--muted)";
}

function unitStroke(u: MapUnit, crowns: number, hl: MapHighlight | null | undefined) {
  if (hl?.correct === u.id) return "var(--gold)";
  if (hl?.wrong === u.id) return "var(--destructive)";
  if (crowns >= 4) return "var(--gold)";
  if (u.category === "Provincia Constitucional") return "var(--gem)";
  return "var(--border)";
}

export function PeruMap({
  onSelect,
  highlight,
  locked = false,
  showLabels = true,
  showProgress = true,
  className,
  lang = "es",
}: PeruMapProps) {
  const g = useGame();
  const isCallao = (u: MapUnit) => u.category === "Provincia Constitucional";
  const labelMin = 1500; // no etiquetar unidades muy pequeñas (Callao, Tumbes…)

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${MAP_VIEWBOX.w} ${MAP_VIEWBOX.h}`}
        className="h-auto w-full select-none"
        role="group"
        aria-label={lang === "es" ? "Mapa interactivo del Perú" : "Interactive map of Peru"}
        style={{ touchAction: "manipulation" }}
      >
        {MAP_UNITS.map((u) => {
          const crowns = isCallao(u) ? -1 : g.crowns(u.id);
          const fill = unitFill(u, crowns, highlight, showProgress);
          const stroke = unitStroke(u, crowns, highlight);
          const label =
            lang === "es"
              ? `${u.name} — ${u.category}, región ${u.region}` + (crowns >= 0 ? `, ${crowns} de 4 coronas` : "")
              : `${u.name} — ${u.category}, ${u.region} region` + (crowns >= 0 ? `, ${crowns} of 4 crowns` : "");
          return (
            <path
              key={u.id}
              d={u.d}
              fill={fill}
              stroke={stroke}
              strokeWidth={1.5}
              strokeLinejoin="round"
              className={cn(
                "cursor-pointer transition-[filter,fill] duration-150 motion-safe:hover:brightness-110 motion-safe:focus-visible:brightness-110",
                locked && "cursor-default"
              )}
              style={{ strokeDasharray: u.category === "Provincia Constitucional" ? "4 2" : undefined }}
              role="button"
              tabIndex={locked ? -1 : 0}
              aria-label={label}
              onClick={() => !locked && onSelect?.(u)}
              onKeyDown={(e) => {
                if (!locked && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSelect?.(u);
                }
              }}
            />
          );
        })}
        {showLabels &&
          MAP_UNITS.filter((u) => u.area >= labelMin).map((u) => (
            <text
              key={`lbl-${u.id}`}
              x={u.cx}
              y={u.cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none fill-foreground/70 font-bold"
              style={{ fontSize: Math.max(13, Math.min(22, Math.sqrt(u.area) / 5)) }}
            >
              {u.name}
            </text>
          ))}
      </svg>
      <p className="mt-1 text-center text-[10px] text-muted-foreground">
        {lang === "es" ? "Límites: " : "Boundaries: "}
        {MAP_SOURCE}
      </p>
    </div>
  );
}
