// @ts-nocheck
/**
 * Super-admin only: POST Pulseem `AccountsApi/CreditTransfer` — load credits onto an existing Direct (sub) account.
 *
 * Per OpenAPI `CreditTransferModel` (api.pulseem.com/swagger/v1/swagger.json):
 * - Request header `APIKEY`: company main REST key (`PULSEEM_MAIN_API_KEY` secret).
 * - JSON body uses lowercase `apikey` for the **target** Direct account API key (stored encrypted on business_profile).
 * - Optional integer fields: emailCredits, smsCredits, directEmailCredits, directSmsCredits.
 *
 * Auth: same as pulseem-provision-subaccount (service_role JWT or sb_secret).
 * verify_jwt must stay false (custom Bearer check).
 *
 * POST JSON (single business):
 *   { "businessId": "uuid",
 *     "smsCredits"?: number — SendSms pool. Positive loads the sub-account
 *       (purchased extras by default). Negative is rejected: Pulseem debits the
 *       sub-account and does not credit the main account (panel-only behavior),
 *     "asPrepaid"?: boolean — default true when smsCredits > 0; also increments
 *       business_profile.pulseem_prepaid_sms_credits so monthly refill keeps extras,
 *     "directSmsCredits"?: number, "emailCredits"?: number, "directEmailCredits"?: number }
 * A positive transfer needs at least one credit field > 0.
 * A reclaim is smsCredits < 0 (other pools must stay 0), capped at 10,000.
 *
 * POST JSON (monthly automation — pg_cron, 1st of month):
 *   { "monthlyTopupAll": true,
 *     "directSmsCredits"?: number — monthly PACKAGE size, default PULSEEM_MONTHLY_TARGET_DIRECT_SMS or 1000 }
 * For each business: refill only the monthly package (target − max(0, pulseemBalance − prepaid)).
 * Purchased extras (`pulseem_prepaid_sms_credits`) are kept on top and never expire.
 * If already at/above package+prepaid, skip (do not add extra, do not remove surplus).
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtVerify } from "https://deno.land/x/jose@v5.2.3/index.ts";
import { decryptPulseemField } from "./pulseemFieldCrypto.ts";

const PULSEEM_REST_BASE = "https://api.pulseem.com/api/v1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function bearerFromRequest(req: Request): string {
  return (req.headers.get("Authorization") ?? "")
    .replace(/^Bearer\s+/i, "")
    .trim();
}

async function authorizeServiceRole(req: Request): Promise<boolean> {
  const auth = bearerFromRequest(req);
  if (!auth) return false;

  const expected = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "").trim();
  if (expected && auth === expected) return true;

  const jwtSecret = (
    Deno.env.get("SUPABASE_JWT_SECRET") ??
    Deno.env.get("JWT_SECRET") ??
    ""
  ).trim();
  if (!jwtSecret || !auth.startsWith("eyJ")) return false;

  try {
    const { payload } = await jwtVerify(
      auth,
      new TextEncoder().encode(jwtSecret),
      { algorithms: ["HS256"] },
    );
    return String(payload.role ?? "") === "service_role";
  } catch {
    return false;
  }
}

function clampInt(n: unknown, fallback: number, max: number): number {
  const v = typeof n === "number" && Number.isFinite(n) ? Math.trunc(n) : fallback;
  return Math.max(0, Math.min(max, v));
}

/** Positive top-up up to 1e6, or a reclaim down to -10_000. Null means "not sent". */
function parseSignedSmsCredits(
  n: unknown,
): { ok: true; value: number } | { ok: false; errorMessage: string } {
  if (n == null) return { ok: true, value: 0 };
  if (typeof n !== "number" || !Number.isFinite(n)) {
    return { ok: false, errorMessage: "כמות ה-SMS אינה מספר תקין" };
  }
  const value = Math.trunc(n);
  if (value > 1_000_000) {
    return { ok: false, errorMessage: "מקסימום 1,000,000 קרדיטים בהעברה" };
  }
  if (value < -10_000) {
    return { ok: false, errorMessage: "מקסימום 10,000 קרדיטים בהחזרה אחת" };
  }
  return { ok: true, value };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface CreditAmounts {
  emailCredits: number;
  smsCredits: number;
  directEmailCredits: number;
  directSmsCredits: number;
}

async function pulseemCreditTransferRequest(opts: {
  mainKey: string;
  targetApiKey: string;
  amounts: CreditAmounts;
}): Promise<
  | { ok: true; json: Record<string, unknown>; text: string }
  | { ok: false; errorMessage: string; pulseemRaw?: string }
> {
  const pulseBody = {
    apikey: opts.targetApiKey,
    emailCredits: opts.amounts.emailCredits,
    smsCredits: opts.amounts.smsCredits,
    directEmailCredits: opts.amounts.directEmailCredits,
    directSmsCredits: opts.amounts.directSmsCredits,
  };

  const url = `${PULSEEM_REST_BASE}/AccountsApi/CreditTransfer`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        APIKEY: opts.mainKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(pulseBody),
    });
  } catch (e) {
    console.error("[pulseem-credit-transfer] fetch:", e);
    return {
      ok: false,
      errorMessage: (e as Error)?.message ?? "קריאה ל-Pulseem נכשלה",
    };
  }

  const text = await res.text();
  let j: Record<string, unknown> = {};
  try {
    j = JSON.parse(text) as Record<string, unknown>;
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    return {
      ok: false,
      errorMessage: `Pulseem HTTP ${res.status}: ${text.slice(0, 300)}`,
      pulseemRaw: text.slice(0, 500),
    };
  }

  const status = j?.status ?? j?.Status ?? "";
  const errMsg =
    j?.error ?? j?.Error ?? j?.errorMessage ?? j?.ErrorMessage ?? null;

  if (status && String(status).toLowerCase() !== "success") {
    return {
      ok: false,
      errorMessage: `Pulseem: ${status}${errMsg ? ` - ${errMsg}` : ""}`,
    };
  }
  if (errMsg) {
    return { ok: false, errorMessage: String(errMsg) };
  }

  return { ok: true, json: j, text };
}

function asFiniteNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function creditsFromPackage(v: unknown): number | null {
  const flat = asFiniteNumber(v);
  if (flat !== null) return flat;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return asFiniteNumber(o.credits ?? o.Credits);
  }
  return null;
}

function pickFirstCredits(
  obj: Record<string, unknown> | undefined,
  keys: string[],
): number | null {
  if (!obj || typeof obj !== "object") return null;
  for (const k of keys) {
    if (!(k in obj)) continue;
    const n = creditsFromPackage(obj[k]);
    if (n !== null) return n;
  }
  return null;
}

const SMS_PACKAGE_KEYS = [
  "sms",
  "Sms",
  "SMS",
  "smsCredits",
  "SmsCredits",
  "SMSCredits",
  "smsBalance",
  "SmsBalance",
];

/** Pulseem now bills SendSms from «חבילת SMS», not Direct «חבילת SMS בAPI». */
function extractSmsPackageCreditsFromPulseemJson(
  j: Record<string, unknown>,
): number | null {
  const ctr =
    j.creditTransferModelResult ??
    j.CreditTransferModelResult ??
    j.creditBalanceModelResult ??
    j.CreditBalanceModelResult ??
    j.result;
  const ctrObj = ctr as Record<string, unknown> | undefined;
  const fromNested = pickFirstCredits(ctrObj, SMS_PACKAGE_KEYS);
  if (fromNested !== null) return fromNested;
  return pickFirstCredits(j, [
    "smsCredits",
    "SmsCredits",
    "SMSCredits",
    "smsBalance",
    "SmsBalance",
  ]);
}

async function getDirectSmsBalanceWithDirectKey(
  directApiKey: string,
): Promise<
  | { ok: true; credits: number }
  | { ok: false; errorMessage: string }
