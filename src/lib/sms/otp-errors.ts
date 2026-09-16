export const OTP_ERROR_MESSAGES: Record<string, string> = {
  phone_not_registered: "המספר לא רשום במערכת.",
  invalid_phone: "מספר הטלפון אינו תקין.",
  rate_limit_sends: "נשלחו יותר מדי קודים. נסו שוב בעוד כמה דקות.",
  sms_send_failed: "שליחת ה-SMS נכשלה. נסו שוב.",
  pulseem_not_configured: "שליחת הודעות עדיין לא הוגדרה. פנו לתמיכה.",
  no_active_code: "אין קוד פעיל. בקשו קוד חדש.",
  wrong_code: "הקוד שגוי. בדקו ונסו שוב.",
  too_many_attempts: "יותר מדי ניסיונות. בקשו קוד חדש.",
  invalid_code: "הקוד אינו תקין.",
};

const KNOWN_OTP_CODES = new Set(Object.keys(OTP_ERROR_MESSAGES));

export function findOtpErrorCode(value: unknown): string | null {
  if (typeof value === "string") {
    return KNOWN_OTP_CODES.has(value) ? value : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findOtpErrorCode(item);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const found = findOtpErrorCode(item);
      if (found) return found;
    }
  }
  return null;
}

export function otpErrorMessage(code: string | null, fallback: string) {
  if (code && OTP_ERROR_MESSAGES[code]) return OTP_ERROR_MESSAGES[code];
  return fallback;
}
