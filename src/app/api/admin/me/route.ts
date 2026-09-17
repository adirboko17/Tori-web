import { requireAdminSession } from "@/lib/admin/guard";
import { jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  return jsonOk({ phone: session.phone, name: session.name });
}