> {
  const key = directApiKey.trim();
  if (!key) {
    return { ok: false, errorMessage: "מפתח API Direct ריק" };
  }
  const url = `${PULSEEM_REST_BASE}/AccountsApi/GetCreditBalance`;
  const bodies = [{}, { isSMSIncludeVoice: false }, { IsSMSIncludeVoice: false }];
  const headerVariants: Record<string, string>[] = [
    { APIKEY: key },
    { APIKey: key },
  ];
  let lastHttpErr = "";
  for (const bodyObj of bodies) {
    for (const apiHeader of headerVariants) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            ...apiHeader,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(bodyObj),
        });
        const text = await res.text();
        if (!res.ok) {
          lastHttpErr = `Pulseem HTTP ${res.status}: ${text.slice(0, 180)}`;
          continue;
        }
        let j: Record<string, unknown> = {};
        try {
          j = JSON.parse(text) as Record<string, unknown>;
        } catch {
          continue;
        }
        const st = j.status ?? j.Status;
        if (st && String(st).toLowerCase() !== "success") {
          const err =
            j.errorMessage ?? j.ErrorMessage ?? j.error ?? j.Error ?? text;
          lastHttpErr = `Pulseem: ${String(err).slice(0, 200)}`;
          continue;
        }
        const n = extractSmsPackageCreditsFromPulseemJson(j);
        if (n !== null) {
          return { ok: true, credits: n };
        }
      } catch (e) {
        lastHttpErr = (e as Error)?.message ?? "GetCreditBalance נכשלה";
      }
    }
  }
  return {
    ok: false,
    errorMessage: lastHttpErr || "לא נמצאה יתרת חבילת SMS בתשובת Pulseem",
  };
}

function creditTransferSummary(j: Record<string, unknown>): Record<string, unknown> {
  const ctr = j?.creditTransferModelResult ?? j?.CreditTransferModelResult;
  const ctrObj = ctr as Record<string, unknown> | undefined;
  const pickCredits = (...keys: string[]) => {
    const n = pickFirstCredits(ctrObj, keys);
    return n === null ? undefined : n;
  };

  return {
    directSmsCreditsAfter: pickCredits("directSms", "DirectSms"),
    smsCreditsAfter: pickCredits("sms", "Sms", "smsCredits", "SmsCredits"),
    emailCreditsAfter: pickCredits("emailCredits", "EmailCredits"),
    directEmailCreditsAfter: pickCredits("directEmail", "DirectEmail"),
    creditTransferModelResult: ctr ?? null,
  };
}

async function incrementPrepaidSmsCredits(
  admin: ReturnType<typeof createClient>,
  businessId: string,
  amount: number,
): Promise<number | null> {
  if (amount <= 0) return null;
  const { data: row, error: fetchErr } = await admin
    .from("business_profile")
    .select("pulseem_prepaid_sms_credits")
    .eq("id", businessId)
    .maybeSingle();
  if (fetchErr || !row) {
    console.error("[pulseem-credit-transfer] prepaid fetch", fetchErr);
    return null;
  }
  const next = Math.max(
    0,
    Math.floor(Number(row.pulseem_prepaid_sms_credits) || 0) + amount,
  );
  const { error: updErr } = await admin
    .from("business_profile")
    .update({ pulseem_prepaid_sms_credits: next })
    .eq("id", businessId);
  if (updErr) {
    console.error("[pulseem-credit-transfer] prepaid increment", updErr);
    return null;
  }
  return next;
}

/** Purchased extras leave first. The monthly package portion is refilled on the 1st. */
async function decrementPrepaidSmsCredits(
  admin: ReturnType<typeof createClient>,
  businessId: string,
  amount: number,
): Promise<number | null> {
  if (amount <= 0) return null;
  const { data: row, error: fetchErr } = await admin
    .from("business_profile")
    .select("pulseem_prepaid_sms_credits")
    .eq("id", businessId)
    .maybeSingle();
  if (fetchErr || !row) {
    console.error("[pulseem-credit-transfer] prepaid fetch", fetchErr);
    return null;
  }
  const current = Math.max(0, Math.floor(Number(row.pulseem_prepaid_sms_credits) || 0));
  const next = Math.max(0, current - amount);
  if (next === current) return current;
  const { error: updErr } = await admin
    .from("business_profile")
    .update({ pulseem_prepaid_sms_credits: next })
    .eq("id", businessId);
  if (updErr) {
    console.error("[pulseem-credit-transfer] prepaid decrement", updErr);
    return null;
  }
  return next;
}

