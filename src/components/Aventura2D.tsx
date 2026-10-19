import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DEPARTMENTS, locDept } from "@/data/departments";
import { useGame } from "@/lib/game";
import { soundManager } from "@/lib/audio";
import intiHappy from "@/assets/inti/inti-happy.png";
import intiAngry from "@/assets/inti/inti-angry.png";
import intiThinking from "@/assets/inti/inti-thinking.png";
import intiSad from "@/assets/inti/inti-sad.png";

/**
 * AVENTURA 2D — tres mundos (Costa, Sierra, Selva) con un único motor:
 * física, controles y colisiones compartidos; cada mundo aporta paleta,
 * fondo parallax procedural, obstáculos, velocidad y jefe final.
 *
 * Registro: récord de distancia y mundos completados en localStorage
 * (clave propia, validada). Sin XP/gemas/coronas — los mundos completados
 * se registran una sola vez en el log de evidencias vía actividad
 * "aventura" (log-only en game.tsx). Punto de integración de XP: pendiente
 * hasta que exista una vía de recompensa sin coronas/gemas.
 */

const W = 800;
const H = 320;
const GROUND = 260;
const GRAVITY = 0.55;
const JUMP_V = -11;

const BOSS_AT = 1000; // distancia interna; HUD muestra /10 (100 m)
const BOSS_QUESTIONS = 3;
const BOSS_TIME = 10; // segundos por pregunta del jefe
const BOSS_NEED = 2; // respuestas correctas para vencer

type WorldId = "costa" | "sierra" | "selva";
type Region = "Costa" | "Sierra" | "Selva";
type Expr = "happy" | "angry" | "thinking" | "sad";

type Entity = { x: number; y: number; kind: "coin" | "rock"; size: number };

type Question = { q: string; options: string[]; answer: number; dept: string; fact: string };

type WorldConfig = {
  id: WorldId;
  region: Region;
  emoji: string;
  name: { es: string; en: string };
  tip: { es: string; en: string };
  boss: { emoji: string; name: { es: string; en: string } };
  speedBase: number;
  spawnEvery: number;
  palette: {
    sky: [string, string, string];
    ground: string;
    groundLine: string;
    obstacleFill: string;
    obstacleStroke: string;
  };
};

const WORLDS: WorldConfig[] = [
  {
    id: "costa",
    region: "Costa",
    emoji: "🏖️",
    name: { es: "Inti en la Costa", en: "Inti in the Costa" },
    tip: {
      es: "Corre por el litoral, salta las rocas y junta soles de oro.",
      en: "Run along the shore, jump over rocks and collect golden suns.",
    },
    boss: {
      emoji: "🦀",
      name: { es: "Cangrejo Guardián de los Manglares", en: "Guardian Crab of the Mangroves" },
    },
    speedBase: 3,
    spawnEvery: 75,
    palette: {
      sky: ["#7dd3fc", "#fde68a", "#fb923c"],
      ground: "#f2e8cf",
      groundLine: "#d6c9a8",
      obstacleFill: "#a8a29e",
      obstacleStroke: "#78716c",
    },
  },
  {
    id: "sierra",
    region: "Sierra",
    emoji: "⛰️",
    name: { es: "Inti en la Sierra", en: "Inti in the Highlands" },
    tip: {
      es: "Sube por los Andes y esquiva los muros de piedra del camino.",
      en: "Climb through the Andes and dodge the stone walls on the path.",
    },
    boss: {
      emoji: "🦅",
      name: { es: "Cóndor de los Andes", en: "Condor of the Andes" },
    },
    speedBase: 3.6,
    spawnEvery: 65,
    palette: {
      sky: ["#60a5fa", "#93c5fd", "#dbeafe"],
      ground: "#b98d6b",
      groundLine: "#8a684d",
      obstacleFill: "#6d5c4b",
      obstacleStroke: "#574a3c",
    },
  },
  {
    id: "selva",
    region: "Selva",
    emoji: "🌳",
    name: { es: "Inti en la Selva", en: "Inti in the Jungle" },
    tip: {
      es: "Abre camino en la Amazonía y salta los troncos caídos.",
      en: "Make your way through the Amazon and jump over fallen logs.",
    },
    boss: {
      emoji: "🐆",
      name: { es: "Otorongo de la Amazonía", en: "Jaguar of the Amazon" },
    },
    speedBase: 4.2,
    spawnEvery: 58,
    palette: {
      sky: ["#86efac", "#d9f99d", "#f0fdf4"],
      ground: "#4d7c0f",
      groundLine: "#3f6212",
      obstacleFill: "#7c4a1d",
      obstacleStroke: "#5b3516",
    },
  },
];

