import { useState } from "react";
import { Department } from "@/data/departments";
import { useGame } from "@/lib/game";

interface LocalizeGameProps {
  dept: Department;
  onComplete: (correct: boolean) => void;
}

export function LocalizeGame({ dept, onComplete }: LocalizeGameProps) {
  const g = useGame();
  const options = ["Costa", "Sierra", "Selva"];
  const [selected, setSelected] = useState<string | null>(null);
  const correct = dept.region;

  const handleOption = (region: string) => {
    setSelected(region);
    const correctC = region === correct;
    if (correctC) {
      // Perfect score for this mini game
      g.complete(dept.id, "quiz", 2, 2);
    } else {
      g.complete(dept.id, "quiz", 0, 2);
    }
    onComplete(correctC);
  };

  return (
    <div className="bg-card rounded-3xl p-6">
      <h3 className="text-xl font-bold mb-4">{dept.name}</h3>
      <p className="mb-4">¿Dónde se encuentra?</p>
      <div className="grid grid-cols-3 gap-4">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleOption(opt)}
            className="btn-3d flex-1"
          >
            {opt}
          </button>
        ))}
      </div>
      {selected && (
        <p className={`mt-4 text-lg ${selected === correct ? "text-success" : "text-destructive"}`}> {selected === correct ? "Correcto!" : "Incorrecto."}</p>
      )}
    </div>
  );
}
