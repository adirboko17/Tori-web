import { requireAdminSession } from "@/lib/admin/guard";
import {
  parseOperationalMessageActive,
  parseOperationalMessageInput,
} from "@/lib/admin/operational-message-parse";
import {
  setOperationalMessageActive,
  updateOperationalMessage,
} from "@/lib/admin/operational-messages";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return jsonError("מזהה ההודעה אינו תקין.");
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const editing =
    body.title != null || body.audience != null || body.businessIds != null;
  if (editing) {
    const parsed = parseOperationalMessageInput(body);
    if (!parsed.ok) return jsonError(parsed.error);
    try {
      const message = await updateOperationalMessage(id, parsed.value);
      if (!message) return jsonError("ההודעה לא נמצאה.", 404);
      return jsonOk({ message });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "עדכון ההודעה נכשל.";
      return jsonError(message, 500);
    }
  }
  const parsed = parseOperationalMessageActive(body);
  if (!parsed.ok) return jsonError(parsed.error);
  try {
    const message = await setOperationalMessageActive(id, parsed.active);
    if (!message) return jsonError("ההודעה לא נמצאה.", 404);
    return jsonOk({ message });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "עדכון ההודעה נכשל.";
    return jsonError(message, 500);
  }
}
