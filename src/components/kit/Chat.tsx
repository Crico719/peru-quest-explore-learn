import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, BookOpen, Brain, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { chatServerFn } from "@/server/chat.server";

const INTI_TASKS = {
  es: [
    "¡Ñapay! Sigue así 🦙",
    "¡Buen trabajo, viajero! 👑",
    "¡Eso es, campeón! 🔥",
    "¡Poco a poco se llega lejos! 🗺️",
    "¡Vamos, Inti te acompaña! 🇵🇪",
  ],
  en: [
    "¡Ñapay! Keep going 🦙",
    "Great job, traveler! 👑",
    "That's it, champion! 🔥",
    "Little by little we go far! 🗺️",
    "Let's go, Inti is with you! 🇵🇪",
  ],
};

const intiMsg = (lang: string) => {
  const arr = INTI_TASKS[lang as "es" | "en"];
  return arr[Math.floor(Math.random() * arr.length)] ?? arr[0] ?? "¡Vamos, Inti te acompaña!";
};

const INtiMascot = ({ lang }: { lang: string }) => {
  const [showBubble, setShowBubble] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (showBubble) {
      setMessage(intiMsg(lang));
      const timer = setTimeout(() => setShowBubble(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showBubble, lang]);

  return (
    <div className="relative inline-block cursor-pointer" onClick={() => setShowBubble(true)} title="Inti tu mascota">
      <div className="block">
        <svg viewBox="0 0 200 200" width="48" height="48" className="block">
          <defs>
            <linearGradient id="intiBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e7e5e4" />
            </linearGradient>
          </defs>
          <ellipse cx="95" cy="142" rx="40" ry="30" fill="url(#intiBody)" stroke="#d6d3d1" strokeWidth="2" />
          <ellipse cx="70" cy="132" rx="26" ry="25" fill="#e7e5e4" />
          <ellipse cx="140" cy="92" rx="20" ry="22" fill="url(#intiBody)" stroke="#d6d3d1" strokeWidth="2" />
          <ellipse cx="114" cy="106" rx="12" ry="24" fill="url(#intiBody)" stroke="#d6d3d1" strokeWidth="2" />
          <ellipse cx="128" cy="80" rx="6" ry="13" fill="url(#intiBody)" stroke="#d6d3d1" strokeWidth="2" transform="rotate(-30 128 80)" />
          <ellipse cx="152" cy="76" rx="6" ry="13" fill="url(#intiBody)" stroke="#d6d3d1" strokeWidth="2" transform="rotate(30 152 76)" />
          <circle cx="130" cy="88" rx="4" fill="#1a202c" />
          <circle cx="132" cy="86" rx="2" fill="white" />
          <circle cx="150" cy="88" rx="4" fill="#1a202c" />
          <circle cx="152" cy="86" rx="2" fill="white" />
          <ellipse cx="140" cy="98" rx="4" ry="2.5" fill="#d6d3d1" />
          <path d="M136 102 Q140 105 144 102" stroke="#d6d3d1" strokeWidth="2" fill="none" />
          <path d="M95 142 Q155 132 165 162 Q155 182 125 182 Q95 182 95 142" fill="url(#intiBody)" stroke="#d6d3d1" strokeWidth="2" />
          <rect x="101" y="162" width="10" height="26" fill="#d6d3d1" stroke="#d6d3d1" strokeWidth="2" />
          <rect x="126" y="162" width="10" height="26" fill="#e7e5e4" stroke="#d6d3d1" strokeWidth="2" />
          <rect x="76" y="162" width="10" height="26" fill="#e7e5e4" stroke="#d6d3d1" strokeWidth="2" />
          <rect x="51" y="162" width="10" height="26" fill="#d6d3d1" stroke="#d6d3d1" strokeWidth="2" />
          <ellipse cx="56" cy="162" rx="13" ry="7" fill="#e7e5e4" stroke="#d6d3d1" strokeWidth="2" transform="rotate(45 56 162)" />
        </svg>
      </div>
      {showBubble && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 -top-2 bg-card border-2 border-border rounded-xl px-3 py-2 text-sm whitespace-nowrap shadow-lg z-10">
          <span className="text-xs text-primary font-bold">Inti dice:</span>
          <div className="text-foreground">{message}</div>
        </div>
      )}
    </div>
  );
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type Suggestion = {
  icon: typeof BookOpen;
  label: string;
  prompt: string;
};

const suggestions: Suggestion[] = [
  { icon: BookOpen, label: "Leyendas del Perú", prompt: "Cuéntame leyendas peruanas como la del Dorado o la del Huascarán" },
  { icon: Brain, label: "Gastronomía regional", prompt: "¿Cuáles son los platos típicos de cada región del Perú?" },
  { icon: Sparkles, label: "Festividades andinas", prompt: "Explícame el Inti Raymi y otras festividades andinas" },
  { icon: Calculator, label: "Arte precolombino", prompt: "Háblame de la cerámica Moche y Nazca" },
];

const systemPrompt = `Eres Inti, asistente de cultura peruana.

Características:
- Respondes en español, con calidez y orgullo cultural.
- Te especializas en: cultura andina, amazonica y costeña; historia del Perú precolombino y republicano; gastronomía, música, danzas, festividades, leyendas, arte precolombino y patrimonio.
- Explicas con ejemplos concretos de departamentos y comunidades.
- Mantienes un tono cercano y motivador, siempre fomentando el respeto por la diversidad cultural peruana.

Temas que cubres:
1. Civilizaciones precolombinas: Caral, Chavín, Mochica, Wari, Tiahuanaco, Inca
2. Gastronomía: platos regionales, ingredientes nativos
3. Festividades: Inti Raymi, Fiesta de la Candelaria, Marinera, etc.
4. Arte y textiles: cerámica, orfebrería, tejidos andinos
5. Leyendas y mitos: del Huascarán, la Puma, el Dorado
6. Patrimonio natural y cultural del Perú`;

// Simulación de IA local (reemplazar con Ollama en producción)
async function simulateAI(userMessage: string, history: Message[]): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("leyenda") || lowerMessage.includes("dorado") || lowerMessage.includes("huascarán")) {
    return `## Leyendas del Perú 🇵🇪✨

**Leyenda del Huascarán**
El Huascarán es la montaña más alta del Perú. Según la leyenda, es el corazón de un joven pastor que amó a una princesa Chachapoya y se convirtió en piedra para seguir vigilando su pueblo.

**El Dorado**
En la Amazonía se cuenta que El Dorado era un hombre cubierto de oro que se bañaba en las lagunas. Símbolo de la riqueza natural y la imaginación andino-amazónica.

¿Quieres que te cuente la leyenda de la Puma o de Manco Cápac?`;
  }

  if (lowerMessage.includes("gastronomía") || lowerMessage.includes("plato") || lowerMessage.includes("comida")) {
    return `## Gastronomía regional del Perú 🍲

**Costa:** Ceviche, tiradito, arroz con mariscos
**Sierra:** Papa a la huancaína, cuy chactado, queso fresco
**Selva:** Juane, tacacho con cecina, ensalada de plátano

Ingredientes nativos: quinua, kiwicha, camote, ají amarillo, maíz morado.

¿De qué departamento quieres un plato típico?`;
  }

  if (lowerMessage.includes("inti raymi") || lowerMessage.includes("festividad") || lowerMessage.includes("fiesta")) {
    return `## Festividades andinas 🎉

**Inti Raymi** — 24 de junio en Cusco
Fiesta del Sol en honor a Inti. Procesión, ofrendas y danzas. Celebra el solsticio de invierno y agradece la cosecha.

Otras festividades:
- Fiesta de la Candelaria en Puno — música y danza
- Señor de los Milagros en Lima
- Virgen de la Candelaria y Qoyllur Rit'i

¿Quieres detalles de una región específica?`;
  }

  if (lowerMessage.includes("arte") || lowerMessage.includes("moche") || lowerMessage.includes("nazca") || lowerMessage.includes("cerámica")) {
    return `## Arte precolombino peruano 🎨

**Moche:** Cerámica de retrato con cabezas clínicas, escenas cotidianas y mythológicas. Famosa por su técnica de pulido y colores vivos.

**Nazca:** Líneas en el desierto y cerámica con personajes antropomorfos. Representan deidades y animales andinos.

**Inca:** Textiles de lana de alpaca, orfebrería en oro y plata, piedra tallada en Machu Picchu.

¿Te interesa un detalle sobre textiles andinos?`;
  }

  return `¡Hola! Soy **Inti**, tu asistente de cultura peruana 🇵🇪🦙

Puedo contarte sobre:
📜 Leyendas y mitos andino-amazónicos
🍲 Gastronomía regional e ingredientes nativos
🎉 Festividades y danzas
🎨 Arte precolombino: Moche, Nazca, Inca, Chavín
🏔️ Historia de los 25 departamentos

Pregúntame por un departamento, una festividad o una leyenda y te cuento. ¿Por dónde empezamos?`;
}

