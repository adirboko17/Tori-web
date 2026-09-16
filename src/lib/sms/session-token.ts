import { createHmac, timingSafeEqual } from "node:crypto";

export type SmsSession = {
  userId: string;
  businessId: string;
  phone: string;
  name: string;
  businessName: string;
  exp: number;
};

export type SmsSessionInput = Omit<SmsSession, "exp">;

export function signSmsSession(session: SmsSession, secret: string) {
  const body = Buffer.from(JSON.stringify(session), "utf8").toString(
    "base64url",
  );
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySmsSession(
  token: string,
  secret: string,
  now = Date.now(),
): SmsSession | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as Partial<SmsSession>;
    if (
      typeof payload.userId !== "string" ||
      typeof payload.businessId !== "string" ||
      typeof payload.phone !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= now
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      businessId: payload.businessId,
      phone: payload.phone,
      name: String(payload.name ?? ""),
      businessName: String(payload.businessName ?? ""),
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
