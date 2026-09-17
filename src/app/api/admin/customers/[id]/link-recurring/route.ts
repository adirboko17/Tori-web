import { requireAdminSession } from "@/lib/admin/guard";
import { savePayplusSubscription } from "@/lib/admin/payplus-subscriptions";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";
import { payplusTerminalUid } from "@/lib/sms/env";
import { isPayplusUid, viewPayplusRecurring } from "@/lib/sms/payplus";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const recurringUid = String(body.recurringUid ?? body.recurring_uid ?? "").trim();
  if (!isPayplusUid(recurringUid)) {
    return jsonError("צריך להזין מזהה הוראת קבע תקין מ-PayPlus.");
  }
  const { id } = await context.params;
  try {
    const viewed = await viewPayplusRecurring(recurringUid);
    const saved = await savePayplusSubscription({
      businessId: id,
      recurringUid,
      terminalUid: viewed.ok ? viewed.terminalUid : payplusTerminalUid(),
      customerUid: viewed.ok ? viewed.recurring.customerUid : null,
      amountIls: viewed.ok ? viewed.recurring.amount : null,
      nextChargeAt: viewed.ok ? viewed.recurring.nextChargeAt : null,
      lastChargeAt: viewed.ok ? viewed.recurring.lastChargeDate : null,
    });
    if (!saved) return jsonError("חיבור הוראת הקבע נכשל.");
    return jsonOk({
      ok: true,
      verified: viewed.ok,
      subscription: saved,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "חיבור הוראת הקבע נכשל.";
    return jsonError(message, 500);
  }
}
