export const ADMIN_PUSH_TYPES = [
  "new_business",
  "new_client",
  "sms_purchase_paid",
  "sms_purchase_failed",
  "cancellation_request",
  "account_deletion",
  "whatsapp_human",
  "sms_low_balance",
  "pulseem_main_low",
] as const;

export type AdminPushType = (typeof ADMIN_PUSH_TYPES)[number];

export const ADMIN_PUSH_TYPE_LABELS: Record<AdminPushType, string> = {
  new_business: "עסק חדש",
  new_client: "לקוח חדש",
  sms_purchase_paid: "רכישת SMS שולמה",
  sms_purchase_failed: "רכישת SMS נכשלה",
  cancellation_request: "בקשת ביטול מנוי",
  account_deletion: "בקשת מחיקת חשבון",
  whatsapp_human: "שיחת וואטסאפ עברה לנציג",
  sms_low_balance: "יתרת SMS נמוכה בעסק",
  pulseem_main_low: "יתרה נמוכה בפולסים הראשי",
};

export type AdminPushPreferences = {
  enabled: boolean;
  types: Record<AdminPushType, boolean>;
};

export type AdminPushEvent = {
  /** Stable id of the underlying event; a key is only ever delivered once. */
  key: string;
  type: AdminPushType;
  title: string;
  body: string;
  /** In-app route the mobile app opens when the notification is tapped. */
  url: string;
};

export type PushTokenInput = {
  token: string;
  platform: "ios" | "android";
  deviceId: string;
};

export function isAdminPushType(value: unknown): value is AdminPushType {
  return (
    typeof value === "string" &&
    (ADMIN_PUSH_TYPES as readonly string[]).includes(value)
  );
}

/** Missing keys mean "on": every type is enabled until the admin turns it off. */
export function normalizePreferences(row: {
  enabled?: unknown;
  types?: unknown;
} | null | undefined): AdminPushPreferences {
  const stored =
    row?.types && typeof row.types === "object"
      ? (row.types as Record<string, unknown>)
      : {};
  const types = Object.fromEntries(
    ADMIN_PUSH_TYPES.map((type) => [type, stored[type] !== false]),
  ) as Record<AdminPushType, boolean>;
  return { enabled: row?.enabled !== false, types };
}

export function wantsPush(prefs: AdminPushPreferences, type: AdminPushType) {
  return prefs.enabled && prefs.types[type];
}

export function parsePreferencesInput(
  body: Record<string, unknown>,
): { ok: true; value: AdminPushPreferences } | { ok: false; error: string } {
  if (typeof body.enabled !== "boolean") {
    return { ok: false, error: "חסרה הגדרת ההתראות הראשית." };
  }
  const raw =
    body.types && typeof body.types === "object"
      ? (body.types as Record<string, unknown>)
      : {};
  for (const [key, value] of Object.entries(raw)) {
    if (!isAdminPushType(key) || typeof value !== "boolean") {
      return { ok: false, error: "סוג התראה לא מוכר." };
    }
  }
  return {
    ok: true,
    value: normalizePreferences({ enabled: body.enabled, types: raw }),
  };
}

const EXPO_TOKEN_RE = /^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]{10,}\]$/;
const DEVICE_ID_RE = /^[A-Za-z0-9._:-]{8,128}$/;

export function isExpoPushToken(value: unknown): value is string {
  return typeof value === "string" && EXPO_TOKEN_RE.test(value.trim());
}

export function parsePushTokenInput(
  body: Record<string, unknown>,
): { ok: true; value: PushTokenInput } | { ok: false; error: string } {
  const token = String(body.token ?? "").trim();
  const deviceId = String(body.deviceId ?? "").trim();
  const platform = body.platform;
  if (!isExpoPushToken(token)) {
    return { ok: false, error: "טוקן ההתראות אינו תקין." };
  }
  if (platform !== "ios" && platform !== "android") {
    return { ok: false, error: "סוג המכשיר אינו נתמך." };
  }
  if (!DEVICE_ID_RE.test(deviceId)) {
    return { ok: false, error: "מזהה המכשיר אינו תקין." };
  }
  return { ok: true, value: { token, platform, deviceId } };
}

