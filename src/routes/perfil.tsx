import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGame, ACHIEVEMENTS } from "@/lib/game";
import { t } from "@/lib/i18n";

const AVATARS = ["🦉", "🦙", "🦜", "🦔", "🐙", "🐆", "🐧", "🦘", "🐺", "🐯"];

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — PERÚ QUEST" },
      { name: "description", content: "Tu perfil de jugador en PERÚ QUEST: nombre, avatar, XP, gemas y racha." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const g = useGame();
  const [name, setName] = useState(g.profile.name);
  const [avatar, setAvatar] = useState(g.profile.avatar);

  const save = () => {
    g.updateProfile(name, avatar);
  };

  const totalCrowns = Object.values(g.progress).reduce((n, p) => n + (p ? ((p.quiz !== undefined && p.quiz >= 2 ? 1 : 0) + (p.memory ? 1 : 0) + (p.tap ? 1 : 0) + (p.order ? 1 : 0)) : 0), 0);
  const unlockedAch = ACHIEVEMENTS.filter(a => a.test(g)).length;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <h1 className="text-3xl font-bold">👤 {t(g.lang, "profile") || "Perfil"}</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card-3d p-5">
          <h2 className="text-xl font-bold mb-3">Editar perfil</h2>
          <label className="block text-sm font-semibold mb-1">Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-2xl border-2 border-input bg-card px-4 py-3 font-semibold outline-none focus:border-primary mb-4"
            placeholder="Tu nombre"
          />
          <label className="block text-sm font-semibold mb-2">Avatar</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {AVATARS.map(a => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`text-3xl rounded-2xl p-3 border-2 ${avatar === a ? "border-primary bg-primary/10" : "border-border"}`}
                aria-label={a}
              >
                {a}
              </button>
            ))}
          </div>
          <button onClick={save} className="btn-3d px-5 py-3 w-full">Guardar cambios</button>
        </div>

        <div className="card-3d p-5">
          <h2 className="text-xl font-bold mb-3">Estadísticas</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{g.profile.avatar}</span>
            <div>
              <p className="text-2xl font-bold">{g.profile.name}</p>
              <p className="text-sm text-muted-foreground">Explorador del Perú</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-card p-3"><p className="text-xs uppercase text-muted-foreground">XP</p><p className="text-xl font-bold">⚡ {g.xp}</p></div>
            <div className="rounded-2xl bg-card p-3"><p className="text-xs uppercase text-muted-foreground">Gemas</p><p className="text-xl font-bold">💎 {g.gems}</p></div>
            <div className="rounded-2xl bg-card p-3"><p className="text-xs uppercase text-muted-foreground">Racha</p><p className="text-xl font-bold">🔥 {g.streak}</p></div>
            <div className="rounded-2xl bg-card p-3"><p className="text-xs uppercase text-muted-foreground">Coronas</p><p className="text-xl font-bold">👑 {totalCrowns}</p></div>
          </div>
          <div className="mt-4 rounded-2xl bg-card p-3">
            <p className="text-sm font-semibold">Logros desbloqueados</p>
            <p className="text-lg font-bold">{unlockedAch} / {ACHIEVEMENTS.length}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
