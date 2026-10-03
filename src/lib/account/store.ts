import { randomUUID } from "node:crypto";
import { hashManagerPassword } from "@/lib/account/password";
import type { AccountLanguage, AccountProfileDraft } from "@/lib/account/profile";
import { normalizeIsraeliMobile } from "@/lib/sms/phone";
import { getServiceSupabase } from "@/lib/sms/supabase-admin";

export type CustomerAccount = {
  id: string;
  phone: string;
  fullName: string;
  businessName: string;
  paidAt: string | null;
  businessId: string | null;
  userId: string | null;
  email: string;
  appNameEn: string;
  address: string;
  idNumber: string;
  receiptName: string;
  receiptVat: string;
  language: AccountLanguage;
  brandColor: string;
};

export type PortalService = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
};

export type PortalProfile = CustomerAccount & {
  services: PortalService[];
};

const ACCOUNT_COLUMNS =
  "id, phone, full_name, business_name, paid_at, business_id, user_id, email, app_name_en, address, id_number, receipt_name, receipt_vat, language, brand_color";

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function languageOf(value: unknown): AccountLanguage {
  const language = String(value ?? "");
  if (language === "en" || language === "ru" || language === "ar") return language;
  return "he";
}

function toAccount(row: Record<string, unknown>): CustomerAccount {
  return {
    id: String(row.id ?? ""),
    phone: String(row.phone ?? ""),
    fullName: String(row.full_name ?? ""),
    businessName: String(row.business_name ?? ""),
    paidAt: row.paid_at ? String(row.paid_at) : null,
    businessId: row.business_id ? String(row.business_id) : null,
    userId: row.user_id ? String(row.user_id) : null,
    email: String(row.email ?? ""),
    appNameEn: String(row.app_name_en ?? ""),
    address: String(row.address ?? ""),
    idNumber: String(row.id_number ?? ""),
    receiptName: String(row.receipt_name ?? ""),
    receiptVat: String(row.receipt_vat ?? ""),
    language: languageOf(row.language),
    brandColor: String(row.brand_color ?? ""),
  };
}

async function findAdminUser(businessId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, phone, language, block")
    .eq("business_id", businessId)
    .eq("user_type", "admin")
    .eq("block", false)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) throw new Error("איתור המשתמש נכשל.");
  const row = (data ?? [])[0];
  if (!row) return null;
  const record = asRecord(row);
  const phone = normalizeIsraeliMobile(String(record.phone ?? ""));
  if (!phone) return null;
  return {
    id: String(record.id ?? ""),
    name: String(record.name ?? "").trim(),
    phone,
    language: languageOf(record.language),
  };
}

export async function listAccountsByPhone(rawPhone: string) {
  const phone = normalizeIsraeliMobile(rawPhone);
  if (!phone) return { ok: false as const, error: "צריך להזין מספר נייד ישראלי תקין." };

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_customer_accounts")
    .select(ACCOUNT_COLUMNS)
    .eq("phone", phone);
  if (error) throw new Error("איתור החשבון נכשל.");

  const accounts = (data ?? []).map((row) => toAccount(asRecord(row)));
  return { ok: true as const, phone, accounts };
}

