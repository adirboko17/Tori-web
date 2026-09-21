import { BrandingAssetsError, updateBrandingAssets } from "@/lib/superadmin/update-branding-assets";
import { fail, guardAdmin, ok, UUID_RE } from "@/lib/superadmin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return fail("מזהה עסק לא תקין");
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await updateBrandingAssets(id, body);
    return ok(result);
  } catch (error) {
    if (error instanceof BrandingAssetsError) return fail(error.message);
    const message = error instanceof Error ? error.message : "עדכון המיתוג נכשל";
    console.error("[apps/branding]", error);
    return fail(message, 500);
  }
}
