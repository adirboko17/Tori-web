/** Public apps site. The path is the code name, not the store name. */
export const APP_SITE_ORIGIN = "https://toriapp.co.il";

/** English letters, digits, and hyphen. Empty or anything else is not a public path. */
const CLIENT_CODE_NAME = /^[A-Za-z0-9-]{1,64}$/;

/**
 * Site URL for a business, derived in the view from `branding_client_name`.
 * Returns null when the code name is missing or not a safe path segment.
 */
export function appSiteUrl(clientName: string | null | undefined): string | null {
  const name = String(clientName ?? "").trim();
  if (!CLIENT_CODE_NAME.test(name)) return null;
  return `${APP_SITE_ORIGIN}/${name.toLowerCase()}`;
}
