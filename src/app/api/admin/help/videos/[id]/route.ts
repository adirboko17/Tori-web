import { HelpCenterError, deleteHelpVideo, updateHelpVideo } from "@/lib/superadmin/help-center";
import { fail, guardAdmin, ok, UUID_RE } from "@/lib/superadmin/http";
import type { HelpI18n } from "@/lib/superadmin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asI18n(value: unknown): HelpI18n | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as HelpI18n;
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return fail("מזהה לא תקין");
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const patch: Parameters<typeof updateHelpVideo>[1] = {};
    if (body.category_id !== undefined) patch.category_id = asString(body.category_id) ?? "";
    if (body.slug !== undefined) patch.slug = asString(body.slug) || null;
    if (body.title !== undefined) patch.title = asString(body.title) ?? "";
    if (body.title_i18n !== undefined) patch.title_i18n = asI18n(body.title_i18n);
    if (body.description !== undefined) patch.description = asString(body.description) ?? null;
    if (body.description_i18n !== undefined) patch.description_i18n = asI18n(body.description_i18n);
    if (body.video_url !== undefined) patch.video_url = asString(body.video_url) ?? "";
    if (body.storage_path !== undefined) patch.storage_path = asString(body.storage_path) ?? null;
    if (body.thumbnail_url !== undefined) patch.thumbnail_url = asString(body.thumbnail_url) ?? null;
    if (body.duration_seconds !== undefined) {
      patch.duration_seconds =
        body.duration_seconds == null || body.duration_seconds === ""
          ? null
          : Number(body.duration_seconds);
    }
    if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order);
    if (body.is_published !== undefined) patch.is_published = body.is_published === true;
    return ok({ video: await updateHelpVideo(id, patch) });
  } catch (error) {
    if (error instanceof HelpCenterError) return fail(error.message);
    console.error("[help/videos/id]", error);
    return fail("עדכון הסרטון נכשל", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return fail("מזהה לא תקין");
  try {
    await deleteHelpVideo(id);
    return ok();
  } catch (error) {
    if (error instanceof HelpCenterError) return fail(error.message);
    console.error("[help/videos/delete]", error);
    return fail("מחיקת הסרטון נכשלה", 500);
  }
}
