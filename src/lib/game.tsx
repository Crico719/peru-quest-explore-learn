import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type React from "react";
import { DEPARTMENTS } from "@/data/departments";

export type Activity = "quiz" | "memory" | "tap" | "order" | "locate" | "aventura";
export type DeptProgress = { quiz?: number; memory?: boolean; tap?: boolean; order?: boolean; facts?: number[] };
export type LogEntry = { at: string; dept: string; activity: Activity; score: number; max: number; xp: number };
export type Lang = "es" | "en";

type State = {
  xp: number; gems: number; streak: number; lastDay: string | null;
  progress: Record<string, DeptProgress>; log: LogEntry[]; dark: boolean; lang: Lang;
  profile: { name: string; avatar: string };
  _v?: number;
};

const initial: State = { xp: 0, gems: 0, streak: 0, lastDay: null, progress: {}, log: [], dark: false, lang: "es", profile: { name: "Explorador", avatar: "🦉" }, _v: 2 };
const KEY = "peru-quest-v1";

const today = () => new Date().toISOString().slice(0, 10);

type Ctx = State & {
  complete: (dept: string, a: Activity, score: number, max: number) => number;
  seeFact: (dept: string, i: number) => void;
  crowns: (dept: string) => number;
  unlocked: (index: number) => boolean;
  toggleDark: () => void;
  setLang: (l: Lang) => void;
  reset: () => void;
  updateProfile: (name: string, avatar: string) => void;
  level: number;
  xpToNext: number;
};

// Keep a single context instance across hot reloads so the provider and consumers always match.
const g = globalThis as unknown as { __peruQuestCtx?: React.Context<Ctx | null> };
const GameCtx = g.__peruQuestCtx ?? (g.__peruQuestCtx = createContext<Ctx | null>(null));

export function crownsOf(p?: DeptProgress) {
  if (!p) return 0;
  return (p.quiz !== undefined && p.quiz >= 2 ? 1 : 0) + (p.memory ? 1 : 0) + (p.tap ? 1 : 0) + (p.order ? 1 : 0);
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const migrated: State = { ...initial, ...parsed, _v: 2 };
        // Basic schema validation
        if (typeof migrated.xp !== 'number') migrated.xp = 0;
        if (typeof migrated.gems !== 'number') migrated.gems = 0;
        if (!migrated.progress || typeof migrated.progress !== 'object') migrated.progress = {};
        if (!migrated.profile) migrated.profile = initial.profile;
        setS(migrated);
      }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(s));
    document.documentElement.classList.toggle("dark", s.dark);
    document.documentElement.lang = s.lang;
  }, [s, loaded]);

  const complete = useCallback((dept: string, a: Activity, score: number, max: number) => {
    // "locate" (práctica de localización en el mapa) y "aventura" (mundos de la
    // aventura 2D): solo registran en el log de evidencias.
    // Sin XP, gemas, coronas, progreso ni racha — reutilizan el log existente.
    if (a === "locate" || a === "aventura") {
      setS((prev) => ({
        ...prev,
        log: [...prev.log, { at: new Date().toISOString(), dept, activity: a, score, max, xp: 0 }],
      }));
      return 0;
    }
    const xp = a === "quiz" ? score * 10 : 15;
    const p = { ...(s.progress[dept] ?? {}) };
    const firstTime = a === "quiz" ? p.quiz === undefined : !p[a];
    const gainedXp = firstTime ? xp : 0;
    const gems = (firstTime ? 5 : 0) + (score === max ? 2 : 0);

    setS((prev) => {
      const current = { ...(prev.progress[dept] ?? {}) };
      if (a === "quiz") current.quiz = Math.max(current.quiz ?? 0, score);
      else current[a] = true;
      const d = today();
      let streak = prev.streak;
      if (prev.lastDay !== d) {
        const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
        streak = prev.lastDay === y ? streak + 1 : 1;
      }
      return {
        ...prev, xp: prev.xp + gainedXp, gems: prev.gems + gems, streak, lastDay: d,
        progress: { ...prev.progress, [dept]: current },
        log: [...prev.log, { at: new Date().toISOString(), dept, activity: a, score, max, xp: gainedXp }],
      };
    });
    return gainedXp;
  }, [s]);

  const seeFact = useCallback((dept: string, i: number) => {
    setS((prev) => {
      const p = prev.progress[dept] ?? {};
      const facts = p.facts ?? [];
      if (facts.includes(i)) return prev;
      return { ...prev, xp: prev.xp + 2, progress: { ...prev.progress, [dept]: { ...p, facts: [...facts, i] } } };
    });
  }, []);

  const crowns = (dept: string) => crownsOf(s.progress[dept]);
  const unlocked = (i: number) => i === 0 || crowns(DEPARTMENTS[i - 1]!.id) >= 1;
  const level = Math.floor(s.xp / 100) + 1;
  const xpToNext = Math.max(0, level * 100 - s.xp);

  return (
    <GameCtx.Provider
      value={{
        ...s, complete, seeFact, crowns, unlocked, level, xpToNext,
        toggleDark: () => setS((p) => ({ ...p, dark: !p.dark })),
        setLang: (lang) => setS((p) => ({ ...p, lang })),
        reset: () => setS((p) => ({ ...initial, dark: p.dark, lang: p.lang, profile: p.profile })),
        updateProfile: (name: string, avatar: string) => setS((p) => ({ ...p, profile: { name: name.trim() || p.profile.name, avatar } })),
      }}
    >
      {children}
    </GameCtx.Provider>
  );
}

