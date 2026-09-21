const DEFAULT_BRAND_COLOR = "#D4A574";
const DEFAULT_ADDRESS = "לא צוין";
const PENDING_PASSWORD = "pending-setup";

const HE_TO_EN: Record<string, string> = {
  א: "a",
  ב: "b",
  ג: "g",
  ד: "d",
  ה: "h",
  ו: "v",
  ז: "z",
  ח: "h",
  ט: "t",
  י: "y",
  כ: "k",
  ך: "k",
  ל: "l",
  מ: "m",
  ם: "m",
  נ: "n",
  ן: "n",
  ס: "s",
  ע: "a",
  פ: "p",
  ף: "p",
  צ: "tz",
  ץ: "tz",
  ק: "k",
  ר: "r",
  ש: "sh",
  ת: "t",
};

export type OnboardingServiceInput = {
  name: string;
  price: string | number;
  duration: string | number;
};

export type OnboardingFormInput = {
  managerName?: string;
  phone?: string;
  businessNameHe?: string;
  businessNameEn?: string;
  appNameEn?: string;
  address?: string;
  email?: string;
  managerPassword?: string;
  brandColor?: string;
  plan?: string | null;
  price?: string | null;
  commitment?: string | null;
  businessType?: string | null;
  note?: string | null;
  logoFile?: File | null;
  services?: OnboardingServiceInput[];
};

export type MappedBusiness = {
  business_name_he: string;
  business_name_en: string;
  app_name_en: string;
  address: string;
  manager_name: string;
  phone: string;
  manager_password: string;
  email: string | null;
  brand_color: string;
  plan: string | null;
  price: string | null;
  commitment: string | null;
  business_type: string | null;
  note: string | null;
};

export type MappedService = {
  name: string;
  price: number;
  duration_minutes: number;
  sort_order: number;
};

function trim(value: unknown) {
  return String(value ?? "").trim();
}

export function transliterateHe(value: string) {
  return Array.from(value)
    .map((ch) => HE_TO_EN[ch] ?? ch)
    .join("");
}

export function toAppNameEn(value: string, fallback = "business") {
  const source = trim(value) || fallback;
  let cleaned = transliterateHe(source).replace(/[^A-Za-z0-9]/g, "");
  if (!cleaned) cleaned = "business";
  if (!/^[A-Za-z]/.test(cleaned)) cleaned = `b${cleaned}`;
  return cleaned.slice(0, 40);
}

export function toEnglishName(value: string, fallback = "") {
  const source = trim(value);
  if (/[A-Za-z]/.test(source)) return source;
  const latin = transliterateHe(source)
    .replace(/[^A-Za-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return latin || trim(fallback) || source;
}

export function mapBusinessFields(input: OnboardingFormInput): MappedBusiness {
  const managerName = trim(input.managerName);
  const businessNameHe =
    trim(input.businessNameHe) || managerName || "עסק חדש";
  const businessNameEn =
    trim(input.businessNameEn) ||
    toEnglishName(businessNameHe, managerName || "Business");
  return {
    business_name_he: businessNameHe,
    business_name_en: businessNameEn,
    app_name_en: toAppNameEn(
      trim(input.appNameEn) || businessNameEn || businessNameHe,
    ),
    address: trim(input.address) || DEFAULT_ADDRESS,
    manager_name: managerName || businessNameHe,
    phone: trim(input.phone),
    manager_password: trim(input.managerPassword) || PENDING_PASSWORD,
    email: trim(input.email) || null,
    brand_color: trim(input.brandColor) || DEFAULT_BRAND_COLOR,
    plan: trim(input.plan) || null,
    price: trim(input.price) || null,
    commitment: trim(input.commitment) || null,
    business_type: trim(input.businessType) || null,
    note: trim(input.note) || null,
  };
}

export function mapServices(
  services: OnboardingServiceInput[] | undefined,
): MappedService[] {
  return (services || [])
    .filter((service) => trim(service.name))
    .map((service, index) => ({
      name: trim(service.name),
      price: Number(service.price),
      duration_minutes: Number(service.duration),
      sort_order: index,
    }))
    .filter(
      (service) =>
        service.name &&
        Number.isFinite(service.price) &&
        Number.isFinite(service.duration_minutes),
    );
}

export function safeFileName(name: string) {
  return (
    name.replace(/[^A-Za-z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 80) ||
    "file"
  );
}
