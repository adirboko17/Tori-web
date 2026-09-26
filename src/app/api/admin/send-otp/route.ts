import { sendSiteAdminOtp } from "@/lib/admin/auth";
import { writeAdminOtpPending } from "@/lib/admin/session";
import {
  CONFIG_ERRORS,
  sessionSigningConfigured,
  smsBackendConfigured,
} from "@/lib/sms/env";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!smsBackendConfigured()) return jsonError(CONFIG_ERRORS.backend, 503);
  if (!sessionSigningConfigured()) return jsonError(CONFIG_ERRORS.session, 503);
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  try {
    const result = await sendSiteAdminOtp(String(body.phone ?? ""));
    if (!result.ok) return jsonError(result.error, 400);
    const { token } = await writeAdminOtpPending({
      phone: result.phone,
      businessId: result.businessId,
    });
    if (body.client === "mobile") {
      return jsonOk({ ok: true, phone: result.phone, otpToken: token });
    }
    return jsonOk({ ok: true, phone: result.phone });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "שליחת הקוד נכשלה.";
    return jsonError(message, 500);
  }
}