const worldById = (id: WorldId) => WORLDS.find((w) => w.id === id)!;
const nextWorld = (id: WorldId) => WORLDS[WORLDS.findIndex((w) => w.id === id) + 1]?.id;

/* ---------- Persistencia (clave propia, validada) ---------- */

const AVENTURA_KEY = "peru-quest-aventura";
type AventuraSave = { bestDistance: number; worldsCompleted: WorldId[] };

function loadSave(): AventuraSave {
  try {
    const raw = localStorage.getItem(AVENTURA_KEY);
    if (!raw) return { bestDistance: 0, worldsCompleted: [] };
    const p = JSON.parse(raw) as Partial<AventuraSave>;
    const bestDistance =
      typeof p.bestDistance === "number" && isFinite(p.bestDistance) && p.bestDistance >= 0
        ? Math.floor(p.bestDistance)
        : 0;
    const worldsCompleted = Array.isArray(p.worldsCompleted)
      ? p.worldsCompleted.filter((x): x is WorldId => x === "costa" || x === "sierra" || x === "selva")
      : [];
    return { bestDistance, worldsCompleted };
  } catch {
    return { bestDistance: 0, worldsCompleted: [] };
  }
}

function persistSave(save: AventuraSave) {
  try {
    localStorage.setItem(AVENTURA_KEY, JSON.stringify(save));
  } catch {
    /* almacenamiento no disponible: el juego sigue funcional */
  }
}

/* ---------- Preguntas filtradas por región del mundo ---------- */

function pickQuestion(region: Region, lang: "es" | "en"): Question | null {
  const pool = DEPARTMENTS.filter((d) => d.region === region);
  if (pool.length === 0) return null;
  const base = pool[Math.floor(Math.random() * pool.length)]!;
  const d = locDept(base, lang);
  const q = d.quiz[Math.floor(Math.random() * d.quiz.length)]!;
  const order = q.o.map((_, k) => k).sort(() => Math.random() - 0.5);
  return {
    q: q.q,
    options: order.map((k) => q.o[k]!),
    answer: order.indexOf(q.a),
    dept: d.name,
    fact: d.facts[0] ? `${d.facts[0].t}: ${d.facts[0].d}` : "",
  };
}

/* ---------- Fondos parallax procedurales por mundo ---------- */

function drawTriangle(ctx: CanvasRenderingContext2D, x: number, base: number, w: number, h: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.lineTo(x + w / 2, base - h);
  ctx.lineTo(x + w, base);
  ctx.closePath();
  ctx.fill();
}

