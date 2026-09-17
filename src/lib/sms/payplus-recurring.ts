export type PayplusRecurringMatch = {
  uid: string;
  number: string;
  customerName: string;
  customerPhone: string;
  customerUid: string;
  amount: number;
  startDate: string;
  lastChargeDate: string;
  nextChargeAt: string | null;
  valid: boolean;
  extraInfo: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isPayplusUid(value: string) {
  return UUID_RE.test(value.trim());
}

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

export function parsePayplusDate(raw: string): Date | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }
  const dmy = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(value);
  if (dmy) {
    return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addRecurringPeriod(date: Date, type: string, range: number) {
  const next = new Date(date);
  if (type === "0" || type === "daily") {
    next.setDate(next.getDate() + range);
  } else if (type === "1" || type === "weekly") {
    next.setDate(next.getDate() + 7 * range);
  } else {
    next.setMonth(next.getMonth() + range);
  }
  return next;
}

export function nextPayplusChargeDate(input: {
  lastChargeDate?: string;
  firstChargeDate?: string;
  startDate?: string;
  recurringType?: string | number;
  recurringRange?: number;
  now?: Date;
}): string | null {
  const range = Number(input.recurringRange ?? 1) || 1;
  const type = String(input.recurringType ?? "monthly").toLowerCase();
  const last =
    parsePayplusDate(input.lastChargeDate ?? "") ||
    parsePayplusDate(input.firstChargeDate ?? "") ||
    parsePayplusDate(input.startDate ?? "");
  if (!last) return null;
  const today = startOfDay(input.now ?? new Date());
  if (last.getTime() > today.getTime()) return last.toISOString();
  let next = addRecurringPeriod(last, type, range);
  for (let i = 0; i < 120 && next.getTime() <= today.getTime(); i += 1) {
    next = addRecurringPeriod(next, type, range);
  }
  return next.toISOString();
}

export function parsePayplusRecurringRow(value: unknown): PayplusRecurringMatch | null {
  const row = asRecord(value);
  const uid = String(row.uid ?? row.recurring_payment_uid ?? "").trim();
  if (!isPayplusUid(uid)) return null;
  const startDate = String(row.start_date ?? row.first_charge_date ?? "");
  const lastChargeDate = String(row.last_charge_date ?? "");
  const amount = Number(row.each_payment_amount ?? row.amount ?? 0) || 0;
  return {
    uid,
    number: String(row.number ?? ""),
    customerName: String(row.customer_name ?? "").trim(),
    customerPhone: String(row.customer_phone ?? "").trim(),
    customerUid: String(row.customer_uid ?? "").trim(),
    amount,
    startDate,
    lastChargeDate,
    nextChargeAt: nextPayplusChargeDate({
      lastChargeDate,
      firstChargeDate: String(row.first_charge_date ?? ""),
      startDate,
      recurringType: row.recurring_type as string | number | undefined,
      recurringRange: Number(row.recurring_range ?? 1) || 1,
    }),
    valid: row.valid !== false && row.valid !== "false" && row.valid !== 0,
    extraInfo: String(row.extra_info ?? ""),
  };
}

export function parsePayplusRecurringList(payload: unknown) {
  const root = asRecord(payload);
  const rows = Array.isArray(root.data)
    ? root.data
    : Array.isArray(payload)
      ? payload
      : [];
  return rows
    .map((row) => parsePayplusRecurringRow(row))
    .filter((row): row is PayplusRecurringMatch => Boolean(row));
}
