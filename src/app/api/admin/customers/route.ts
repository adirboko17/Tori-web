import { listCustomers } from "@/lib/admin/customers";
import { requireAdminSession } from "@/lib/admin/guard";
import { jsonError, jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  try {
    return jsonOk({ customers: await listCustomers() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "טעינת הלקוחות נכשלה.";
    return jsonError(message, 500);
  }
}
