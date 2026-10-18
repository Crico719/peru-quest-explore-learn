import { useEffect, useState } from "react";
import { IntiMascot } from "@/components/IntiMascot";

type Step = {
  title: string;
  text: string;
  icon: string;
};

const STEPS: Step[] = [
  {
    title: "Aprende jugando",
    text: "Entra a cada departamento, responde quizzes, juega memoria, tap rápido y ordena pasos. Cada actividad desbloquea contenido nuevo.",
    icon: "📚",
  },
  {
    title: "Gana recompensas",
    text: "Completa actividades para ganar XP. La primera vez que haces una actividad ganas 5 gemas y 2 gemas extra si sacas la máxima puntuación. Gana coronas en cada departamento.",
    icon: "💎",
  },
  {
    title: "Conquista el Perú",
    text: "Los departamentos se desbloquean en orden. Con 4 coronas completas un departamento y avanzas al siguiente territorio.",
    icon: "🗺️",
  },
  {
    title: "¡Tu aventura comienza!",
    text: "Inti te acompañará en todo el camino. Explora, aprende y convierte el Perú en tu conquista personal.",
    icon: "🚀",
  },
];



export function Onboarding({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const handler = () => setReduced(m.matches);
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, []);

  const done = () => {
    localStorage.setItem("peru-quest-onboarding-done", "1");
    onClose();
  };
  const skip = () => {
    localStorage.setItem("peru-quest-onboarding-skipped", "1");
    onClose();
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className={`w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl ${reduced ? "" : "animate-in fade-in zoom-in"}`}>
        <div className="flex items-start gap-4">
          <div className="shrink-0"><IntiMascot size={120} expression="happy" /></div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">¡Hola! Soy Inti ☀️</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ¡Bienvenido a Perú Quest! Te acompañaré en una aventura para aprender sobre el Perú, ganar gemas y conquistar nuevos territorios.
            </p>
            <button onClick={() => setStep(0)} className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              ¡Vamos a empezar!
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {step + 1} de 4
            </span>
            <button onClick={skip} className="text-xs font-semibold underline">Saltar tutorial</button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{STEPS[step]?.icon}</span>
            <div>
              <h3 className="font-bold">{STEPS[step]?.title}</h3>
              <p className="text-sm text-muted-foreground">{STEPS[step]?.text}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button onClick={back} disabled={step === 0} className="rounded-full border px-4 py-2 text-sm font-bold disabled:opacity-40">
            Atrás
          </button>
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-2 w-2 rounded-full ${i === step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              Siguiente
            </button>
          ) : (
            <button onClick={done} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              Comenzar a jugar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
