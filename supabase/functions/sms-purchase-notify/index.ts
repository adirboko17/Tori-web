// @ts-nocheck
/**
 * SMS to the platform owners after a /sms credit purchase.
 * Recipients are fixed. Auth is the service-role JWT (verify_jwt).
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const PULSEEM_REST_SEND = "https://api.pulseem.com/api/v1/SmsApi/SendSms";
const RECIPIENTS = ["0502307500", "0527488779"];

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function normalizeSmsDestination(raw: string): string {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0") && digits.length >= 9 && digits.length <= 11) {
    return `972${digits.slice(1)}`;
  }
  if (digits.length === 9 && /^5\d{8}$/.test(digits)) return `972${digits}`;
  return digits;
}

serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const text = String(body.text ?? "").trim();
  if (!text || text.length > 300) {
    return json({ error: "invalid_text" }, 400);
  }

  const mainKey = (Deno.env.get("PULSEEM_MAIN_API_KEY") ?? "").trim();
  if (!mainKey) return json({ error: "missing_pulseem_key" }, 503);

  const fromNumber = (
    (Deno.env.get("ONBOARDING_WEBHOOK_FROM_NUMBER") ?? "").trim() ||
    (Deno.env.get("PULSEEM_REST_FROM_NUMBER") ?? "").trim() ||
    (Deno.env.get("PULSEEM_FROM_NUMBER") ?? "").trim() ||
    "0508085737"
  );
  const toNums = RECIPIENTS.map(normalizeSmsDestination);
  const sendId = crypto.randomUUID().replace(/-/g, "").slice(0, 20);

  const response = await fetch(PULSEEM_REST_SEND, {
    method: "POST",
    headers: {
      APIKEY: mainKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sendId,
      isAsync: true,
      smsSendData: {
        fromNumber,
        toNumberList: toNums,
        referenceList: toNums.map(() =>
          crypto.randomUUID().replace(/-/g, "").slice(0, 20),
        ),
        textList: toNums.map(() => text),
        isAutomaticUnsubscribeLink: false,
      },
    }),
  });

  const responseText = await response.text();
  let failed = !response.ok;
  if (!failed && responseText.trim().startsWith("{")) {
    try {
      const payload = JSON.parse(responseText) as Record<string, unknown>;
      const status = String(payload.status ?? payload.Status ?? "").toLowerCase();
      failed =
        status === "error" ||
        status === "failed" ||
        status === "failure" ||
        payload.success === false ||
        payload.Success === false;
    } catch {
      failed = true;
    }
  }
  if (failed) {
    console.error("[sms-purchase-notify] pulseem", response.status, responseText.slice(0, 240));
    return json({ error: "sms_failed" }, 502);
  }

  return json({ ok: true, destinations: toNums.length });
});
