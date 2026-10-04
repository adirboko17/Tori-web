export const SUBSCRIPTION_RETURN_PATH = "/api/subscribe/return";
export const SUBSCRIBE_TRACK_COOKIE = "tori_track_subscribe";

const UID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PayplusReturnFields = {
  transactionUid: string;
  pageRequestUid: string;
  moreInfo: string;
  statusCode: string;
};

export type PayplusReturnDecision = "missing" | "declined" | "lookup";

function field(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function uid(value: string) {
  return UID_RE.test(value) ? value : "";
}

/** Identifiers PayPlus appends when it sends the customer back after payment. */
export function readPayplusReturnFields(
  source: Record<string, unknown>,
): PayplusReturnFields {
  return {
    transactionUid: uid(field(source, ["transaction_uid", "transactionUid", "uid"])),
    pageRequestUid: uid(
      field(source, ["page_request_uid", "pageRequestUid", "payment_request_uid"]),
    ),
    moreInfo: field(source, ["more_info", "moreInfo"]).slice(0, 80),
    statusCode: field(source, ["status_code", "statusCode"]).slice(0, 12),
  };
}

/**
 * A success redirect is only worth checking with PayPlus when it carries a
 * transaction or page-request id. A non-success status code stops the lookup.
 */
export function payplusReturnDecision(
  fields: PayplusReturnFields,
): PayplusReturnDecision {
  if (!fields.transactionUid && !fields.pageRequestUid) return "missing";
  if (fields.statusCode && fields.statusCode !== "000") return "declined";
  return "lookup";
}
