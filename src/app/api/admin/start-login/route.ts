import { LOGIN_UNAVAILABLE } from "@/lib/admin/access-code";
import { startMobileAccessLogin } from "@/lib/admin/mobile-login";
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
  if (!body || body.client !== "mobile") return jsonError("בקשה לא תקינה.");
  try {
    const result = await startMobileAccessLogin(String(body.phone ?? ""));
    if (!result.ok) return jsonError(result.error, result.status);
    return jsonOk({ ok: true, phone: result.phone, otpToken: result.otpToken });
  } catch {
    return jsonError(LOGIN_UNAVAILABLE, 500);
  }
}
