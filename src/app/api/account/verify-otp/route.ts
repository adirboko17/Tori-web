import { writeAccountSession } from "@/lib/account/session";
import { startSubscriptionCheckout } from "@/lib/account/start-checkout";
import { paidAccounts, payableAccounts } from "@/lib/account/profile";
import {
  clearOtpPending,
  readOtpPending,
  writeSignupPhone,
} from "@/lib/account/phone-ticket";
import { listAccountsByPhone } from "@/lib/account/store";
import {
  CONFIG_ERRORS,
  sessionSigningConfigured,
  smsBackendConfigured,
} from "@/lib/sms/env";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";
import { verifyLoginOtp, verifyRegisterOtp } from "@/lib/sms/otp";

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

  const code = String(body.code ?? "").replace(/\D/g, "");
  if (code.length !== 6) return jsonError("יש להזין קוד בן 6 ספרות.");

  try {
    const found = await listAccountsByPhone(String(body.phone ?? ""));
    if (!found.ok) return jsonError(found.error);
    const pending = await readOtpPending();
    if (!pending || pending.phone !== found.phone) {
      return jsonError("בקשו קוד חדש.", 400);
    }

    const verified =
      pending.purpose === "register"
        ? await verifyRegisterOtp(pending.businessId, found.phone, code)
        : await verifyLoginOtp(pending.businessId, found.phone, code, {
            allowEmergency: pending.flow !== "signup",
          });
    if (!verified.ok) {
      return jsonError(
        verified.message,
        400,
        verified.code ? { code: verified.code } : undefined,
      );
    }

    await clearOtpPending();

    if (pending.flow === "signup") {
      await writeSignupPhone(found.phone);
      return jsonOk({ next: "details" });
    }

    if (pending.flow === "pay") {
      const account = payableAccounts(found.accounts).find(
        (row) => row.businessId === pending.businessId,
      );
      if (!account?.businessId) {
        return jsonError("התשלום עדיין לא זמין למספר הזה.", 400);
      }
      const checkout = await startSubscriptionCheckout(request, {
        businessId: account.businessId,
        customerName: account.fullName,
        phone: account.phone,
      });
      if (!checkout.ok) return jsonError(checkout.error, checkout.status);
      return jsonOk({ next: "pay", url: checkout.url });
    }

    const confirmed = await listAccountsByPhone(found.phone);
    if (!confirmed.ok) return jsonError(confirmed.error);
    const account = paidAccounts(confirmed.accounts).find(
      (row) => row.businessId === pending.businessId && row.userId,
    );
    if (!account?.businessId || !account.userId) {
      return jsonError("המספר לא משויך ללקוח ששילם.", 403);
    }

    await writeAccountSession({
      accountId: account.id,
      userId: account.userId,
      businessId: account.businessId,
      phone: account.phone,
      name: account.fullName,
      businessName: account.businessName,
    });
    return jsonOk({ next: "account" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "אימות הקוד נכשל.";
    return jsonError(message, 500);
  }
}
