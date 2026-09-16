import { normalizeIsraeliMobile, phoneLastNine, phoneLookupVariants } from "./phone";
import { getServiceSupabase } from "./supabase-admin";

export type AdminBusiness = {
  userId: string;
  businessId: string;
  name: string;
  businessName: string;
  phone: string;
};

const UNKNOWN_ADMIN =
  "המספר לא מזוהה כמנהל עסק במערכת תורי.";

function isBlocked(row: Record<string, unknown>) {
  return row.block === true || row.block === "true" || row.block === 1;
}

function pickName(row: Record<string, unknown>) {
  return String(
    row.name ?? row.full_name ?? row.display_name ?? row.first_name ?? "",
  ).trim();
}

async function loadBusinessNames(ids: string[]) {
  const names = new Map<string, string>();
  if (!ids.length) return names;
  const supabase = getServiceSupabase();
  const joined = ids.join(",");
  const withBoth = await supabase
    .from("business_profile")
    .select("id, business_id, display_name")
    .or(`id.in.(${joined}),business_id.in.(${joined})`);

  const rows = withBoth.error
    ? (
        await supabase
          .from("business_profile")
          .select("id, display_name")
          .in("id", ids)
      ).data
    : withBoth.data;

  for (const row of rows ?? []) {
    const record = row as {
      id?: string;
      business_id?: string;
      display_name?: string | null;
    };
    const label = String(record.display_name ?? "").trim();
    if (!label) continue;
    if (record.id && ids.includes(record.id)) names.set(record.id, label);
    if (record.business_id && ids.includes(record.business_id)) {
      names.set(record.business_id, label);
    }
  }
  return names;
}

export async function findAdminBusinesses(
  rawPhone: string,
): Promise<
  { ok: true; phone: string; admins: AdminBusiness[] } | { ok: false; error: string }
> {
  const phone = normalizeIsraeliMobile(rawPhone);
  if (!phone) {
    return { ok: false, error: "צריך להזין מספר נייד ישראלי תקין." };
  }

  const supabase = getServiceSupabase();
  const last9 = phoneLastNine(phone);
  const phoneFilters = [
    ...phoneLookupVariants(phone)
      .filter((value) => !value.startsWith("+"))
      .map((value) => `phone.eq.${value}`),
    `phone.ilike.%${last9}%`,
  ].join(",");
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_type", "admin")
    .or(phoneFilters);

  if (error) {
    console.error("admin lookup failed", error.code || "", error.message);
    if (/api key/i.test(error.message || "")) {
      throw new Error(
        "חיבור השרת ל-Supabase נכשל. בדקו ש-SUPABASE_URL ו-SUPABASE_SERVICE_ROLE_KEY שייכים לאותו פרויקט של האפליקציה.",
      );
    }
    throw new Error("איתור המנהל נכשל. נסו שוב.");
  }

  const matched = (data ?? [])
    .map((row) => row as Record<string, unknown>)
    .filter((row) => {
      if (isBlocked(row)) return false;
      return normalizeIsraeliMobile(String(row.phone ?? "")) === phone;
    });

  const businessIds = [
    ...new Set(
      matched
        .map((row) => String(row.business_id ?? ""))
        .filter(Boolean),
    ),
  ];
  const names = await loadBusinessNames(businessIds);

  const admins: AdminBusiness[] = [];
  const seen = new Set<string>();
  for (const row of matched) {
    const businessId = String(row.business_id ?? "");
    const userId = String(row.id ?? "");
    if (!businessId || !userId || seen.has(businessId)) continue;
    seen.add(businessId);
    admins.push({
      userId,
      businessId,
      name: pickName(row),
      businessName: names.get(businessId) || "עסק",
      phone,
    });
  }

  return { ok: true, phone, admins };
}

export function unknownAdminMessage() {
  return UNKNOWN_ADMIN;
}

export async function assertStillAdmin(
  userId: string,
  businessId: string,
  phone: string,
) {
  const found = await findAdminBusinesses(phone);
  if (!found.ok) return null;
  return (
    found.admins.find(
      (admin) => admin.userId === userId && admin.businessId === businessId,
    ) ?? null
  );
}
