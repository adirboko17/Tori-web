import { normalizeIsraeliMobile } from "./sms/phone.ts";

export type AccountDeletionInput = {
  fullName: string;
  phone: string;
  appName: string;
  note: string;
};

export function parseAccountDeletionInput(input: Record<string, unknown>) {
  const fullName = String(input.fullName ?? input.full_name ?? "").trim();
  if (!fullName || fullName.length > 80) {
    return { ok: false as const, error: "צריך להזין שם מלא." };
  }

  const phone = normalizeIsraeliMobile(String(input.phone ?? ""));
  if (!phone) {
    return { ok: false as const, error: "צריך להזין מספר נייד ישראלי תקין." };
  }

  const appName = String(input.appName ?? input.app_name ?? "").trim();
  if (!appName || appName.length > 120) {
    return { ok: false as const, error: "צריך להזין את שם העסק או האפליקציה." };
  }

  const note = String(input.note ?? "").trim();
  if (note.length > 1000) {
    return { ok: false as const, error: "ההערה ארוכה מדי." };
  }

  if (input.confirm !== true) {
    return { ok: false as const, error: "צריך לאשר את בקשת המחיקה." };
  }

  return {
    ok: true as const,
    value: { fullName, phone, appName, note } satisfies AccountDeletionInput,
  };
}
