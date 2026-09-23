import { fail, guardAdmin, ok } from "@/lib/superadmin/http";
import { sendFirstLeadMessage } from "@/lib/whatsapp/actions";
import { dbErrorMessage } from "@/lib/whatsapp/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const id = decodeURIComponent((await context.params).id);
  if (!id || id.includes("/") || id.includes("..")) return fail("חסר מזהה ליד");
  try {
    const result = await sendFirstLeadMessage(id);
    return ok(result);
  } catch (err) {
    const message = dbErrorMessage(err);
    const status = message.includes("לא נמצא") ? 404 : 400;
    return fail(message, status);
  }
}
