import { useEffect, useMemo, useState } from "react";
import { DEPARTMENTS, REGION_EMOJI, locDept } from "@/data/departments";
import { MAP_UNITS, type MapUnit } from "@/data/peru-map";
import { CALLAO_INFO } from "@/data/callao";
import { useGame } from "@/lib/game";
import { soundManager } from "@/lib/audio";
import { PeruMap, type MapHighlight } from "./PeruMap";
import { cn } from "@/lib/utils";

type GeoGameProps = {
  /** contrarreloj: 10 s por pregunta */
  timed?: boolean;
  onExit: () => void;
};

type Phase = "ask" | "feedback" | "done";

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

/** Dificultad progresiva por tamaño: unidades grandes = fáciles, pequeñas (y Callao) = difíciles */
function buildRounds(timed: boolean): MapUnit[] {
  const sorted = [...MAP_UNITS].sort((a, b) => b.area - a.area);
  const tiers = [sorted.slice(0, 8), sorted.slice(8, 16), sorted.slice(16)];
  const perTier = timed ? 3 : 2;
  return tiers.flatMap((t) => shuffle(t).slice(0, perTier));
}

const TIME_PER_ROUND = 10;

function targetFact(u: MapUnit, lang: "es" | "en") {
  if (u.category === "Provincia Constitucional") return CALLAO_INFO[lang].facts[0]!;
  const base = DEPARTMENTS.find((d) => d.id === u.id);
  if (!base) return undefined;
  return locDept(base, lang).facts[0];
}

function targetCapital(u: MapUnit, lang: "es" | "en") {
  if (u.category === "Provincia Constitucional") return CALLAO_INFO[lang].capital;
  const base = DEPARTMENTS.find((d) => d.id === u.id);
  return base ? locDept(base, lang).capital : u.name;
}

