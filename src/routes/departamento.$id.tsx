import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DEPARTMENTS, REGION_EMOJI, locDept } from "@/data/departments";
import { useGame, speak, type Activity } from "@/lib/game";
import { t } from "@/lib/i18n";
import { useWikiImage } from "@/lib/wiki";
import { Quiz, Memory, TapGame, OrderGame } from "@/components/Games";

export const Route = createFileRoute("/departamento/$id")({
  loader: ({ params }) => {
    const d = DEPARTMENTS.find((x) => x.id === params.id);
    if (!d) throw notFound();
    return { id: d.id, name: d.name, capital: d.capital };
  },
  head: ({ loaderData }) => {
    const n = loaderData?.name ?? "Departamento";
    return {
      meta: [
        { title: `${n} — PERÚ QUEST` },
        { name: "description", content: `Historia, lugares, gastronomía y fiestas de ${n}, con quiz y minijuegos.` },
        { property: "og:title", content: `${n} — PERÚ QUEST` },
        { property: "og:description", content: `Aprende sobre ${n} jugando en PERÚ QUEST.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: DeptPage,
});

function Section({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  const { lang } = useGame();
  return (
    <section className="card-3d p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">{title}</h2>
        <button onClick={() => speak(text, lang)} className="rounded-xl bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground" aria-label={t(lang, "listen")}>
          🔊 {t(lang, "listen")}
        </button>
      </div>
      {children}
    </section>
  );
}

function DeptPage() {
  const { id } = Route.useLoaderData();
  const base = DEPARTMENTS.find((x) => x.id === id);
  if (!base) throw notFound();
  const g = useGame();
  const d = locDept(base, g.lang);
  const { data: img } = useWikiImage(d.wiki);
  const [game, setGame] = useState<Activity>("quiz");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const p = g.progress[d.id] ?? {};
  const seen = p.facts ?? [];
  const L = (k: Parameters<typeof t>[1]) => t(g.lang, k);

  const tabs: { k: Activity; icon: string; done: boolean }[] = [
    { k: "quiz", icon: "❓", done: (p.quiz ?? 0) >= 2 },
    { k: "memory", icon: "🃏", done: !!p.memory },
    { k: "tap", icon: "👆", done: !!p.tap },
    { k: "order", icon: "🔢", done: !!p.order },
  ];

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 pb-24 pt-4">
      <Link to="/" className="text-sm font-semibold text-primary">← {L("back")}</Link>
      <div className="relative overflow-hidden rounded-3xl bg-primary">
        {img ? <img src={img} alt={d.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} className="h-56 w-full object-cover sm:h-72" /> : <div className="flex h-56 items-center justify-center text-7xl">{d.emoji}</div>}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-5 text-background">
          <h1 className="text-3xl font-bold sm:text-4xl">{d.emoji} {d.name}</h1>
          <p className="font-medium">{L("capital")}: {d.capital} · {REGION_EMOJI[d.region]} {d.region} · 👑 {g.crowns(d.id)}/4</p>
        </div>
      </div>
      {g.lang === "en" && <p className="text-sm text-muted-foreground">{L("contentNote")}</p>}

      <Section title={L("history")} text={d.history}><p className="leading-relaxed">{d.history}</p></Section>

      <div className="grid gap-5 sm:grid-cols-2">
        <Section title={`📍 ${L("places")}`} text={d.places.join(". ")}>
          <ul className="space-y-1">{d.places.map((x) => <li key={x}>• {x}</li>)}</ul>
        </Section>
        <Section title={`🍽️ ${L("food")}`} text={d.food.join(". ")}>
          <ul className="space-y-1">{d.food.map((x) => <li key={x}>• {x}</li>)}</ul>
        </Section>
        <Section title={`🎉 ${L("fiestas")}`} text={d.fiestas.join(". ")}>
          <ul className="space-y-1">{d.fiestas.map((x) => <li key={x}>• {x}</li>)}</ul>
        </Section>
        <Section title={`⭐ ${L("person")}`} text={`${d.person.name}. ${d.person.desc}`}>
          <p className="font-semibold">{d.person.name}</p>
          <p className="text-sm text-muted-foreground">{d.person.desc}</p>
        </Section>
      </div>

      <section>
        <h2 className="text-xl font-bold">💡 {L("facts")}</h2>
        <p className="mb-3 text-sm text-muted-foreground">{L("tapFact")} (+2 XP)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {d.facts.map((f, i) => {
            const open = seen.includes(i);
            return (
              <button
                key={i}
                onClick={() => { g.seeFact(d.id, i); speak(`${f.t}. ${f.d}`, g.lang); }}
                className={`min-h-28 rounded-2xl p-3 text-left transition ${open ? "card-3d" : "bg-gem text-primary-foreground shadow-[0_4px_0_var(--border)]"}`}
              >
                <p className="font-bold">{open ? f.t : `#${i + 1} ${f.t}`}</p>
                {open && <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card-3d p-5">
        <h2 className="mb-3 text-xl font-bold">🎮 {L("activities")}</h2>
        <div className="mb-4 grid grid-cols-4 gap-2">
          {tabs.map((tb) => (
            <button
              key={tb.k}
              onClick={() => setGame(tb.k)}
              className={`rounded-2xl border-2 px-1 py-2 text-xs font-semibold sm:text-sm ${game === tb.k ? "border-primary bg-secondary" : "border-border"}`}
            >
              <span className="block text-xl">{tb.done ? "👑" : tb.icon}</span>
              {L(tb.k)}
            </button>
          ))}
        </div>
        {mounted && game === "quiz" && <Quiz key={d.id + "q"} d={d} />}
        {mounted && game === "memory" && <Memory key={d.id + "m"} d={d} />}
        {mounted && game === "tap" && <TapGame key={d.id + "t"} d={d} />}
        {mounted && game === "order" && <OrderGame key={d.id + "o"} d={d} />}
      </section>
    </main>
  );
}
