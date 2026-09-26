import { requireAdminSession } from "@/lib/admin/guard";
import { deletePushToken, parsePushTokenInput, savePushToken } from "@/lib/admin/push";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const parsed = parsePushTokenInput(body);
  if (!parsed.ok) return jsonError(parsed.error);
  try {
    await savePushToken(session.userId, parsed.value);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "השמירה נכשלה.", 500);
  }
}

export async function DELETE(request: Request) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const body = (await readJsonBody(request)) ?? {};
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
  if (!token && !deviceId) return jsonError("חסר מזהה מכשיר.");
  try {
    await deletePushToken(session.userId, { token, deviceId });
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "ההסרה נכשלה.", 500);
  }
}
