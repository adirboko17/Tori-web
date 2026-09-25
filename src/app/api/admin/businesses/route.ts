import { listAdminBusinesses } from "@/lib/admin/businesses";
import { requireAdminSession } from "@/lib/admin/guard";
import { jsonError, jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  try {
    return jsonOk({ businesses: await listAdminBusinesses() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "טעינת העסקים נכשלה.";
    return jsonError(message, 500);
  }
}