export function GeoGame({ timed = false, onExit }: GeoGameProps) {
  const g = useGame();
  const es = g.lang === "es";
  const [gameId, setGameId] = useState(0);
  const units = useMemo(() => buildRounds(timed), [timed, gameId]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [attempts, setAttempts] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [lastRoundScore, setLastRoundScore] = useState(0);
  const [highlight, setHighlight] = useState<MapHighlight>({});
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const maxScore = units.length * 2;

  const target = units[idx]!;
  const wasCorrect = lastRoundScore > 0;

  // Contrarreloj
  useEffect(() => {
    if (!timed || phase !== "ask") return;
    if (timeLeft <= 0) {
      // Se acabó el tiempo: cuenta como fallo
      g.complete(target.id, "locate", 0, 2);
      setLastRoundScore(0);
      setHighlight({ correct: target.id });
      setPhase("feedback");
      soundManager.playSfx("incorrect");
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timed, phase, timeLeft, target, g]);

  const nextRound = () => {
    if (idx + 1 >= units.length) {
      setPhase("done");
      soundManager.playSfx("crown");
      return;
    }
    setIdx((i) => i + 1);
    setAttempts(0);
    setUsedHint(false);
    setHighlight({});
    setTimeLeft(TIME_PER_ROUND);
    setPhase("ask");
  };

  const restart = () => {
    setGameId((n) => n + 1);
    setIdx(0);
    setAttempts(0);
    setUsedHint(false);
    setTotalScore(0);
    setLastRoundScore(0);
    setHighlight({});
    setTimeLeft(TIME_PER_ROUND);
    setPhase("ask");
  };

  const handleSelect = (u: MapUnit) => {
    if (phase !== "ask") return;
    if (u.id === target.id) {
      const roundScore = attempts === 0 && !usedHint ? 2 : 1;
      g.complete(target.id, "locate", roundScore, 2);
      setTotalScore((s) => s + roundScore);
      setLastRoundScore(roundScore);
      setHighlight({ correct: target.id });
      setPhase("feedback");
      soundManager.playSfx("correct");
      return;
    }
    const nextAttempt = attempts + 1;
    if (nextAttempt >= 2) {
      // segundo fallo: revelar respuesta
      g.complete(target.id, "locate", 0, 2);
      setLastRoundScore(0);
      setHighlight({ correct: target.id, wrong: u.id });
      setPhase("feedback");
      soundManager.playSfx("incorrect");
    } else {
      // primer fallo: queda un reintento con pista automática
      setAttempts(nextAttempt);
      setUsedHint(true);
      setHighlight({ wrong: u.id });
      soundManager.playSfx("incorrect");
    }
  };

  if (phase === "done") {
    const pct = Math.round((totalScore / maxScore) * 100);
    return (
      <div className="card-3d pop-in mx-auto max-w-md rounded-3xl p-6 text-center">
        <p className="text-5xl">{pct >= 80 ? "🏆" : pct >= 50 ? "🎉" : "🧭"}</p>
        <h3 className="mt-2 text-2xl font-bold">{es ? "¡Ronda completada!" : "Round complete!"}</h3>
        <p className="mt-1 font-semibold">
          {es ? "Puntaje" : "Score"}: {totalScore}/{maxScore} ({pct}%)
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {es
            ? "La práctica no suma XP ni coronas: queda registrada en tu evidencia de aprendizaje."
            : "Practice doesn't add XP or crowns: it is recorded in your learning evidence."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button onClick={restart} className="btn-3d rounded-2xl px-5 py-3">
            {es ? "JUGAR OTRA VEZ" : "PLAY AGAIN"}
          </button>
          <button
            onClick={onExit}
            className="rounded-2xl border-2 border-border px-5 py-3 font-bold hover:bg-muted"
          >
            {es ? "VOLVER AL MAPA" : "BACK TO MAP"}
          </button>
        </div>
      </div>
    );
  }

  const fact = targetFact(target, g.lang);
  const capital = targetCapital(target, g.lang);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      {/* Mapa (sin etiquetas: no revela respuestas) */}
      <div className="card-3d rounded-3xl p-3">
        <PeruMap
          onSelect={handleSelect}
          highlight={highlight}
          locked={phase !== "ask"}
          showLabels={false}
          showProgress={false}
          lang={g.lang}
          className="mx-auto max-w-md"
        />
      </div>

      {/* Panel de pregunta */}
      <div className="flex flex-col gap-3">
        <div className="card-3d pop-in rounded-3xl p-5" key={`${gameId}-${idx}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            {es ? `Pregunta ${idx + 1} de ${units.length}` : `Question ${idx + 1} of ${units.length}`} ·{" "}
            {attempts === 0
              ? es ? "Dificultad " + (idx < 2 ? "fácil" : idx < 4 ? "media" : "difícil")
                   : "Difficulty " + (idx < 2 ? "easy" : idx < 4 ? "medium" : "hard")
              : es ? "¡Último intento!" : "Last try!"}
          </p>
          <h3 className="mt-2 text-2xl font-bold">{es ? "¿Dónde se encuentra" : "Where is"}</h3>
          <h2 className="text-3xl font-extrabold text-primary">
            {DEPARTMENTS.find((d) => d.id === target.id)?.emoji ?? "⚓"} {target.name}
          </h2>
          {timed && phase === "ask" && (
            <p
              className={cn("mt-2 font-bold", timeLeft <= 3 ? "text-destructive" : "text-muted-foreground")}
              role="timer"
              aria-label={es ? `Tiempo restante: ${timeLeft} segundos` : `Time left: ${timeLeft} seconds`}
            >
              ⏱ {timeLeft}s
            </p>
          )}

          {/* Pista */}
          {(usedHint || attempts > 0) && phase === "ask" && (
            <p className="mt-2 rounded-2xl bg-secondary p-3 text-sm font-semibold">
              💡 {es ? "Pista: está en la región" : "Hint: it's in the"} {REGION_EMOJI[target.region]}{" "}
              {es ? target.region : target.region} · {es ? "Capital" : "Capital"}: {capital}
            </p>
          )}
          {phase === "ask" && !usedHint && attempts === 0 && (
            <button
              onClick={() => setUsedHint(true)}
              className="mt-3 rounded-2xl border-2 border-border px-4 py-2 text-sm font-bold hover:bg-muted"
            >
              💡 {es ? "Pista (vale 1 punto)" : "Hint (worth 1 point)"}
            </button>
          )}

          {/* Feedback */}
          {phase === "feedback" && (
            <div className="mt-3 space-y-2">
              <p
                className={cn(
                  "text-lg font-extrabold",
                  wasCorrect ? "text-primary" : "text-destructive"
                )}
                role="status"
              >
                {wasCorrect
                  ? es ? `¡Correcto! +${lastRoundScore} pts 🎉` : `Correct! +${lastRoundScore} pts 🎉`
                  : es ? `Era ${target.name}. ¡Suerte en la próxima!` : `It was ${target.name}. Better luck next time!`}
              </p>
              <div className="rounded-2xl bg-muted p-3 text-sm">
                <p className="font-bold">
                  📍 {target.name} — {target.category}
                </p>
                <p className="text-muted-foreground">
                  {REGION_EMOJI[target.region]} {es ? "Región" : "Region"}: {target.region} ·{" "}
                  {es ? "Capital" : "Capital"}: {capital}
                </p>
                {fact && (
                  <p className="mt-1 text-muted-foreground">
                    ℹ️ {fact.t}: {fact.d}
                  </p>
                )}
              </div>
              <button onClick={nextRound} className="btn-3d w-full rounded-2xl px-5 py-3">
                {idx + 1 >= units.length
                  ? es ? "VER RESULTADO" : "SEE RESULTS"
                  : es ? "SIGUIENTE ▶" : "NEXT ▶"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-2 text-sm font-bold">
          <span>⭐ {es ? "Puntaje" : "Score"}: {totalScore}/{maxScore}</span>
          <button onClick={onExit} className="text-muted-foreground underline hover:text-foreground">
            {es ? "Salir" : "Exit"}
          </button>
        </div>
      </div>
    </div>
  );
}
