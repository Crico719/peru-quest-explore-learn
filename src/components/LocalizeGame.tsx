import { useState } from "react";
import { Department } from "@/data/departments";
import { cn } from "@/lib/utils";

interface LocalizeGameProps {
  dept: Department;
  onComplete: (correct: boolean) => void;
}

export function LocalizeGame({ dept, onComplete }: LocalizeGameProps) {
  const options = ["Costa", "Sierra", "Selva"] as const;
  const [selected, setSelected] = useState<string | null>(null);
  const correct = dept.region;

  const handleOption = (region: string) => {
    if (selected) return;
    setSelected(region);
    const isCorrect = region === correct;
    // Practice mode: no XP/crowns, just feedback.
    setTimeout(() => onComplete(isCorrect), 1200);
  };

  return (
    <div className="bg-card rounded-3xl p-2">
      <h3 className="text-xl font-bold mb-1">📍 {dept.name}</h3>
      <p className="mb-4 text-muted-foreground">¿En qué región se encuentra?</p>
      <div className="grid grid-cols-3 gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleOption(opt)}
            disabled={!!selected}
            className={cn(
              "btn-3d flex-1 rounded-2xl px-2 py-3 font-bold",
              selected && opt === correct && "ring-4 ring-success",
              selected && opt === selected && opt !== correct && "ring-4 ring-destructive opacity-70"
            )}
          >
            {opt === "Costa" ? "🏖️" : opt === "Sierra" ? "⛰️" : "🌳"} {opt}
          </button>
        ))}
      </div>
      {selected && (
        <p className={cn("mt-4 text-lg font-bold", selected === correct ? "text-success" : "text-destructive")}>
          {selected === correct ? "¡Correcto! 🎉" : `Incorrecto. ${dept.name} está en la ${correct}.`}
        </p>
      )}
    </div>
  );
}
