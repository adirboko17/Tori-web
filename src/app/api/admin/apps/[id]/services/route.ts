import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import { fail, guardAdmin, ok, UUID_RE } from "@/lib/superadmin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const NAME_MAX = 255;
const PRICE_MAX = 100_000;
const DURATION_MAX = 24 * 60;

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return fail("מזהה עסק לא תקין");

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = str(body.name);
  const price = Number(body.price);
  const duration = Number(body.durationMinutes);

  if (!name) return fail("יש להזין שם שירות");
  if (name.length > NAME_MAX) return fail("שם השירות ארוך מדי");
  if (!Number.isFinite(price) || price < 0 || price > PRICE_MAX) {
    return fail("יש להזין מחיר בין 0 ל-100,000");
  }
  if (!Number.isInteger(duration) || duration < 5 || duration > DURATION_MAX) {
    return fail("משך השירות צריך להיות בין 5 דקות ליממה");
  }

  const db = getServiceSupabase();

  const { data: profile, error: profileError } = await db
    .from("business_profile")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (profileError) return fail("טעינת העסק נכשלה", 500);
  if (!profile) return fail("העסק לא נמצא", 404);

  const { data: admin } = await db
    .from("users")
    .select("id")
    .eq("business_id", id)
    .eq("user_type", "admin")
    .order("created_at")
    .limit(1)
    .maybeSingle();

  const { data: last } = await db
    .from("services")
    .select("order_index")
    .eq("business_id", id)
    .order("order_index", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  const orderIndex = Math.max(0, Number(last?.order_index) || 0) + 1;

  const { data: created, error } = await db
    .from("services")
    .insert({
      name,
      price,
      duration_minutes: duration,
      is_active: true,
      business_id: id,
      worker_id: admin?.id ?? null,
      order_index: orderIndex,
    })
    .select("id, name, price, duration_minutes, is_active")
    .single();

  if (error || !created) {
    console.error("[apps/services]", error?.message);
    return fail("הוספת השירות נכשלה", 500);
  }

  return ok({ service: created });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return fail("מזהה עסק לא תקין");

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const serviceId = str(body.serviceId);
  if (!serviceId) return fail("חסר מזהה שירות");

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = str(body.name);
    if (!name) return fail("יש להזין שם שירות");
    if (name.length > NAME_MAX) return fail("שם השירות ארוך מדי");
    patch.name = name;
  }
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0 || price > PRICE_MAX) {
      return fail("יש להזין מחיר בין 0 ל-100,000");
    }
    patch.price = price;
  }
  if (body.durationMinutes !== undefined) {
    const duration = Number(body.durationMinutes);
    if (!Number.isInteger(duration) || duration < 5 || duration > DURATION_MAX) {
      return fail("משך השירות צריך להיות בין 5 דקות ליממה");
    }
    patch.duration_minutes = duration;
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") return fail("ערך הפעלה לא תקין");
    patch.is_active = body.isActive;
  }
  if (body.orderIndex !== undefined) {
    const orderIndex = Number(body.orderIndex);
    if (!Number.isInteger(orderIndex) || orderIndex < 0 || orderIndex > 100_000) {
      return fail("סדר השירות לא תקין");
    }
    patch.order_index = orderIndex;
  }
  if (Object.keys(patch).length === 0) return fail("אין שינויים לשמירה");

  const { data: updated, error } = await getServiceSupabase()
    .from("services")
    .update(patch)
    .eq("id", serviceId)
    .eq("business_id", id)
    .select("id, name, price, duration_minutes, is_active, order_index")
    .maybeSingle();
  if (error) {
    console.error("[apps/services] update", error.message);
    return fail("עדכון השירות נכשל", 500);
  }
  if (!updated) return fail("השירות לא נמצא", 404);
  return ok({ service: updated });
}
