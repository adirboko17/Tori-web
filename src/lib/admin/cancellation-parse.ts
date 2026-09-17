import { normalizeIsraeliMobile } from "../sms/phone.ts";

export const CANCELLATION_STATUSES = [
  "requested",
  "seen",
  "done",
  "dismissed",
] as const;

export type CancellationStatus = (typeof CANCELLATION_STATUSES)[number];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const OPEN_STATUSES: CancellationStatus[] = ["requested", "seen"];

const STATUS_LABELS: Record<CancellationStatus, string> = {
  requested: "ממתין לטיפול",
  seen: "נצפה",
  done: "טופל",
  dismissed: "לא רלוונטי",
};

export function isCancellationStatus(value: unknown): value is CancellationStatus {
  return CANCELLATION_STATUSES.includes(String(value) as CancellationStatus);
}

export function isOpenCancellationStatus(status: CancellationStatus) {
  return OPEN_STATUSES.includes(status);
}

export function cancellationStatusLabel(status: CancellationStatus) {
  return STATUS_LABELS[status];
}

export function isCancellationId(value: string) {
  return UUID_RE.test(value);
}

export function parseCancellationInput(input: Record<string, unknown>) {
  const businessId = String(input.businessId ?? input.business_id ?? "").trim();
  if (!UUID_RE.test(businessId)) {
    return { ok: false as const, error: "חסר מזהה עסק תקין." };
  }

  const userId = String(input.userId ?? input.user_id ?? "").trim();
  if (userId && !UUID_RE.test(userId)) {
    return { ok: false as const, error: "מזהה המנהל אינו תקין." };
  }

  const phone = normalizeIsraeliMobile(String(input.phone ?? ""));
  if (!phone) {
    return { ok: false as const, error: "צריך להזין מספר נייד ישראלי תקין." };
  }

  const name = String(input.name ?? "").trim() || "מנהל עסק";
  const note = String(input.note ?? "").trim();
  const effectiveRaw = String(input.effectiveAt ?? input.effective_at ?? "").trim();
  let effectiveAt: string | null = null;
  if (effectiveRaw) {
    const parsed = new Date(effectiveRaw);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false as const, error: "תאריך סיום החיוב אינו תקין." };
    }
    effectiveAt = parsed.toISOString();
  }

  return {
    ok: true as const,
    businessId,
    userId: userId || null,
    phone,
    name,
    note,
    effectiveAt,
  };
}
