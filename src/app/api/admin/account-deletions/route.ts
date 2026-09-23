import { listAccountDeletionRequests } from "@/lib/account-deletions";
import { requireAdminSession } from "@/lib/admin/guard";
import { jsonError, jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  try {
    const requests = await listAccountDeletionRequests();
    return jsonOk({ requests });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "טעינת בקשות המחיקה נכשלה.";
    return jsonError(message, 500);
  }
}
