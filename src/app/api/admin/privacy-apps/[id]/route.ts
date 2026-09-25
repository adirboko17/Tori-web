import {
  deletePrivacyPolicyApp,
  updatePrivacyPolicyApp,
} from "@/lib/admin/privacy-apps";
import { requireAdminSession } from "@/lib/admin/guard";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const { id } = await context.params;
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  try {
    const app = await updatePrivacyPolicyApp(
      id,
      String(body.name ?? ""),
      String(body.bundleId ?? body.bundle_id ?? ""),
    );
    return jsonOk({ app });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "עדכון האפליקציה נכשל.";
    const status = message.includes("לא נמצאה")
      ? 404
      : message.includes("כבר מופיע")
        ? 409
        : message.startsWith("צריך להזין")
          ? 400
          : 500;
    return jsonError(message, status);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const { id } = await context.params;
  try {
    await deletePrivacyPolicyApp(id);
    return jsonOk({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "מחיקת האפליקציה נכשלה.";
    const status = message.includes("לא נמצאה") ? 404 : 500;
    return jsonError(message, status);
  }
}
