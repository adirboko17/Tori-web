const MOBILE_LOCAL = /^05\d{8}$/;

/** Normalize an Israeli mobile number to `05XXXXXXXX`. Returns null if invalid. */
export function normalizeIsraeliMobile(input: string): string | null {
  const trimmed = String(input ?? "").trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("972")) {
    digits = digits.slice(3);
  }
  if (digits.length === 9 && digits.startsWith("5")) {
    digits = `0${digits}`;
  }
  return MOBILE_LOCAL.test(digits) ? digits : null;
}

export function phoneLastNine(normalized: string): string {
  return normalized.startsWith("0") ? normalized.slice(1) : normalized;
}

export function phoneLookupVariants(normalized: string): string[] {
  const last9 = phoneLastNine(normalized);
  return [
    normalized,
    last9,
    `972${last9}`,
    `+972${last9}`,
    `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6)}`,
    `${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6)}`,
  ];
}
