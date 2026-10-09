import { leaveLiveSession, pruneLiveRows, touchLiveSession } from "@/lib/live/store";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_RE = /^[a-zA-Z0-9_-]{16,64}$/;

function cleanPath(value: unknown) {
  const raw = String(value ?? "").trim().slice(0, 180);
  const path = raw.split("?")[0]?.split("#")[0] ?? "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || path.startsWith("/admin") || path.startsWith("/api")) {
    return null;
  }
  return path;
}

function headerValue(request: Request, name: string, max: number) {
  const value = request.headers.get(name)?.trim() ?? "";
  if (!value || value === "unknown") return null;
  try {
    return decodeURIComponent(value).replace(/[^\p{L}\p{N} .'-]/gu, "").slice(0, max) || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  const sessionKey = String(body?.sessionId ?? "");
  const visitorRaw = String(body?.visitorId ?? "");
  const path = cleanPath(body?.path);
  if (!SESSION_RE.test(sessionKey) || !path) return jsonError("בקשה לא תקינה.");
  const visitorKey = SESSION_RE.test(visitorRaw) ? visitorRaw : null;

  try {
    if (body?.left === true) {
      await leaveLiveSession(sessionKey, visitorKey);
      return jsonOk({ ok: true });
    }
    await touchLiveSession({
      sessionKey,
      visitorKey,
      path,
      country: headerValue(request, "x-vercel-ip-country", 8),
      city: headerValue(request, "x-vercel-ip-city", 80),
    });
    if (Math.random() < 0.02) void pruneLiveRows().catch(() => undefined);
  } catch (error) {
    console.error("live presence failed", error);
    return jsonError("לא ניתן לעדכן את הנוכחות.", 503);
  }

  return jsonOk({ ok: true });
}
