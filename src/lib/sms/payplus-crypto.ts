import { createHmac, timingSafeEqual } from "node:crypto";

export function amountsMatch(
  charged: number,
  expected: number,
  tolerance = 0.05,
) {
  return Math.abs(charged - expected) <= tolerance;
}

export function verifyPayplusHash(
  rawBody: string,
  hashHeader: string | null,
  secret: string,
) {
  if (!hashHeader) return false;
  const expected = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");
  const left = Buffer.from(hashHeader);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function pickNestedString(value: unknown, keys: string[]): string {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const found = record[key];
    if (found != null && String(found).trim()) return String(found).trim();
  }
  for (const nested of Object.values(record)) {
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const found = pickNestedString(nested, keys);
      if (found) return found;
    }
  }
  return "";
}

export function extractPayplusRecurringRef(payload: unknown) {
  return {
    recurringUid: pickNestedString(payload, [
      "recurring_payment_uid",
      "recurring_uid",
      "recurringPaymentUid",
      "recurringUid",
    ]),
    terminalUid: pickNestedString(payload, ["terminal_uid", "terminalUid"]),
    customerUid: pickNestedString(payload, ["customer_uid", "customerUid"]),
  };
}

export function parsePayplusCallback(rawBody: string) {
  const payload = JSON.parse(rawBody) as Record<string, unknown>;
  const transaction =
    (payload.transaction as Record<string, unknown> | undefined) ?? payload;
  const recurring = extractPayplusRecurringRef(payload);
  return {
    uid: String(transaction.uid ?? ""),
    statusCode: String(transaction.status_code ?? ""),
    amount: Number(transaction.amount),
    moreInfo: String(transaction.more_info ?? ""),
    recurringUid: recurring.recurringUid,
    terminalUid: recurring.terminalUid,
    customerUid: recurring.customerUid,
    raw: payload,
  };
}

export function isSuccessfulPayplusStatus(statusCode: string) {
  return statusCode === "000";
}

export function isPayplusUserAgent(userAgent: string | null) {
  if (!userAgent) return true;
  return /payplus/i.test(userAgent);
}
