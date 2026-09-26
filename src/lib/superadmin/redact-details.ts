import type { BusinessDetails } from "./types";

const PROFILE_FIELDS = [
  "id",
  "display_name",
  "address",
  "phone",
  "primary_color",
  "created_at",
  "branding_client_name",
  "pulseem_from_number",
  "pulseem_has_password",
  "pulseem_has_api_key",
] as const;

const IMAGE_FILE_RE = /\.(png|jpe?g|webp|gif)$/i;

/**
 * Business details safe to send to the mobile app: no encrypted Pulseem
 * secrets, no Pulseem login, and no text branding files (the `.env` holds keys).
 */
export function redactBusinessDetails(details: BusinessDetails): BusinessDetails {
  const source = details.profile ?? {};
  const profile: Record<string, unknown> = {};
  for (const field of PROFILE_FIELDS) {
    if (field in source) profile[field] = source[field];
  }
  profile.pulseem_has_user_id = Boolean(
    String(source.pulseem_user_id ?? "").trim(),
  );
  return {
    ...details,
    profile: details.profile ? profile : null,
    brandingFiles: details.brandingFiles
      .filter((file) => IMAGE_FILE_RE.test(file.name))
      .map((file) => ({ ...file, content: null })),
  };
}