async function clampPrepaidToPulseemBalance(
  admin: ReturnType<typeof createClient>,
  businessId: string,
  pulseemBalance: number,
  ledgerPrepaid: number,
): Promise<number> {
  const next = Math.min(Math.max(0, ledgerPrepaid), Math.max(0, pulseemBalance));
  if (next !== ledgerPrepaid) {
    const { error } = await admin
      .from("business_profile")
      .update({ pulseem_prepaid_sms_credits: next })
      .eq("id", businessId);
    if (error) {
      console.error("[pulseem-credit-transfer] prepaid clamp", error);
      return ledgerPrepaid;
    }
  }
  return next;
}

async function transferForBusiness(opts: {
  businessId: string;
  amounts: CreditAmounts;
  asPrepaid: boolean;
  encKey: string;
  mainKey: string;
  admin: ReturnType<typeof createClient>;
}): Promise<
  | { ok: true; businessId: string } & Record<string, unknown>
  | { ok: false; businessId: string; errorMessage: string; pulseemRaw?: string }
> {
  const { data: row, error: fetchErr } = await opts.admin
    .from("business_profile")
    .select("id, pulseem_api_key, pulseem_has_api_key")
    .eq("id", opts.businessId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false, businessId: opts.businessId, errorMessage: "לא נמצא עסק" };
  }
  if (!row.pulseem_has_api_key) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: "לעסק אין מפתח API Pulseem (Direct)",
    };
  }

  let targetApiKey: string;
  try {
    targetApiKey = await decryptPulseemField(
      String(row.pulseem_api_key ?? "").trim(),
      opts.encKey,
    );
  } catch (e) {
    console.error("[pulseem-credit-transfer] decrypt:", e);
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: "פענוח מפתח Pulseem מהמסד נכשל",
    };
  }
  targetApiKey = targetApiKey.trim();
  if (!targetApiKey) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: "מפתח API Direct ריק אחרי פענוח",
    };
  }

  const api = await pulseemCreditTransferRequest({
    mainKey: opts.mainKey,
    targetApiKey,
    amounts: opts.amounts,
  });

  if (!api.ok) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: api.errorMessage,
      pulseemRaw: api.pulseemRaw,
    };
  }

  let prepaidSmsCreditsAfter: number | undefined;
  if (opts.asPrepaid && opts.amounts.smsCredits > 0) {
    const prepaid = await incrementPrepaidSmsCredits(
      opts.admin,
      opts.businessId,
      opts.amounts.smsCredits,
    );
    if (prepaid != null) prepaidSmsCreditsAfter = prepaid;
  }

  return {
    ok: true,
    businessId: opts.businessId,
    prepaidSmsCreditsAfter,
    asPrepaid: opts.asPrepaid && opts.amounts.smsCredits > 0,
    ...creditTransferSummary(api.json),
  };
}

/** Monthly job: refill the 1000 package only; keep prepaid extras on top. */
async function refillBusinessToTarget(opts: {
  businessId: string;
  target: number;
  encKey: string;
  mainKey: string;
  admin: ReturnType<typeof createClient>;
}): Promise<
  | {
      ok: true;
      businessId: string;
      skipped: boolean;
      balanceBefore: number;
      prepaid: number;
      packageLeft: number;
      transferred: number;
      target: number;
      packageTarget: number;
    }
    & Record<string, unknown>
  | { ok: false; businessId: string; errorMessage: string; pulseemRaw?: string }
