import {
  entryForAccounts,
  paidAccounts,
  payableAccounts,
} from "@/lib/account/profile";
import { loadSignupSenderBusinessId } from "@/lib/account/otp-sender";
import { writeOtpPending, type OtpPurpose } from "@/lib/account/phone-ticket";
import { listAccountsByPhone, type CustomerAccount } from "@/lib/account/store";
import {
  CONFIG_ERRORS,
  sessionSigningConfigured,
  smsBackendConfigured,
} from "@/lib/sms/env";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";
import { sendLoginOtp, sendRegisterOtp } from "@/lib/sms/otp";

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

  const businessId =
    typeof body.businessId === "string" ? body.businessId.trim() : "";

  try {
    const found = await listAccountsByPhone(String(body.phone ?? ""));
    if (!found.ok) return jsonError(found.error);

    const flow = entryForAccounts(found.accounts);
    if (flow === "login" || flow === "pay") {
      const pool =
        flow === "login" ? paidAccounts(found.accounts) : payableAccounts(found.accounts);
      if (pool.length > 1 && !businessId) {
        return jsonOk({
          needsBusiness: true,
          flow,
          businesses: pool.map((account) => ({
            id: account.businessId,
            name: account.businessName,
          })),
        });
      }
      const account = pickAccount(pool, businessId);
      if (!account?.businessId) {
        return jsonError("העסק שנבחר אינו משויך למספר זה.");
      }
      const { sent, senderId, purpose } = await sendPlatformOtp(found.phone);
      if (!sent.ok) {
        return jsonError(sent.message, 400, sent.code ? { code: sent.code } : undefined);
      }
      await writeOtpPending({
        phone: found.phone,
        businessId: account.businessId,
        senderId,
        purpose,
        flow,
      });
      return jsonOk({ ok: true, phone: found.phone, flow });
    }

    const { sent, senderId, purpose } = await sendPlatformOtp(found.phone);
    if (!sent.ok) {
      return jsonError(sent.message, 400, sent.code ? { code: sent.code } : undefined);
    }
    await writeOtpPending({
      phone: found.phone,
      businessId: senderId,
      senderId,
      purpose,
      flow: "signup",
    });
    return jsonOk({ ok: true, phone: found.phone, flow: "signup" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "שליחת הקוד נכשלה.";
    return jsonError(message, 500);
  }
}

/**
 * Website codes always go out from the platform sender. A customer's own business
 * may not have a working SMS sender yet, right after payment.
 */
async function sendPlatformOtp(phone: string) {
  const senderId = await loadSignupSenderBusinessId();
  let sent = await sendRegisterOtp(senderId, phone);
  let purpose: OtpPurpose = "register";
  if (!sent.ok && sent.code === "phone_registered") {
    sent = await sendLoginOtp(senderId, phone);
    purpose = "login";
  }
  return { sent, senderId, purpose };
}

function pickAccount(accounts: CustomerAccount[], businessId: string) {
  if (businessId) return accounts.find((row) => row.businessId === businessId);
  return accounts[0];
}
