import { parseAccountDeletionInput } from "@/lib/account-deletion-parse";
import { createAccountDeletionRequest } from "@/lib/account-deletions";
import { adminPushEvents, queueAdminPush } from "@/lib/admin/push";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const parsed = parseAccountDeletionInput(body);
  if (!parsed.ok) return jsonError(parsed.error);
  try {
    const created = await createAccountDeletionRequest(parsed.value);
    if (created.id) {
      queueAdminPush(
        adminPushEvents.accountDeletion({
          requestId: created.id,
          fullName: parsed.value.fullName,
          appName: parsed.value.appName,
        }),
      );
    }
    return jsonOk({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "שמירת בקשת המחיקה נכשלה.";
    return jsonError(message, 500);
  }
}
