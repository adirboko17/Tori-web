import { HelpCenterError, createHelpVideo } from "@/lib/superadmin/help-center";
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
    const video = await createHelpVideo({
      category_id: asString(body.category_id),
      slug: asString(body.slug) || null,
      title: asString(body.title),
      title_i18n: asI18n(body.title_i18n),
      description: asString(body.description) || null,
      description_i18n: asI18n(body.description_i18n),
      video_url: asString(body.video_url),
      storage_path: asString(body.storage_path) || null,
      thumbnail_url: asString(body.thumbnail_url) || null,
      duration_seconds:
        body.duration_seconds == null || body.duration_seconds === ""
          ? null
          : Number(body.duration_seconds),
      sort_order: Number(body.sort_order ?? 0),
      is_published: body.is_published !== false,
    });
    return ok({ video });
  } catch (error) {
    if (error instanceof HelpCenterError) return fail(error.message);
    console.error("[help/videos]", error);
    return fail("יצירת הסרטון נכשלה", 500);
  }
}
