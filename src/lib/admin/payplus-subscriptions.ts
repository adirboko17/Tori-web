import { deletePayplusRecurring, listPayplusRecurrings } from "@/lib/sms/payplus";
import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import {
  isCancellationId,
  isOpenCancellationStatus,
} from "./cancellation-parse";
import {
  isMissingCancellationTable,
  loadOpenCancellationsByBusiness,
  updateCancellationRequest,
} from "./cancellations";

export type PayplusSubscriptionStatus = "active" | "cancelled";

export type PayplusSubscription = {
  id: string;
  businessId: string;
  recurringUid: string;
  terminalUid: string | null;
  customerUid: string | null;
  transactionUid: string | null;
  status: PayplusSubscriptionStatus;
  cancelledAt: string | null;
  cancelledByPhone: string | null;
  amountIls: number | null;
  nextChargeAt: string | null;
  lastChargeAt: string | null;
  updatedAt: string;
};

const PACKAGE_PREFIX = "payplus_sub_";
const PACKAGE_COLUMNS = "id, package_key, label, is_active, updated_at";

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function isMissingTable(
  error: { code?: string; message?: string } | null | undefined,
) {
  return isMissingCancellationTable(error);
}

function toSubscription(record: Record<string, unknown>): PayplusSubscription {
  const status =
    String(record.status ?? "") === "cancelled" ? "cancelled" : "active";
  return {
    id: String(record.id ?? ""),
    businessId: String(record.business_id ?? ""),
    recurringUid: String(record.recurring_uid ?? ""),
    terminalUid: record.terminal_uid ? String(record.terminal_uid) : null,
    customerUid: record.customer_uid ? String(record.customer_uid) : null,
    transactionUid: record.transaction_uid
      ? String(record.transaction_uid)
      : null,
    status,
    cancelledAt: record.cancelled_at ? String(record.cancelled_at) : null,
    cancelledByPhone: record.cancelled_by_phone
      ? String(record.cancelled_by_phone)
      : null,
    amountIls:
      record.amount_ils == null || record.amount_ils === ""
        ? null
        : Number(record.amount_ils) || null,
    nextChargeAt: record.next_charge_at ? String(record.next_charge_at) : null,
    lastChargeAt: record.last_charge_at ? String(record.last_charge_at) : null,
    updatedAt: String(record.updated_at ?? record.created_at ?? ""),
  };
}

function fromPackageRow(row: Record<string, unknown>): PayplusSubscription | null {
  try {
    const payload = asRecord(JSON.parse(String(row.label ?? "")));
    const businessId = String(payload.businessId ?? payload.business_id ?? "");
    const recurringUid = String(payload.recurringUid ?? payload.recurring_uid ?? "");
    if (!businessId || !recurringUid) return null;
    return toSubscription({
      id: String(row.id ?? ""),
      business_id: businessId,
      recurring_uid: recurringUid,
      terminal_uid: payload.terminalUid ?? payload.terminal_uid,
      customer_uid: payload.customerUid ?? payload.customer_uid,
      transaction_uid: payload.transactionUid ?? payload.transaction_uid,
      status: payload.status,
      cancelled_at: payload.cancelledAt ?? payload.cancelled_at,
      cancelled_by_phone: payload.cancelledByPhone ?? payload.cancelled_by_phone,
      amount_ils: payload.amountIls ?? payload.amount_ils,
      next_charge_at: payload.nextChargeAt ?? payload.next_charge_at,
      last_charge_at: payload.lastChargeAt ?? payload.last_charge_at,
      updated_at: row.updated_at,
    });
  } catch {
    return null;
  }
}

async function listPackageSubscriptions() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_sms_packages")
    .select(PACKAGE_COLUMNS)
    .like("package_key", `${PACKAGE_PREFIX}%`);
  if (error) throw new Error("טעינת הוראות הקבע נכשלה.");
  return (data ?? [])
    .map((row) => fromPackageRow(asRecord(row)))
    .filter((row): row is PayplusSubscription => Boolean(row));
}

