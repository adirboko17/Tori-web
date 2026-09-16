import { findAdminBusinesses } from "@/lib/sms/admins";
import {
  CONFIG_ERRORS,
  sessionSigningConfigured,
  smsBackendConfigured,
} from "@/lib/sms/env";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";
import { verifyLoginOtp } from "@/lib/sms/otp";
import { writeSmsSession } from "@/lib/sms/session";
import { shopPayload } from "@/lib/sms/shop";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!smsBackendConfigured()) {
    return jsonError(CONFIG_ERRORS.backend, 503);
  }
  if (!sessionSigningConfigured()) {
    return jsonError(CONFIG_ERRORS.session, 503);
  }

  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");

  const phone = String(body.phone ?? "");
  const businessId = String(body.businessId ?? "").trim();
  const code = String(body.code ?? "").replace(/\D/g, "");

  if (!businessId) return jsonError("יש לבחור עסק.");
  if (code.length !== 6) return jsonError("יש להזין קוד בן 6 ספרות.");

  try {
    const found = await findAdminBusinesses(phone);
    if (!found.ok) return jsonError(found.error);
    const admin = found.admins.find((row) => row.businessId === businessId);
    if (!admin) {
      return jsonError("המספר לא מזוהה כמנהל עסק במערכת תורי.", 403);
    }

    const verified = await verifyLoginOtp(admin.businessId, found.phone, code);
    if (!verified.ok) {
      return jsonError(
        verified.message,
        400,
        verified.code ? { code: verified.code } : undefined,
      );
    }

    const confirmed = await findAdminBusinesses(found.phone);
    if (!confirmed.ok) return jsonError(confirmed.error);
    const stillAdmin = confirmed.admins.find(
      (row) =>
        row.userId === admin.userId && row.businessId === admin.businessId,
    );
    if (!stillAdmin) {
      return jsonError("המספר לא מזוהה כמנהל עסק במערכת תורי.", 403);
    }

    const session = await writeSmsSession({
      userId: stillAdmin.userId,
      businessId: stillAdmin.businessId,
      phone: stillAdmin.phone,
      name: stillAdmin.name,
      businessName: stillAdmin.businessName,
    });

    return jsonOk({
      ok: true,
      ...(await shopPayload(session)),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "אימות הקוד נכשל.";
    return jsonError(message, 500);
  }
}
