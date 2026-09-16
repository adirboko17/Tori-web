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

export function parsePayplusCallback(rawBody: string) {
  const payload = JSON.parse(rawBody) as Record<string, unknown>;
  const transaction =
    (payload.transaction as Record<string, unknown> | undefined) ?? payload;
  return {
    uid: String(transaction.uid ?? ""),
    statusCode: String(transaction.status_code ?? ""),
    amount: Number(transaction.amount),
    moreInfo: String(transaction.more_info ?? ""),
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
