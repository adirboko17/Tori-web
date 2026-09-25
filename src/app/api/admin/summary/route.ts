import { requireAdminSession } from "@/lib/admin/guard";
import { loadAdminSummary } from "@/lib/admin/summary";
import { jsonError, jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  try {
    return jsonOk({ summary: await loadAdminSummary() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "טעינת לוח הבקרה נכשלה.";
    return jsonError(message, 500);
  }
}
