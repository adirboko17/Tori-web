import { fail, guardAdmin, ok } from "@/lib/superadmin/http";
import { dbErrorMessage } from "@/lib/whatsapp/client";
import { deleteConversation, getMessages } from "@/lib/whatsapp/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ phone: string }> };

function readPhone(raw: string) {
  const phone = decodeURIComponent(raw);
  if (!/^\d{8,15}$/.test(phone)) return null;
  return phone;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const phone = readPhone((await context.params).phone);
  if (!phone) return fail("מספר טלפון לא תקין");
  try {
    const messages = await getMessages(phone);
    return ok({ messages });
  } catch (err) {
    return fail(dbErrorMessage(err), 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const phone = readPhone((await context.params).phone);
  if (!phone) return fail("מספר טלפון לא תקין");
  try {
    await deleteConversation(phone);
    return ok({ success: true });
  } catch (err) {
    return fail(dbErrorMessage(err), 500);
  }
}
