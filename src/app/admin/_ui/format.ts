export type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

export const LOW_SMS_BALANCE = 200;

const dateFormat = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const shortDateFormat = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "short",
});

const timeFormat = new Intl.DateTimeFormat("he-IL", {
  hour: "2-digit",
  minute: "2-digit",
});

const monthFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jerusalem",
  year: "numeric",
  month: "2-digit",
});

/** "2026-09" in Israel time, so month totals match the dashboard. */
export function monthKey(value: string | Date | null | undefined) {
  const date = value instanceof Date ? value : toDate(value);
  return date ? monthFormat.format(date) : "";
}

function toDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatNumber(value: number | null | undefined) {
  return value == null || !Number.isFinite(value) ? "—" : value.toLocaleString("he-IL");
}

export function formatIls(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `₪${value.toLocaleString("he-IL", { maximumFractionDigits: 2 })}`;
}

/** "12 בספט׳ 2026" */
export function formatDate(value: string | null | undefined) {
  const date = toDate(value);
  return date ? dateFormat.format(date) : "—";
}

/** "12 בספט׳ 2026, 14:05" */
export function formatDateTime(value: string | null | undefined) {
  const date = toDate(value);
  return date ? `${dateFormat.format(date)}, ${timeFormat.format(date)}` : "—";
}

/** "היום 14:05" / "אתמול" / "לפני 3 ימים" / "12 בספט׳". */
export function formatRelative(value: string | null | undefined) {
  const date = toDate(value);
  if (!date) return "—";
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.floor((startOfToday - date.getTime()) / 86_400_000) + 1;
  if (date.getTime() >= startOfToday) {
    const minutes = Math.round((now.getTime() - date.getTime()) / 60_000);
    if (minutes < 1) return "עכשיו";
    if (minutes < 60) return `לפני ${minutes} דק׳`;
    return `היום ${timeFormat.format(date)}`;
  }
  if (diffDays === 1) return "אתמול";
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  return date.getFullYear() === now.getFullYear()
    ? shortDateFormat.format(date)
    : dateFormat.format(date);
}

export function initialOf(name: string | null | undefined) {
  const value = String(name ?? "").trim();
  return value ? value.charAt(0).toUpperCase() : "?";
}

const PURCHASE_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "ממתין לתשלום", tone: "neutral" },
  processing: { label: "בטעינה", tone: "info" },
  paid: { label: "שולם", tone: "success" },
  fulfilled: { label: "הושלם", tone: "success" },
  failed: { label: "נכשל", tone: "danger" },
};

export function purchaseStatus(status: string) {
  return PURCHASE_STATUS[status] ?? { label: status || "—", tone: "neutral" as Tone };
}

export const SUBSCRIPTION_STATUS = {
  active: { label: "מנוי פעיל", tone: "success" },
  cancelled: { label: "מנוי בוטל", tone: "neutral" },
  none: { label: "אין הוראת קבע", tone: "neutral" },
  cancelling: { label: "ביקשו לבטל", tone: "warning" },
} as const satisfies Record<string, { label: string; tone: Tone }>;

export function smsTone(credits: number | null | undefined): Tone {
  if (credits == null) return "neutral";
  if (credits < LOW_SMS_BALANCE) return "danger";
  return "success";
}
