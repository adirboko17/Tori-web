import { isHelpAudience } from "@/lib/superadmin/help-shared";
import { HelpCenterError, deleteHelpCategory, updateHelpCategory } from "@/lib/superadmin/help-center";
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
    const patch: Parameters<typeof updateHelpCategory>[1] = {};
    if (body.slug !== undefined) patch.slug = asString(body.slug) ?? "";
    if (body.title !== undefined) patch.title = asString(body.title) ?? "";
    if (body.title_i18n !== undefined) patch.title_i18n = asI18n(body.title_i18n);
    if (body.description !== undefined) patch.description = asString(body.description) ?? null;
    if (body.description_i18n !== undefined) patch.description_i18n = asI18n(body.description_i18n);
    if (body.icon !== undefined) patch.icon = asString(body.icon) ?? null;
    if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order);
    if (body.is_published !== undefined) patch.is_published = body.is_published === true;
    if (body.audience !== undefined && isHelpAudience(body.audience)) patch.audience = body.audience;
    return ok({ category: await updateHelpCategory(id, patch) });
  } catch (error) {
    if (error instanceof HelpCenterError) return fail(error.message);
    console.error("[help/categories/id]", error);
    return fail("עדכון הקטגוריה נכשל", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return fail("מזהה לא תקין");
  try {
    await deleteHelpCategory(id);
    return ok();
  } catch (error) {
    if (error instanceof HelpCenterError) return fail(error.message);
    console.error("[help/categories/delete]", error);
    return fail("מחיקת הקטגוריה נכשלה", 500);
  }
}
