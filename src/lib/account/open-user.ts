import { randomInt } from "node:crypto";
import {
  ENGLISH_DISPLAY_NAME_ERROR,
  isEnglishDisplayName,
} from "@/lib/display-name";
import { mapBusinessFields } from "@/lib/business-onboarding-map";
import { paidAccounts } from "@/lib/account/profile";
import {
  attachBusinessToSignup,
  listAccountsByPhone,
  loadPendingSignup,
  savePendingSignup,
  upsertSignupAccount,
} from "@/lib/account/store";
import { getSupabaseUrl } from "@/lib/sms/env";
import { getServiceSupabase } from "@/lib/sms/supabase-admin";

function anonKey() {
  return (
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim() ||
    (process.env.SUPABASE_ANON_KEY ?? "").trim()
  );
}

export async function openCustomerUser(input: {
  phone: string;
  fullName: string;
  businessName: string;
}) {
  const fullName = input.fullName.trim();
  const businessName = input.businessName.trim();
  if (!isEnglishDisplayName(businessName)) {
    return { ok: false as const, error: ENGLISH_DISPLAY_NAME_ERROR };
  }
  const found = await listAccountsByPhone(input.phone);
  if (!found.ok) return { ok: false as const, error: found.error };
  if (paidAccounts(found.accounts).length > 0) {
    return {
      ok: false as const,
      error: "המספר כבר פעיל. התחברו מחדש כדי להיכנס לאזור האישי.",
    };
  }

  // Older signups that already got a business before paying keep working.
  const resume = found.accounts.find((account) => account.businessId && !account.paidAt);
  if (resume?.businessId) {
    await upsertSignupAccount({
      businessId: resume.businessId,
      fullName,
      phone: found.phone,
      businessName,
    });
    await refreshOpenedNames(resume.businessId, fullName, businessName);
    return { ok: true as const, checkoutId: resume.businessId, returning: true };
  }

  // New signups only keep the details. The business is opened after payment.
  const mapped = mapBusinessFields({
    managerName: fullName,
    phone: found.phone,
    businessNameHe: businessName,
  });
  const pending = await savePendingSignup({
    phone: found.phone,
    fullName,
    businessName,
    appNameEn: randomAppName(mapped.app_name_en),
  });
  return { ok: true as const, checkoutId: pending.id, returning: pending.existed };
}

function randomAppName(base: string) {
  return `${base}${randomInt(1000, 10000)}`.slice(0, 40);
}

/**
 * Called only after a subscription payment was confirmed.
 * Opens the business for a signup that has none yet and returns the business id.
 */
export async function openBusinessAfterPayment(signupId: string) {
  const pending = await loadPendingSignup(signupId);
  if (!pending) return { ok: true as const, businessId: signupId };

  const created = await createBusiness({
    id: pending.id,
    phone: pending.phone,
    fullName: pending.fullName,
    businessName: pending.businessName,
    appNameEn: pending.appNameEn || randomAppName(
      mapBusinessFields({
        managerName: pending.fullName,
        businessNameHe: pending.businessName,
      }).app_name_en,
    ),
  });
  if (!created.ok) return created;

  await attachBusinessToSignup(pending.id, created.businessId);
  return { ok: true as const, businessId: created.businessId };
}

async function refreshOpenedNames(
  businessId: string,
  fullName: string,
  businessName: string,
) {
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const { error: profileError } = await supabase
    .from("business_profile")
    .update({ display_name: businessName, updated_at: now })
    .eq("id", businessId);
  if (profileError) console.error("opened business name update failed", profileError.message);

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("business_id", businessId)
    .eq("user_type", "admin")
    .limit(1);
  if (error || !data?.[0]?.id) return;
  const { error: userError } = await supabase
    .from("users")
    .update({ name: fullName, updated_at: now })
    .eq("id", data[0].id);
  if (userError) console.error("opened user name update failed", userError.message);
}

async function createBusiness(input: {
  id: string;
  phone: string;
  fullName: string;
  businessName: string;
  appNameEn: string;
}) {
  const secret = (process.env.ONBOARDING_WEBHOOK_SECRET ?? "").trim();
  const base = getSupabaseUrl().replace(/\/$/, "");
  const key = anonKey();
  if (!secret || !base || !key) {
    return { ok: false as const, error: "פתיחת המשתמש עדיין לא הוגדרה." };
  }

  const mapped = mapBusinessFields({
    managerName: input.fullName,
    phone: input.phone,
    businessNameHe: input.businessName,
    plan: "monthly",
    commitment: "pending-payment",
  });
  const appNameEn = input.appNameEn;
  const id = input.id;
  const payload = {
    event: "new_business_onboarded",
    timestamp: new Date().toISOString(),
    data: {
      business: {
        id,
        business_name_he: mapped.business_name_he,
        business_name_en: mapped.business_name_en,
        app_name_en: appNameEn,
        address: mapped.address,
        manager_name: mapped.manager_name,
        phone: mapped.phone,
        manager_password: mapped.manager_password,
        logo_url: null,
        logo_url_plain_background: null,
        logo_url_transparent: null,
        manager_photo_url: null,
        brand_color: mapped.brand_color,
        plan: mapped.plan,
        price: mapped.price,
        commitment: mapped.commitment,
        email: null,
      },
      services: [],
    },
  };

  let response: Response;
  try {
    response = await fetch(`${base}/functions/v1/onboarding-webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        "X-Webhook-Secret": secret,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("signup webhook request failed", error);
    return { ok: false as const, error: "לא הצלחנו לפתוח את המשתמש. נסו שוב." };
  }

  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    error?: string;
    businessId?: string;
  } | null;
  if (!response.ok || !data?.ok) {
    console.error("signup webhook failed", response.status, data?.error || "unknown");
    return { ok: false as const, error: "לא הצלחנו לפתוח את המשתמש. נסו שוב." };
  }
  return { ok: true as const, businessId: data.businessId || id, appNameEn };
}
