import { useState } from "react";
import { DEPARTMENTS } from "@/data/departments";
import { LocalizeGame } from "./LocalizeGame";

interface PracticeModalProps {
  open: boolean;
  onClose: () => void;
  deptId?: string | null;
}

export function PracticeModal({ open, onClose, deptId }: PracticeModalProps) {
  const [showGame, setShowGame] = useState(false);

  const dept = open && deptId ? DEPARTMENTS.find((d) => d.id === deptId) : undefined;
  if (!dept) return null;

  const handleComplete = () => {
    setShowGame(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-3xl p-6 relative w-full max-w-md shadow-2xl pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-2xl bg-transparent"
          aria-label="Cerrar"
          onClick={onClose}
        >
          ✕
        </button>
        {showGame ? (
          <LocalizeGame dept={dept} onComplete={handleComplete} />
        ) : (
          <>
            <span className="chip text-primary">🎯 Modo práctica</span>
            <h2 className="text-2xl font-bold mt-2 mb-4">{dept.emoji} {dept.name}</h2>
            <p><strong>Capital:</strong> {dept.capital}</p>
            <p className="mt-4"><strong>Datos curiosos:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              {dept.facts.map((f, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {f.t}: {f.d}
                </li>
              ))}
            </ul>
            <p className="mt-4"><strong>Gastronomía:</strong> {dept.food.join(" · ")}</p>
            <p className="mt-2"><strong>Fiestas:</strong> {dept.fiestas.join(" · ")}</p>
            <p className="mt-2"><strong>Personaje destacado:</strong> {dept.person.name} — {dept.person.desc}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              La práctica no suma XP ni coronas: es solo para repasar.
            </p>
            <button
              onClick={() => setShowGame(true)}
              className="mt-4 btn-3d w-full rounded-2xl px-4 py-3 text-sm font-bold"
            >
              INICIAR LOCALIZACIÓN ▶
            </button>
          </>
        )}
      </div>
    </div>
  );
}
