import { cookies } from "next/headers";
import { getSessionSecret, sessionSigningConfigured } from "@/lib/sms/env";
import {
  signAdminOtpPending,
  signAdminSession,
  verifyAdminOtpPending,
  verifyAdminSession,
  type AdminOtpPending,
  type AdminSession,
  type AdminSessionInput,
} from "./session-token";

export const ADMIN_SESSION_COOKIE = "tori_admin_session";
export const ADMIN_OTP_COOKIE = "tori_admin_otp";
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60;
export const ADMIN_OTP_TTL_SECONDS = 10 * 60;

export type { AdminOtpPending, AdminSession, AdminSessionInput };

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function readAdminSession(): Promise<AdminSession | null> {
  if (!sessionSigningConfigured()) return null;
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return await verifyAdminSession(token, getSessionSecret());
}

export async function writeAdminSession(input: AdminSessionInput) {
  if (!sessionSigningConfigured()) {
    throw new Error("SESSION_SECRET is not configured");
  }
  const session: AdminSession = {
    ...input,
    exp: Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000,
  };
  const store = await cookies();
  store.set(
    ADMIN_SESSION_COOKIE,
    await signAdminSession(session, getSessionSecret()),
    cookieOptions(ADMIN_SESSION_TTL_SECONDS),
  );
  store.delete(ADMIN_OTP_COOKIE);
  return session;
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  store.delete(ADMIN_OTP_COOKIE);
}

export async function writeAdminOtpPending(input: {
  phone: string;
  businessId: string;
}) {
  if (!sessionSigningConfigured()) {
    throw new Error("SESSION_SECRET is not configured");
  }
  const pending: AdminOtpPending = {
    ...input,
    exp: Date.now() + ADMIN_OTP_TTL_SECONDS * 1000,
  };
  const store = await cookies();
  store.set(
    ADMIN_OTP_COOKIE,
    await signAdminOtpPending(pending, getSessionSecret()),
    cookieOptions(ADMIN_OTP_TTL_SECONDS),
  );
  return pending;
}

export async function readAdminOtpPending(): Promise<AdminOtpPending | null> {
  if (!sessionSigningConfigured()) return null;
  const store = await cookies();
  const token = store.get(ADMIN_OTP_COOKIE)?.value;
  if (!token) return null;
  return await verifyAdminOtpPending(token, getSessionSecret());
}

export async function clearAdminOtpPending() {
  const store = await cookies();
  store.delete(ADMIN_OTP_COOKIE);
}
