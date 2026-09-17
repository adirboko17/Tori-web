import { requireAdminSession } from "@/lib/admin/guard";
import { jsonError, jsonOk } from "@/lib/sms/http";
import { listPayplusRecurrings } from "@/lib/sms/payplus";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const search = new URL(request.url).searchParams.get("search") ?? "";
  try {
    const result = await listPayplusRecurrings(search);
    if (!result.ok) return jsonError(result.error, 400);
    return jsonOk({ recurrings: result.recurrings });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "טעינת הוראות הקבע נכשלה.";
    return jsonError(message, 500);
  }
}
