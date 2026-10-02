import { validateAccountProfile } from "@/lib/account/profile";
import { clearAccountSession, readAccountSession } from "@/lib/account/session";
import { loadPortal, savePortal } from "@/lib/account/store";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = await readAccountSession();
  if (!session) return jsonError("צריך להתחבר מחדש.", 401);

  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const draft = validateAccountProfile(body);
  if (!draft.ok) return jsonError(draft.error);

  try {
    const portal = await loadPortal(session.accountId, session.userId);
    if (!portal || portal.businessId !== session.businessId) {
      await clearAccountSession();
      return jsonError("צריך להתחבר מחדש.", 401);
    }
    const saved = await savePortal(portal, draft.value);
    if (!saved.ok) return jsonError(saved.error);
    return jsonOk({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "שמירת הפרטים נכשלה.";
    return jsonError(message, 500);
  }
}
