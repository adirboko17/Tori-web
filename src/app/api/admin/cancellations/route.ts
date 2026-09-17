import {
  countOpenCancellations,
  isCancellationStatus,
  listCancellationRequests,
} from "@/lib/admin/cancellations";
import { requireAdminSession } from "@/lib/admin/guard";
import {
  enrichPayplusSubscriptionsWithLive,
  loadPayplusSubscriptionsByBusiness,
} from "@/lib/admin/payplus-subscriptions";
import { jsonError, jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const status = new URL(request.url).searchParams.get("status");
  if (status && !isCancellationStatus(status)) {
    return jsonError("סטטוס הביטול אינו תקין.");
  }
  try {
    const [requests, openCount] = await Promise.all([
      listCancellationRequests(status && isCancellationStatus(status) ? status : undefined),
      countOpenCancellations(),
    ]);
    const subscriptions = await enrichPayplusSubscriptionsWithLive(
      await loadPayplusSubscriptionsByBusiness(
        requests.map((row) => row.businessId),
      ),
    );
    return jsonOk({
      openCount,
      requests: requests.map((row) => ({
        ...row,
        payplusSubscription: subscriptions.get(row.businessId) ?? null,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "טעינת בקשות הביטול נכשלה.";
    return jsonError(message, 500);
  }
}