export function Chat() {
  // Inti mascot integration active - 2026-10-17
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lang, setLang] = useState<"es" | "en">("es");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const allMessages = [...messages, userMessage];
      const result = await chatServerFn({ messages: allMessages, lang });
      if (!result.ok) {
        throw new Error(result.error);
      }
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, hubo un error. Intenta de nuevo. 🔄",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100dvh-14rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="grid size-10 place-items-center rounded-full bg-primary/10">
          <Bot className="size-5 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <INtiMascot lang={lang} />
          <div>
            <h1 className="font-semibold">Inti — Cultura Perú</h1>
            <p className="text-xs text-muted-foreground">Asistente cultural del Perú</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="size-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground">En línea</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full bg-primary/10">
              <Sparkles className="size-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">¡Hola! Soy Inti 🇵🇪🦙</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Tu guía de cultura peruana.
              Pregúntame por leyendas, gastronomía, festividades, arte precolombino y tradiciones de los 25 departamentos.
            </p>

            {/* Suggestions */}
            <div className="mt-8 grid w-full max-w-lg gap-3 sm:grid-cols-2">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSuggestionClick(s.prompt)}
                  className="press flex items-center gap-3 rounded-[16px] border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
                >
                  <s.icon className="size-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10">
                    <Bot className="size-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-[16px] px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  )}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <p
                    className={cn(
                      "mt-2 text-xs opacity-70",
                      message.role === "user" ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10">
                  <Bot className="size-4 text-primary" />
                </div>
                <div className="rounded-[16px] border border-border bg-card px-4 py-3">
                  <div className="flex gap-1">
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-card px-4 py-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Escribe tu pregunta..."
            rows={1}
            className="min-h-11 flex-1 resize-none rounded-[16px] border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="press grid size-11 place-items-center rounded-[16px] bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send className="size-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Presiona Enter para enviar · Shift+Enter para nueva línea
        </p>
      </form>
    </div>
  );
}
