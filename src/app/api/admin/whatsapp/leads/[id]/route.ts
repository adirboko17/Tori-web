import { fail, guardAdmin, ok } from "@/lib/superadmin/http";
import { dbErrorMessage } from "@/lib/whatsapp/client";
import { deleteLead, updateLead } from "@/lib/whatsapp/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function readId(raw: string) {
  const id = decodeURIComponent(raw);
  if (!id || id.includes("/") || id.includes("..")) return null;
  return id;
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const id = readId((await context.params).id);
  if (!id) return fail("חסר מזהה ליד");
  const body = (await request.json().catch(() => ({}))) as {
    status?: string;
    message_name?: string;
  };
  if (body.status === undefined && body.message_name === undefined) {
    return fail("חסר שדה לעדכון");
  }
  try {
    const lead = await updateLead(id, body);
    return ok({ lead });
  } catch (err) {
    return fail(dbErrorMessage(err), 400);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const id = readId((await context.params).id);
  if (!id) return fail("חסר מזהה ליד");
  try {
    await deleteLead(id);
    return ok({ success: true });
  } catch (err) {
    return fail(dbErrorMessage(err), 500);
  }
}
