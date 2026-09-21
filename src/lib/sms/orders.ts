import { transferPrepaidCredits } from "./balance";
import { fulfillmentAfterMissedLock } from "./fulfillment";
import { notifySmsPurchase } from "./purchase-notify";
import { isSuccessfulPayplusStatus } from "./payplus-crypto";
import type { SmsPackage } from "./packages";
import {
  isConfirmedPayplusPayment,
  lookupPayplusPayment,
} from "./payplus";
import type { SmsSession } from "./session";
import { getServiceSupabase } from "./supabase-admin";

export type SmsTopupOrder = {
  id: string;
  business_id: string;
  admin_user_id: string;
  package_id: string;
  sms_credits: number;
  amount_ils: number;
  status: string;
  payplus_page_request_uid: string | null;
  payplus_transaction_uid: string | null;
  payplus_payment_link: string | null;
  error_message: string | null;
};

export async function createPendingOrder(
  session: SmsSession,
  pack: SmsPackage,
) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("sms_topup_orders")
    .insert({
      business_id: session.businessId,
      admin_user_id: session.userId,
      package_id: pack.id,
      sms_credits: pack.smsCredits,
      amount_ils: pack.amountIls,
      status: "pending",
    })
    .select("id")
    .single();
  if (error || !data?.id) {
    throw new Error("לא הצלחנו ליצור הזמנה. נסו שוב.");
  }
  return String(data.id);
}

export async function attachPayplusLink(
  orderId: string,
  link: string,
  pageRequestUid: string,
) {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from("sms_topup_orders")
    .update({
      payplus_payment_link: link,
      payplus_page_request_uid: pageRequestUid || null,
    })
    .eq("id", orderId);
  if (error) {
    throw new Error("שמירת קישור התשלום נכשלה.");
  }
}

export async function markOrderFailed(orderId: string, message: string) {
  const supabase = getServiceSupabase();
  await supabase
    .from("sms_topup_orders")
    .update({ status: "failed", error_message: message })
    .eq("id", orderId)
    .in("status", ["pending", "processing"]);
}

export async function loadOrder(orderId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("sms_topup_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw new Error("טעינת ההזמנה נכשלה.");
  return (data as SmsTopupOrder | null) ?? null;
}

async function claimOrder(
  orderId: string,
  transactionUid: string,
  fromStatus: "pending" | "failed",
) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("sms_topup_orders")
    .update({
      status: "processing",
      payplus_transaction_uid: transactionUid,
      paid_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", orderId)
    .eq("status", fromStatus)
    .select("id, business_id, sms_credits, amount_ils, status")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Pick<
    SmsTopupOrder,
    "id" | "business_id" | "sms_credits" | "amount_ils" | "status"
  > | null;
}

export async function fulfillPaidOrder(input: {
  orderId: string;
  transactionUid: string;
  payplusStatusCode: string;
}) {
  const claimed = await claimOrder(input.orderId, input.transactionUid, "pending");
  let order = claimed;
  if (!order) {
    const existing = await loadOrder(input.orderId);
    const decision = fulfillmentAfterMissedLock(existing?.status ?? null);
    if (decision === "idempotent") {
      return { ok: true as const, idempotent: true };
    }
    if (decision === "retry" && existing) {
      order = await claimOrder(input.orderId, input.transactionUid, "failed");
    }
    if (!order) {
      return { ok: false as const, message: "ההזמנה אינה ממתינה לתשלום." };
    }
  }

  const transfer = await transferPrepaidCredits(
    order.business_id,
    Number(order.sms_credits),
  );
  const supabase = getServiceSupabase();
  if (!transfer.ok) {
    await supabase
      .from("sms_topup_orders")
      .update({
        status: "failed",
        error_message: transfer.message,
      })
      .eq("id", order.id);
    return { ok: false as const, message: transfer.message };
  }

  await supabase
    .from("sms_topup_orders")
    .update({
      status: "fulfilled",
      fulfilled_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", order.id);

  const saved = await loadOrder(order.id);
  if (saved && isSuccessfulPayplusStatus(input.payplusStatusCode)) {
    await notifySmsPurchase({
      businessId: saved.business_id,
      adminUserId: saved.admin_user_id,
      credits: Number(saved.sms_credits),
      payplusStatusCode: input.payplusStatusCode,
    });
  }

  return { ok: true as const, idempotent: false };
}

export async function loadPendingOrders(businessId?: string) {
  const supabase = getServiceSupabase();
  let query = supabase
    .from("sms_topup_orders")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);
  if (businessId) query = query.eq("business_id", businessId);
  const { data, error } = await query;
  if (error) throw new Error("טעינת ההזמנות נכשלה.");
  return (data ?? []) as SmsTopupOrder[];
}

export async function reconcilePendingOrders(businessId?: string) {
  const pending = await loadPendingOrders(businessId);
  let fulfilled = 0;
  for (const order of pending) {
    try {
      const payment = await lookupPayplusPayment({
        paymentRequestUid: order.payplus_page_request_uid || undefined,
        moreInfo: order.id,
      });
      if (
        !payment ||
        !isConfirmedPayplusPayment(payment, Number(order.amount_ils))
      ) {
        continue;
      }
      const result = await fulfillPaidOrder({
        orderId: order.id,
        transactionUid: payment.uid || order.payplus_page_request_uid || order.id,
        payplusStatusCode: payment.statusCode,
      });
      if (result.ok && !result.idempotent) fulfilled += 1;
    } catch (error) {
      console.error("reconcile order failed", order.id, error);
    }
  }
  return { checked: pending.length, fulfilled };
}
