import { findOtpErrorCode, otpErrorMessage } from "./otp-errors";
import { invokeEdgeFunction } from "./supabase-admin";

export { OTP_ERROR_MESSAGES, findOtpErrorCode, otpErrorMessage } from "./otp-errors";

type OtpResponse = Record<string, unknown>;

export async function sendLoginOtp(businessId: string, phone: string) {
  const result = await invokeEdgeFunction<OtpResponse>("auth-phone-otp", {
    action: "send_login_otp",
    business_id: businessId,
    phone,
  });
  const code = findOtpErrorCode(result.data);
  if (!result.ok || code) {
    return {
      ok: false as const,
      code,
      message: otpErrorMessage(code, "שליחת הקוד נכשלה. נסו שוב."),
    };
  }
  return { ok: true as const };
}

export async function verifyLoginOtp(
  businessId: string,
  phone: string,
  otpCode: string,
) {
  const result = await invokeEdgeFunction<OtpResponse>("auth-phone-otp", {
    action: "verify_login_otp",
    business_id: businessId,
    phone,
    code: otpCode,
  });
  const code = findOtpErrorCode(result.data);
  if (!result.ok || code) {
    return {
      ok: false as const,
      code,
      message: otpErrorMessage(code, "אימות הקוד נכשל. נסו שוב."),
    };
  }
  return { ok: true as const };
}
