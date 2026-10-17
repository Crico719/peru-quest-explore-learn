import { Link } from "@tanstack/react-router";
import { useGame } from "@/lib/game";

export function TopBar() {
  const g = useGame();
  return (
    <header className="sticky top-0 z-30 border-b-2 border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-2 sm:gap-4">
        <Link to="/" className="text-xl font-bold tracking-tight text-primary sm:text-2xl">PERÚ QUEST</Link>
        <div className="ml-auto flex items-center gap-2 text-sm font-semibold sm:gap-4 sm:text-base">
          <span className="text-streak" title="Racha">🔥 {g.streak}</span>
          <span className="text-gem" title="Gemas">💎 {g.gems}</span>
          <span className="text-gold" title="XP">⚡ {g.xp}</span>
          <Link to="/logros" className="rounded-xl px-2 py-1 hover:bg-muted" title="Logros">🏆</Link>
          <button onClick={() => g.setLang(g.lang === "es" ? "en" : "es")} className="rounded-xl border-2 border-border px-2 py-0.5 text-xs">
            {g.lang.toUpperCase()}
          </button>
          <button onClick={g.toggleDark} className="rounded-xl px-2 py-1 hover:bg-muted" aria-label="Modo oscuro">
            {g.dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
