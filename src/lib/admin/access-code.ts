/**
 * Shared access code for the three site admins.
 * Checked only on the server. A later per-person code can replace
 * the constant in this file without changing the login routes.
 * Never log or return this value.
 */
const SHARED_ACCESS_CODE = "123456";

export const PHONE_REJECTED = "לא ניתן להמשיך. בדקו את המספר ונסו שוב.";
export const CODE_REJECTED = "הקוד שגוי. נסו שוב.";
export const CODE_RATE_LIMITED = "יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.";
export const LOGIN_UNAVAILABLE = "לא ניתן להמשיך כרגע. נסו שוב.";

export const ACCESS_CODE_MAX_FAILURES = 5;
export const ACCESS_CODE_LOCK_SECONDS = 15 * 60;

function digitsOnly(value: string) {
  return String(value ?? "").replace(/\D/g, "");
}

/** Constant-time compare. Length mismatches still walk the longer value. */
function safeEqual(left: string, right: string) {
  const length = Math.max(left.length, right.length);
  let mismatch = left.length === right.length ? 0 : 1;
  for (let index = 0; index < length; index += 1) {
    const leftCode = index < left.length ? left.charCodeAt(index) : 0;
    const rightCode = index < right.length ? right.charCodeAt(index) : 0;
    mismatch |= leftCode ^ rightCode;
  }
  return mismatch === 0;
}

export function accessCodeMatches(code: string) {
  return safeEqual(digitsOnly(code), SHARED_ACCESS_CODE);
}
