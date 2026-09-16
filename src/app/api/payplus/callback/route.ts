import { jsonError, jsonOk } from "@/lib/sms/http";
import { fulfillPaidOrder, loadOrder, markOrderFailed } from "@/lib/sms/orders";
import {
  amountsMatch,
  isPayplusUserAgent,
  isSuccessfulPayplusStatus,
  parsePayplusCallback,
  verifyPayplusHash,
} from "@/lib/sms/payplus";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const userAgent = request.headers.get("user-agent");
  if (!isPayplusUserAgent(userAgent)) {
    return jsonError("unauthorized", 401);
  }

  const secret = (process.env.PAYPLUS_SECRET_KEY ?? "").trim();
  const hash = request.headers.get("hash");
  if (!secret || !verifyPayplusHash(rawBody, hash, secret)) {
    return jsonError("unauthorized", 401);
  }

  let parsed: ReturnType<typeof parsePayplusCallback>;
  try {
    parsed = parsePayplusCallback(rawBody);
  } catch {
    return jsonError("invalid payload", 400);
  }

  if (!parsed.moreInfo) {
    return jsonError("missing order", 400);
  }

  const order = await loadOrder(parsed.moreInfo);
  if (!order) {
    return jsonError("order not found", 404);
  }

  if (!isSuccessfulPayplusStatus(parsed.statusCode)) {
    await markOrderFailed(
      order.id,
      `PayPlus status ${parsed.statusCode || "unknown"}`,
    );
    return jsonOk({ ok: true, ignored: true });
  }

  if (!Number.isFinite(parsed.amount) || !amountsMatch(parsed.amount, Number(order.amount_ils))) {
    await markOrderFailed(order.id, "סכום התשלום אינו תואם להזמנה.");
    return jsonError("amount mismatch", 409);
  }

  try {
    const result = await fulfillPaidOrder({
      orderId: order.id,
      transactionUid: parsed.uid,
    });
    if (!result.ok) {
      return jsonError(result.message, 502);
    }
    return jsonOk({ ok: true, idempotent: result.idempotent ?? false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "fulfillment failed";
    return jsonError(message, 500);
  }
}
