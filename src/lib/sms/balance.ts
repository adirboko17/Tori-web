import { invokeEdgeFunction } from "./supabase-admin";

export type SmsBalance = {
  ok: boolean;
  total: number;
  packageCredits: number;
  prepaidCredits: number;
};

function toNumber(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function loadSmsBalance(businessId: string): Promise<SmsBalance> {
  const result = await invokeEdgeFunction<Record<string, unknown>>(
    "pulseem-tenant-direct-sms-balance",
    { businessId },
  );
  const data = result.data ?? {};
  const hasCredits = data.directSmsCredits != null && data.directSmsCredits !== "";
  return {
    ok: Boolean(result.ok && data.ok === true && hasCredits),
    total: toNumber(data.directSmsCredits),
    packageCredits: toNumber(data.packageSmsCredits),
    prepaidCredits: toNumber(data.prepaidSmsCredits),
  };
}

export async function transferPrepaidCredits(
  businessId: string,
  smsCredits: number,
) {
  const result = await invokeEdgeFunction<Record<string, unknown>>(
    "pulseem-credit-transfer",
    { businessId, smsCredits, asPrepaid: true },
  );
  if (!result.ok || findTransferError(result.data)) {
    const message =
      typeof result.data?.error === "string"
        ? result.data.error
        : typeof result.data?.message === "string"
          ? result.data.message
          : "העברת ההודעות נכשלה";
    return { ok: false as const, message };
  }
  return { ok: true as const };
}

function findTransferError(data: Record<string, unknown>) {
  if (data.error || data.success === false || data.ok === false) return true;
  return false;
}
