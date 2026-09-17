import { DEFAULT_SMS_PACKAGES, type SmsPackage } from "@/lib/sms/packages";
import { smsBackendConfigured } from "@/lib/sms/env";
import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import { DEFAULT_MONTHLY_PRICE_ILS } from "@/lib/subscription";

export type SiteSmsPackageRow = {
  id: string;
  package_key: string;
  sms_credits: number;
  amount_ils: number;
  label: string;
  featured: boolean;
  sort_order: number;
  is_active: boolean;
};

function toPackage(row: SiteSmsPackageRow): SmsPackage {
  return {
    id: row.package_key,
    smsCredits: Number(row.sms_credits),
    amountIls: Number(row.amount_ils),
    label: row.label,
    featured: Boolean(row.featured),
  };
}

export async function loadMonthlyPriceIls() {
  if (!smsBackendConfigured()) return DEFAULT_MONTHLY_PRICE_ILS;
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("site_pricing")
      .select("monthly_price_ils")
      .eq("id", "default")
      .maybeSingle();
    if (error || data?.monthly_price_ils == null) {
      return DEFAULT_MONTHLY_PRICE_ILS;
    }
    const price = Number(data.monthly_price_ils);
    return Number.isFinite(price) && price > 0
      ? price
      : DEFAULT_MONTHLY_PRICE_ILS;
  } catch {
    return DEFAULT_MONTHLY_PRICE_ILS;
  }
}

export async function saveMonthlyPriceIls(price: number) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("site_pricing").upsert({
    id: "default",
    monthly_price_ils: price,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error("שמירת המחיר החודשי נכשלה.");
}

export async function loadSmsPackages(): Promise<SmsPackage[]> {
  const rows = await loadSmsPackageRows(true);
  if (!rows.length) return DEFAULT_SMS_PACKAGES.map((pack) => ({ ...pack }));
  return rows.map(toPackage);
}

export async function loadSmsPackage(packageId: string) {
  const packs = await loadSmsPackages();
  return packs.find((pack) => pack.id === packageId) ?? null;
}

export async function loadSmsPackageRows(activeOnly = false) {
  if (!smsBackendConfigured()) return [];
  try {
    const supabase = getServiceSupabase();
    let query = supabase
      .from("site_sms_packages")
      .select(
        "id, package_key, sms_credits, amount_ils, label, featured, sort_order, is_active",
      )
      .order("sort_order", { ascending: true });
    if (activeOnly) query = query.eq("is_active", true);
    const { data, error } = await query;
    if (error || !data) return [];
    return (data as SiteSmsPackageRow[]).filter((row) => {
      const key = String(row.package_key ?? "");
      return !key.startsWith("app_cancel_") && !key.startsWith("payplus_sub_");
    });
  } catch {
    return [];
  }
}

export async function createSmsPackage(input: {
  packageKey: string;
  smsCredits: number;
  amountIls: number;
  label: string;
  featured?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const supabase = getServiceSupabase();
  if (input.featured) await clearFeatured();
  const { data, error } = await supabase
    .from("site_sms_packages")
    .insert({
      package_key: input.packageKey,
      sms_credits: input.smsCredits,
      amount_ils: input.amountIls,
      label: input.label,
      featured: Boolean(input.featured),
      sort_order: input.sortOrder ?? 100,
      is_active: input.isActive ?? true,
    })
    .select(
      "id, package_key, sms_credits, amount_ils, label, featured, sort_order, is_active",
    )
    .single();
  if (error || !data) {
    if (error?.code === "23505") {
      throw new Error("מזהה החבילה כבר קיים.");
    }
    throw new Error("יצירת החבילה נכשלה.");
  }
  return data as SiteSmsPackageRow;
}

export async function updateSmsPackage(
  id: string,
  input: Partial<{
    packageKey: string;
    smsCredits: number;
    amountIls: number;
    label: string;
    featured: boolean;
    sortOrder: number;
    isActive: boolean;
  }>,
) {
  const supabase = getServiceSupabase();
  if (input.featured) await clearFeatured(id);
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.packageKey != null) patch.package_key = input.packageKey;
  if (input.smsCredits != null) patch.sms_credits = input.smsCredits;
  if (input.amountIls != null) patch.amount_ils = input.amountIls;
  if (input.label != null) patch.label = input.label;
  if (input.featured != null) patch.featured = input.featured;
  if (input.sortOrder != null) patch.sort_order = input.sortOrder;
  if (input.isActive != null) patch.is_active = input.isActive;
  const { data, error } = await supabase
    .from("site_sms_packages")
    .update(patch)
    .eq("id", id)
    .select(
      "id, package_key, sms_credits, amount_ils, label, featured, sort_order, is_active",
    )
    .single();
  if (error || !data) {
    if (error?.code === "23505") {
      throw new Error("מזהה החבילה כבר קיים.");
    }
    throw new Error("עדכון החבילה נכשל.");
  }
  return data as SiteSmsPackageRow;
}

export async function deleteSmsPackage(id: string) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("site_sms_packages").delete().eq("id", id);
  if (error) throw new Error("מחיקת החבילה נכשלה.");
}

async function clearFeatured(exceptId?: string) {
  const supabase = getServiceSupabase();
  let query = supabase
    .from("site_sms_packages")
    .update({ featured: false, updated_at: new Date().toISOString() })
    .eq("featured", true);
  if (exceptId) query = query.neq("id", exceptId);
  await query;
}
