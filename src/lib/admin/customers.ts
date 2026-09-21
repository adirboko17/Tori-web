import { loadSmsBalance } from "@/lib/sms/balance";
import { getServiceSupabase } from "@/lib/sms/supabase-admin";
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
  plan: string;
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
  smsCredits: number;
  amountIls: number;
  status: string;
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
      plan: "",
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
  const customers = await listCustomers();
  const customer = customers.find((item) => item.id === id);
  if (!customer) return null;

  const supabase = getServiceSupabase();
  const [admins, purchases] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, phone, user_type, block")
      .eq("business_id", id)
      .eq("user_type", "admin"),
    supabase
      .from("sms_topup_orders")
      .select(
        "id, business_id, package_id, sms_credits, amount_ils, status, created_at, paid_at",
      )
      .eq("business_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    ...customer,
    admins: (admins.data ?? [])
      .map((row) => asRecord(row))
      .filter((row) => row.block !== true)
      .map((row) => ({
        id: String(row.id ?? ""),
        name: String(row.name ?? "").trim() || "מנהל",
        phone: String(row.phone ?? ""),
      })),
    purchases: (purchases.data ?? []).map((row) =>
      toPurchase(asRecord(row), customer.name),
    ),
  };
}

export async function listPurchases(): Promise<AdminPurchase[]> {
  const supabase = getServiceSupabase();
  const [orders, profiles] = await Promise.all([
    supabase
      .from("sms_topup_orders")
      .select(
        "id, business_id, package_id, sms_credits, amount_ils, status, created_at, paid_at",
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("business_profile").select("id, display_name"),
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
    return toPurchase(record, names.get(businessId) || "עסק");
  });
}

function toPurchase(
  record: Record<string, unknown>,
  businessName: string,
): AdminPurchase {
  return {
    id: String(record.id ?? ""),
    businessId: String(record.business_id ?? ""),
    businessName,
    packageId: String(record.package_id ?? ""),
    smsCredits: Number(record.sms_credits ?? 0),
    amountIls: Number(record.amount_ils ?? 0),
    status: String(record.status ?? ""),
    createdAt: String(record.created_at ?? ""),
    paidAt: record.paid_at ? String(record.paid_at) : null,
  };
}