async function upsertPackageSubscription(input: PayplusSubscription) {
  const supabase = getServiceSupabase();
  const packageKey = `${PACKAGE_PREFIX}${input.businessId}`;
  const { data: existing } = await supabase
    .from("site_sms_packages")
    .select("id")
    .eq("package_key", packageKey)
    .maybeSingle();
  const patch = {
    package_key: packageKey,
    label: JSON.stringify({
      businessId: input.businessId,
      recurringUid: input.recurringUid,
      terminalUid: input.terminalUid,
      customerUid: input.customerUid,
      transactionUid: input.transactionUid,
      status: input.status,
      cancelledAt: input.cancelledAt,
      cancelledByPhone: input.cancelledByPhone,
      amountIls: input.amountIls,
      nextChargeAt: input.nextChargeAt,
      lastChargeAt: input.lastChargeAt,
    }),
    sms_credits: 1,
    amount_ils: 1,
    featured: false,
    sort_order: 999998,
    is_active: input.status === "active",
    updated_at: new Date().toISOString(),
  };
  const query = existing
    ? supabase.from("site_sms_packages").update(patch).eq("id", existing.id)
    : supabase.from("site_sms_packages").insert(patch);
  const { data, error } = await query.select(PACKAGE_COLUMNS).single();
  if (error || !data) {
    console.error("payplus subscription package upsert failed", error);
    throw new Error("שמירת הוראת הקבע נכשלה.");
  }
  const mapped = fromPackageRow(asRecord(data));
  if (!mapped) throw new Error("שמירת הוראת הקבע נכשלה.");
  return mapped;
}

export async function loadPayplusSubscription(businessId: string) {
  const map = await loadPayplusSubscriptionsByBusiness([businessId]);
  return map.get(businessId) ?? null;
}

export async function loadPayplusSubscriptionsByBusiness(businessIds: string[]) {
  const found = new Map<string, PayplusSubscription>();
  if (businessIds.length === 0) return found;
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_payplus_subscriptions")
    .select(
      "id, business_id, recurring_uid, terminal_uid, customer_uid, transaction_uid, status, cancelled_at, cancelled_by_phone, updated_at, created_at",
    )
    .in("business_id", businessIds);
  if (error) {
    if (!isMissingTable(error)) throw new Error("טעינת הוראות הקבע נכשלה.");
    for (const row of await listPackageSubscriptions()) {
      if (businessIds.includes(row.businessId)) found.set(row.businessId, row);
    }
    return found;
  }
  for (const row of data ?? []) {
    const item = toSubscription(asRecord(row));
    if (item.businessId) found.set(item.businessId, item);
  }
  return found;
}

export async function enrichPayplusSubscriptionsWithLive(
  found: Map<string, PayplusSubscription>,
) {
  if (found.size === 0) return found;
  try {
    const live = await listPayplusRecurrings("");
    if (!live.ok) return found;
    const byUid = new Map(live.recurrings.map((row) => [row.uid, row]));
    for (const [businessId, sub] of found) {
      const row = byUid.get(sub.recurringUid);
      if (!row) continue;
      found.set(businessId, {
        ...sub,
        amountIls: row.amount || sub.amountIls,
        nextChargeAt: row.nextChargeAt || sub.nextChargeAt,
        lastChargeAt: row.lastChargeDate || sub.lastChargeAt,
      });
    }
  } catch (error) {
    console.error("payplus live recurring enrich failed", error);
  }
  return found;
}

