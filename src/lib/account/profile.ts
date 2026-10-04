import {
  ENGLISH_DISPLAY_NAME_ERROR,
  isEnglishDisplayName,
} from "../display-name.ts";
import { validateDesign, type AccountDesign } from "./design.ts";

export const ACCOUNT_LANGUAGES = ["he", "en", "ru", "ar"] as const;

export type AccountLanguage = (typeof ACCOUNT_LANGUAGES)[number];

export type AccountServiceDraft = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
};

export type AccountProfileDraft = {
  fullName: string;
  businessName: string;
  email: string;
  appNameEn: string;
  address: string;
  idNumber: string;
  receiptName: string;
  receiptVat: string;
  language: AccountLanguage;
  brandColor: string;
  password: string;
  services: AccountServiceDraft[];
  design: AccountDesign;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[A-Za-z][A-Za-z0-9]*$/;
const COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function text(value: unknown, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

function digits(value: unknown) {
  return text(value, 40).replace(/\D/g, "");
}

export function paidAccounts<T extends {
  paidAt: string | null;
  businessId: string | null;
  userId: string | null;
}>(accounts: T[]) {
  return accounts.filter(
    (account) => account.paidAt && account.businessId && account.userId,
  );
}

export type AccountEntry = "login" | "pay" | "signup";

export function payableAccounts<T extends {
  paidAt: string | null;
  businessId: string | null;
  userId: string | null;
}>(accounts: T[]) {
  return accounts.filter(
    (account) => !account.paidAt && account.businessId && account.userId,
  );
}

/** Paid phones enter the personal area. A started signup continues to payment. */
export function entryForAccounts<T extends {
  paidAt: string | null;
  businessId: string | null;
  userId: string | null;
}>(accounts: T[]): AccountEntry {
  if (paidAccounts(accounts).length > 0) return "login";
  if (payableAccounts(accounts).length > 0) return "pay";
  return "signup";
}

export function validateAccountProfile(
  input: unknown,
): { ok: true; value: AccountProfileDraft } | { ok: false; error: string } {
  const body =
    input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  const fullName = text(body.fullName, 120);
  if (fullName.length < 2) return { ok: false, error: "צריך להזין שם מלא." };

  const businessName = text(body.businessName, 120);
  if (!isEnglishDisplayName(businessName)) {
    return { ok: false, error: ENGLISH_DISPLAY_NAME_ERROR };
  }

  const email = text(body.email, 200).toLowerCase();
  if (email && !EMAIL_RE.test(email)) {
    return { ok: false, error: "צריך להזין אימייל תקין." };
  }

  const appNameEn = text(body.appNameEn, 40).replace(/[^A-Za-z0-9]/g, "");
  if (appNameEn && !SLUG_RE.test(appNameEn)) {
    return { ok: false, error: "השם באנגלית צריך להתחיל באות." };
  }

  const idNumber = digits(body.idNumber);
  if (idNumber && idNumber.length !== 9) {
    return { ok: false, error: "תעודת זהות צריכה 9 ספרות." };
  }

  const receiptVat = digits(body.receiptVat);
  if (receiptVat && receiptVat.length !== 9) {
    return { ok: false, error: "מספר ח.פ צריך 9 ספרות." };
  }

  const language = text(body.language, 8);
  if (!ACCOUNT_LANGUAGES.includes(language as AccountLanguage)) {
    return { ok: false, error: "צריך לבחור שפה." };
  }

  const brandColor = text(body.brandColor, 7);
  if (brandColor && !COLOR_RE.test(brandColor)) {
    return { ok: false, error: "צבע המותג לא תקין." };
  }

  const password = digits(body.password);
  if (password && !/^\d{6}$/.test(password)) {
    return { ok: false, error: "סיסמת המנהל היא 6 ספרות." };
  }

  const design = validateDesign(body.design);
  if (!design.ok) return design;

  const servicesRaw = Array.isArray(body.services) ? body.services : [];
  if (servicesRaw.length > 40) {
    return { ok: false, error: "אפשר לשמור עד 40 שירותים." };
  }

  const services: AccountServiceDraft[] = [];
  for (const item of servicesRaw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const name = text(row.name, 100);
    if (!name) continue;
    const price = Number(row.price);
    const durationMinutes = Number(row.durationMinutes ?? row.duration);
    if (!Number.isFinite(price) || price < 0 || price > 100000) {
      return { ok: false, error: `מחיר לא תקין לשירות ${name}.` };
    }
    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 5 ||
      durationMinutes > 480
    ) {
      return { ok: false, error: `משך לא תקין לשירות ${name}.` };
    }
    const id = text(row.id, 80);
    services.push({
      id: UUID_RE.test(id) ? id : "",
      name,
      price,
      durationMinutes,
    });
  }

  return {
    ok: true,
    value: {
      fullName,
      businessName,
      email,
      appNameEn,
      address: text(body.address, 800),
      idNumber,
      receiptName: text(body.receiptName, 120),
      receiptVat,
      language: language as AccountLanguage,
      brandColor,
      password,
      services,
      design: design.value,
    },
  };
}