function drawBackground(ctx: CanvasRenderingContext2D, world: WorldConfig, frame: number) {
  const p = world.palette;
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, p.sky[0]);
  sky.addColorStop(0.6, p.sky[1]);
  sky.addColorStop(1, p.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND + 60);

  if (world.id === "costa") {
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(650, 70, 32, 0, Math.PI * 2);
    ctx.fill();
    // Mar al fondo
    ctx.fillStyle = "#38bdf8";
    const wave = Math.sin(frame / 40) * 3;
    ctx.fillRect(0, GROUND - 60, W, 30 + wave);
    ctx.fillStyle = "#7dd3fc";
    ctx.fillRect(0, GROUND - 52, W, 22);
    // Dunas (2 capas)
    const off1 = (frame * 0.4) % 220;
    ctx.fillStyle = "#e7d8b0";
    for (let i = -1; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(i * 220 - off1 + 110, GROUND - 10, 90, Math.PI, 0);
      ctx.fill();
    }
    const off2 = (frame * 0.9) % 160;
    ctx.fillStyle = "#eedfb9";
    for (let i = -1; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(i * 160 - off2 + 80, GROUND + 8, 70, Math.PI, 0);
      ctx.fill();
    }
  } else if (world.id === "sierra") {
    ctx.fillStyle = "#fffbeb";
    ctx.beginPath();
    ctx.arc(140, 66, 26, 0, Math.PI * 2);
    ctx.fill();
    // Montañas lejanas con nieve
    const off1 = (frame * 0.25) % 260;
    for (let i = -1; i < 5; i++) {
      const x = i * 260 - off1;
      drawTriangle(ctx, x, GROUND - 40, 240, 150, "#94a3b8");
      drawTriangle(ctx, x + 70, GROUND - 40, 100, 60, "#e2e8f0");
    }
    // Colinas cercanas
    const off2 = (frame * 0.6) % 180;
    for (let i = -1; i < 7; i++) {
      const x = i * 180 - off2;
      drawTriangle(ctx, x, GROUND - 6, 160, 90, "#a3785a");
    }
  } else {
    // Selva: sol difuso
    ctx.fillStyle = "#fef9c3";
    ctx.beginPath();
    ctx.arc(600, 60, 28, 0, Math.PI * 2);
    ctx.fill();
    // Doses lejanos
    const off1 = (frame * 0.3) % 140;
    ctx.fillStyle = "#166534";
    for (let i = -1; i < 8; i++) {
      const x = i * 140 - off1;
      ctx.beginPath();
      ctx.arc(x, GROUND - 90, 70, 0, Math.PI * 2);
      ctx.fill();
    }
    // Doses cercanos + lianas
    const off2 = (frame * 0.75) % 110;
    ctx.fillStyle = "#15803d";
    for (let i = -1; i < 10; i++) {
      const x = i * 110 - off2 + 40;
      ctx.beginPath();
      ctx.arc(x, GROUND - 40, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#166534";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 12, 0);
      ctx.lineTo(x - 12, 40 + ((i * 37) % 30));
      ctx.stroke();
    }
  }

  // Suelo
  ctx.fillStyle = p.ground;
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.strokeStyle = p.groundLine;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND + 1);
  ctx.lineTo(W, GROUND + 1);
  ctx.stroke();
}

/* ---------- Componente ---------- */

