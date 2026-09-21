import { isHelpAudience } from "@/lib/superadmin/help-shared";
import { HelpCenterError, createHelpCategory } from "@/lib/superadmin/help-center";
import { fail, guardAdmin, ok } from "@/lib/superadmin/http";
import type { HelpI18n } from "@/lib/superadmin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asI18n(value: unknown): HelpI18n | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as HelpI18n;
}

export async function POST(request: Request) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const audience = asString(body.audience).trim();
    const category = await createHelpCategory({
      slug: asString(body.slug),
      title: asString(body.title),
      title_i18n: asI18n(body.title_i18n),
      description: asString(body.description) || null,
      description_i18n: asI18n(body.description_i18n),
      icon: asString(body.icon) || null,
      sort_order: Number(body.sort_order ?? 0),
      is_published: body.is_published !== false,
      audience: isHelpAudience(audience) ? audience : "admin",
    });
    return ok({ category });
  } catch (error) {
    if (error instanceof HelpCenterError) return fail(error.message);
    console.error("[help/categories]", error);
    return fail("יצירת הקטגוריה נכשלה", 500);
  }
}
