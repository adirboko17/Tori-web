import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import { isValidHexColor } from "@/lib/superadmin/format";
import { BrandingAssetsError, updateBrandingAssets } from "@/lib/superadmin/update-branding-assets";
import { fail, guardAdmin, ok, UUID_RE } from "@/lib/superadmin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

function hasImage(body: Record<string, unknown>) {
  return ["logoBase64", "iconBase64", "splashBase64"].some(
    (key) => typeof body[key] === "string" && String(body[key]).trim() !== "",
  );
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return fail("מזהה עסק לא תקין");
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const primaryColor =
      typeof body.primaryColor === "string" ? body.primaryColor.trim() : "";
    if (primaryColor && !isValidHexColor(primaryColor)) {
      return fail("צבע ראשי לא תקין — נדרש פורמט HEX כמו #1A2B3C");
    }
    if (primaryColor) {
      const { data, error } = await getServiceSupabase()
        .from("business_profile")
        .update({ primary_color: primaryColor })
        .eq("id", id)
        .select("id")
        .maybeSingle();
      if (error) return fail("עדכון הצבע נכשל", 500);
      if (!data) return fail("העסק לא נמצא", 404);
      if (!hasImage(body)) {
        return ok({ uploaded: [], warnings: [], brandingFolder: null, primaryColor });
      }
    }
    const result = await updateBrandingAssets(id, body);
    return ok(primaryColor ? { ...result, primaryColor } : result);
  } catch (error) {
    if (error instanceof BrandingAssetsError) return fail(error.message);
    const message = error instanceof Error ? error.message : "עדכון המיתוג נכשל";
    console.error("[apps/branding]", error);
    return fail(message, 500);
  }
}