export async function loadPortal(accountId: string, userId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_customer_accounts")
    .select(ACCOUNT_COLUMNS)
    .eq("id", accountId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("טעינת האזור האישי נכשלה.");
  if (!data) return null;
  const account = toAccount(asRecord(data));
  if (!account.paidAt || !account.businessId || !account.userId) return null;

  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id, name, price, duration_minutes, order_index, worker_id")
    .eq("business_id", account.businessId)
    .order("order_index", { ascending: true });
  if (servicesError) throw new Error("טעינת השירותים נכשלה.");

  return {
    ...account,
    services: (services ?? [])
      .map((row) => asRecord(row))
      .filter((row) => {
        const workerId = row.worker_id ? String(row.worker_id) : "";
        return !workerId || workerId === account.userId;
      })
      .map((row) => ({
        id: String(row.id ?? ""),
        name: String(row.name ?? ""),
        price: Number(row.price ?? 0),
        durationMinutes: Number(row.duration_minutes ?? 0),
      })),
  } satisfies PortalProfile;
}

export async function savePortal(account: CustomerAccount, draft: AccountProfileDraft) {
  if (!account.businessId || !account.userId) {
    return { ok: false as const, error: "החשבון עדיין לא מחובר לעסק." };
  }

  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("site_customer_accounts")
    .update({
      full_name: draft.fullName,
      business_name: draft.businessName,
      email: draft.email || null,
      app_name_en: draft.appNameEn || null,
      address: draft.address || null,
      id_number: draft.idNumber || null,
      receipt_name: draft.receiptName || null,
      receipt_vat: draft.receiptVat || null,
      language: draft.language,
      brand_color: draft.brandColor || null,
      updated_at: now,
    })
    .eq("id", account.id)
    .eq("user_id", account.userId);
  if (error) {
    console.error("account profile update failed", error.message);
    return { ok: false as const, error: "שמירת הפרטים נכשלה." };
  }

  const userPatch: Record<string, unknown> = {
    name: draft.fullName,
    language: draft.language,
    updated_at: now,
  };
  if (draft.password) userPatch.password_hash = hashManagerPassword(draft.password);
  const { error: userError } = await supabase
    .from("users")
    .update(userPatch)
    .eq("id", account.userId)
    .eq("business_id", account.businessId)
    .eq("user_type", "admin");
  if (userError) {
    console.error("account user update failed", userError.message);
    return { ok: false as const, error: "שמירת המשתמש נכשלה." };
  }

  const profilePatch: Record<string, unknown> = {
    display_name: draft.businessName,
    address: draft.address,
    updated_at: now,
  };
  if (draft.brandColor) profilePatch.primary_color = draft.brandColor;
  if (draft.appNameEn) profilePatch.branding_client_name = draft.appNameEn;
  const { error: profileError } = await supabase
    .from("business_profile")
    .update(profilePatch)
    .eq("id", account.businessId);
  if (profileError) {
    console.error("account business update failed", profileError.message);
    return { ok: false as const, error: "שמירת העסק נכשלה." };
  }

  const saved = await syncServices(account.businessId, account.userId, draft);
  if (!saved.ok) return saved;
  return { ok: true as const };
}

async function syncServices(
  businessId: string,
  userId: string,
  draft: AccountProfileDraft,
) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("services")
    .select("id, worker_id")
    .eq("business_id", businessId);
  if (error) return { ok: false as const, error: "שמירת השירותים נכשלה." };

  const owned = new Set(
    (data ?? [])
      .map((row) => asRecord(row))
      .filter((row) => {
        const workerId = row.worker_id ? String(row.worker_id) : "";
        return !workerId || workerId === userId;
      })
      .map((row) => String(row.id ?? ""))
      .filter(Boolean),
  );

  const kept = new Set<string>();
  for (const [index, service] of draft.services.entries()) {
    const payload = {
      name: service.name,
      price: service.price,
      duration_minutes: service.durationMinutes,
      order_index: index,
      is_active: true,
      business_id: businessId,
      worker_id: userId,
      updated_at: new Date().toISOString(),
    };
    if (service.id && owned.has(service.id)) {
      const { error: updateError } = await supabase
        .from("services")
        .update(payload)
        .eq("id", service.id)
        .eq("business_id", businessId);
      if (updateError) {
        return { ok: false as const, error: "שמירת השירותים נכשלה." };
      }
      kept.add(service.id);
      continue;
    }
    const { data: inserted, error: insertError } = await supabase
      .from("services")
      .insert(payload)
      .select("id")
      .single();
    if (insertError) {
      return { ok: false as const, error: "שמירת השירותים נכשלה." };
    }
    kept.add(String(asRecord(inserted).id ?? ""));
  }

  const removed = [...owned].filter((id) => !kept.has(id));
  if (removed.length) {
    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .in("id", removed)
      .eq("business_id", businessId);
    if (deleteError) {
      return { ok: false as const, error: "שמירת השירותים נכשלה." };
    }
  }
  return { ok: true as const };
}

export async function upsertSignupAccount(input: {
  businessId: string;
  fullName: string;
  phone: string;
  businessName: string;
  email?: string | null;
  appNameEn?: string | null;
  address?: string | null;
  brandColor?: string | null;
}) {
  const phone = normalizeIsraeliMobile(input.phone);
  if (!phone || input.fullName.trim().length < 2 || input.businessName.trim().length < 2) {
    return;
  }
  const supabase = getServiceSupabase();
  const user = await findAdminUser(input.businessId);
  const now = new Date().toISOString();
  const patch = {
    phone,
    full_name: input.fullName.trim(),
    business_name: input.businessName.trim(),
    email: input.email?.trim() || null,
    app_name_en: input.appNameEn?.trim() || null,
    address: input.address?.trim() || null,
    brand_color: /^#[0-9A-Fa-f]{6}$/.test(input.brandColor ?? "")
      ? input.brandColor
      : null,
    agreement_accepted_at: now,
    business_id: input.businessId,
    user_id: user?.id ?? null,
    updated_at: now,
  };

  const { data: existing, error: lookupError } = await supabase
    .from("site_customer_accounts")
    .select("id")
    .eq("business_id", input.businessId)
    .maybeSingle();
  if (lookupError) throw new Error("שמירת החשבון נכשלה.");

  if (existing?.id) {
    const { error } = await supabase
      .from("site_customer_accounts")
      .update(patch)
      .eq("id", existing.id);
    if (error) throw new Error("שמירת החשבון נכשלה.");
    return;
  }

  const { error } = await supabase.from("site_customer_accounts").insert({
    ...patch,
    language: user?.language ?? "he",
  });
  if (error) throw new Error("שמירת החשבון נכשלה.");
}

