import { fail, guardAdmin, ok } from "@/lib/superadmin/http";
import { handback } from "@/lib/whatsapp/actions";
import { dbErrorMessage } from "@/lib/whatsapp/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ phone: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const phone = decodeURIComponent((await context.params).phone);
  if (!/^\d{8,15}$/.test(phone)) return fail("מספר טלפון לא תקין");
  try {
    await handback(phone);
    return ok({ success: true });
  } catch (err) {
    return fail(dbErrorMessage(err), 500);
  }
}
