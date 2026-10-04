/**
 * App design the customer fills in the personal area, stored on business_profile:
 * home_logo_url, home_hero_* and pulseem_from_number.
 */

/** "none" keeps the app's default home. */
export type HeroKind = "none" | "image" | "video" | "images";

export type AccountDesign = {
  logoUrl: string;
  heroKind: HeroKind;
  /** The one image or video when heroKind is "image" or "video". */
  heroUrl: string;
  /** The rolling images when heroKind is "images". */
  heroImages: string[];
  /** SMS sender name, saved to pulseem_from_number. */
  fromNumber: string;
};

export type UploadKind = "logo" | "hero-image" | "hero-video" | "hero-images";

/** The app_design bucket rejects files above 10MB. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_HERO_IMAGES = 10;
export const DESIGN_BUCKET = "app_design";
export const DESIGN_FOLDER = "business-images";

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};

/** Same folders the app uses, so its storage cleanup and logo checks recognize them. */
const UPLOAD_FOLDERS: Record<UploadKind, string> = {
  logo: `${DESIGN_FOLDER}/home-logos`,
  "hero-image": `${DESIGN_FOLDER}/home-hero-single`,
  "hero-video": `${DESIGN_FOLDER}/home-hero-single`,
  "hero-images": `${DESIGN_FOLDER}/home-hero`,
};

export const SENDER_NAME_MAX = 11;
const SENDER_RE = /^(?=.*[A-Za-z])[A-Za-z0-9]{2,11}$/;
export const SENDER_NAME_ERROR =
  "שם השולח ב-SMS: 2 עד 11 תווים באנגלית ומספרים, בלי רווחים, ולפחות אות אחת.";

export function isUploadKind(value: unknown): value is UploadKind {
  return typeof value === "string" && value in UPLOAD_FOLDERS;
}

export function acceptsFor(kind: UploadKind) {
  return Object.keys(kind === "hero-video" ? VIDEO_TYPES : IMAGE_TYPES).join(",");
}

export function uploadSpec(
  kind: unknown,
  contentType: unknown,
  size: unknown,
): { ok: true; folder: string; ext: string } | { ok: false; error: string } {
  if (!isUploadKind(kind)) return { ok: false, error: "סוג הקובץ לא נתמך." };
  const types = kind === "hero-video" ? VIDEO_TYPES : IMAGE_TYPES;
  const ext = types[String(contentType ?? "").toLowerCase()];
  if (!ext) {
    return {
      ok: false,
      error: kind === "hero-video" ? "אפשר להעלות סרטון MP4 או MOV." : "אפשר להעלות תמונה JPG, PNG או WEBP.",
    };
  }
  const bytes = Number(size);
  if (!Number.isFinite(bytes) || bytes <= 0) return { ok: false, error: "הקובץ ריק." };
  if (bytes > MAX_UPLOAD_BYTES) return { ok: false, error: "הקובץ גדול מ-10MB." };
  return { ok: true, folder: UPLOAD_FOLDERS[kind], ext };
}

export function senderNameError(value: string) {
  return SENDER_RE.test(value) ? null : SENDER_NAME_ERROR;
}

/** Keeps only what a sender name may contain. */
export function cleanSenderName(value: string) {
  return value.replace(/[^A-Za-z0-9]/g, "").slice(0, SENDER_NAME_MAX);
}

function url(value: unknown) {
  const text = String(value ?? "").trim();
  return /^https:\/\/\S+$/.test(text) && text.length <= 2000 ? text : "";
}

function urlList(value: unknown) {
  return Array.isArray(value) ? value.map(url).filter(Boolean) : [];
}

export function designFromProfile(row: Record<string, unknown>): AccountDesign {
  const heroImages = urlList(row.home_hero_images);
  const single = url(row.home_hero_single_url);
  const singleKind = row.home_hero_single_kind === "video" ? "video" : "image";
  let heroKind: HeroKind = "none";
  if (row.home_hero_mode === "single_fullbleed" && single) heroKind = singleKind;
  else if (heroImages.length) heroKind = "images";
  return {
    logoUrl: url(row.home_logo_url),
    heroKind,
    heroUrl: single,
    heroImages,
    fromNumber: String(row.pulseem_from_number ?? "").trim(),
  };
}

export function validateDesign(
  input: unknown,
): { ok: true; value: AccountDesign } | { ok: false; error: string } {
  const body =
    input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  const fromNumber = String(body.fromNumber ?? "").trim();
  const senderError = senderNameError(fromNumber);
  if (senderError) return { ok: false, error: senderError };

  const kind = String(body.heroKind ?? "none");
  const heroKind: HeroKind =
    kind === "image" || kind === "video" || kind === "images" ? kind : "none";
  const heroUrl = url(body.heroUrl);
  const heroImages = urlList(body.heroImages);
  if ((heroKind === "image" || heroKind === "video") && !heroUrl) {
    return {
      ok: false,
      error: heroKind === "video" ? "צריך להעלות סרטון לדף הבית." : "צריך להעלות תמונה לדף הבית.",
    };
  }
  if (heroKind === "images" && !heroImages.length) {
    return { ok: false, error: "צריך להעלות לפחות תמונה אחת לדף הבית." };
  }
  if (heroImages.length > MAX_HERO_IMAGES) {
    return { ok: false, error: `אפשר עד ${MAX_HERO_IMAGES} תמונות לדף הבית.` };
  }

  return {
    ok: true,
    value: { logoUrl: url(body.logoUrl), heroKind, heroUrl, heroImages, fromNumber },
  };
}

/**
 * Media may be a file uploaded from the personal area, or whatever is already
 * saved on the business (for example a logo set from the app).
 */
export function unknownMediaUrl(
  design: AccountDesign,
  current: AccountDesign,
  uploadPrefix: string,
) {
  const known = new Set(
    [current.logoUrl, current.heroUrl, ...current.heroImages].filter(Boolean),
  );
  const used = [design.logoUrl];
  if (design.heroKind === "image" || design.heroKind === "video") used.push(design.heroUrl);
  if (design.heroKind === "images") used.push(...design.heroImages);
  return used.find((item) => item && !known.has(item) && !item.startsWith(uploadPrefix)) ?? null;
}

/**
 * Columns to write. Switching hero mode leaves the other mode's media in place,
 * the same way the app does.
 */
export function designProfilePatch(design: AccountDesign): Record<string, unknown> {
  const patch: Record<string, unknown> = {
    home_logo_url: design.logoUrl || null,
    pulseem_from_number: design.fromNumber,
  };
  if (design.heroKind === "image" || design.heroKind === "video") {
    patch.home_hero_mode = "single_fullbleed";
    patch.home_hero_single_url = design.heroUrl;
    patch.home_hero_single_kind = design.heroKind;
  } else {
    patch.home_hero_mode = "marquee";
    patch.home_hero_images = design.heroKind === "images" ? design.heroImages : [];
  }
  return patch;
}
