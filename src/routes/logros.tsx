import { createFileRoute } from "@tanstack/react-router";
import { ACHIEVEMENTS, useGame, exportEvidence } from "@/lib/game";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/logros")({
  head: () => ({
    meta: [
      { title: "Logros — PERÚ QUEST" },
      { name: "description", content: "Tus logros, XP, gemas y racha en PERÚ QUEST." },
      { property: "og:title", content: "Logros — PERÚ QUEST" },
      { property: "og:description", content: "Mira tus medallas por conocer el Perú." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Logros,
});

function Logros() {
  const g = useGame();
  const got = ACHIEVEMENTS.filter((a) => a.test(g));
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <h1 className="text-3xl font-bold">🏆 {t(g.lang, "achievements")}</h1>
      <p className="text-muted-foreground">{got.length}/{ACHIEVEMENTS.length} {t(g.lang, "unlockedOf")}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const ok = a.test(g);
          return (
            <div key={a.id} className={`card-3d p-4 text-center ${ok ? "" : "opacity-50 grayscale"}`}>
              <p className="text-4xl">{a.icon}</p>
              <p className="mt-1 font-bold">{g.lang === "es" ? a.es : a.en}</p>
              <p className="text-xs text-muted-foreground">{g.lang === "es" ? a.des : a.den}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={() => exportEvidence(g)} className="btn-3d px-5 py-3">⬇ {t(g.lang, "export")}</button>
        <button onClick={() => confirm(g.lang === "es" ? "¿Seguro? Se borra tu progreso." : "Sure? Your progress will be erased.") && g.reset()} className="rounded-2xl border-2 border-border px-5 py-3 font-semibold text-destructive">
          {t(g.lang, "reset")}
        </button>
      </div>
    </main>
  );
}
