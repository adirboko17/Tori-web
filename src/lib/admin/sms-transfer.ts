export function parseSmsTransferInput(input: {
  amount: unknown;
  destination: unknown;
  fromBusinessId: string;
  maxRemaining: number | null;
}) {
  const amount = Math.floor(Number(input.amount));
  if (!Number.isFinite(amount) || amount < 1) {
    return { ok: false as const, error: "יש לציין כמות הודעות חיובית." };
  }
  if (input.maxRemaining != null && amount > input.maxRemaining) {
    return { ok: false as const, error: "אין מספיק יתרה אצל הלקוח." };
  }

  const destination = String(input.destination ?? "").trim();
  if (!destination || destination === "main") {
    return {
      ok: true as const,
      amount,
      destination: "main" as const,
      toBusinessId: null,
    };
  }
  if (destination === input.fromBusinessId) {
    return { ok: false as const, error: "לא ניתן להעביר לאותו לקוח." };
  }
  return {
    ok: true as const,
    amount,
    destination: "business" as const,
    toBusinessId: destination,
  };
}
