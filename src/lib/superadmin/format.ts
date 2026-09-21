/**
 * The app authenticates admins against these exact literals — see `users.password_hash`.
 * `123456` → `default_hash`; anything else → `hash_<password>`.
 */
export function hashAdminPassword(password: string): string {
  return password === '123456' ? 'default_hash' : `hash_${password}`;
}

/** Inverse of {@link hashAdminPassword}; `null` when the stored hash is in an unknown format. */
export function readableAdminPassword(hash: string | null | undefined): string | null {
  const h = String(hash ?? '');
  if (h === 'default_hash') return '123456';
  if (h.startsWith('hash_')) return h.slice(5);
  return null;
}

/** Storage-safe client name: English letters and digits only (as the RN app does). */
export function sanitizeClientName(raw: string): string {
  return String(raw ?? '').replace(/[^a-zA-Z0-9]/g, '');
}

export function isValidClientName(raw: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9]*$/.test(String(raw ?? '').trim());
}

export function isValidHexColor(raw: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(String(raw ?? '').trim());
}

export function formatDateHe(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatDateTimeHe(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function initialOf(name: string | null | undefined): string {
  const s = String(name ?? '').trim();
  return s ? s.charAt(0).toUpperCase() : '?';
}

export function formatBytes(bytes: number | null | undefined): string {
  const n = Number(bytes ?? 0);
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** `84` → `1:24`. Used by the help-center video cards. */
export function formatDurationSeconds(seconds: number | null | undefined): string {
  const n = Math.max(0, Math.round(Number(seconds ?? 0)));
  if (!n) return '—';
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Same rule as the RN app: an API key, or a WS user id paired with a password. */
export function hasPulseemCredentials(b: {
  pulseemHasApiKey: boolean;
  pulseem_user_id: string | null;
  pulseemHasPassword: boolean;
}): boolean {
  return b.pulseemHasApiKey || (!!b.pulseem_user_id && b.pulseemHasPassword);
}

/** Formats Pulseem credit strings ("3990.0") for display. */
export function formatSmsCredits(raw: string | null | undefined): string | null {
  if (raw == null || String(raw).trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n.toLocaleString('he-IL') : String(raw);
}

/** Public URL for a file in `app_design/branding/<client>/`. Safe for client + server. */
export function brandingAssetUrl(
  clientName: string | null | undefined,
  fileName: string,
): string | null {
  const name = String(clientName ?? '').trim();
  const base = String(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '',
  ).replace(/\/$/, '');
  if (!name || !base) return null;
  return `${base}/storage/v1/object/public/app_design/branding/${encodeURIComponent(name)}/${fileName}`;
}

/** Readable contrast colour for text drawn on top of an arbitrary brand colour. */
export function contrastText(hex: string | null | undefined): '#FFFFFF' | '#1C1C1E' {
  const h = String(hex ?? '').replace('#', '');
  if (h.length < 6) return '#FFFFFF';
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return '#FFFFFF';
  // Relative luminance, sRGB coefficients.
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#1C1C1E' : '#FFFFFF';
}
