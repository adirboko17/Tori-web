import { loadSmsBalance } from "@/lib/sms/balance";
import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import { loadSmsPackageRows } from "./catalog";
import {
  loadOpenCancellationsByBusiness,
  type OpenCancellation,
} from "./cancellations";
import {
  enrichPayplusSubscriptionsWithLive,
  loadPayplusSubscriptionsByBusiness,
  type PayplusSubscription,
} from "./payplus-subscriptions";
import { resolveSmsRemaining } from "./sms-remaining";

export type AdminCustomer = {
  id: string;
  name: string;
  phone: string;
  prepaidCredits: number;
  smsRemaining: number | null;
  createdAt: string;
  adminCount: number;
  purchaseCount: number;
  purchaseTotalIls: number;
  openCancellation: OpenCancellation | null;
  payplusSubscription: PayplusSubscription | null;
};

export type AdminPurchase = {
  id: string;
  businessId: string;
  businessName: string;
  packageId: string;
  packageLabel: string | null;
  smsCredits: number;
  amountIls: number;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  paidAt: string | null;
};

export type AdminCustomerDetail = AdminCustomer & {
  admins: { id: string; name: string; phone: string }[];
  purchases: AdminPurchase[];
};

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

async function loadLiveSmsTotals(businessIds: string[]) {
  const totals = new Map<string, number>();
  await Promise.all(
    businessIds.map(async (businessId) => {
      try {
        const balance = await loadSmsBalance(businessId);
        if (balance.ok) totals.set(businessId, balance.total);
      } catch {
        // A live balance failure should not hide the customer list.
      }
    }),
  );
  return totals;
}

export async function listCustomers(): Promise<AdminCustomer[]> {
  const supabase = getServiceSupabase();
  const [profiles, users, orders] = await Promise.all([
    supabase
      .from("business_profile")
      .select(
        "id, display_name, phone, pulseem_prepaid_sms_credits, pulseem_user_id, created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("users")
      .select("id, business_id, user_type, block")
      .eq("user_type", "admin"),
    supabase
      .from("sms_topup_orders")
      .select("business_id, amount_ils, status"),
  ]);

  if (profiles.error) throw new Error("טעינת הלקוחות נכשלה.");

  const adminCounts = new Map<string, number>();
  for (const row of users.data ?? []) {
    const record = asRecord(row);
    if (record.block === true) continue;
    const businessId = String(record.business_id ?? "");
    if (!businessId) continue;
    adminCounts.set(businessId, (adminCounts.get(businessId) ?? 0) + 1);
  }

  const purchaseCounts = new Map<string, { count: number; total: number }>();
  for (const row of orders.data ?? []) {
    const record = asRecord(row);
    const status = String(record.status ?? "");
    if (!["paid", "fulfilled", "processing"].includes(status)) continue;
    const businessId = String(record.business_id ?? "");
    if (!businessId) continue;
    const current = purchaseCounts.get(businessId) ?? { count: 0, total: 0 };
    current.count += 1;
    current.total += Number(record.amount_ils ?? 0);
    purchaseCounts.set(businessId, current);
  }

  const liveIds = (profiles.data ?? [])
    .map((row) => asRecord(row))
    .filter((record) => String(record.pulseem_user_id ?? "").trim())
    .map((record) => String(record.id ?? ""))
    .filter(Boolean);
  const liveTotals = await loadLiveSmsTotals(liveIds);
  const profileIds = (profiles.data ?? [])
    .map((row) => String(asRecord(row).id ?? ""))
    .filter(Boolean);
  const [cancellations, subscriptions] = await Promise.all([
    loadOpenCancellationsByBusiness(profileIds),
    loadPayplusSubscriptionsByBusiness(profileIds).then(
      enrichPayplusSubscriptionsWithLive,
    ),
  ]);

  return (profiles.data ?? []).map((row) => {
    const record = asRecord(row);
    const id = String(record.id ?? "");
    const purchases = purchaseCounts.get(id) ?? { count: 0, total: 0 };
    const prepaidCredits = Number(record.pulseem_prepaid_sms_credits ?? 0) || 0;
    return {
      id,
      name: String(record.display_name ?? "").trim() || "עסק",
      phone: String(record.phone ?? ""),
      prepaidCredits,
      smsRemaining: resolveSmsRemaining(liveTotals.get(id) ?? null, prepaidCredits),
      createdAt: String(record.created_at ?? ""),
      adminCount: adminCounts.get(id) ?? 0,
      purchaseCount: purchases.count,
      purchaseTotalIls: purchases.total,
      openCancellation: cancellations.get(id) ?? null,
      payplusSubscription: subscriptions.get(id) ?? null,
    };
  });
}

export async function loadCustomer(id: string): Promise<AdminCustomerDetail | null> {
  const supabase = getServiceSupabase();
  const [profile, admins, purchases, labels] = await Promise.all([
    supabase
      .from("business_profile")
      .select(
        "id, display_name, phone, pulseem_prepaid_sms_credits, pulseem_user_id, created_at",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("users")
      .select("id, name, phone, user_type, block")
      .eq("business_id", id)
      .eq("user_type", "admin"),
    supabase
      .from("sms_topup_orders")
      .select(ORDER_COLUMNS)
      .eq("business_id", id)
      .order("created_at", { ascending: false }),
    loadPackageLabels(),
  ]);

  if (profile.error) throw new Error("טעינת הלקוח נכשלה.");
  if (!profile.data) return null;

  const record = asRecord(profile.data);
  const name = String(record.display_name ?? "").trim() || "עסק";
  const prepaidCredits = Number(record.pulseem_prepaid_sms_credits ?? 0) || 0;
  const hasLive = Boolean(String(record.pulseem_user_id ?? "").trim());
  const [liveTotals, cancellations, subscriptions] = await Promise.all([
    hasLive ? loadLiveSmsTotals([id]) : Promise.resolve(new Map<string, number>()),
    loadOpenCancellationsByBusiness([id]),
    loadPayplusSubscriptionsByBusiness([id]).then(enrichPayplusSubscriptionsWithLive),
  ]);

  const orders = (purchases.data ?? []).map((row) =>
    toPurchase(asRecord(row), name, labels),
  );
  const paid = orders.filter((order) =>
    ["paid", "fulfilled", "processing"].includes(order.status),
  );
  const activeAdmins = (admins.data ?? [])
    .map((row) => asRecord(row))
    .filter((row) => row.block !== true);

  return {
    id,
    name,
    phone: String(record.phone ?? ""),
    prepaidCredits,
    smsRemaining: resolveSmsRemaining(liveTotals.get(id) ?? null, prepaidCredits),
    createdAt: String(record.created_at ?? ""),
    adminCount: activeAdmins.length,
    purchaseCount: paid.length,
    purchaseTotalIls: paid.reduce((sum, order) => sum + order.amountIls, 0),
    openCancellation: cancellations.get(id) ?? null,
    payplusSubscription: subscriptions.get(id) ?? null,
    admins: activeAdmins.map((row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? "").trim() || "מנהל",
      phone: String(row.phone ?? ""),
    })),
    purchases: orders,
  };
}

