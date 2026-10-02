import { rememberCheckoutDetails } from "@/lib/account/store";
import {
  CONFIG_ERRORS,
  payplusSubscriptionConfigured,
} from "@/lib/sms/env";
import { generatePayplusSubscriptionLink } from "@/lib/sms/payplus";
import { markSubscriptionCheckoutStarted } from "@/lib/subscription-orders";

export async function startSubscriptionCheckout(
  request: Request,
  input: { businessId: string; customerName: string; phone: string },
) {
  if (!payplusSubscriptionConfigured()) {
    return { ok: false as const, error: CONFIG_ERRORS.subscription, status: 503 };
  }
  if (input.customerName.trim().length < 2) {
    return { ok: false as const, error: "צריך להזין שם מלא.", status: 400 };
  }

  try {
    await markSubscriptionCheckoutStarted(input.businessId);
  } catch (error) {
    console.error("subscription status update skipped", error);
  }
  try {
    await rememberCheckoutDetails({
      businessId: input.businessId,
      fullName: input.customerName.trim(),
      phone: input.phone,
      email: "",
      idNumber: "",
    });
  } catch (error) {
    console.error("checkout account update skipped", error);
  }

  const link = await generatePayplusSubscriptionLink({
    businessId: input.businessId,
    customer: {
      customer_name: input.customerName.trim(),
      phone: input.phone,
    },
    request,
  });
  if (!link.ok) {
    return { ok: false as const, error: link.message, status: 502 };
  }
  return { ok: true as const, url: link.link };
}
