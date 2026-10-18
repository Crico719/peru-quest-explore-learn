import { useState } from "react";
import { DEPARTMENTS } from "@/data/departments";
import { useGame } from "@/lib/game";
import { LocalizeGame } from "./LocalizeGame";

interface PracticeModalProps {
  open: boolean;
  onClose: () => void;
  deptId?: string;
}

export function PracticeModal({ open, onClose, deptId }: PracticeModalProps) {
  const g = useGame();
  if (!open || !deptId) return null;
  const dept = DEPARTMENTS.find((d) => d.id === deptId);
  if (!dept) return null;

  const [showGame, setShowGame] = useState(false);

  const handleComplete = (correct: boolean) => {
    if (correct) {
      g.complete(dept.id, "quiz", 2, 2);
    } else {
      g.complete(dept.id, "quiz", 0, 2);
    }
    setShowGame(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-card rounded-3xl p-6 relative w-full max-w-md shadow-2xl">
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
            <h2 className="text-2xl font-bold mb-4">{dept.name}</h2>
            <p><strong>Capital:</strong> {dept.capital}</p>
            <p><strong>Región:</strong> {dept.region}</p>
            <p className="mt-4"><strong>Datos curiosos:</strong></p>
            <ul className="list-disc pl-4 space-y-1">{dept.facts.map((f, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {f.t}: {f.d}
              </li>
            ))}</ul>
            <p className="mt-4"><strong>Gastronomía:</strong> {dept.food.join(" · ")}</p>
            <p className="mt-2"><strong>Fiestas:</strong> {dept.fiestas.join(" · ")}</p>
            <p className="mt-2"><strong>Personaje destacado:</strong> {dept.person.name} - {dept.person.desc}</p>
            <button
              onClick={() => setShowGame(true)}
              className="mt-4 btn-3d px-4 py-2 text-sm"
            >
              Iniciar localización
            </button>
          </>
        )}
      </div>
    </div>
  );
}
