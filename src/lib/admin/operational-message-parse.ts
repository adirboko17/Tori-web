const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const HTTPS_URL_RE = /^https:\/\/\S+$/i;

export const OPERATIONAL_AUDIENCES = ["staff", "everyone"] as const;

export type OperationalAudience = (typeof OPERATIONAL_AUDIENCES)[number];

export type OperationalMessageInput = {
  title: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
  audience: OperationalAudience;
  businessIds: string[];
};

export function parseOperationalAudience(value: unknown): OperationalAudience | null {
  if (value == null || value === "") return "staff";
  return value === "staff" || value === "everyone" ? value : null;
}

export function parseOperationalMessageInput(input: Record<string, unknown>) {
  const title = String(input.title ?? "").trim();
  if (!title || title.length > 120) {
    return { ok: false as const, error: "צריך כותרת עד 120 תווים." };
  }

  const body = String(input.body ?? "").trim();
  if (!body || body.length > 2000) {
    return { ok: false as const, error: "צריך תוכן הודעה עד 2000 תווים." };
  }

  const actionLabel = String(input.actionLabel ?? input.action_label ?? "").trim();
  if (actionLabel.length > 40) {
    return { ok: false as const, error: "טקסט הכפתור יכול להכיל עד 40 תווים." };
  }

  const actionUrl = String(input.actionUrl ?? input.action_url ?? "").trim();
  if (actionUrl && !HTTPS_URL_RE.test(actionUrl)) {
    return { ok: false as const, error: "קישור הכפתור צריך להתחיל ב-https." };
  }
  if (actionUrl.length > 500) {
    return { ok: false as const, error: "הקישור ארוך מדי." };
  }
  if (actionUrl && !actionLabel) {
    return { ok: false as const, error: "צריך טקסט לכפתור כשיש קישור." };
  }

  const audience = parseOperationalAudience(input.audience);
  if (!audience) {
    return { ok: false as const, error: "קהל היעד אינו תקין." };
  }

  const rawIds = Array.isArray(input.businessIds)
    ? input.businessIds
    : Array.isArray(input.business_ids)
      ? input.business_ids
      : null;
  if (!rawIds) {
    return { ok: false as const, error: "צריך לבחור לקוחות." };
  }

  const businessIds = [...new Set(rawIds.map((id) => String(id ?? "").trim()))];
  if (businessIds.length === 0) {
    return { ok: false as const, error: "צריך לבחור לפחות לקוח אחד." };
  }
  if (businessIds.length > 500) {
    return { ok: false as const, error: "אפשר לבחור עד 500 לקוחות בהודעה אחת." };
  }
  if (businessIds.some((id) => !UUID_RE.test(id))) {
    return { ok: false as const, error: "אחד הלקוחות שנבחרו אינו תקין." };
  }

  return {
    ok: true as const,
    value: {
      title,
      body,
      actionLabel,
      actionUrl,
      audience,
      businessIds,
    } satisfies OperationalMessageInput,
  };
}

export function parseOperationalMessageActive(input: Record<string, unknown>) {
  if (typeof input.active !== "boolean") {
    return { ok: false as const, error: "חסר סטטוס פעיל או כבוי." };
  }
  return { ok: true as const, active: input.active };
}
