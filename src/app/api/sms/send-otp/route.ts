import {
  findAdminBusinesses,
  unknownAdminMessage,
} from "@/lib/sms/admins";
import { CONFIG_ERRORS, smsBackendConfigured } from "@/lib/sms/env";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";
import { sendLoginOtp } from "@/lib/sms/otp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!smsBackendConfigured()) {
    return jsonError(CONFIG_ERRORS.backend, 503);
  }

  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");

  const phone = String(body.phone ?? "");
  const businessId =
    typeof body.businessId === "string" ? body.businessId.trim() : "";

  try {
    const found = await findAdminBusinesses(phone);
    if (!found.ok) return jsonError(found.error);
    if (found.admins.length === 0) {
      return jsonError(unknownAdminMessage(), 404);
    }

    if (found.admins.length > 1 && !businessId) {
      return jsonOk({
        needsBusiness: true,
        businesses: found.admins.map((admin) => ({
          id: admin.businessId,
          name: admin.businessName,
        })),
      });
    }

    const admin = businessId
      ? found.admins.find((row) => row.businessId === businessId)
      : found.admins[0];
    if (!admin) {
      return jsonError("העסק שנבחר אינו משויך למספר זה.");
    }

    const sent = await sendLoginOtp(admin.businessId, found.phone);
    if (!sent.ok) {
      return jsonError(sent.message, 400, sent.code ? { code: sent.code } : undefined);
    }

    return jsonOk({
      ok: true,
      phone: found.phone,
      businessId: admin.businessId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : CONFIG_ERRORS.backend;
    return jsonError(message, 500);
  }
}
