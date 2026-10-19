import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DEPARTMENTS, locDept } from "@/data/departments";
import { useGame } from "@/lib/game";
import intiHappy from "@/assets/inti/inti-happy.png";

/**
 * PROTOTIPO Aventura 2D — mundo Costa.
 * Canvas 2D, un solo archivo: movimiento (teclado + táctil), obstáculos,
 * coleccionables (soles de oro) y preguntas educativas con datos de departments.ts.
 * No registra XP/gemas/coronas (es un prototipo de práctica).
 */

const W = 800;
const H = 320;
const GROUND = 260;
const GRAVITY = 0.55;
const JUMP_V = -11;

type Entity = { x: number; y: number; kind: "coin" | "rock"; size: number };

type Question = { q: string; options: string[]; answer: number; dept: string; fact: string };

export function Aventura2D() {
  const g = useGame();
  const es = g.lang === "es";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgReady = useRef(false);

  // Estado del juego en refs (el loop no provoca re-render)
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
    entities: [] as Entity[],
    frame: 0,
  });
  const keys = useRef({ left: false, right: false, jump: false });

  // HUD en React
  const [hud, setHud] = useState({ coins: 0, distance: 0 });
  const [phase, setPhase] = useState<"intro" | "playing" | "question" | "over">("intro");
  const [question, setQuestion] = useState<Question | null>(null);
  const [qAnswered, setQAnswered] = useState<number | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = intiHappy;
    img.onload = () => {
      imgRef.current = img;
      imgReady.current = true;
    };
  }, []);

  const startGame = useCallback(() => {
    state.current = {
      running: true,
      paused: false,
      over: false,
      x: 120,
      y: GROUND - 48,
      vy: 0,
      distance: 0,
      speed: 3,
      coins: 0,
      invuln: 0,
      entities: [],
      frame: 0,
    };
    setHud({ coins: 0, distance: 0 });
    setQuestion(null);
    setQAnswered(null);
    setPhase("playing");
  }, []);

  const openQuestion = useCallback(() => {
    const base = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)]!;
    const d = locDept(base, g.lang);
    const qi = Math.floor(Math.random() * d.quiz.length);
    const q = d.quiz[qi]!;
    const order = q.o.map((_, k) => k).sort(() => Math.random() - 0.5);
    setQuestion({
      q: q.q,
      options: order.map((k) => q.o[k]!),
      answer: order.indexOf(q.a),
      dept: d.name,
      fact: d.facts[0] ? `${d.facts[0].t}: ${d.facts[0].d}` : "",
    });
    setQAnswered(null);
    state.current.paused = true;
    setPhase("question");
  }, [g.lang]);

  const answerQuestion = useCallback(
    (i: number) => {
      if (!question || qAnswered !== null) return;
      setQAnswered(i);
      const s = state.current;
      if (i === question.answer) {
        s.coins += 2;
        setHud((h) => ({ ...h, coins: s.coins }));
      } else {
        s.coins = Math.max(0, s.coins - 1);
        setHud((h) => ({ ...h, coins: s.coins }));
      }
    },
    [question, qAnswered]
  );

  const closeQuestion = useCallback(() => {
    state.current.paused = false;
    setPhase("playing");
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

  // Loop principal
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

      if (s.running && !s.paused && !s.over) {
        // Movimiento horizontal limitado
        if (k.left) s.x = Math.max(10, s.x - 3);
        if (k.right) s.x = Math.min(W - 58, s.x + 3);
        // Salto
        if (k.jump && s.y >= GROUND - 48 - 0.5) s.vy = JUMP_V;
        s.vy += GRAVITY;
        s.y += s.vy;
        if (s.y > GROUND - 48) {
          s.y = GROUND - 48;
          s.vy = 0;
        }

        s.frame++;
        s.distance += s.speed;
        s.speed = Math.min(7, 3 + s.distance / 1200);

        // Generador de entidades
        if (s.frame % 75 === 0) {
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
        for (const e of s.entities) {
          const hit =
            px < e.x + e.size && px + ps > e.x && py < e.y + e.size && py + ps > e.y;
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
            setHud({ coins: s.coins, distance: Math.floor(s.distance / 10) });
          }
        }
      }

      // Dibujo
      // Cielo (Costa: atardecer)
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
      sky.addColorStop(0, "#7dd3fc");
      sky.addColorStop(0.7, "#fde68a");
      sky.addColorStop(1, "#fb923c");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, GROUND + 60);
      // Sol
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(650, 70, 32, 0, Math.PI * 2);
      ctx.fill();
      // Mar (izquierda)
      ctx.fillStyle = "#0ea5e9";
      ctx.fillRect(0, GROUND - 18, 120, 22);
      // Arena
      ctx.fillStyle = "#f2e8cf";
      ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.strokeStyle = "#d6c9a8";
      ctx.beginPath();
      ctx.moveTo(0, GROUND + 0.5);
      ctx.lineTo(W, GROUND + 0.5);
      ctx.stroke();

      const s2 = state.current;
      // Entidades
      for (const e of s2.entities) {
        if (e.kind === "coin") {
          ctx.fillStyle = "#f59e0b";
          ctx.beginPath();
          ctx.arc(e.x + e.size / 2, e.y + e.size / 2, e.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#b45309";
          ctx.stroke();
        } else {
          ctx.fillStyle = "#a8a29e";
          ctx.beginPath();
          ctx.roundRect(e.x, e.y, e.size, e.size, 8);
          ctx.fill();
          ctx.strokeStyle = "#78716c";
          ctx.stroke();
        }
      }

      // Inti (parpadea si es invulnerable)
      if (imgReady.current && imgRef.current && !(s2.invuln > 0 && s2.frame % 12 < 6)) {
        ctx.drawImage(imgRef.current, s2.x, s2.y, 48, 48);
      } else if (!imgReady.current) {
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(s2.x + 24, s2.y + 24, 22, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [openQuestion]);

  const touchBtn =
    "select-none rounded-2xl border-2 border-border bg-card px-6 py-4 text-xl font-bold active:bg-muted";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-3 flex items-center justify-between">
        <Link to="/practica" className="text-sm font-bold text-primary">
          ← {es ? "Volver al mapa" : "Back to map"}
        </Link>
        <div className="flex gap-2 text-sm font-bold" aria-live="polite">
          <span className="chip text-gold">🪙 {hud.coins}</span>
          <span className="chip">📏 {hud.distance} m</span>
        </div>
      </div>

      <div className="card-3d relative overflow-hidden rounded-3xl">
        <canvas ref={canvasRef} width={W} height={H} className="block h-auto w-full" aria-label={es ? "Juego Aventura 2D de Inti en la Costa" : "Inti 2D Adventure game in the Costa"} />

        {phase === "intro" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-6 text-center text-white">
            <p className="text-4xl">🏖️</p>
            <h3 className="text-2xl font-bold">{es ? "Inti en la Costa" : "Inti in the Costa"}</h3>
            <p className="max-w-md text-sm">
              {es
                ? "Prototipo: corre por la costa, salta las rocas y junta soles de oro. Cada 5 soles responde una pregunta del Perú."
                : "Prototype: run along the coast, jump over rocks and collect golden suns. Every 5 suns, answer a Peru question."}
            </p>
            <p className="text-xs opacity-80">
              {es ? "← → moverse · Espacio saltar · botones táctiles en celular" : "← → move · Space jump · touch buttons on mobile"}
            </p>
            <button onClick={startGame} className="btn-3d rounded-2xl px-6 py-3">
              ▶ {es ? "EMPEZAR" : "START"}
            </button>
          </div>
        )}

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
          ? "Prototipo educativo — no otorga XP, gemas ni coronas."
          : "Educational prototype — no XP, gems or crowns awarded."}
      </p>
    </div>
  );
}
