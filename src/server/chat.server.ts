import { createServerFn } from "@tanstack/start";
import type { Message } from "@/components/kit/Chat";

const SYSTEM_PROMPT = `Eres Inti, asistente de cultura peruana.
Responde en español, con claridad, respeto cultural y profundidad.
Cubre historia, civilizaciones, arqueología, gastronomía, danzas, festividades, departamentos, pueblos indígenas, lenguas, biodiversidad y patrimonio.
Distingue hechos, interpretaciones y leyendas. No inventes fechas ni fuentes. Si no sabes, dilo.
Adáptate al nivel del usuario y mantiene contexto conversacional.`;

export const chatServerFn = createServerFn({ method: "POST" })
  .validator((data: { messages: Message[]; lang: string }) => data)
  .handler(async ({ data }) => {
    const { messages } = data;

    const baseUrl = process.env.AI_BASE_URL?.trim();
    const apiKey = process.env.AI_API_KEY?.trim();
    const model = process.env.AI_MODEL?.trim() || "llama3.1";

    if (!baseUrl || !apiKey) {
      return {
        ok: false as const,
        error: "Backend IA no configurado. Configura AI_BASE_URL y AI_API_KEY en variables de entorno del servidor."
      };
    }

    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`IA provider error ${res.status}: ${text}`);
      }

      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content?.trim() || "";

      return { ok: true as const, content };
    } catch (err: any) {
      return {
        ok: false as const,
        error: err?.message || "Error al contactar al backend de IA"
      };
    }
  });
