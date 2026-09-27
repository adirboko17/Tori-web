export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

const MAX_TURNS = 12;
const MAX_CHARS = 800;

export function parseChatMessages(value: unknown): ChatTurn[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_TURNS) {
    return null;
  }
  const turns: ChatTurn[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    const role =
      row.role === "user" || row.role === "assistant" ? row.role : null;
    const content = String(row.content ?? "").trim().slice(0, MAX_CHARS);
    if (!role || !content) return null;
    turns.push({ role, content });
  }
  if (turns[turns.length - 1]?.role !== "user") return null;
  return turns;
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 20;
const hits = new Map<string, number[]>();

export function allowSiteChat(ip: string, now = Date.now()) {
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((at) => now - at >= WINDOW_MS)) hits.delete(key);
    }
  }
  return true;
}

export function siteChatIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "local";
}
