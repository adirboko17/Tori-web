import { phoneSchema } from "@/lib/booking";
import {
  CONFIG_ERRORS,
  payplusSubscriptionConfigured,
} from "@/lib/sms/env";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";
import { generatePayplusSubscriptionLink } from "@/lib/sms/payplus";
import { markSubscriptionCheckoutStarted } from "@/lib/subscription-orders";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function trimField(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(request: Request) {
  if (!payplusSubscriptionConfigured()) {
    return jsonError(CONFIG_ERRORS.subscription, 503);
  }

  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");

  const businessId = trimField(body.businessId);
  if (!UUID_RE.test(businessId)) {
    return jsonError("חסר מזהה עסק לתשלום.");
  }

  const customerName = trimField(body.customerName);
  if (customerName.length < 2) {
    return jsonError("צריך להזין שם מלא.");
  }

  const phoneParsed = phoneSchema.safeParse(trimField(body.phone));
  if (!phoneParsed.success) {
    return jsonError("צריך להזין מספר נייד ישראלי תקין.");
  }

  const email = trimField(body.email).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return jsonError("צריך להזין אימייל תקין.");
  }

  const vatNumber = trimField(body.vatNumber).replace(/\D/g, "").slice(0, 9);

  try {
    try {
      await markSubscriptionCheckoutStarted(businessId);
    } catch (error) {
      console.error("subscription status update skipped", error);
    }

    const link = await generatePayplusSubscriptionLink({
      businessId,
      customer: {
        customer_name: customerName,
        phone: phoneParsed.data,
        email,
        vat_number: vatNumber || undefined,
      },
      request,
    });

    if (!link.ok) {
      return jsonError(link.message, 502);
    }

    return jsonOk({ ok: true, url: link.link });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "יצירת התשלום נכשלה.";
    return jsonError(message, 500);
  }
}
