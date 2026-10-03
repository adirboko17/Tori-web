export const ENGLISH_DISPLAY_NAME_ERROR =
  "שם האפליקציה חייב להיות באנגלית, באותיות אנגליות בלבד.";

const ENGLISH_DISPLAY_NAME_RE = /^[A-Za-z][A-Za-z0-9 '&-]*$/;

/** Customer-facing app name stored in `business_profile.display_name`. */
export function isEnglishDisplayName(value: string) {
  const name = value.trim();
  return name.length >= 2 && name.length <= 120 && ENGLISH_DISPLAY_NAME_RE.test(name);
}

export function hasNonEnglishDisplayChars(value: string) {
  return /[^A-Za-z0-9 '&-]/.test(value);
}
