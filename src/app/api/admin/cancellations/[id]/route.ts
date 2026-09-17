import {
  isCancellationStatus,
  updateCancellationRequest,
} from "@/lib/admin/cancellations";
import { requireAdminSession } from "@/lib/admin/guard";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const status = String(body.status ?? "");
  if (!isCancellationStatus(status)) {
    return jsonError("סטטוס הביטול אינו תקין.");
  }
  const { id } = await context.params;
  try {
    const result = await updateCancellationRequest(id, status, session.phone);
    if (!result.ok) return jsonError(result.error, 400);
    return jsonOk({ request: result.request });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "עדכון בקשת הביטול נכשל.";
    return jsonError(message, 500);
  }
}
