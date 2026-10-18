import type { Lang } from "./game";

const T = {
  es: {
    tagline: "Aprende los 24 departamentos del Perú jugando", start: "¡Empezar el camino!", capital: "Capital", population: "Población",
    area: "Superficie", languages: "Idiomas", currency: "Moneda", independence: "Independencia", regions: "Regiones",
    path: "Tu camino", locked: "Completa el anterior para desbloquear", achievements: "Logros", export: "Exportar evidencia",
    history: "Historia", places: "Lugares top", food: "Gastronomía", fiestas: "Fiestas", person: "Personaje", facts: "6 datos curiosos",
    tapFact: "Toca cada dato para descubrirlo", activities: "Actividades", quiz: "Quiz", memory: "Memoria", tap: "Tap rápido", order: "Ordenar pasos",
    listen: "Escuchar", back: "Volver", check: "Comprobar", next: "Siguiente", finish: "Terminar", correct: "¡Correcto!", wrong: "Respuesta:",
    done: "¡Completado!", again: "Jugar otra vez", score: "Puntaje", region: "Región", reset: "Reiniciar progreso",
    memoryHelp: "Encuentra las parejas de lugar y emoji", tapHelp: "Toca solo los platos de este departamento antes de que acabe el tiempo",
    orderHelp: "Toca los pasos en el orden correcto", start2: "Comenzar", time: "Tiempo", unlockedOf: "logros desbloqueados", contentNote: "",
    search: "Buscar departamento…", all: "Todos", coast: "Costa", highlands: "Sierra", jungle: "Selva", progress: "Progreso de coronas", tip: "Tip del día", moves: "movidas", showRecipe: "Ver receta para aprender", hideRecipe: "Ocultar receta", dishesOf: "Platos de este departamento", profile: "Mi perfil",
  },
  en: {
    tagline: "Learn Peru's 24 departments by playing", start: "Start the path!", capital: "Capital", population: "Population",
    area: "Area", languages: "Languages", currency: "Currency", independence: "Independence", regions: "Regions",
    path: "Your path", locked: "Finish the previous one to unlock", achievements: "Achievements", export: "Export evidence",
    history: "History", places: "Top places", food: "Food", fiestas: "Festivals", person: "Famous figure", facts: "6 fun facts",
    tapFact: "Tap each fact to reveal it", activities: "Activities", quiz: "Quiz", memory: "Memory", tap: "Quick tap", order: "Order steps",
    listen: "Listen", back: "Back", check: "Check", next: "Next", finish: "Finish", correct: "Correct!", wrong: "Answer:",
    done: "Completed!", again: "Play again", score: "Score", region: "Region", reset: "Reset progress",
    memoryHelp: "Match each place with its emoji", tapHelp: "Tap only this department's dishes before time runs out",
    orderHelp: "Tap the steps in the right order", start2: "Start", time: "Time", unlockedOf: "achievements unlocked",
    contentNote: "Department content is in Spanish — great practice!",
    search: "Search department…", all: "All", coast: "Coast", highlands: "Highlands", jungle: "Jungle", progress: "Crown progress", tip: "Tip of the day", moves: "moves", showRecipe: "See recipe to learn", hideRecipe: "Hide recipe", dishesOf: "Dishes of this department", profile: "My profile",
  },
};

export type TKey = keyof typeof T.es;
export const t = (lang: Lang, k: TKey) => T[lang][k];
