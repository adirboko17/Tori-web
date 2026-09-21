import { HelpCenterError, createHelpUploadUrl } from "@/lib/superadmin/help-center";
import { fail, guardAdmin, ok } from "@/lib/superadmin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as { path?: unknown; upsert?: unknown };
    const path = typeof body.path === "string" ? body.path : "";
    const upload = await createHelpUploadUrl(path, body.upsert !== false);
    return ok(upload);
  } catch (error) {
    if (error instanceof HelpCenterError) return fail(error.message);
    console.error("[help/upload-url]", error);
    return fail("הכנת ההעלאה נכשלה", 500);
  }
}