> {
  const { data: row, error: fetchErr } = await opts.admin
    .from("business_profile")
    .select("id, pulseem_api_key, pulseem_has_api_key, pulseem_prepaid_sms_credits")
    .eq("id", opts.businessId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false, businessId: opts.businessId, errorMessage: "לא נמצא עסק" };
  }
  if (!row.pulseem_has_api_key) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: "לעסק אין מפתח API Pulseem (Direct)",
    };
  }

  let targetApiKey: string;
  try {
    targetApiKey = await decryptPulseemField(
      String(row.pulseem_api_key ?? "").trim(),
      opts.encKey,
    );
  } catch (e) {
    console.error("[pulseem-credit-transfer] decrypt:", e);
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: "פענוח מפתח Pulseem מהמסד נכשל",
    };
  }
  targetApiKey = targetApiKey.trim();
  if (!targetApiKey) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: "מפתח API Direct ריק אחרי פענוח",
    };
  }

  const bal = await getDirectSmsBalanceWithDirectKey(targetApiKey);
  if (!bal.ok) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: `קריאת יתרה נכשלה: ${bal.errorMessage}`,
    };
  }

  const balanceBefore = Math.max(0, Math.floor(bal.credits));
  const prepaid = await clampPrepaidToPulseemBalance(
    opts.admin,
    opts.businessId,
    balanceBefore,
    Math.max(0, Math.floor(Number(row.pulseem_prepaid_sms_credits) || 0)),
  );
  const packageLeft = Math.max(0, balanceBefore - prepaid);
  const transferred = Math.max(0, opts.target - packageLeft);
  if (transferred <= 0) {
    return {
      ok: true,
      businessId: opts.businessId,
      skipped: true,
      balanceBefore,
      prepaid,
      packageLeft,
      transferred: 0,
      target: opts.target + prepaid,
      packageTarget: opts.target,
    };
  }

  const api = await pulseemCreditTransferRequest({
    mainKey: opts.mainKey,
    targetApiKey,
    amounts: {
      emailCredits: 0,
      smsCredits: transferred,
      directEmailCredits: 0,
      directSmsCredits: 0,
    },
  });

  if (!api.ok) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: api.errorMessage,
      pulseemRaw: api.pulseemRaw,
    };
  }

  return {
    ok: true,
    businessId: opts.businessId,
    skipped: false,
    balanceBefore,
    prepaid,
    packageLeft,
    transferred,
    target: opts.target + prepaid,
    packageTarget: opts.target,
    ...creditTransferSummary(api.json),
  };
}

/**
 * Pulseem's panel returns SMS to the main account when a sub-account top-up
 * is a negative number. CreditTransfer accepts that int32. After the call we
 * confirm the main pool actually grew; if the sub-account dropped and the main
 * account did not, the transfer is reversed so credits are not destroyed.
 */
async function reclaimSmsToMain(opts: {
  businessId: string;
  amount: number;
  encKey: string;
  mainKey: string;
  admin: ReturnType<typeof createClient>;
}): Promise<
  | { ok: true; businessId: string } & Record<string, unknown>
  | { ok: false; businessId: string; errorMessage: string; pulseemRaw?: string }
