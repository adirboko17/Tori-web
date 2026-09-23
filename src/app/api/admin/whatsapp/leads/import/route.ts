import { fail, guardAdmin, ok } from "@/lib/superadmin/http";
import { importLeadFile } from "@/lib/whatsapp/actions";
import { dbErrorMessage } from "@/lib/whatsapp/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return fail("חסר קובץ Excel (שדה file)");
  const sendOpening = form.get("sendOpening") === "true";
  const businessType = String(form.get("businessType") || "סלון ציפורניים");
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await importLeadFile(buffer, businessType, sendOpening);
    return ok({ success: true, ...result });
  } catch (err) {
    return fail(dbErrorMessage(err), 400);
  }
}