export function useGame() {
  const c = useContext(GameCtx);
  if (!c) throw new Error("useGame outside provider");
  return c;
}

export function speak(text: string, lang: Lang) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "es" ? "es-PE" : "en-US";
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

export function exportEvidence(s: State) {
  const data = {
    app: "PERÚ QUEST", exportedAt: new Date().toISOString(),
    summary: {
      xp: s.xp, gems: s.gems, streak: s.streak,
      crowns: DEPARTMENTS.reduce((n, d) => n + crownsOf(s.progress[d.id]), 0),
      departmentsStarted: Object.keys(s.progress).length,
    },
    progress: s.progress, activityLog: s.log,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `peru-quest-evidencia-${today()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const ACHIEVEMENTS = [
  { id: "first", icon: "🥇", es: "Primer paso", en: "First step", des: "Gana tu primera corona", den: "Earn your first crown", test: (s: State) => DEPARTMENTS.some((d) => crownsOf(s.progress[d.id]) > 0) },
  { id: "five", icon: "🗺️", es: "Explorador", en: "Explorer", des: "Corona en 5 departamentos", den: "Crown 5 departments", test: (s: State) => DEPARTMENTS.filter((d) => crownsOf(s.progress[d.id]) > 0).length >= 5 },
  { id: "ten", icon: "🧭", es: "Viajero", en: "Traveler", des: "Corona en 10 departamentos", den: "Crown 10 departments", test: (s: State) => DEPARTMENTS.filter((d) => crownsOf(s.progress[d.id]) > 0).length >= 10 },
  { id: "all", icon: "🇵🇪", es: "Conoce el Perú", en: "Know Peru", des: "Corona en los 24", den: "Crown all 24", test: (s: State) => DEPARTMENTS.every((d) => crownsOf(s.progress[d.id]) > 0) },
  { id: "master", icon: "👑", es: "Maestro", en: "Master", des: "4 coronas en un departamento", den: "4 crowns in one department", test: (s: State) => DEPARTMENTS.some((d) => crownsOf(s.progress[d.id]) === 4) },
  { id: "perfect", icon: "💯", es: "Perfecto", en: "Perfect", des: "Quiz sin errores", den: "Flawless quiz", test: (s: State) => s.log.some((l) => l.activity === "quiz" && l.score === l.max) },
  { id: "xp500", icon: "⚡", es: "500 XP", en: "500 XP", des: "Acumula 500 XP", den: "Earn 500 XP", test: (s: State) => s.xp >= 500 },
  { id: "streak3", icon: "🔥", es: "En racha", en: "On fire", des: "Racha de 3 días", den: "3-day streak", test: (s: State) => s.streak >= 3 },
  { id: "gems100", icon: "💎", es: "Coleccionista", en: "Collector", des: "Junta 100 gemas", den: "Collect 100 gems", test: (s: State) => s.gems >= 100 },
];
