import { jsonError, jsonOk } from "@/lib/sms/http";
import {
  fulfillPaidOrder,
  loadOrder,
  markOrderFailed,
} from "@/lib/sms/orders";
import {
  amountsMatch,
  isConfirmedPayplusPayment,
  isPayplusUserAgent,
  isSuccessfulPayplusStatus,
  lookupPayplusPayment,
  parsePayplusCallback,
  verifyPayplusHash,
} from "@/lib/sms/payplus";

export const runtime = "nodejs";

function firstHeader(request: Request, name: string) {
  return request.headers.get(name);
}

async function handleCallback(request: Request) {
  const rawBody = request.method === "GET" ? "" : await request.text();
  const url = new URL(request.url);
  const userAgent = firstHeader(request, "user-agent");
  const hash =
    firstHeader(request, "hash") || url.searchParams.get("hash");

  let parsed: {
    uid: string;
    statusCode: string;
    amount: number;
    moreInfo: string;
  } | null = null;

  if (rawBody) {
    try {
      parsed = parsePayplusCallback(rawBody);
    } catch {
      parsed = null;
    }
  }
  if (!parsed) {
    parsed = {
      uid: url.searchParams.get("transaction_uid") || url.searchParams.get("uid") || "",
      statusCode: url.searchParams.get("status_code") || "",
      amount: Number(url.searchParams.get("amount")),
      moreInfo:
        url.searchParams.get("more_info") ||
        url.searchParams.get("moreInfo") ||
        "",
    };
  }

  const signed =
    Boolean(rawBody) &&
    isPayplusUserAgent(userAgent) &&
    verifyPayplusHash(rawBody, hash, (process.env.PAYPLUS_SECRET_KEY ?? "").trim());

  const orderId = parsed.moreInfo.trim();
  if (signed && orderId && isSuccessfulPayplusStatus(parsed.statusCode)) {
    const order = await loadOrder(orderId);
    if (!order) return jsonError("order not found", 404);
    if (
      !Number.isFinite(parsed.amount) ||
      !amountsMatch(parsed.amount, Number(order.amount_ils))
    ) {
      await markOrderFailed(order.id, "סכום התשלום אינו תואם להזמנה.");
      return jsonError("amount mismatch", 409);
    }
    const result = await fulfillPaidOrder({
      orderId: order.id,
      transactionUid: parsed.uid,
    });
    if (!result.ok) return jsonError(result.message, 502);
    return jsonOk({ ok: true, idempotent: result.idempotent ?? false });
  }

  if (signed && orderId && !isSuccessfulPayplusStatus(parsed.statusCode)) {
    await markOrderFailed(
      orderId,
      `PayPlus status ${parsed.statusCode || "unknown"}`,
    );
    return jsonOk({ ok: true, ignored: true });
  }

  const payment = await lookupPayplusPayment({
    moreInfo: orderId || undefined,
    transactionUid: parsed.uid || undefined,
    paymentRequestUid:
      url.searchParams.get("page_request_uid") ||
      url.searchParams.get("payment_request_uid") ||
      undefined,
  });

  if (payment?.moreInfo) {
    const order = await loadOrder(payment.moreInfo);
    if (order && isConfirmedPayplusPayment(payment, Number(order.amount_ils))) {
      const result = await fulfillPaidOrder({
        orderId: order.id,
        transactionUid: payment.uid,
      });
      if (!result.ok) return jsonError(result.message, 502);
      return jsonOk({ ok: true, via: "ipn" });
    }
  }

  console.error("payplus callback not fulfilled", {
    method: request.method,
    signed,
    hasOrderId: Boolean(orderId),
    statusCode: parsed.statusCode,
    agent: userAgent,
  });
  return jsonOk({ ok: false, ignored: true });
}

export async function POST(request: Request) {
  return handleCallback(request);
}

export async function GET(request: Request) {
  return handleCallback(request);
}