export function Aventura2D() {
  const g = useGame();
  const es = g.lang === "es";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgs = useRef<Partial<Record<Expr, HTMLImageElement>>>({});

  // Motor (refs: el loop no provoca re-render)
  const state = useRef({
    running: false,
    paused: false,
    over: false,
    x: 120,
    y: GROUND - 48,
    vy: 0,
    distance: 0,
    speed: 3,
    coins: 0,
    invuln: 0,
    expr: "happy" as Expr,
    exprTicks: 0,
    bossTriggered: false,
    entities: [] as Entity[],
    frame: 0,
  });
  const keys = useRef({ left: false, right: false, jump: false });
  const worldRef = useRef<WorldId>("costa");

  // React UI
  const [hud, setHud] = useState({ coins: 0, distance: 0 });
  const [phase, setPhase] = useState<"select" | "intro" | "playing" | "question" | "boss" | "victory" | "defeat">("select");
  const [question, setQuestion] = useState<Question | null>(null);
  const [qAnswered, setQAnswered] = useState<number | null>(null);
  const [boss, setBoss] = useState({ idx: 0, score: 0 });
  const [bossTimer, setBossTimer] = useState(BOSS_TIME);
  const [save, setSave] = useState<AventuraSave>({ bestDistance: 0, worldsCompleted: [] });
  const saveRef = useRef(save);

  // Cargar sprites (4 expresiones disponibles) y datos guardados
  useEffect(() => {
    ([
      ["happy", intiHappy],
      ["angry", intiAngry],
      ["thinking", intiThinking],
      ["sad", intiSad],
    ] as const).forEach(([expr, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imgs.current[expr] = img;
      };
    });
    const loaded = loadSave();
    saveRef.current = loaded;
    setSave(loaded);
  }, []);

  const updateBest = useCallback((meters: number) => {
    if (meters <= saveRef.current.bestDistance) return;
    const next = { ...saveRef.current, bestDistance: meters };
    saveRef.current = next;
    setSave(next);
    persistSave(next);
  }, []);

  const startRun = useCallback(() => {
    const world = worldRef.current;
    state.current = {
      running: true,
      paused: false,
      over: false,
      x: 120,
      y: GROUND - 48,
      vy: 0,
      distance: 0,
      speed: worldById(world).speedBase,
      coins: 0,
      invuln: 0,
      expr: "happy",
      exprTicks: 0,
      bossTriggered: false,
      entities: [],
      frame: 0,
    };
    setHud({ coins: 0, distance: 0 });
    setQuestion(null);
    setQAnswered(null);
    setPhase("playing");
    soundManager.playSfx("click");
  }, []);

  const chooseWorld = useCallback((id: WorldId) => {
    worldRef.current = id;
    setPhase("intro");
  }, []);

  const openQuestion = useCallback(() => {
    setQuestion(pickQuestion(worldById(worldRef.current).region, g.lang));
    setQAnswered(null);
    state.current.paused = true;
    setPhase("question");
  }, [g.lang]);

  const startBoss = useCallback(() => {
    const s = state.current;
    s.paused = true;
    s.expr = "thinking";
    s.exprTicks = 120;
    updateBest(Math.floor(s.distance / 10));
    setBoss({ idx: 0, score: 0 });
    setQuestion(pickQuestion(worldById(worldRef.current).region, g.lang));
    setQAnswered(null);
    setBossTimer(BOSS_TIME);
    setPhase("boss");
  }, [g.lang, updateBest]);

  const completeWorld = useCallback(() => {
    const id = worldRef.current;
    const s = state.current;
    updateBest(Math.floor(s.distance / 10));
    if (!saveRef.current.worldsCompleted.includes(id)) {
      // Marcar completado + registrar en el log UNA sola vez (sin XP/gemas/coronas)
      const next = { ...saveRef.current, worldsCompleted: [...saveRef.current.worldsCompleted, id] };
      saveRef.current = next;
      setSave(next);
      persistSave(next);
      g.complete(id, "aventura", 1, 1);
    }
    s.expr = "happy";
    s.exprTicks = 0;
    s.over = true; // pausa el motor tras la victoria
    soundManager.playSfx("crown");
    setPhase("victory");
  }, [g, updateBest]);

  const defeatBoss = useCallback(() => {
    const s = state.current;
    updateBest(Math.floor(s.distance / 10));
    s.expr = "sad";
    s.exprTicks = 240;
    soundManager.playSfx("incorrect");
    setPhase("defeat");
  }, [updateBest]);

  /* ----- Preguntas normales (puertas cada 5 soles) ----- */

  const answerQuestion = useCallback(
    (i: number) => {
      if (!question || qAnswered !== null) return;
      setQAnswered(i);
      const s = state.current;
      if (i === question.answer) {
        s.coins += 2;
        s.expr = "happy";
        s.exprTicks = 0;
        soundManager.playSfx("correct");
      } else {
        s.coins = Math.max(0, s.coins - 1);
        s.expr = "sad";
        s.exprTicks = 180;
        soundManager.playSfx("incorrect");
      }
      setHud({ coins: s.coins, distance: Math.floor(s.distance / 10) });
    },
    [question, qAnswered]
  );

  const closeQuestion = useCallback(() => {
    state.current.paused = false;
    setPhase("playing");
  }, []);

  /* ----- Preguntas del jefe (3 preguntas, 10 s, ganar con 2/3) ----- */

  const answerBoss = useCallback(
    (i: number) => {
      if (!question || qAnswered !== null) return;
      setQAnswered(i);
      const s = state.current;
      if (i === question.answer) {
        setBoss((b) => ({ ...b, score: b.score + 1 }));
        s.expr = "happy";
        s.exprTicks = 0;
        soundManager.playSfx("correct");
      } else {
        s.expr = "sad";
        s.exprTicks = 180;
        soundManager.playSfx("incorrect");
      }
    },
    [question, qAnswered]
  );

  const nextBossQuestion = useCallback(() => {
    if (boss.idx + 1 >= BOSS_QUESTIONS) {
      if (boss.score >= BOSS_NEED) completeWorld();
      else defeatBoss();
      return;
    }
    setBoss((b) => ({ ...b, idx: b.idx + 1 }));
    setQuestion(pickQuestion(worldById(worldRef.current).region, g.lang));
    setQAnswered(null);
    setBossTimer(BOSS_TIME);
  }, [boss, completeWorld, defeatBoss, g.lang]);

  // Temporizador del jefe (solo mientras la pregunta está sin responder)
  useEffect(() => {
    if (phase !== "boss" || qAnswered !== null) return;
    if (bossTimer <= 0) {
      answerBoss(-1); // -1 nunca coincide con answer (>= 0): cuenta como fallo
      return;
    }
    const id = setTimeout(() => setBossTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, bossTimer, qAnswered, answerBoss]);

  const retryBoss = useCallback(() => {
    setBoss({ idx: 0, score: 0 });
    setQuestion(pickQuestion(worldById(worldRef.current).region, g.lang));
    setQAnswered(null);
    setBossTimer(BOSS_TIME);
    setPhase("boss");
  }, [g.lang]);

  const backToSelect = useCallback(() => {
    state.current.running = false;
    setPhase("select");
  }, []);

  // Teclado
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", " ", "ArrowUp"].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowLeft") keys.current.left = true;
      if (e.key === "ArrowRight") keys.current.right = true;
      if (e.key === " " || e.key === "ArrowUp") keys.current.jump = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
      if (e.key === " " || e.key === "ArrowUp") keys.current.jump = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Loop principal (motor único para los tres mundos)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const s = state.current;
      const k = keys.current;
      const world = worldById(worldRef.current);

      if (s.running && !s.paused && !s.over) {
        if (k.left) s.x = Math.max(10, s.x - 3);
        if (k.right) s.x = Math.min(W - 58, s.x + 3);
        if (k.jump && s.y >= GROUND - 48 - 0.5) s.vy = JUMP_V;
        s.vy += GRAVITY;
        s.y += s.vy;
        if (s.y > GROUND - 48) {
          s.y = GROUND - 48;
          s.vy = 0;
        }

        s.frame++;
        s.distance += s.speed;
        s.speed = Math.min(world.speedBase + 3.5, world.speedBase + s.distance / 1200);

        // Generador de entidades
        if (s.frame % world.spawnEvery === 0) {
          const kind = Math.random() < 0.5 ? "coin" : "rock";
          s.entities.push({
            x: W + 40,
            y: kind === "coin" ? GROUND - 90 - Math.random() * 50 : GROUND - 30,
            kind,
            size: kind === "coin" ? 18 : 30 + Math.random() * 14,
          });
        }
        s.entities.forEach((e) => (e.x -= s.speed));
        s.entities = s.entities.filter((e) => e.x > -60);

        // Colisiones AABB
        const px = s.x + 4;
        const py = s.y + 4;
        const ps = 40;
        if (s.invuln > 0) s.invuln--;
        if (s.exprTicks > 0) s.exprTicks--;
        else s.expr = "happy";
        for (const e of s.entities) {
          const hit = px < e.x + e.size && px + ps > e.x && py < e.y + e.size && py + ps > e.y;
          if (!hit) continue;
          if (e.kind === "coin") {
            s.coins++;
            e.x = -100;
            setHud({ coins: s.coins, distance: Math.floor(s.distance / 10) });
            if (s.coins % 5 === 0) {
              openQuestion();
              break;
            }
          } else if (s.invuln === 0) {
            s.invuln = 60;
            s.coins = Math.max(0, s.coins - 1);
            s.expr = "angry";
            s.exprTicks = 90;
            soundManager.playSfx("incorrect");
            setHud({ coins: s.coins, distance: Math.floor(s.distance / 10) });
          }
        }

        // Jefe al final del recorrido
        if (!s.bossTriggered && s.distance >= BOSS_AT) {
          s.bossTriggered = true;
          startBoss();
        }
      }

      // Dibujo
      drawBackground(ctx, world, s.frame);

      for (const e of s.entities) {
        if (e.kind === "coin") {
          ctx.fillStyle = "#f59e0b";
          ctx.beginPath();
          ctx.arc(e.x + e.size / 2, e.y + e.size / 2, e.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#b45309";
          ctx.stroke();
        } else if (world.id === "selva") {
          // Tronco caído: más ancho que alto
          ctx.fillStyle = world.palette.obstacleFill;
          ctx.beginPath();
          ctx.roundRect(e.x, GROUND - 18, e.size + 16, 18, 9);
          ctx.fill();
          ctx.strokeStyle = world.palette.obstacleStroke;
          ctx.stroke();
        } else {
          ctx.fillStyle = world.palette.obstacleFill;
          ctx.beginPath();
          ctx.roundRect(e.x, e.y, e.size, e.size, 8);
          ctx.fill();
          ctx.strokeStyle = world.palette.obstacleStroke;
          ctx.stroke();
        }
      }

      // Inti con expresión (parpadea si es invulnerable)
      const img = imgs.current[s.expr] ?? imgs.current.happy;
      if (img && !(s.invuln > 0 && s.frame % 12 < 6)) {
        ctx.drawImage(img, s.x, s.y, 48, 48);
      } else {
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(s.x + 24, s.y + 24, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // Indicador de proximidad del jefe
      if (s.running && !s.bossTriggered) {
        const pctLeft = Math.min(1, s.distance / BOSS_AT);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(20, 16, 180, 10);
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(20, 16, 180 * pctLeft, 10);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(
          worldById(worldRef.current).boss.emoji + " " + Math.round(pctLeft * 100) + "%",
          24,
          40
        );
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [openQuestion, startBoss]);

  const touchBtn =
    "select-none rounded-2xl border-2 border-border bg-card px-6 py-4 text-xl font-bold active:bg-muted";
  const world = worldById(worldRef.current);
  const next = nextWorld(worldRef.current);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-3 flex items-center justify-between">
        <Link to="/practica" className="text-sm font-bold text-primary">
          ← {es ? "Volver al mapa" : "Back to map"}
        </Link>
        <div className="flex flex-wrap gap-2 text-sm font-bold" aria-live="polite">
          <span className="chip text-gold">🪙 {hud.coins}</span>
          <span className="chip">
            📏 {hud.distance}/{BOSS_AT / 10} m
          </span>
          <span className="chip">🏅 {es ? "Récord" : "Best"}: {save.bestDistance} m</span>
        </div>
      </div>

      <div className="card-3d relative overflow-hidden rounded-3xl">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block h-auto w-full"
          aria-label={es ? "Aventura 2D de Inti por el Perú" : "Inti 2D adventure across Peru"}
        />

        {/* Selector de mundos */}
        {phase === "select" && (
          <div className="absolute inset-0 overflow-auto bg-background/95 p-4">
            <h3 className="text-center text-xl font-bold">🎮 {es ? "Elige tu mundo" : "Choose your world"}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {WORLDS.map((w) => {
                const done = save.worldsCompleted.includes(w.id);
                const prev = WORLDS[WORLDS.findIndex((x) => x.id === w.id) - 1];
                const locked = !!prev && !save.worldsCompleted.includes(prev.id);
                return (
                  <div key={w.id} className={`rounded-3xl border-2 border-border bg-card p-4 text-center ${locked ? "opacity-50" : ""}`}>
                    <p className="text-4xl">{w.emoji}</p>
                    <h4 className="mt-1 font-bold">{es ? w.name.es : w.name.en}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {w.boss.emoji} {es ? "Jefe: " : "Boss: "}
                      {es ? w.boss.name.es : w.boss.name.en}
                    </p>
                    {done && <p className="mt-1 text-xs font-bold text-gold">👑 {es ? "Completado" : "Completed"}</p>}
                    <button
                      disabled={locked}
                      onClick={() => chooseWorld(w.id)}
                      className="btn-3d mt-3 w-full rounded-2xl px-3 py-2 text-xs"
                      aria-label={`${es ? "Jugar" : "Play"} ${es ? w.name.es : w.name.en}`}
                    >
                      {locked ? `🔒 ${es ? "Bloqueado" : "Locked"}` : es ? "JUGAR ▶" : "PLAY ▶"}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {es
                ? "Vence al guardián de cada mundo (2 de 3 preguntas correctas) para desbloquear el siguiente."
                : "Defeat each world's guardian (2 of 3 correct answers) to unlock the next one."}
            </p>
          </div>
        )}

        {/* Intro del mundo */}
        {phase === "intro" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-6 text-center text-white">
            <p className="text-4xl">{world.emoji}</p>
            <h3 className="text-2xl font-bold">{es ? world.name.es : world.name.en}</h3>
            <p className="max-w-md text-sm">{es ? world.tip.es : world.tip.en}</p>
            <p className="text-xs opacity-80">
              {es
                ? `Llega a ${BOSS_AT / 10} m y vence a ${world.boss.emoji} ${world.boss.name.es} con ${BOSS_NEED} de ${BOSS_QUESTIONS} respuestas.`
                : `Reach ${BOSS_AT / 10} m and defeat ${world.boss.emoji} ${world.boss.name.en} with ${BOSS_NEED} of ${BOSS_QUESTIONS} answers.`}
            </p>
            <p className="text-xs opacity-80">
              {es ? "← → moverse · Espacio saltar · botones táctiles en celular" : "← → move · Space jump · touch buttons on mobile"}
            </p>
            <div className="flex gap-2">
              <button onClick={startRun} className="btn-3d rounded-2xl px-6 py-3">
                ▶ {es ? "EMPEZAR" : "START"}
              </button>
              <button onClick={backToSelect} className="rounded-2xl border-2 border-white/40 px-5 py-3 font-bold hover:bg-white/10">
                {es ? "Mundos" : "Worlds"}
              </button>
            </div>
          </div>
        )}

        {/* Preguntas (puertas de monedas) */}
        {phase === "question" && question && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
            <div className="pop-in w-full max-w-sm rounded-3xl bg-card p-5 text-card-foreground shadow-2xl">
              <p className="text-xs font-bold uppercase text-primary">📖 {question.dept}</p>
              <h3 className="mt-1 text-lg font-bold">{question.q}</h3>
              <div className="mt-3 grid gap-2">
                {question.options.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => answerQuestion(i)}
                    disabled={qAnswered !== null}
                    className={`rounded-2xl border-2 px-4 py-2 text-left text-sm font-semibold transition ${
                      qAnswered === null
                        ? "border-border hover:bg-muted"
                        : i === question.answer
                          ? "border-success bg-primary/10"
                          : i === qAnswered
                            ? "border-destructive opacity-70"
                            : "border-border opacity-50"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
              {qAnswered !== null && (
                <div className="mt-3 text-sm">
                  <p className="font-bold">
                    {qAnswered === question.answer
                      ? es ? "¡Correcto! +2 🪙" : "Correct! +2 🪙"
                      : es ? "Incorrecto. -1 🪙" : "Incorrect. -1 🪙"}
                  </p>
                  {question.fact && <p className="mt-1 text-muted-foreground">ℹ️ {question.fact}</p>}
                  <button onClick={closeQuestion} className="btn-3d mt-3 w-full rounded-2xl py-2">
                    {es ? "CONTINUAR ▶" : "CONTINUE ▶"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Batalla del jefe */}
        {phase === "boss" && question && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
            <div className="pop-in w-full max-w-sm rounded-3xl bg-card p-5 text-card-foreground shadow-2xl">
              <p className="text-lg font-bold">
                {world.boss.emoji} {es ? world.boss.name.es : world.boss.name.en}
              </p>
              <p className="text-xs font-bold text-primary">
                {es ? `Desafío ${boss.idx + 1}/${BOSS_QUESTIONS}` : `Challenge ${boss.idx + 1}/${BOSS_QUESTIONS}`} ·{" "}
                {es ? `Necesitas ${BOSS_NEED} aciertos` : `You need ${BOSS_NEED} correct`} · ⭐ {boss.score}
              </p>
              {qAnswered === null && (
                <p
                  className={`text-sm font-bold ${bossTimer <= 3 ? "text-destructive" : "text-muted-foreground"}`}
                  role="timer"
                  aria-label={es ? `Tiempo: ${bossTimer} segundos` : `Time: ${bossTimer} seconds`}
                >
                  ⏱ {bossTimer}s
                </p>
              )}
              <h3 className="mt-2 text-base font-bold">📖 {question.dept}</h3>
              <h4 className="text-lg font-bold">{question.q}</h4>
              <div className="mt-3 grid gap-2">
                {question.options.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => answerBoss(i)}
                    disabled={qAnswered !== null}
                    className={`rounded-2xl border-2 px-4 py-2 text-left text-sm font-semibold transition ${
                      qAnswered === null
                        ? "border-border hover:bg-muted"
                        : i === question.answer
                          ? "border-success bg-primary/10"
                          : i === qAnswered
                            ? "border-destructive opacity-70"
                            : "border-border opacity-50"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
              {qAnswered !== null && (
                <div className="mt-3 text-sm">
                  <p className="font-bold">
                    {qAnswered === question.answer
                      ? es ? "¡Correcto! ⭐" : "Correct! ⭐"
                      : es ? "Incorrecto." : "Incorrect."}
                  </p>
                  {question.fact && <p className="mt-1 text-muted-foreground">ℹ️ {question.fact}</p>}
                  <button onClick={nextBossQuestion} className="btn-3d mt-3 w-full rounded-2xl py-2">
                    {boss.idx + 1 >= BOSS_QUESTIONS
                      ? es ? "VER RESULTADO" : "SEE RESULT"
                      : es ? "SIGUIENTE ▶" : "NEXT ▶"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Victoria */}
        {phase === "victory" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 p-6 text-center text-white">
            <p className="text-5xl">🏆</p>
            <h3 className="text-2xl font-bold">
              {es ? "¡Venciste al " : "You defeated the "}
              {world.boss.emoji} {es ? world.boss.name.es : world.boss.name.en}!
            </h3>
            <p className="text-sm">
              {es ? "Mundo completado: queda registrado en tu evidencia de aprendizaje." : "World completed: recorded in your learning evidence."}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {next && (
                <button onClick={() => chooseWorld(next)} className="btn-3d rounded-2xl px-5 py-3">
                  {es ? "SIGUIENTE MUNDO ▶" : "NEXT WORLD ▶"}
                </button>
              )}
              <button onClick={backToSelect} className="rounded-2xl border-2 border-white/40 px-5 py-3 font-bold hover:bg-white/10">
                {es ? "MAPA DE MUNDOS" : "WORLD MAP"}
              </button>
            </div>
          </div>
        )}

        {/* Derrota */}
        {phase === "defeat" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 p-6 text-center text-white">
            <p className="text-5xl">{world.boss.emoji}</p>
            <h3 className="text-2xl font-bold">
              {es ? `El ${world.boss.name.es} te venció` : `The ${world.boss.name.en} won this time`}
            </h3>
            <p className="text-sm">
              {es
                ? `Consigue ${BOSS_NEED} de ${BOSS_QUESTIONS} respuestas correctas. ¡Inténtalo de nuevo!`
                : `Get ${BOSS_NEED} of ${BOSS_QUESTIONS} correct. Try again!`}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <button onClick={retryBoss} className="btn-3d rounded-2xl px-5 py-3">
                🔄 {es ? "REINTENTAR JEFE" : "RETRY BOSS"}
              </button>
              <button onClick={backToSelect} className="rounded-2xl border-2 border-white/40 px-5 py-3 font-bold hover:bg-white/10">
                {es ? "MAPA DE MUNDOS" : "WORLD MAP"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controles táctiles */}
      <div className="mt-3 flex justify-center gap-3 sm:hidden">
        <button
          className={touchBtn}
          aria-label={es ? "Mover a la izquierda" : "Move left"}
          onPointerDown={() => (keys.current.left = true)}
          onPointerUp={() => (keys.current.left = false)}
          onPointerLeave={() => (keys.current.left = false)}
        >
          ◀
        </button>
        <button
          className={touchBtn}
          aria-label={es ? "Saltar" : "Jump"}
          onPointerDown={() => (keys.current.jump = true)}
          onPointerUp={() => (keys.current.jump = false)}
          onPointerLeave={() => (keys.current.jump = false)}
        >
          ⤒
        </button>
        <button
          className={touchBtn}
          aria-label={es ? "Mover a la derecha" : "Move right"}
          onPointerDown={() => (keys.current.right = true)}
          onPointerUp={() => (keys.current.right = false)}
          onPointerLeave={() => (keys.current.right = false)}
        >
          ▶
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {es
          ? "Récord y mundos completados se guardan en tu dispositivo. Sin XP, gemas ni coronas."
          : "Best record and completed worlds are saved on your device. No XP, gems or crowns."}
      </p>
    </div>
  );
}
