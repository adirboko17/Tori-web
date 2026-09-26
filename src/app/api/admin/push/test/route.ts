import { requireAdminSession } from "@/lib/admin/guard";
import { sendTestPush } from "@/lib/admin/push";
import { jsonError, jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  try {
    const result = await sendTestPush(session.userId);
    if (result.devices === 0) {
      return jsonError("אין מכשיר רשום להתראות. יש לאשר התראות באפליקציה.", 404);
    }
    return jsonOk({ ok: true, ...result });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "השליחה נכשלה.", 500);
  }
}
