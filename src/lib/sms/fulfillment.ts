export type OrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "fulfilled"
  | "failed";

export type FulfillmentDecision = "claim" | "idempotent" | "retry" | "reject";

/** Decide what to do after the pending→processing lock updates 0 rows. */
export function fulfillmentAfterMissedLock(
  status: string | null,
): FulfillmentDecision {
  if (status === "pending") return "claim";
  if (status === "fulfilled" || status === "processing") return "idempotent";
  if (status === "failed") return "retry";
  return "reject";
}

export function isTerminalPaid(status: string | null) {
  return status === "fulfilled" || status === "processing";
}
