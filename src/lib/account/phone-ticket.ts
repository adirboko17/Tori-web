import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getSessionSecret, sessionSigningConfigured } from "@/lib/sms/env";

export type OtpFlow = "login" | "pay" | "signup";
export type OtpPurpose = "login" | "register";

export type OtpPending = {
  phone: string;
  businessId: string;
  purpose: OtpPurpose;
  flow: OtpFlow;
  exp: number;
};

const OTP_COOKIE = "tori_otp_pending";
const SIGNUP_COOKIE = "tori_signup_phone";
const OTP_TTL_SECONDS = 10 * 60;
const SIGNUP_TTL_SECONDS = 30 * 60;

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function signTicket(payload: object, secret: string) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readTicket(token: string, secret: string, now = Date.now()) {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      exp?: unknown;
    };
    if (typeof payload.exp !== "number" || payload.exp <= now) return null;
    return payload as Record<string, unknown> & { exp: number };
  } catch {
    return null;
  }
}

function isFlow(value: unknown): value is OtpFlow {
  return value === "login" || value === "pay" || value === "signup";
}

function isPurpose(value: unknown): value is OtpPurpose {
  return value === "login" || value === "register";
}

export async function writeOtpPending(input: Omit<OtpPending, "exp">) {
  if (!sessionSigningConfigured()) throw new Error("SESSION_SECRET is not configured");
  const pending: OtpPending = {
    ...input,
    exp: Date.now() + OTP_TTL_SECONDS * 1000,
  };
  const store = await cookies();
  store.set(OTP_COOKIE, signTicket(pending, getSessionSecret()), cookieOptions(OTP_TTL_SECONDS));
}

export async function readOtpPending() {
  if (!sessionSigningConfigured()) return null;
  const store = await cookies();
  const token = store.get(OTP_COOKIE)?.value;
  if (!token) return null;
  const payload = readTicket(token, getSessionSecret());
  if (
    !payload ||
    typeof payload.phone !== "string" ||
    typeof payload.businessId !== "string" ||
    !isPurpose(payload.purpose) ||
    !isFlow(payload.flow)
  ) {
    return null;
  }
  return {
    phone: payload.phone,
    businessId: payload.businessId,
    purpose: payload.purpose,
    flow: payload.flow,
    exp: payload.exp,
  } satisfies OtpPending;
}

export async function clearOtpPending() {
  const store = await cookies();
  store.delete(OTP_COOKIE);
}

export async function writeSignupPhone(phone: string) {
  if (!sessionSigningConfigured()) throw new Error("SESSION_SECRET is not configured");
  const store = await cookies();
  store.set(
    SIGNUP_COOKIE,
    signTicket({ phone, exp: Date.now() + SIGNUP_TTL_SECONDS * 1000 }, getSessionSecret()),
    cookieOptions(SIGNUP_TTL_SECONDS),
  );
}

export async function readSignupPhone() {
  if (!sessionSigningConfigured()) return null;
  const store = await cookies();
  const token = store.get(SIGNUP_COOKIE)?.value;
  if (!token) return null;
  const payload = readTicket(token, getSessionSecret());
  return payload && typeof payload.phone === "string" ? payload.phone : null;
}

export async function clearSignupPhone() {
  const store = await cookies();
  store.delete(SIGNUP_COOKIE);
}
