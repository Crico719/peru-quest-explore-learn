import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, BookOpen, Brain, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="relative inline-block cursor-pointer animate-pulse" onClick={() => setShowBubble(true)}>
      <div className="block">
        <svg viewBox="0 0 200 200" width="36" height="36" className="block">
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
  { icon: Calculator, label: "Explica ecuaciones cuadráticas", prompt: "Explícame las ecuaciones cuadráticas de forma sencilla" },
  { icon: Brain, label: "Dame un ejercicio de razonamiento", prompt: "Dame un ejercicio de razonamiento matemático para practicar" },
  { icon: BookOpen, label: "Resumen de Historia del Perú", prompt: "Hazme un resumen de la historia del Perú republicano" },
  { icon: Sparkles, label: "Técnicas de estudio", prompt: "¿Cuáles son las mejores técnicas de estudio para un examen de admisión?" },
];

const systemPrompt = `Eres un asistente de IA especializado en ayudar a estudiantes peruanos a prepararse para exámenes de admisión universitaria. 

Características:
- Respondes en español
- Eres amigable y motivador
- Te especializas en: Matemáticas, Razonamiento Matemático, Razonamiento Verbal, Física, Química, Biología, Literatura, Historia y Geografía
- Puedes explicar temas, crear ejercicios, y dar consejos de estudio
- Usas ejemplos prácticos y sencillos
- Fomentas la confianza del estudiante

Materias que cubres:
1. Matemáticas: Álgebra, geometría, aritmética
2. Razonamiento Matemático: Sucesiones, ecuaciones, conteo
3. Razonamiento Verbal: Comprensión lectora, sinónimos, analogías
4. Física: Dinámica, movimiento, termodinámica
5. Química: Enlaces, orgánica, inorgánica
6. Biología: Celular, genética, ecología
7. Literatura: Corrientes, obras, autores
8. Historia: Perú republicano, mundial
9. Geografía: Perú y general`;

