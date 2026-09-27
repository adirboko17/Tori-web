import { DEFAULT_SITE_CHAT_MODEL, SITE_CHAT_SYSTEM_PROMPT } from "@/lib/chat/knowledge";
import type { ChatTurn } from "@/lib/chat/messages";

export function siteChatModel() {
  return process.env.OPENROUTER_MODEL?.trim() || DEFAULT_SITE_CHAT_MODEL;
}

function messageText(content: unknown) {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (!part || typeof part !== "object") return "";
      const text = (part as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .join("")
    .trim();
}

export async function completeSiteChat(messages: ChatTurn[]) {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    const error = new Error("missing_key");
    error.name = "SiteChatConfigError";
    throw error;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://wetori.co.il",
      "X-Title": "Tori",
    },
    body: JSON.stringify({
      model: siteChatModel(),
      temperature: 0.3,
      max_completion_tokens: 450,
      reasoning: { effort: "low", exclude: true },
      messages: [{ role: "system", content: SITE_CHAT_SYSTEM_PROMPT }, ...messages],
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    choices?: { message?: { content?: unknown } }[];
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    console.error("openrouter chat failed", response.status, payload?.error?.message);
    throw new Error("upstream");
  }

  const reply = messageText(payload?.choices?.[0]?.message?.content).slice(0, 1200);
  if (!reply) throw new Error("empty");
  return reply;
}
