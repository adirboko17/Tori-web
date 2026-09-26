export type AdminSession = {
  userId: string;
  phone: string;
  name: string;
  exp: number;
};

export type AdminSessionInput = Omit<AdminSession, "exp">;

export type AdminOtpPending = {
  phone: string;
  businessId: string;
  exp: number;
};

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let next = 0;
  for (let i = 0; i < left.length; i += 1) {
    next |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return next === 0;
}

async function hmacSha256Base64url(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );
  return toBase64Url(bytes);
}

async function signPayload(payload: unknown, secret: string) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = await hmacSha256Base64url(secret, body);
  return `${body}.${sig}`;
}

async function verifyPayload<T>(
  token: string,
  secret: string,
  read: (value: unknown) => T | null,
): Promise<T | null> {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = await hmacSha256Base64url(secret, body);
  if (!safeEqual(sig, expected)) return null;
  try {
    return read(JSON.parse(Buffer.from(body, "base64url").toString("utf8")));
  } catch {
    return null;
  }
}

/** `Authorization: Bearer <token>` → token. Anything else → null. */
export function readBearerToken(header: string | null | undefined) {
  const match = /^Bearer\s+(\S+)\s*$/i.exec(String(header ?? "").trim());
  return match ? match[1] : null;
}

export async function signAdminSession(session: AdminSession, secret: string) {
  return signPayload(session, secret);
}

export async function verifyAdminSession(
  token: string,
  secret: string,
  now = Date.now(),
): Promise<AdminSession | null> {
  return verifyPayload(token, secret, (value) => {
    const payload = value as Partial<AdminSession>;
    if (
      typeof payload.userId !== "string" ||
      typeof payload.phone !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= now
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      phone: payload.phone,
      name: String(payload.name ?? ""),
      exp: payload.exp,
    };
  });
}

export async function signAdminOtpPending(pending: AdminOtpPending, secret: string) {
  return signPayload(pending, secret);
}

export async function verifyAdminOtpPending(
  token: string,
  secret: string,
  now = Date.now(),
): Promise<AdminOtpPending | null> {
  return verifyPayload(token, secret, (value) => {
    const payload = value as Partial<AdminOtpPending>;
    if (
      typeof payload.phone !== "string" ||
      typeof payload.businessId !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= now
    ) {
      return null;
    }
    return {
      phone: payload.phone,
      businessId: payload.businessId,
      exp: payload.exp,
    };
  });
}
