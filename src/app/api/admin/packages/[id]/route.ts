import { deleteSmsPackage, updateSmsPackage } from "@/lib/admin/catalog";
import { requireAdminSession } from "@/lib/admin/guard";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const { id } = await context.params;
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const patch: Parameters<typeof updateSmsPackage>[1] = {};
  if (body.packageKey != null) patch.packageKey = String(body.packageKey).trim();
  if (body.smsCredits != null) {
    const smsCredits = Number(body.smsCredits);
    if (!Number.isInteger(smsCredits) || smsCredits <= 0) {
      return jsonError("צריך להזין כמות הודעות חיובית.");
    }
    patch.smsCredits = smsCredits;
  }
  if (body.amountIls != null) {
    const amountIls = Number(body.amountIls);
    if (!Number.isFinite(amountIls) || amountIls < 0) {
      return jsonError("צריך להזין מחיר תקין.");
    }
    patch.amountIls = amountIls;
  }
  if (body.label != null) {
    const label = String(body.label).trim();
    if (!label) return jsonError("צריך להזין שם לחבילה.");
    patch.label = label;
  }
  if (body.featured != null) patch.featured = Boolean(body.featured);
  if (body.sortOrder != null) patch.sortOrder = Number(body.sortOrder);
  if (body.isActive != null) patch.isActive = Boolean(body.isActive);
  try {
    const pack = await updateSmsPackage(id, patch);
    return jsonOk({ package: pack });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "עדכון החבילה נכשל.";
    return jsonError(message, 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const { id } = await context.params;
  try {
    await deleteSmsPackage(id);
    return jsonOk({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "מחיקת החבילה נכשלה.";
    return jsonError(message, 500);
  }
}
