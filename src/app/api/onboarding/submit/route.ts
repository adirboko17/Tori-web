import { getSupabaseUrl } from "@/lib/sms/env";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function text(value: unknown, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

function optionalText(value: unknown, max = 300) {
  const trimmed = text(value, max);
  return trimmed || null;
}

function anonKey() {
  return (
    text(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 2000) ||
    text(process.env.SUPABASE_ANON_KEY, 2000)
  );
}

export async function POST(request: Request) {
  const secret = text(process.env.ONBOARDING_WEBHOOK_SECRET, 500);
  const base = getSupabaseUrl().replace(/\/$/, "");
  const key = anonKey();
  if (!secret || !base || !key) {
    console.error("onboarding webhook is not configured");
    return jsonError("שליחת הפרטים עדיין לא הוגדרה בשרת.", 503);
  }

  const body = await readJsonBody(request);
  const business =
    body?.business && typeof body.business === "object"
      ? (body.business as Record<string, unknown>)
      : null;
  if (!business) return jsonError("בקשה לא תקינה.");

  const id = text(business.id, 80);
  const managerName = text(business.manager_name);
  const phone = text(business.phone, 40);
  const businessNameHe = text(business.business_name_he);
  const appNameEn = text(business.app_name_en, 40);
  if (!UUID_RE.test(id) || !managerName || !phone || !businessNameHe) {
    return jsonError("צריך למלא שם וטלפון.");
  }
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(appNameEn)) {
    return jsonError("שם האפליקציה באנגלית לא תקין.");
  }

  const logoBase64 = text(business.logoBase64, 4_000_000);
  const services = (Array.isArray(body?.services) ? body.services : [])
    .slice(0, 40)
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as Record<string, unknown>;
      const name = text(row.name, 120);
      const price = Number(row.price);
      const duration = Number(row.duration_minutes);
      const sortOrder = Number(row.sort_order);
      if (!name || !Number.isFinite(price) || !Number.isFinite(duration)) return [];
      return [
        {
          name,
          price,
          duration_minutes: duration,
          sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
        },
      ];
    });

  const payload = {
    event: "new_business_onboarded",
    timestamp: new Date().toISOString(),
    data: {
      business: {
        id,
        business_name_he: businessNameHe,
        business_name_en: text(business.business_name_en) || businessNameHe,
        app_name_en: appNameEn,
        address: text(business.address, 800) || "לא צוין",
        manager_name: managerName,
        phone,
        manager_password: text(business.manager_password, 200) || "pending-setup",
        logo_url: optionalText(business.logo_url, 2000),
        logo_url_plain_background: null,
        logo_url_transparent: optionalText(business.logo_url_transparent, 2000),
        manager_photo_url: optionalText(business.manager_photo_url, 2000),
        brand_color: text(business.brand_color, 20) || "#D4A574",
        plan: optionalText(business.plan, 80),
        price: optionalText(business.price, 40),
        commitment: optionalText(business.commitment, 80),
        email: optionalText(business.email, 200),
        ...(logoBase64 ? { logoBase64 } : {}),
      },
      services,
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
    console.error("onboarding-webhook request failed", error);
    return jsonError("לא הצלחנו לשלוח את הפרטים. נסו שוב.", 502);
  }

  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    error?: string;
    businessId?: string;
    duplicate?: boolean;
  } | null;
  if (!response.ok || !data?.ok) {
    console.error("onboarding-webhook failed", response.status, data?.error || "unknown");
    return jsonError("לא הצלחנו לשלוח את הפרטים. נסו שוב.", 502);
  }

  return jsonOk({
    id: data.businessId || id,
    duplicate: Boolean(data.duplicate),
  });
}
