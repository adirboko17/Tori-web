function trimEnv(value: string | undefined) {
  return (value ?? "").trim();
}

export function getSupabaseUrl() {
  return (
    trimEnv(process.env.SUPABASE_URL) ||
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    trimEnv(process.env.VITE_SUPABASE_URL)
  );
}

export function getServiceRoleKey() {
  return trimEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSessionSecret() {
  return trimEnv(process.env.SESSION_SECRET);
}

export function smsBackendConfigured() {
  return Boolean(getSupabaseUrl() && getServiceRoleKey());
}

export function sessionSigningConfigured() {
  return getSessionSecret().length >= 16;
}

export function payplusConfigured() {
  return Boolean(
    trimEnv(process.env.PAYPLUS_API_KEY) &&
      trimEnv(process.env.PAYPLUS_SECRET_KEY) &&
      trimEnv(process.env.PAYPLUS_PAYMENT_PAGE_UID),
  );
}

export function payplusSubscriptionConfigured() {
  return Boolean(
    trimEnv(process.env.PAYPLUS_API_KEY) &&
      trimEnv(process.env.PAYPLUS_SECRET_KEY) &&
      trimEnv(process.env.PAYPLUS_SUBSCRIPTION_PAGE_UID),
  );
}

export function payplusSubscriptionPageUid() {
  return trimEnv(process.env.PAYPLUS_SUBSCRIPTION_PAGE_UID);
}

export function payplusTerminalUid() {
  return trimEnv(process.env.PAYPLUS_TERMINAL_UID);
}

export function payplusBaseUrl() {
  return trimEnv(process.env.PAYPLUS_ENV).toLowerCase() === "staging"
    ? "https://restapidev.payplus.co.il/api/v1.0"
    : "https://restapi.payplus.co.il/api/v1.0";
}

export function publicAppUrl(request?: Request) {
  const configured = trimEnv(process.env.APP_URL).replace(/\/$/, "");
  if (configured) return configured;
  return requestOrigin(request) || "http://127.0.0.1:3000";
}

export function requestOrigin(request?: Request) {
  if (!request) return "";
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return "";
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export function checkoutReturnUrl(request?: Request) {
  const origin = requestOrigin(request);
  if (origin && /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(new URL(origin).host)) {
    return origin;
  }
  return publicAppUrl(request);
}

export function payplusCallbackUrl(request?: Request) {
  const tunnel = trimEnv(process.env.PAYPLUS_CALLBACK_URL).replace(/\/$/, "");
  if (tunnel) return tunnel;
  return `${publicAppUrl(request)}/api/payplus/callback`;
}

export const CONFIG_ERRORS = {
  backend: "השרת עדיין לא הוגדר לזיהוי מנהלים.",
  session: "חסר מפתח הפעלה בשרת. פנו לתמיכה.",
  payplus: "סליקה עדיין לא הוגדרה.",
  subscription: "סליקת המנוי החודשי עדיין לא הוגדרה.",
  recurring:
    "חסר מזהה מסוף PayPlus. הוסיפו PAYPLUS_TERMINAL_UID כדי לבטל הוראת קבע.",
} as const;
