import { Link } from "@tanstack/react-router";
import { useGame } from "@/lib/game";
import { IntiMascot } from "@/components/IntiMascot";

export function TopBar() {
  const g = useGame();
  return (
    <header className="sticky top-0 z-30 border-b-2 border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-2 sm:gap-3">
        <Link to="/" className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-primary transition-transform hover:scale-105 sm:text-2xl" aria-label="PERÚ QUEST — Inicio">
          <IntiMascot size={30} expression="happy" alt="" />
          PERÚ QUEST
        </Link>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span className="chip text-streak" title="Racha" aria-label={`Racha: ${g.streak} días`}>
            <span aria-hidden="true">🔥</span> {g.streak}
          </span>
          <span className="chip text-gem" title="Gemas" aria-label={`Gemas: ${g.gems}`}>
            <span aria-hidden="true">💎</span> {g.gems}
          </span>
          <span className="chip text-gold" title="XP" aria-label={`XP: ${g.xp}`}>
            <span aria-hidden="true">⚡</span> {g.xp}
          </span>
          <Link
            to="/logros"
            className="chip hover:text-primary"
            title="Logros"
            aria-label="Ver logros y clasificación"
          >
            <span aria-hidden="true">🏆</span>
          </Link>
          <button
            onClick={() => g.setLang(g.lang === "es" ? "en" : "es")}
            className="chip min-w-11 justify-center text-xs"
            aria-label={g.lang === "es" ? "Switch to English" : "Cambiar a español"}
          >
            {g.lang.toUpperCase()}
          </button>
          <button
            onClick={g.toggleDark}
            className="chip justify-center"
            aria-label={g.dark ? "Activar modo claro" : "Activar modo oscuro"}
          >
            {g.dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
