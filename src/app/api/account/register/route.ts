import { openCustomerUser } from "@/lib/account/open-user";
import { clearSignupPhone, readSignupPhone } from "@/lib/account/phone-ticket";
import { startSubscriptionCheckout } from "@/lib/account/start-checkout";
import {
  CONFIG_ERRORS,
  payplusSubscriptionConfigured,
  sessionSigningConfigured,
} from "@/lib/sms/env";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";

function text(value: unknown, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(request: Request) {
  if (!sessionSigningConfigured()) {
    return jsonError(CONFIG_ERRORS.session, 503);
  }
  if (!payplusSubscriptionConfigured()) {
    return jsonError(CONFIG_ERRORS.subscription, 503);
  }

  const phone = await readSignupPhone();
  if (!phone) return jsonError("צריך לאמת את מספר הטלפון מחדש.", 401);

  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  if (body.agreed !== true) return jsonError("צריך לאשר את הסכם השירות.");

  const fullName = text(body.fullName);
  const businessName = text(body.businessName);
  if (fullName.length < 2 || businessName.length < 2) {
    return jsonError("צריך למלא שם מלא ושם העסק.");
  }

  try {
    const opened = await openCustomerUser({ phone, fullName, businessName });
    if (!opened.ok) return jsonError(opened.error, 400);

    const checkout = await startSubscriptionCheckout(request, {
      businessId: opened.checkoutId,
      customerName: fullName,
      phone,
    });
    if (!checkout.ok) return jsonError(checkout.error, checkout.status);

    await clearSignupPhone();
    return jsonOk({ url: checkout.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "פתיחת המשתמש נכשלה.";
    return jsonError(message, 500);
  }
}
