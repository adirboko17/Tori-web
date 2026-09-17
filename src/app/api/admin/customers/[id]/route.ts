import { loadCustomer } from "@/lib/admin/customers";
import { requireAdminSession } from "@/lib/admin/guard";
import { jsonError, jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const { id } = await context.params;
  try {
    const customer = await loadCustomer(id);
    if (!customer) return jsonError("הלקוח לא נמצא.", 404);
    return jsonOk({ customer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "טעינת הלקוח נכשלה.";
    return jsonError(message, 500);
  }
}