// Simulación de IA local (reemplazar con Ollama en producción)
async function simulateAI(userMessage: string, history: Message[]): Promise<string> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500));

  const lowerMessage = userMessage.toLowerCase();

  // Respuestas inteligentes basadas en keywords
  if (lowerMessage.includes("ecuación") || lowerMessage.includes("cuadrátic")) {
    return `## Ecuaciones Cuadráticas 📐

Una **ecuación cuadrática** tiene la forma:
\`ax² + bx + c = 0\`

### Fórmula General
\`x = (-b ± √(b²-4ac)) / 2a\`

### Ejemplo práctico
Resolvamos: \`x² - 5x + 6 = 0\`

1. Identificamos: a=1, b=-5, c=6
2. Calculamos el discriminante: \`b²-4ac = 25-24 = 1\`
3. Aplicamos la fórmula:
   - x₁ = (5 + 1)/2 = **3**
   - x₂ = (5 - 1)/2 = **2**

### ¿Quieres practicar?
Intenta resolver: \`x² - 7x + 12 = 0\`

¿Necesitas que te explique algún paso? 🎯`;
  }

  if (lowerMessage.includes("razonamiento") || lowerMessage.includes("ejercicio")) {
    return `## Ejercicio de Razonamiento Matemático 🧠

**Problema:**
En una sucesión, cada término se obtiene multiplicando el anterior por 3 y sumando 2.
Si el primer término es 1, ¿cuál es el quinto término?

### Pista
Analiza el patrón:
- T₁ = 1
- T₂ = 1 × 3 + 2 = ?
- T₃ = ? × 3 + 2 = ?

### Solución
- T₁ = 1
- T₂ = 1 × 3 + 2 = **5**
- T₃ = 5 × 3 + 2 = **17**
- T₄ = 17 × 3 + 2 = **53**
- T₅ = 53 × 3 + 2 = **161**

**Respuesta: El quinto término es 161** ✅

¿Quieres otro ejercicio más difícil? 💪`;
  }

  if (lowerMessage.includes("historia") || lowerMessage.includes("perú")) {
    return `## Historia del Perú Republicano 🇵🇪

### Época Clave: La República Aristocrática (1826-1836)

**Características principales:**
- Gobernaron los terratenientes y comerciantes
- Base económica: exportación de guano y algodón
- Centralismo: Lima era el centro del poder

**Presidentes importantes:**
1. **Agustín Gamarro** (1829-1833): Primer presidente constitucional
2. **Ramón Castilla** (1845-1851, 1855-1862): Abolición de la esclavitud
3. **Miguel de San Román** (1862-1863): Elección democrática

### Datos para el examen
- La Constitución de 1826 fue la primera
- El Guano generó mucha riqueza (1840-1860)
- La Guerra con España fue en 1864-1866

¿Quieres que te genere un ejercicio sobre este tema? 📚`;
  }

  if (lowerMessage.includes("técnicas") || lowerMessage.includes("estudio") || lowerMessage.includes("consejo")) {
    return `## Mejores Técnicas de Estudio 📖

### 1. **Método Pomodoro** ⏱️
- Estudia 25 minutos sin distracciones
- Descansa 5 minutos
- Después de 4 pomodoros, descansa 15-30 min

### 2. **Técnica Feynman** 🎯
- Explica el tema como si enseñaras a alguien
- Identifica qué no entiendes
- Vuelve a estudiar esas partes
- Simplifica con palabras simples

### 3. **Repaso Espaciado** 📅
- Repasa hoy, mañana, en 3 días, en 7 días
- Mejora la memoria a largo plazo

### 4. **Mapas Mentales** 🗺️
- Conecta ideas visualmente
- Usa colores y dibujos
- Ayuda a ver relaciones entre temas

### 5. **Práctica Activa** ✍️
- Haz simulacros reales
- Cronometra el tiempo
- Analiza tus errores

### Consejo del día
> "No estudies más horas, estudia mejor horas." 🌟

¿Quieres que profundice en alguna técnica?`;
  }

  if (lowerMessage.includes("física") || lowerMessage.includes("movimiento")) {
    return `## Movimiento Uniformemente Acelerado 🚀

### Fórmulas importantes
\`\`\`
v = v₀ + at
x = v₀t + ½at²
v² = v₀² + 2ax
\`\`\`

### Ejemplo práctico
Un auto parte del reposo y acelera a 2 m/s². ¿Qué velocidad alcanza en 10 segundos?

**Datos:**
- v₀ = 0 (parte del reposo)
- a = 2 m/s²
- t = 10 s

**Solución:**
v = 0 + (2)(10) = **20 m/s**

### Convierte las unidades
- 20 m/s = 72 km/h

¿Quieres que te dé un problema más complejo? 🎯`;
  }

  // Respuesta genérica
  return `¡Hola! Soy **MaChat**, tu tutor IA para el examen de admisión. 🎓

Puedo ayudarte con:

📚 **Explicar temas** de cualquier materia
✏️ **Crear ejercicios** personalizados
💡 **Darte consejos** de estudio
📝 **Resúmenes** de temas importantes

**Materias disponibles:**
- Matemáticas
- Razonamiento Matemático
- Razonamiento Verbal
- Física
- Química
- Biología
- Literatura
- Historia
- Geografía

¿Qué materia te gustaría practicar hoy? ¡Estoy aquí para ayudarte a lograr tu meta! 💪`;
}

export function Chat() {
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
      const response = await simulateAI(userMessage.content, messages);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
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
            <h1 className="font-semibold">MaChat</h1>
            <p className="text-xs text-muted-foreground">Tu tutor IA de estudio</p>
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
            <h2 className="text-lg font-semibold">¡Hola! Soy MaChat 🎓</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Tu tutor IA para el examen de admisión.
              Pregúntame sobre cualquier materia, pide ejercicios o solicita explicaciones.
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