> {
  const amount = Math.floor(opts.amount);
  if (amount < 1 || amount > 10_000) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: "יש להחזיר בין 1 ל-10,000 הודעות",
    };
  }

  const { data: row, error: fetchErr } = await opts.admin
    .from("business_profile")
    .select("id, pulseem_api_key, pulseem_has_api_key")
    .eq("id", opts.businessId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false, businessId: opts.businessId, errorMessage: "לא נמצא עסק" };
  }
  if (!row.pulseem_has_api_key) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: "לעסק אין מפתח API Pulseem (Direct)",
    };
  }

  let targetApiKey: string;
  try {
    targetApiKey = await decryptPulseemField(
      String(row.pulseem_api_key ?? "").trim(),
      opts.encKey,
    );
  } catch (e) {
    console.error("[pulseem-credit-transfer] decrypt:", e);
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: "פענוח מפתח Pulseem מהמסד נכשל",
    };
  }
  targetApiKey = targetApiKey.trim();
  if (!targetApiKey) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: "מפתח API Direct ריק אחרי פענוח",
    };
  }

  const subBefore = await getDirectSmsBalanceWithDirectKey(targetApiKey);
  if (!subBefore.ok) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: `קריאת יתרת הלקוח נכשלה: ${subBefore.errorMessage}`,
    };
  }
  if (subBefore.credits < amount) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: `אין מספיק יתרה. לעסק יש ${Math.floor(subBefore.credits)} הודעות.`,
    };
  }

  const mainBefore = await getDirectSmsBalanceWithDirectKey(opts.mainKey);
  if (!mainBefore.ok) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: `קריאת יתרת החשבון הראשי נכשלה: ${mainBefore.errorMessage}`,
    };
  }

  const zero = { emailCredits: 0, directEmailCredits: 0, directSmsCredits: 0 };
  const api = await pulseemCreditTransferRequest({
    mainKey: opts.mainKey,
    targetApiKey,
    amounts: { ...zero, smsCredits: -amount },
  });
  if (!api.ok) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: api.errorMessage,
      pulseemRaw: api.pulseemRaw,
    };
  }

  let subAfter: number | null = null;
  let mainAfter: number | null = null;
  for (const waitMs of [700, 1400, 2200, 3000]) {
    await sleep(waitMs);
    const [subNow, mainNow] = await Promise.all([
      getDirectSmsBalanceWithDirectKey(targetApiKey),
      getDirectSmsBalanceWithDirectKey(opts.mainKey),
    ]);
    if (subNow.ok) subAfter = subNow.credits;
    if (mainNow.ok) mainAfter = mainNow.credits;
    if (
      subAfter != null &&
      mainAfter != null &&
      subBefore.credits - subAfter >= amount &&
      mainAfter - mainBefore.credits >= amount
    ) {
      const prepaid = await decrementPrepaidSmsCredits(opts.admin, opts.businessId, amount);
      return {
        ok: true,
        businessId: opts.businessId,
        reclaimed: amount,
        ...creditTransferSummary(api.json),
        smsCreditsAfter: subAfter,
        mainSmsCreditsAfter: mainAfter,
        prepaidSmsCreditsAfter: prepaid ?? undefined,
      };
    }
  }

  const subDropped = subAfter != null && subBefore.credits - subAfter >= amount;
  const mainRose = mainAfter != null && mainAfter - mainBefore.credits >= amount;
  if (subDropped && !mainRose) {
    const rollback = await pulseemCreditTransferRequest({
      mainKey: opts.mainKey,
      targetApiKey,
      amounts: { ...zero, smsCredits: amount },
    });
    if (!rollback.ok) {
      return {
        ok: false,
        businessId: opts.businessId,
        errorMessage:
          `פולסים הוריד ${amount} הודעות מהלקוח בלי לזכות את החשבון הראשי, ` +
          `והביטול נכשל: ${rollback.errorMessage}. יש לבדוק את היתרות ידנית.`,
        pulseemRaw: rollback.pulseemRaw,
      };
    }
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage:
        "פולסים הוריד מהלקוח בלי לזכות את החשבון הראשי, ולכן ההחזרה בוטלה וההודעות הוחזרו ללקוח.",
    };
  }

  if (!subDropped) {
    return {
      ok: false,
      businessId: opts.businessId,
      errorMessage: "פולסים לא שינה את יתרת הלקוח. לא הועברו הודעות.",
    };
  }

  return {
    ok: false,
    businessId: opts.businessId,
    errorMessage:
      "לא הצלחנו לאשר שהחשבון הראשי זוכה במלוא הכמות. בדקו את היתרות לפני ניסיון נוסף.",
  };
}

