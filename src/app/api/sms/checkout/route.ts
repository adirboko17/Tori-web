import { assertStillAdmin } from "@/lib/sms/admins";
import { CONFIG_ERRORS, payplusConfigured } from "@/lib/sms/env";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";
import {
  attachPayplusLink,
  createPendingOrder,
  markOrderFailed,
} from "@/lib/sms/orders";
import { getSmsPackage, isSmsPackageId } from "@/lib/sms/packages";
import { generatePayplusLink } from "@/lib/sms/payplus";
import { readSmsSession } from "@/lib/sms/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await readSmsSession();
  if (!session) {
    return jsonError("יש להתחבר מחדש.", 401);
  }

  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const packageId = body.packageId;
  if (!isSmsPackageId(packageId)) {
    return jsonError("חבילה לא מוכרת.");
  }
  const pack = getSmsPackage(packageId);
  if (!pack) return jsonError("חבילה לא מוכרת.");

  if (!payplusConfigured()) {
    return jsonError(CONFIG_ERRORS.payplus, 503);
  }

  try {
    const admin = await assertStillAdmin(
      session.userId,
      session.businessId,
      session.phone,
    );
    if (!admin) {
      return jsonError("המספר לא מזוהה כמנהל עסק במערכת תורי.", 403);
    }

    const orderId = await createPendingOrder(session, pack);
    const link = await generatePayplusLink({
      orderId,
      businessId: session.businessId,
      pack,
      customer: {
        customer_name: session.businessName || session.name || "מנהל עסק",
        phone: session.phone,
      },
      request,
    });

    if (!link.ok) {
      await markOrderFailed(orderId, link.message);
      return jsonError(link.message, 502);
    }

    await attachPayplusLink(orderId, link.link, link.pageRequestUid);
    return jsonOk({ ok: true, url: link.link, orderId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "יצירת התשלום נכשלה.";
    return jsonError(message, 500);
  }
}
