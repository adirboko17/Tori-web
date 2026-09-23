import { fail, guardAdmin, ok } from "@/lib/superadmin/http";
import { sendAsAgent } from "@/lib/whatsapp/actions";
import { dbErrorMessage } from "@/lib/whatsapp/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ phone: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const phone = decodeURIComponent((await context.params).phone);
  if (!/^\d{8,15}$/.test(phone)) return fail("מספר טלפון לא תקין");
  const body = (await request.json().catch(() => ({}))) as { message?: string };
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return fail("חסר טקסט להודעה");
  try {
    const result = await sendAsAgent(phone, message);
    return ok(result);
  } catch (err) {
    return fail(dbErrorMessage(err), 500);
  }
}
