import { fail, guardAdmin, ok } from "@/lib/superadmin/http";
import { dbErrorMessage } from "@/lib/whatsapp/client";
import { getConversations } from "@/lib/whatsapp/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  try {
    const conversations = await getConversations();
    return ok({ conversations });
  } catch (err) {
    return fail(dbErrorMessage(err), 500);
  }
}
