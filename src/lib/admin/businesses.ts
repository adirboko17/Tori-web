import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import { brandingAssetUrl, hasPulseemCredentials } from "@/lib/superadmin/format";
import {
  loadOpenCancellationsByBusiness,
  type OpenCancellation,
} from "./cancellations";
import { loadPayplusSubscriptionsByBusiness } from "./payplus-subscriptions";

export type SubscriptionState = "active" | "cancelled" | "none";

/** One row of the merged businesses list. Live SMS balances are loaded separately. */
export type AdminBusiness = {
  id: string;
  name: string;
  phone: string;
  address: string;
  clientName: string | null;
  iconUrl: string | null;
  primaryColor: string | null;
  createdAt: string;
  clientCount: number;
  adminCount: number;
  hasPulseem: boolean;
  prepaidCredits: number;
  subscription: SubscriptionState;
  openCancellation: OpenCancellation | null;
  purchaseCount: number;
  purchaseTotalIls: number;
};

export const PAID_ORDER_STATUSES = ["paid", "fulfilled", "processing"];

const PAGE = 1000;

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

async function loadAllUsers() {
  const supabase = getServiceSupabase();
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; from < 200_000; from += PAGE) {
    const { data, error } = await supabase
      .from("users")
      .select("business_id, user_type, block")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error("טעינת המשתמשים נכשלה.");
    rows.push(...(data ?? []).map(asRecord));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

export async function listAdminBusinesses(): Promise<AdminBusiness[]> {
  const supabase = getServiceSupabase();
  const [profiles, users, orders] = await Promise.all([
    supabase
      .from("business_profile")
      .select(
        "id, display_name, phone, address, primary_color, created_at, branding_client_name, pulseem_user_id, pulseem_has_password, pulseem_has_api_key, pulseem_prepaid_sms_credits",
      )
      .order("created_at", { ascending: false }),
    loadAllUsers(),
    supabase.from("sms_topup_orders").select("business_id, amount_ils, status"),
  ]);
  if (profiles.error) throw new Error("טעינת העסקים נכשלה.");

  const counts = new Map<string, { clients: number; admins: number }>();
  for (const user of users) {
    const businessId = String(user.business_id ?? "");
    if (!businessId) continue;
    const current = counts.get(businessId) ?? { clients: 0, admins: 0 };
    if (user.user_type === "client") current.clients += 1;
    else if (user.user_type === "admin" && user.block !== true) current.admins += 1;
    counts.set(businessId, current);
  }

  const purchases = new Map<string, { count: number; total: number }>();
  for (const row of orders.data ?? []) {
    const record = asRecord(row);
    if (!PAID_ORDER_STATUSES.includes(String(record.status ?? ""))) continue;
    const businessId = String(record.business_id ?? "");
    if (!businessId) continue;
    const current = purchases.get(businessId) ?? { count: 0, total: 0 };
    current.count += 1;
    current.total += Number(record.amount_ils ?? 0);
    purchases.set(businessId, current);
  }

  const rows = (profiles.data ?? []).map(asRecord);
  const ids = rows.map((row) => String(row.id ?? "")).filter(Boolean);
  const [cancellations, subscriptions] = await Promise.all([
    loadOpenCancellationsByBusiness(ids).catch((error) => {
      console.error("businesses: open cancellations failed", error);
      return new Map<string, OpenCancellation>();
    }),
    loadPayplusSubscriptionsByBusiness(ids).catch((error) => {
      console.error("businesses: subscriptions failed", error);
      return new Map();
    }),
  ]);

  return rows.map((row) => {
    const id = String(row.id ?? "");
    const clientName = String(row.branding_client_name ?? "").trim() || null;
    const subscription = subscriptions.get(id);
    return {
      id,
      name: String(row.display_name ?? "").trim() || "עסק",
      phone: String(row.phone ?? ""),
      address: String(row.address ?? ""),
      clientName,
      iconUrl: brandingAssetUrl(clientName, "icon.png"),
      primaryColor: row.primary_color ? String(row.primary_color) : null,
      createdAt: String(row.created_at ?? ""),
      clientCount: counts.get(id)?.clients ?? 0,
      adminCount: counts.get(id)?.admins ?? 0,
      hasPulseem: hasPulseemCredentials({
        pulseemHasApiKey: row.pulseem_has_api_key === true,
        pulseem_user_id: row.pulseem_user_id ? String(row.pulseem_user_id) : null,
        pulseemHasPassword: row.pulseem_has_password === true,
      }),
      prepaidCredits: Number(row.pulseem_prepaid_sms_credits ?? 0) || 0,
      subscription: subscription ? subscription.status : "none",
      openCancellation: cancellations.get(id) ?? null,
      purchaseCount: purchases.get(id)?.count ?? 0,
      purchaseTotalIls: purchases.get(id)?.total ?? 0,
    } satisfies AdminBusiness;
  });
}
