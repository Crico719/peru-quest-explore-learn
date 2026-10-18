import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGame, ACHIEVEMENTS } from "@/lib/game";
import { t } from "@/lib/i18n";
import { Pencil, Zap, Gem, Flame, Crown, UserPlus, Trophy, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(g.profile.name);
  const [avatar, setAvatar] = useState(g.profile.avatar);

  const save = () => {
    g.updateProfile(name, avatar);
    setIsEditing(false);
  };

  const totalCrowns = Object.values(g.progress).reduce((n, p) => n + (p ? ((p.quiz !== undefined && p.quiz >= 2 ? 1 : 0) + (p.memory ? 1 : 0) + (p.tap ? 1 : 0) + (p.order ? 1 : 0)) : 0), 0);
  const unlockedAch = ACHIEVEMENTS.filter(a => a.test(g)).length;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left and Middle Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Section */}
          <div className="relative rounded-3xl bg-sky-400 p-8 text-center text-white shadow-sm">
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute right-4 top-4 rounded-full bg-white/20 p-2 hover:bg-white/30 transition-colors"
            >
              <Pencil className="size-5" />
            </button>
            <div className="mx-auto mb-4 grid size-32 place-items-center rounded-full bg-white text-7xl shadow-lg">
              {avatar}
            </div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">{name}</h1>
            <p className="text-sky-100 opacity-90">@{name.toLowerCase().replace(/\s+/g, '_')}</p>
            <div className="mt-4 flex justify-center gap-4 text-sm font-bold">
              <span>Siguiendo 1</span>
              <span>3 seguidores</span>
            </div >
          </div >

          {/* Promo Card - Demo */}
          <div className="flex items-center justify-between rounded-3xl border-2 border-dashed border-border bg-muted/30 p-6 shadow-sm">
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Integración social — Demostración</h3>
              <p className="text-sm text-muted-foreground">La conexión con LinkedIn y funciones sociales son de demostración. No se comparten datos reales.</p>
              <button disabled className="cursor-not-allowed rounded-xl bg-muted px-4 py-2 text-sm font-bold text-muted-foreground">
                PRÓXIMAMENTE
              </button>
            </div >
            <div className="hidden size-20 items-center justify-center rounded-full bg-muted text-4xl sm:flex">
              🌐
            </div >
          </div >

          {/* Stats Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold px-2">Estadísticas</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-border bg-white p-4 transition-all hover:border-sky-400">
                <Flame className="mb-2 size-6 text-orange-500" />
                <span className="text-2xl font-bold">{g.streak}</span>
                <span className="text-xs text-muted-foreground">días de racha</span>
              </div >
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-border bg-white p-4 transition-all hover:border-sky-400">
                <Zap className="mb-2 size-6 text-yellow-500" />
                <span className="text-2xl font-bold">{g.xp}</span>
                <span className="text-xs text-muted-foreground">EXP totales</span>
              </div >
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-border bg-white p-4 transition-all hover:border-sky-400">
                <Crown className="mb-2 size-6 text-purple-500" />
                <span className="text-2xl font-bold">{totalCrowns}</span>
                <span className="text-xs text-muted-foreground">coronas</span>
              </div >
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-border bg-white p-4 transition-all hover:border-sky-400">
                <Gem className="mb-2 size-6 text-blue-500" />
                <span className="text-2xl font-bold">{g.gems}</span>
                <span className="text-xs text-muted-foreground">gemas</span>
              </div >
            </div >
          </div >
          {/* Definiciones */}
          <div className="rounded-2xl border-2 border-border bg-white p-4 text-sm">
            <p className="font-bold mb-2">¿Cómo funciona?</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><span className="font-semibold text-foreground">XP</span>: experiencia por completar actividades. Cada 100 XP subes de nivel.</li>
              <li><span className="font-semibold text-foreground">Gemas</span>: recompensa por primera vez y respuestas perfectas. Úsalas para personalizar logros.</li>
              <li><span className="font-semibold text-foreground">Coronas</span>: 4 por departamento al completar quiz, memoria, tap y orden. Una corona desbloquea el siguiente departamento.</li>
              <li><span className="font-semibold text-foreground">Racha</span>: días consecutivos jugando. Se calcula con fecha UTC.</li>
            </ul>
          </div>

          {/* Friend Suggestions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold">Sugerencias de amigos <span className="text-xs font-normal text-muted-foreground">(demo)</span></h2>
              <button className="text-sm font-bold text-sky-500 hover:underline">VER TODOS</button>
            </div >
            <div className="grid gap-3">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center justify-between rounded-2xl border-2 border-border bg-white p-4 transition-all hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-full bg-muted text-2xl">👤</div>
                    <div>
                      <p className="font-bold">Explorador {i}</p>
                      <p className="text-xs text-muted-foreground">Nivel {i * 5}</p>
                    </div >
                  </div >
                  <button className="rounded-xl border-2 border-sky-500 px-4 py-1 text-sm font-bold text-sky-500 hover:bg-sky-50 transition-colors">
                    AÑADIR
                  </button>
                </div >
              ))}
            </div >
          </div >
        </div >

        {/* Right Column - Activity Feed */}
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Actividad <span className="text-xs font-normal text-muted-foreground">(demo)</span></h2>
              <div className="flex gap-2">
                <button className="text-xs font-bold text-sky-500 border-b-2 border-sky-500">SIGUIENDO</button>
                <button className="text-xs font-bold text-muted-foreground hover:text-sky-500">SEGUIDORES</button>
              </div >
            </div >
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-2xl">🦙</div>
                <div className="space-y-1">
                  <p className="text-sm"><span className="font-bold">{name}</span> ganó la medalla de cultura!</p>
                  <p className="text-xs text-muted-foreground">hace 4 días</p>
                  <button className="text-xs font-bold text-sky-500 hover:underline flex items-center gap-1">
                    <Trophy className="size-3" /> FELICITAR
                  </button>
                </div >
              </div >
              <div className="flex gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-2xl">🦉</div>
                <div className="space-y-1">
                  <p className="text-sm"><span className="font-bold">Inti</span> subió de nivel!</p>
                  <p className="text-xs text-muted-foreground">hace 1 semana</p>
                </div >
              </div >
            </div >
            <button className="mt-6 w-full text-sm font-bold text-muted-foreground hover:text-primary flex items-center justify-center gap-1 transition-colors">
              Ver todo <ChevronRight className="size-4" />
            </button>
          </div >

          <div className="rounded-3xl border-2 border-border bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold">Agregar amigos</h3>
            <div className="flex items-center gap-3 rounded-2xl border-2 border-border p-3 transition-all focus-within:border-sky-500">
              <UserPlus className="size-5 text-muted-foreground" />
              <input 
                placeholder="Encuentra a tus amigos" 
                className="flex-1 bg-transparent text-sm outline-none" 
              />
            </div >
          </div >
        </div >
      </div >

      {/* Edit Profile Modal/Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold">Editar perfil</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Nombre</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 font-semibold outline-none focus:border-primary"
                />
              </div >
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Avatar</label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={`text-2xl rounded-xl p-2 border-2 transition-all ${avatar === a ? "border-primary bg-primary/10 scale-110" : "border-border hover:border-primary/50"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div >
              </div >
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="flex-1 rounded-2xl border-2 border-border py-3 font-bold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={save} 
                  className="flex-1 rounded-2xl bg-sky-500 py-3 font-bold text-white hover:bg-sky-600 transition-all active:scale-95"
                >
                  Guardar
                </button>
              </div >
            </div >
          </div >
        </div >
      )}
    </main>
  );
}
