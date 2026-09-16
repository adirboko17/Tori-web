export const PAYMENT_FIELDS = [
  "cardName",
  "cardNumber",
  "cardExp",
  "cardCvv",
] as const;

/** Payment collection is deferred until a processor is connected. */
export function isPaymentRequired() {
  return false;
}

export function missingPaymentFields(fields: Record<string, string | undefined>) {
  if (!isPaymentRequired()) return [];
  return PAYMENT_FIELDS.filter((key) => !String(fields[key] ?? "").trim());
}

export function canFinishWithoutCards(
  fields: Record<string, string | undefined> = {},
) {
  return missingPaymentFields(fields).length === 0;
}
