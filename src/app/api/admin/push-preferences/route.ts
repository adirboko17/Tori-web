import { requireAdminSession } from "@/lib/admin/guard";
import {
  ADMIN_PUSH_TYPE_LABELS,
  ADMIN_PUSH_TYPES,
  loadPushPreferences,
  parsePreferencesInput,
  savePushPreferences,
} from "@/lib/admin/push";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const catalog = ADMIN_PUSH_TYPES.map((type) => ({
  type,
  label: ADMIN_PUSH_TYPE_LABELS[type],
}));

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  try {
    const preferences = await loadPushPreferences(session.userId);
    return jsonOk({ preferences, catalog });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "הטעינה נכשלה.", 500);
  }
}

export async function PUT(request: Request) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const parsed = parsePreferencesInput(body);
  if (!parsed.ok) return jsonError(parsed.error);
  try {
    const preferences = await savePushPreferences(session.userId, parsed.value);
    return jsonOk({ preferences, catalog });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "השמירה נכשלה.", 500);
  }
}
