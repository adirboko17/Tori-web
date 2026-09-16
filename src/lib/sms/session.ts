import { cookies } from "next/headers";
import { getSessionSecret, sessionSigningConfigured } from "./env";
import {
  signSmsSession,
  verifySmsSession,
  type SmsSession,
  type SmsSessionInput,
} from "./session-token";

export const SMS_SESSION_COOKIE = "tori_sms_session";
export const SMS_SESSION_TTL_SECONDS = 2 * 60 * 60;

export type { SmsSession, SmsSessionInput };

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SMS_SESSION_TTL_SECONDS,
  };
}

export async function readSmsSession(): Promise<SmsSession | null> {
  if (!sessionSigningConfigured()) return null;
  const store = await cookies();
  const token = store.get(SMS_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySmsSession(token, getSessionSecret());
}

export async function writeSmsSession(input: SmsSessionInput) {
  if (!sessionSigningConfigured()) {
    throw new Error("SESSION_SECRET is not configured");
  }
  const session: SmsSession = {
    ...input,
    exp: Date.now() + SMS_SESSION_TTL_SECONDS * 1000,
  };
  const store = await cookies();
  store.set(
    SMS_SESSION_COOKIE,
    signSmsSession(session, getSessionSecret()),
    cookieOptions(),
  );
  return session;
}

export async function clearSmsSession() {
  const store = await cookies();
  store.delete(SMS_SESSION_COOKIE);
}
