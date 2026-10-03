import { openBusinessAfterPayment } from "@/lib/account/open-user";
import { markAccountPaid } from "@/lib/account/store";
import { loadMonthlyPriceIls } from "@/lib/admin/catalog";
import { savePayplusSubscription } from "@/lib/admin/payplus-subscriptions";
import { priceSummary } from "@/lib/booking";
import { amountsMatch } from "@/lib/sms/payplus";
import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import {
  SUBSCRIPTION_PLAN,
  subscriptionChargeIls,
} from "@/lib/subscription";

export type SubscriptionBusiness = {
  id: string;
  manager_name: string | null;
  phone: string | null;
  email: string | null;
  plan: string | null;
  price: string | null;
  commitment: string | null;
};

export async function loadBusinessForSubscription(businessId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("businesses")
    .select("id, manager_name, phone, email, plan, price, commitment")
    .eq("id", businessId)
    .maybeSingle();
  if (error) throw new Error("טעינת העסק נכשלה.");
  return (data as SubscriptionBusiness | null) ?? null;
}

export async function markSubscriptionCheckoutStarted(businessId: string) {
  try {
    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from("businesses")
      .update({
        plan: SUBSCRIPTION_PLAN,
        price: String(priceSummary(await loadMonthlyPriceIls()).total),
        commitment: "pending-payment",
      })
      .eq("id", businessId)
      .neq("commitment", "paid");
    if (error) {
      console.error("subscription status update failed", error.message);
    }
  } catch (error) {
    console.error("subscription status update skipped", error);
  }
}

export async function fulfillPaidSubscription(input: {
  businessId: string;
  amount: number;
  recurringUid?: string | null;
  terminalUid?: string | null;
  customerUid?: string | null;
  transactionUid?: string | null;
}) {
  if (!amountsMatch(input.amount, subscriptionChargeIls(await loadMonthlyPriceIls()))) {
    return { ok: false as const, message: "סכום התשלום אינו תואם למנוי." };
  }
  // The business is opened here, only after the payment was confirmed.
  let businessId = input.businessId;
  try {
    const opened = await openBusinessAfterPayment(input.businessId);
    if (!opened.ok) {
      return { ok: false as const, message: opened.error };
    }
    businessId = opened.businessId;
  } catch (error) {
    console.error("business opening after payment failed", error);
    return { ok: false as const, message: "פתיחת העסק אחרי התשלום נכשלה." };
  }
  await markAccountPaid(businessId);
  if (input.recurringUid) {
    try {
      await savePayplusSubscription({
        businessId,
        recurringUid: input.recurringUid,
        terminalUid: input.terminalUid,
        customerUid: input.customerUid,
        transactionUid: input.transactionUid,
      });
    } catch (error) {
      console.error("payplus recurring save failed", error);
    }
  }
  try {
    const business = await loadBusinessForSubscription(businessId);
    if (!business) {
      return { ok: true as const, idempotent: false };
    }
    if (business.commitment === "paid") {
      return { ok: true as const, idempotent: true };
    }
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("businesses")
      .update({
        plan: SUBSCRIPTION_PLAN,
        price: String(subscriptionChargeIls(await loadMonthlyPriceIls())),
        commitment: "paid",
      })
      .eq("id", businessId)
      .neq("commitment", "paid")
      .select("id")
      .maybeSingle();
    if (error) {
      console.error("subscription status update failed", error.message);
      return { ok: true as const, idempotent: false };
    }
    return { ok: true as const, idempotent: !data };
  } catch (error) {
    console.error("subscription status update skipped", error);
    return { ok: true as const, idempotent: false };
  }
}
