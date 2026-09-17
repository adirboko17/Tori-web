import { invokeEdgeFunction } from "@/lib/sms/supabase-admin";

export async function moveCustomerSmsCredits(input: {
  fromBusinessId: string;
  toBusinessId: string | null;
  smsCredits: number;
}) {
  const result = await invokeEdgeFunction<Record<string, unknown>>(
    "pulseem-credit-move",
    {
      fromBusinessId: input.fromBusinessId,
      toBusinessId: input.toBusinessId,
      smsCredits: input.smsCredits,
    },
  );
  const data = result.data ?? {};
  if (!result.ok || data.ok === false || data.error) {
    const message =
      typeof data.errorMessage === "string"
        ? data.errorMessage
        : typeof data.message === "string"
          ? data.message
          : typeof data.error === "string"
            ? data.error
            : "העברת ההודעות נכשלה.";
    return { ok: false as const, message };
  }
  return { ok: true as const };
}
