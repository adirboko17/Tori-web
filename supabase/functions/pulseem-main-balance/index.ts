// @ts-nocheck
/**
 * Super-admin only, read-only: balance of the company MAIN Pulseem account
 * (`AccountsApi/GetCreditBalance` with the `PULSEEM_MAIN_API_KEY` secret) — the pool
 * `pulseem-credit-transfer` draws from when loading sub-accounts.
 *
 * Auth: service_role (same as pulseem-credit-transfer). verify_jwt must stay false.
 *
 * POST {} → { ok: true, smsCredits, directSmsCredits, emailCredits, directEmailCredits, pools }
 * `pools` lists every numeric credit field Pulseem returned, keyed by its Pulseem name.
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { jwtVerify } from "https://deno.land/x/jose@v5.2.3/index.ts";

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

async function authorizeServiceRole(req: Request): Promise<boolean> {
  const auth = (req.headers.get("Authorization") ?? "")
    .replace(/^Bearer\s+/i, "")
    .trim();
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

function asFiniteNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v.replace(/,/g, "").trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function creditsOf(v: unknown): number | null {
  const flat = asFiniteNumber(v);
  if (flat !== null) return flat;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return asFiniteNumber(o.credits ?? o.Credits);
  }
  return null;
}

function pick(pools: Record<string, number>, keys: string[]): number | null {
  for (const key of keys) {
    if (key in pools) return pools[key];
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!(await authorizeServiceRole(req))) return json({ error: "unauthorized" }, 401);

  const mainKey = (Deno.env.get("PULSEEM_MAIN_API_KEY") ?? "").trim();
  if (!mainKey) {
    return json({ ok: false, errorMessage: "חסר PULSEEM_MAIN_API_KEY ב-Supabase Secrets" });
  }

  let lastError = "";
  for (const body of [{}, { isSMSIncludeVoice: false }]) {
    let res: Response;
    try {
      res = await fetch(`${PULSEEM_REST_BASE}/AccountsApi/GetCreditBalance`, {
        method: "POST",
        headers: {
          APIKEY: mainKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      lastError = (e as Error)?.message ?? "קריאה ל-Pulseem נכשלה";
      continue;
    }

    const text = await res.text();
    if (!res.ok) {
      lastError = `Pulseem HTTP ${res.status}`;
      continue;
    }
    let j: Record<string, unknown> = {};
    try {
      j = JSON.parse(text) as Record<string, unknown>;
    } catch {
      lastError = "תשובה לא תקינה מ-Pulseem";
      continue;
    }
    const status = j.status ?? j.Status;
    if (status && String(status).toLowerCase() !== "success") {
      const err = j.errorMessage ?? j.ErrorMessage ?? j.error ?? j.Error ?? status;
      lastError = `Pulseem: ${String(err).slice(0, 200)}`;
      continue;
    }

    const result = (j.creditBalanceModelResult ??
      j.CreditBalanceModelResult ??
      j.result ??
      j) as Record<string, unknown>;
    const pools: Record<string, number> = {};
    if (result && typeof result === "object") {
      for (const [key, value] of Object.entries(result)) {
        const n = creditsOf(value);
        if (n !== null) pools[key] = n;
      }
    }

    const smsCredits = pick(pools, ["sms", "Sms", "SMS", "smsCredits", "SmsCredits", "SMSCredits", "smsBalance", "SmsBalance"]);
    if (smsCredits === null && Object.keys(pools).length === 0) {
      lastError = "לא נמצאה יתרה בתשובת Pulseem";
      continue;
    }

    return json({
      ok: true,
      smsCredits,
      directSmsCredits: pick(pools, ["directSms", "DirectSms", "directSmsCredits", "DirectSmsCredits"]),
      emailCredits: pick(pools, ["email", "Email", "emailCredits", "EmailCredits"]),
      directEmailCredits: pick(pools, ["directEmail", "DirectEmail", "directEmailCredits", "DirectEmailCredits"]),
      pools,
    });
  }

  return json({ ok: false, errorMessage: lastError || "קריאת היתרה מ-Pulseem נכשלה" });
});
