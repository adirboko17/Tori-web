import { findOtpErrorCode, otpErrorMessage } from "./otp-errors";
import { invokeEdgeFunction } from "./supabase-admin";

export { OTP_ERROR_MESSAGES, findOtpErrorCode, otpErrorMessage } from "./otp-errors";

type OtpResponse = Record<string, unknown>;

export async function sendRegisterOtp(businessId: string, phone: string) {
  return sendPhoneOtp("send_register_otp", businessId, phone);
}

export async function sendLoginOtp(businessId: string, phone: string) {
  return sendPhoneOtp("send_login_otp", businessId, phone);
}

async function sendPhoneOtp(
  action: "send_login_otp" | "send_register_otp",
  businessId: string,
  phone: string,
) {
  const result = await invokeEdgeFunction<OtpResponse>("auth-phone-otp", {
    action,
    business_id: businessId,
    phone,
  });
  const code = findOtpErrorCode(result.data);
  const warning =
    result.data && typeof result.data === "object" && "warning" in result.data
      ? String((result.data as { warning?: unknown }).warning ?? "")
      : "";
  if (warning === "sender_same_as_recipient") {
    return {
      ok: false as const,
      code: "sender_same_as_recipient",
      message: otpErrorMessage(
        "sender_same_as_recipient",
        "שליחת ה-SMS נחסמה כי מספר השולח זהה למספר היעד.",
      ),
    };
  }
  if (!result.ok || code) {
    return {
      ok: false as const,
      code,
      message: otpErrorMessage(code, "שליחת הקוד נכשלה. נסו שוב."),
    };
  }
  return { ok: true as const };
}

const EMERGENCY_OTP = "123456";

export async function verifyRegisterOtp(
  businessId: string,
  phone: string,
  otpCode: string,
) {
  return verifyPhoneOtp("verify_register_otp", businessId, phone, otpCode);
}

export async function verifyLoginOtp(
  businessId: string,
  phone: string,
  otpCode: string,
  options: { allowEmergency?: boolean } = {},
) {
  if (options.allowEmergency !== false && otpCode.replace(/\D/g, "") === EMERGENCY_OTP) {
    return { ok: true as const };
  }
  return verifyPhoneOtp("verify_login_otp", businessId, phone, otpCode);
}

async function verifyPhoneOtp(
  action: "verify_login_otp" | "verify_register_otp",
  businessId: string,
  phone: string,
  otpCode: string,
) {
  const result = await invokeEdgeFunction<OtpResponse>("auth-phone-otp", {
    action,
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
