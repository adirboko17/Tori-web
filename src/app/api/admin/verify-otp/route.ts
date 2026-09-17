import { verifySiteAdminOtp } from "@/lib/admin/auth";
import {
  readAdminOtpPending,
  writeAdminSession,
} from "@/lib/admin/session";
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
  const pending = await readAdminOtpPending();
  if (!pending) return jsonError("יש לבקש קוד חדש.", 401);
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const code = String(body.code ?? "").replace(/\D/g, "");
  if (code.length !== 6) return jsonError("יש להזין קוד בן 6 ספרות.");
  try {
    const result = await verifySiteAdminOtp({
      phone: pending.phone,
      businessId: pending.businessId,
      code,
    });
    if (!result.ok) return jsonError(result.error, 400);
    await writeAdminSession({
      userId: result.admin.id,
      phone: result.admin.phone,
      name: result.admin.name,
    });
    return jsonOk({ ok: true, phone: result.admin.phone });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "אימות הקוד נכשל.";
    return jsonError(message, 500);
  }
}
