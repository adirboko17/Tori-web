import { requireAdminSession } from "@/lib/admin/guard";
import { loadBadgeCounts } from "@/lib/admin/push";
import { jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  return jsonOk(await loadBadgeCounts());
}
