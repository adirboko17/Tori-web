import { cookies } from "next/headers";
import { getSessionSecret, sessionSigningConfigured } from "@/lib/sms/env";
import {
  signAccountSession,
  verifyAccountSession,
  type AccountSession,
  type AccountSessionInput,
} from "./session-token";

export const ACCOUNT_SESSION_COOKIE = "tori_account_session";
export const ACCOUNT_SESSION_TTL_SECONDS = 12 * 60 * 60;

export type { AccountSession, AccountSessionInput };

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCOUNT_SESSION_TTL_SECONDS,
  };
}

export async function readAccountSession(): Promise<AccountSession | null> {
  if (!sessionSigningConfigured()) return null;
  const store = await cookies();
  const token = store.get(ACCOUNT_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAccountSession(token, getSessionSecret());
}

export async function writeAccountSession(input: AccountSessionInput) {
  if (!sessionSigningConfigured()) {
    throw new Error("SESSION_SECRET is not configured");
  }
  const session: AccountSession = {
    ...input,
    exp: Date.now() + ACCOUNT_SESSION_TTL_SECONDS * 1000,
  };
  const store = await cookies();
  store.set(
    ACCOUNT_SESSION_COOKIE,
    signAccountSession(session, getSessionSecret()),
    cookieOptions(),
  );
  return session;
}

export async function clearAccountSession() {
  const store = await cookies();
  store.delete(ACCOUNT_SESSION_COOKIE);
}
