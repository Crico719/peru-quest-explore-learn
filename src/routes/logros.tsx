import { createFileRoute } from "@tanstack/react-router";
import { ACHIEVEMENTS, useGame, exportEvidence } from "@/lib/game";
import { t } from "@/lib/i18n";
import { useEffect, useMemo, useState } from "react";

const UNLOCK_KEY = "peru-quest-achievements-unlocked";

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
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const currentIds = useMemo(() => ACHIEVEMENTS.filter(a => a.test(g)).map(a => a.id), [g]);
  const got = currentIds.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(UNLOCK_KEY);
      const prev = raw ? JSON.parse(raw) : [];
      const justNow = currentIds.filter(id => !prev.includes(id));
      if (justNow.length > 0) {
        setNewlyUnlocked(justNow);
        localStorage.setItem(UNLOCK_KEY, JSON.stringify(currentIds));
      }
    } catch {}
  }, [currentIds]);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <div className="rounded-3xl border bg-card p-6">
        <h1 className="text-3xl font-bold">🏆 {t(g.lang, "achievements")}</h1>
        <p className="text-muted-foreground">{got}/{ACHIEVEMENTS.length} desbloqueados</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all" style={{ width: `${Math.round((got/ACHIEVEMENTS.length)*100)}%` }} />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const ok = a.test(g);
          const isNew = ok && newlyUnlocked.includes(a.id);
          return (
            <div key={a.id} className={`card-3d p-4 text-center rounded-2xl border transition-transform hover:scale-[1.02] ${ok ? "" : "opacity-50 grayscale"} ${isNew ? "achievement-new" : ""}`}>
              <p className={`text-4xl ${isNew ? "achievement-icon" : ""}`}>{a.icon}</p>
              <p className="mt-1 font-bold">{g.lang === "es" ? a.es : a.en}</p>
              <p className="text-xs text-muted-foreground">{g.lang === "es" ? a.des : a.den}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={() => exportEvidence(g)} className="btn-3d px-5 py-3">⬇ {t(g.lang, "export")}</button>
        <button onClick={() => setShowResetConfirm(true)} className="rounded-2xl border-2 border-border px-5 py-3 font-semibold text-destructive">
          {t(g.lang, "reset")}
        </button>
      </div>
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl">
            <h3 className="text-xl font-bold">{g.lang === "es" ? "Reiniciar progreso" : "Reset progress"}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {g.lang === "es"
                ? "Se borrarán XP, gemas, racha, progreso por departamento, logros y log de actividades. Esta acción no se puede deshacer."
                : "XP, gems, streak, department progress, achievements and activity log will be deleted. This action cannot be undone."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="rounded-2xl border-2 border-border px-4 py-2 font-semibold">{g.lang === "es" ? "Cancelar" : "Cancel"}</button>
              <button onClick={() => { g.reset(); setShowResetConfirm(false); }} className="rounded-2xl bg-destructive px-4 py-2 font-semibold text-destructive-foreground">{g.lang === "es" ? "Reiniciar" : "Reset"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