function parseMonthlyTargetCredits(body: Record<string, unknown>): number {
  if (body.directSmsCredits != null) {
    const fromBody = clampInt(body.directSmsCredits, 0, 1_000_000);
    if (fromBody > 0) return fromBody;
  }
  const envTarget = Number.parseInt(
    String(Deno.env.get("PULSEEM_MONTHLY_TARGET_DIRECT_SMS") ?? "").trim(),
    10,
  );
  if (Number.isFinite(envTarget) && envTarget > 0) return envTarget;
  return 1000;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }
  if (!(await authorizeServiceRole(req))) {
    return json({ error: "unauthorized" }, 401);
  }

  const encKey = (Deno.env.get("PULSEEM_FIELD_ENCRYPTION_KEY") ?? "").trim();
  if (!encKey) {
    return json({
      ok: false,
      errorMessage: "חסר PULSEEM_FIELD_ENCRYPTION_KEY ב-Supabase Secrets",
    });
  }

  const mainKey = (Deno.env.get("PULSEEM_MAIN_API_KEY") ?? "").trim();
  if (!mainKey) {
    return json({
      ok: false,
      errorMessage: "חסר PULSEEM_MAIN_API_KEY ב-Supabase Secrets",
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceRole);

  const monthlyTopupAll = body.monthlyTopupAll === true;
  if (monthlyTopupAll) {
    const target = parseMonthlyTargetCredits(body);
    if (target <= 0) {
      return json({
        ok: false,
        errorMessage: "יעד היתרה החודשית חייב להיות חיובי",
      });
    }

    const { data: rows, error: listErr } = await admin
      .from("business_profile")
      .select("id")
      .eq("pulseem_has_api_key", true);

    if (listErr) {
      console.error("[pulseem-credit-transfer] list businesses", listErr);
      return json({ ok: false, errorMessage: "שגיאת מסד ברשימת עסקים" }, 500);
    }

    const ids = (rows ?? []).map((r) => String(r.id)).filter(Boolean);
    const results: Array<Record<string, unknown>> = [];
    let okCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const businessId of ids) {
      const r = await refillBusinessToTarget({
        businessId,
        target,
        encKey,
        mainKey,
        admin,
      });
      results.push(r);
      if (r.ok) {
        okCount++;
        if (r.skipped) skippedCount++;
      } else {
        failCount++;
      }
    }

    return json({
      ok: true,
      monthlyTopupAll: true,
      refillToTarget: true,
      targetDirectSmsCredits: target,
      totalBusinesses: ids.length,
      succeeded: okCount,
      skippedAlreadyAtTarget: skippedCount,
      failed: failCount,
      results,
    });
  }

  const businessId = String(body.businessId ?? "").trim();
  if (!businessId) {
    return json({ ok: false, errorMessage: "חסר מזהה עסק" });
  }

  const emailCredits = clampInt(body.emailCredits, 0, 1_000_000);
  const parsedSms = parseSignedSmsCredits(body.smsCredits);
  if (!parsedSms.ok) return json({ ok: false, errorMessage: parsedSms.errorMessage });
  const smsCredits = parsedSms.value;
  const directEmailCredits = clampInt(body.directEmailCredits, 0, 1_000_000);
  const directSmsCredits = clampInt(body.directSmsCredits, 0, 1_000_000);

  if (smsCredits < 0) {
    return json({
      ok: false,
      errorMessage:
        "פולסים לא מחזיר קרדיטים לחשבון הראשי דרך ה-API. מספר שלילי מוריד מהלקוח בלי לזכות את החשבון הראשי. ההחזרה אפשרית רק ידנית בממשק של פולסים.",
    });
  }

  if (
    emailCredits + smsCredits + directEmailCredits + directSmsCredits <= 0
  ) {
    return json({
      ok: false,
      errorMessage: "יש לציין לפחות סוג קרדיט אחד עם כמות חיובית",
    });
  }

  const amounts: CreditAmounts = {
    emailCredits,
    smsCredits,
    directEmailCredits,
    directSmsCredits,
  };

  const asPrepaid =
    body.asPrepaid === false ? false : smsCredits > 0;

  const r = await transferForBusiness({
    businessId,
    amounts,
    asPrepaid,
    encKey,
    mainKey,
    admin,
  });

  if (!r.ok) {
    return json({
      ok: false,
      errorMessage: r.errorMessage,
      pulseemRaw: r.pulseemRaw,
    });
  }

  const { ok: _ok, businessId: _bid, ...rest } = r;
  return json({ ok: true, ...rest });
});
