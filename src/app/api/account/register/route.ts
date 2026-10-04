import { openCustomerUser } from "@/lib/account/open-user";
import { clearSignupPhone, readSignupPhone } from "@/lib/account/phone-ticket";
import { resumePaidSignup } from "@/lib/account/resume-paid";
import { writeAccountSession } from "@/lib/account/session";
import type { CustomerAccount } from "@/lib/account/store";
import { startSubscriptionCheckout } from "@/lib/account/start-checkout";
import {
  ENGLISH_DISPLAY_NAME_ERROR,
  isEnglishDisplayName,
} from "@/lib/display-name";
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

async function enterPaidAccount(account: CustomerAccount) {
  if (!account.userId || !account.businessId) return false;
  await writeAccountSession({
    accountId: account.id,
    userId: account.userId,
    businessId: account.businessId,
    phone: account.phone,
    name: account.fullName,
    businessName: account.businessName,
  });
  await clearSignupPhone();
  return true;
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
  if (fullName.length < 2) return jsonError("צריך למלא שם מלא.");
  if (!isEnglishDisplayName(businessName)) return jsonError(ENGLISH_DISPLAY_NAME_ERROR);

  try {
    const opened = await openCustomerUser({ phone, fullName, businessName });
    const resumed = await resumePaidSignup({
      phone,
      checkoutId: opened.ok ? opened.checkoutId : undefined,
      returning: opened.ok ? opened.returning : true,
    });
    if (resumed.status === "ready") {
      if (await enterPaidAccount(resumed.account)) return jsonOk({ next: "account" });
      return jsonError("התשלום נקלט, אבל פתיחת האזור האישי נכשלה. נסו שוב.", 502);
    }
    if (resumed.status === "failed") return jsonError(resumed.error, 502);
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