const ORDER_COLUMNS =
  "id, business_id, package_id, sms_credits, amount_ils, status, created_at, paid_at, error_message";

async function loadPackageLabels() {
  const labels = new Map<string, string>();
  try {
    for (const row of await loadSmsPackageRows()) {
      labels.set(row.package_key, row.label);
    }
  } catch {
    // Purchases still render with the raw package id.
  }
  return labels;
}

export async function listPurchases(): Promise<AdminPurchase[]> {
  const supabase = getServiceSupabase();
  const [orders, profiles, labels] = await Promise.all([
    supabase
      .from("sms_topup_orders")
      .select(ORDER_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("business_profile").select("id, display_name"),
    loadPackageLabels(),
  ]);

  if (orders.error) throw new Error("טעינת הרכישות נכשלה.");

  const names = new Map<string, string>();
  for (const row of profiles.data ?? []) {
    const record = asRecord(row);
    names.set(
      String(record.id ?? ""),
      String(record.display_name ?? "").trim() || "עסק",
    );
  }

  return (orders.data ?? []).map((row) => {
    const record = asRecord(row);
    const businessId = String(record.business_id ?? "");
    return toPurchase(record, names.get(businessId) || "עסק", labels);
  });
}

function toPurchase(
  record: Record<string, unknown>,
  businessName: string,
  labels: Map<string, string>,
): AdminPurchase {
  const packageId = String(record.package_id ?? "");
  return {
    id: String(record.id ?? ""),
    businessId: String(record.business_id ?? ""),
    businessName,
    packageId,
    packageLabel: labels.get(packageId) ?? null,
    smsCredits: Number(record.sms_credits ?? 0),
    amountIls: Number(record.amount_ils ?? 0),
    status: String(record.status ?? ""),
    errorMessage: record.error_message ? String(record.error_message) : null,
    createdAt: String(record.created_at ?? ""),
    paidAt: record.paid_at ? String(record.paid_at) : null,
  };
}
