import { createFileRoute } from "@tanstack/react-router";
import { Aventura2D } from "@/components/Aventura2D";

export const Route = createFileRoute("/aventura")({
  head: () => ({
    meta: [
      { title: "Aventura 2D — PERÚ QUEST" },
      {
        name: "description",
        content: "Prototipo de aventura 2D de Inti: corre por la Costa, esquiva obstáculos y responde preguntas del Perú.",
      },
    ],
  }),
  component: AventuraPage,
});

function AventuraPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-4">
      <Aventura2D />
    </main>
  );
}
