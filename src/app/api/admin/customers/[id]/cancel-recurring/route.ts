import { cancelSavedPayplusSubscription } from "@/lib/admin/payplus-subscriptions";
import { requireAdminSession } from "@/lib/admin/guard";
import { jsonError, jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const { id } = await context.params;
  try {
    const result = await cancelSavedPayplusSubscription(id, session.phone);
    if (!result.ok) return jsonError(result.error, 400);
    return jsonOk({
      ok: true,
      alreadyCancelled: Boolean(result.alreadyCancelled),
      subscription: result.subscription,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ביטול הוראת הקבע נכשל.";
    return jsonError(message, 500);
  }
}