/**
 * A visitor who filled in the signup form but has not paid yet.
 * Only a row in site_customer_accounts is kept. No business, user or SMS balance exists
 * until the payment is confirmed. The row id is reused as the business id once paid.
 */
export async function savePendingSignup(input: {
  phone: string;
  fullName: string;
  businessName: string;
  appNameEn: string;
}) {
  const phone = normalizeIsraeliMobile(input.phone);
  if (!phone || input.fullName.trim().length < 2 || input.businessName.trim().length < 2) {
    throw new Error("שמירת הפרטים נכשלה.");
  }
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();

  const { data: existing, error: lookupError } = await supabase
    .from("site_customer_accounts")
    .select("id")
    .eq("phone", phone)
    .is("business_id", null)
    .is("paid_at", null)
    .order("created_at", { ascending: true })
    .limit(1);
  if (lookupError) throw new Error("שמירת הפרטים נכשלה.");

  const existingId = existing?.[0]?.id ? String(existing[0].id) : "";
  if (existingId) {
    const { error } = await supabase
      .from("site_customer_accounts")
      .update({
        full_name: input.fullName.trim(),
        business_name: input.businessName.trim(),
        agreement_accepted_at: now,
        updated_at: now,
      })
      .eq("id", existingId);
    if (error) throw new Error("שמירת הפרטים נכשלה.");
    return existingId;
  }

  const id = randomUUID();
  const { error } = await supabase.from("site_customer_accounts").insert({
    id,
    phone,
    full_name: input.fullName.trim(),
    business_name: input.businessName.trim(),
    app_name_en: input.appNameEn.trim() || null,
    agreement_accepted_at: now,
  });
  if (error) throw new Error("שמירת הפרטים נכשלה.");
  return id;
}

/** Returns the signup only while it has no business yet. */
export async function loadPendingSignup(signupId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_customer_accounts")
    .select(ACCOUNT_COLUMNS)
    .eq("id", signupId)
    .is("business_id", null)
    .maybeSingle();
  if (error) throw new Error("איתור ההרשמה נכשל.");
  return data ? toAccount(asRecord(data)) : null;
}

export async function attachBusinessToSignup(signupId: string, businessId: string) {
  const supabase = getServiceSupabase();
  const user = await findAdminUser(businessId);
  const { error } = await supabase
    .from("site_customer_accounts")
    .update({
      business_id: businessId,
      user_id: user?.id ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", signupId);
  if (error) throw new Error("חיבור החשבון לעסק נכשל.");
}

export async function rememberCheckoutDetails(input: {
  businessId: string;
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
}) {
  const phone = normalizeIsraeliMobile(input.phone);
  if (!phone) return;
  const supabase = getServiceSupabase();
  const idNumber = input.idNumber.replace(/\D/g, "");
  const { data, error } = await supabase
    .from("site_customer_accounts")
    .select("id")
    .eq("business_id", input.businessId)
    .maybeSingle();
  if (error || !data?.id) return;
  await supabase
    .from("site_customer_accounts")
    .update({
      full_name: input.fullName.trim() || undefined,
      phone,
      email: input.email.trim().toLowerCase() || null,
      id_number: idNumber.length === 9 ? idNumber : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);
}

export async function markAccountPaid(businessId: string) {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("site_customer_accounts")
      .select("id, paid_at, user_id")
      .eq("business_id", businessId)
      .maybeSingle();
    if (error) {
      console.error("paid account lookup failed", error.message);
      return;
    }

    const user = await findAdminUser(businessId);
    const now = new Date().toISOString();
    if (data?.id) {
      const patch: Record<string, unknown> = { updated_at: now };
      if (!data.paid_at) patch.paid_at = now;
      if (!data.user_id && user) patch.user_id = user.id;
      const { error: updateError } = await supabase
        .from("site_customer_accounts")
        .update(patch)
        .eq("id", data.id);
      if (updateError) console.error("paid account update failed", updateError.message);
      return;
    }

    if (!user) {
      console.error("paid account skipped, admin user missing");
      return;
    }

    const { data: profile } = await supabase
      .from("business_profile")
      .select("display_name, address, branding_client_name, primary_color, created_at")
      .eq("id", businessId)
      .maybeSingle();
    const business = asRecord(profile);
    const businessName =
      String(business.display_name ?? "").trim() || user.name || "עסק";
    const color = String(business.primary_color ?? "");
    const { error: insertError } = await supabase.from("site_customer_accounts").insert({
      phone: user.phone,
      full_name: user.name || businessName,
      business_name: businessName,
      agreement_accepted_at: business.created_at || now,
      paid_at: now,
      business_id: businessId,
      user_id: user.id,
      address: String(business.address ?? "").trim() || null,
      app_name_en: String(business.branding_client_name ?? "").trim() || null,
      brand_color: /^#[0-9A-Fa-f]{6}$/.test(color) ? color : null,
      language: user.language,
    });
    if (insertError) console.error("paid account insert failed", insertError.message);
  } catch (error) {
    console.error("paid account skipped", error);
  }
}