/** YYYY-MM-DD in Israel time, used for "at most once a day" event keys. */
export function israelDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function ils(amount: number) {
  return `₪${amount.toLocaleString("he-IL")}`;
}

function count(value: number) {
  return value.toLocaleString("he-IL");
}

export const adminPushEvents = {
  newBusiness(input: { businessId: string; businessName: string }): AdminPushEvent {
    return {
      key: `new_business:${input.businessId}`,
      type: "new_business",
      title: "עסק חדש",
      body: input.businessName,
      url: `/business/${input.businessId}`,
    };
  },
  newClient(input: {
    userId: string;
    clientName: string;
    businessId: string;
    businessName: string;
  }): AdminPushEvent {
    return {
      key: `new_client:${input.userId}`,
      type: "new_client",
      title: "לקוח חדש",
      body: `${input.clientName || "לקוח"} · ${input.businessName}`,
      url: `/business/${input.businessId}?tab=people`,
    };
  },
  purchasePaid(input: {
    orderId: string;
    businessId: string;
    businessName: string;
    smsCredits: number;
    amountIls: number;
  }): AdminPushEvent {
    return {
      key: `sms_purchase_paid:${input.orderId}`,
      type: "sms_purchase_paid",
      title: "רכישת SMS שולמה",
      body: `${input.businessName} · ${count(input.smsCredits)} הודעות · ${ils(input.amountIls)}`,
      url: `/business/${input.businessId}?tab=billing`,
    };
  },
  purchaseFailed(input: {
    orderId: string;
    businessId: string;
    businessName: string;
    reason: string;
  }): AdminPushEvent {
    return {
      key: `sms_purchase_failed:${input.orderId}`,
      type: "sms_purchase_failed",
      title: "רכישת SMS נכשלה",
      body: `${input.businessName} · ${input.reason || "סיבה לא ידועה"}`,
      url: `/business/${input.businessId}?tab=billing`,
    };
  },
  cancellation(input: {
    requestId: string;
    requestedAt: string;
    businessName: string;
    requestedByName: string;
  }): AdminPushEvent {
    return {
      key: `cancellation_request:${input.requestId}:${input.requestedAt}`,
      type: "cancellation_request",
      title: "בקשת ביטול מנוי",
      body: `${input.businessName} · ${input.requestedByName}`,
      url: "/requests",
    };
  },
  accountDeletion(input: {
    requestId: string;
    fullName: string;
    appName: string;
  }): AdminPushEvent {
    return {
      key: `account_deletion:${input.requestId}`,
      type: "account_deletion",
      title: "בקשת מחיקת חשבון",
      body: [input.fullName, input.appName].filter(Boolean).join(" · "),
      url: "/requests?view=deletions",
    };
  },
  whatsappHuman(input: { phone: string; name: string; at: string }): AdminPushEvent {
    return {
      key: `whatsapp_human:${input.phone}:${input.at}`,
      type: "whatsapp_human",
      title: "מחכים לנציג בוואטסאפ",
      body: input.name || input.phone,
      url: `/chat/${input.phone}`,
    };
  },
  smsLow(input: {
    businessId: string;
    businessName: string;
    credits: number;
    day?: string;
  }): AdminPushEvent {
    return {
      key: `sms_low_balance:${input.businessId}:${input.day ?? israelDateKey()}`,
      type: "sms_low_balance",
      title: "יתרת SMS נמוכה",
      body: `${input.businessName} · נשארו ${count(input.credits)} הודעות`,
      url: `/business/${input.businessId}?tab=sms`,
    };
  },
  mainLow(input: { credits: number; required: number; day?: string }): AdminPushEvent {
    return {
      key: `pulseem_main_low:${input.day ?? israelDateKey()}`,
      type: "pulseem_main_low",
      title: "יתרה נמוכה בחשבון פולסים הראשי",
      body: `נשארו ${count(input.credits)} הודעות, נדרשות ${count(input.required)} לחידוש החודשי`,
      url: "/",
    };
  },
};
