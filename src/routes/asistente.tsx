import { createFileRoute } from "@tanstack/react-router";
import { Chat } from "@/components/kit/Chat";

export const Route = createFileRoute("/asistente")({
  head: () => ({
    meta: [
      { title: "MaChat · Rumbo" },
      {
        name: "description",
        content: "MaChat - Tu tutor IA para estudiar y prepararte para el examen de admisión.",
      },
      { property: "og:title", content: "MaChat · Rumbo" },
      { property: "og:description", content: "Tu tutor de estudio para preparar el examen de admisión." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AsistentePage,
});

function AsistentePage() {
  return <Chat />;
}