export async function savePayplusSubscription(input: {
  businessId: string;
  recurringUid: string;
  terminalUid?: string | null;
  customerUid?: string | null;
  transactionUid?: string | null;
  amountIls?: number | null;
  nextChargeAt?: string | null;
  lastChargeAt?: string | null;
}) {
  if (!isCancellationId(input.businessId) || !input.recurringUid.trim()) {
    return null;
  }
  const current = await loadPayplusSubscription(input.businessId);
  const next: PayplusSubscription = {
    id: current?.id ?? "",
    businessId: input.businessId,
    recurringUid: input.recurringUid.trim(),
    terminalUid: input.terminalUid?.trim() || current?.terminalUid || null,
    customerUid: input.customerUid?.trim() || current?.customerUid || null,
    transactionUid:
      input.transactionUid?.trim() || current?.transactionUid || null,
    status: "active",
    cancelledAt: null,
    cancelledByPhone: null,
    amountIls: input.amountIls ?? current?.amountIls ?? null,
    nextChargeAt: input.nextChargeAt ?? current?.nextChargeAt ?? null,
    lastChargeAt: input.lastChargeAt ?? current?.lastChargeAt ?? null,
    updatedAt: new Date().toISOString(),
  };
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_payplus_subscriptions")
    .upsert(
      {
        business_id: next.businessId,
        recurring_uid: next.recurringUid,
        terminal_uid: next.terminalUid,
        customer_uid: next.customerUid,
        transaction_uid: next.transactionUid,
        status: "active",
        cancelled_at: null,
        cancelled_by_phone: null,
        updated_at: next.updatedAt,
      },
      { onConflict: "business_id" },
    )
    .select(
      "id, business_id, recurring_uid, terminal_uid, customer_uid, transaction_uid, status, cancelled_at, cancelled_by_phone, updated_at, created_at",
    )
    .maybeSingle();
  if (error) {
    if (!isMissingTable(error)) throw new Error("שמירת הוראת הקבע נכשלה.");
    return upsertPackageSubscription(next);
  }
  return data ? toSubscription(asRecord(data)) : next;
}

export async function cancelSavedPayplusSubscription(
  businessId: string,
  reviewedByPhone: string,
) {
  const current = await loadPayplusSubscription(businessId);
  if (!current?.recurringUid) {
    return {
      ok: false as const,
      error:
        "אין הוראת קבע שמורה ללקוח הזה. בטלו ידנית ב-PayPlus ואז סמנו את הבקשה כטופלה.",
    };
  }
  if (current.status === "cancelled") {
    return { ok: true as const, alreadyCancelled: true, subscription: current };
  }

  const deleted = await deletePayplusRecurring({
    recurringUid: current.recurringUid,
    terminalUid: current.terminalUid,
  });
  if (!deleted.ok) return deleted;

  const cancelledAt = new Date().toISOString();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_payplus_subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: cancelledAt,
      cancelled_by_phone: reviewedByPhone,
      updated_at: cancelledAt,
    })
    .eq("business_id", businessId)
    .select(
      "id, business_id, recurring_uid, terminal_uid, customer_uid, transaction_uid, status, cancelled_at, cancelled_by_phone, updated_at, created_at",
    )
    .maybeSingle();

  let subscription: PayplusSubscription;
  if (error && isMissingTable(error)) {
    subscription = await upsertPackageSubscription({
      ...current,
      status: "cancelled",
      cancelledAt,
      cancelledByPhone: reviewedByPhone,
      updatedAt: cancelledAt,
    });
  } else if (error) {
    throw new Error("עדכון הוראת הקבע נכשל.");
  } else {
    subscription = data
      ? toSubscription(asRecord(data))
      : {
          ...current,
          status: "cancelled",
          cancelledAt,
          cancelledByPhone: reviewedByPhone,
          updatedAt: cancelledAt,
        };
  }

  const open = (await loadOpenCancellationsByBusiness([businessId])).get(
    businessId,
  );
  if (open && isOpenCancellationStatus(open.status)) {
    await updateCancellationRequest(open.id, "done", reviewedByPhone);
  }

  return {
    ok: true as const,
    alreadyCancelled: Boolean(deleted.alreadyCancelled),
    subscription,
  };
}
