import { findAdminBusinesses, type AdminBusiness } from "@/lib/sms/admins";
import { sendLoginOtp, verifyLoginOtp } from "@/lib/sms/otp";
import { normalizeIsraeliMobile } from "@/lib/sms/phone";
import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import { rankOtpBusinesses, type OtpBusinessMeta } from "./otp-business";

export type SiteAdminPhone = {
  id: string;
  phone: string;
  name: string;
  otpBusinessId: string | null;
};

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

export async function findSiteAdminByPhone(rawPhone: string) {
  const phone = normalizeIsraeliMobile(rawPhone);
  if (!phone) return { ok: false as const, error: "צריך להזין מספר נייד ישראלי תקין." };

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_admin_phones")
    .select("id, phone, name, otp_business_id")
    .eq("phone", phone)
    .maybeSingle();
  if (error) throw new Error("בדיקת מנהל האתר נכשלה.");
  if (!data) {
    return { ok: false as const, error: "המספר לא מזוהה כמנהל אתר." };
  }
  const row = asRecord(data);
  const otpBusinessId = String(row.otp_business_id ?? "").trim();
  return {
    ok: true as const,
    admin: {
      id: String(row.id ?? ""),
      phone,
      name: String(row.name ?? "").trim() || "מנהל אתר",
      otpBusinessId: otpBusinessId || null,
    } satisfies SiteAdminPhone,
  };
}

async function loadOtpBusinessMeta(businessIds: string[]) {
  const meta = new Map<string, OtpBusinessMeta>();
  if (businessIds.length === 0) return meta;

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("business_profile")
    .select("id, pulseem_from_number, pulseem_prepaid_sms_credits")
    .in("id", businessIds);
  if (error) throw new Error("בדיקת חיבור SMS נכשלה.");

  for (const row of data ?? []) {
    const record = asRecord(row);
    const id = String(record.id ?? "");
    if (!id) continue;
    meta.set(id, {
      fromNumber: String(record.pulseem_from_number ?? "").trim(),
      credits: Number(record.pulseem_prepaid_sms_credits ?? 0) || 0,
    });
  }
  return meta;
}

function orderOtpBusinesses(
  admins: AdminBusiness[],
  pinnedBusinessId: string | null,
) {
  if (!pinnedBusinessId) return admins;
  const pinned = admins.find((admin) => admin.businessId === pinnedBusinessId);
  if (!pinned) return admins;
  return [
    pinned,
    ...admins.filter((admin) => admin.businessId !== pinnedBusinessId),
  ];
}

export async function sendSiteAdminOtp(rawPhone: string) {
  const foundAdmin = await findSiteAdminByPhone(rawPhone);
  if (!foundAdmin.ok) return foundAdmin;

  const businesses = await findAdminBusinesses(foundAdmin.admin.phone);
  if (!businesses.ok) return { ok: false as const, error: businesses.error };

  const pinnedBusinessId = foundAdmin.admin.otpBusinessId;
  const admins = [...businesses.admins];
  if (
    pinnedBusinessId &&
    !admins.some((admin) => admin.businessId === pinnedBusinessId)
  ) {
    admins.push({
      userId: foundAdmin.admin.id,
      businessId: pinnedBusinessId,
      name: foundAdmin.admin.name,
      businessName: "מנהל אתר",
      phone: businesses.phone,
    });
  }
  if (admins.length === 0) {
    return { ok: false as const, error: "לא ניתן לשלוח קוד כרגע." };
  }

  const meta = await loadOtpBusinessMeta(
    admins.map((admin) => admin.businessId),
  );
  const ranked = rankOtpBusinesses(admins, meta, businesses.phone);
  const candidates = orderOtpBusinesses(ranked, pinnedBusinessId);

  let lastMessage = "שליחת ה-SMS נכשלה. נסו שוב.";
  for (const business of candidates) {
    const sent = await sendLoginOtp(business.businessId, businesses.phone);
    if (sent.ok) {
      return {
        ok: true as const,
        phone: businesses.phone,
        businessId: business.businessId,
        name: foundAdmin.admin.name,
        userId: foundAdmin.admin.id,
      };
    }
    lastMessage = sent.message;
  }
  return { ok: false as const, error: lastMessage };
}

export async function verifySiteAdminOtp(input: {
  phone: string;
  businessId: string;
  code: string;
}) {
  const foundAdmin = await findSiteAdminByPhone(input.phone);
  if (!foundAdmin.ok) return foundAdmin;

  const verified = await verifyLoginOtp(
    input.businessId,
    foundAdmin.admin.phone,
    input.code,
  );
  if (!verified.ok) {
    return { ok: false as const, error: verified.message };
  }

  return {
    ok: true as const,
    admin: foundAdmin.admin,
  };
}
