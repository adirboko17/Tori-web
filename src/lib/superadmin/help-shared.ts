import type { HelpAudience, HelpI18n, HelpLocale } from '@/lib/superadmin/types';

export const HELP_BUCKET = 'help-center';

export const HELP_LOCALES: { code: HelpLocale; label: string }[] = [
  { code: 'he', label: 'עברית' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'ru', label: 'Русский' },
];

/** Exact icon keys the salon manager app renders. Anything else falls back to help. */
export const HELP_ICONS = [
  'appointments',
  'calendar',
  'clock',
  'time',
  'users',
  'clients',
  'employees',
  'settings',
  'palette',
  'design',
  'bell',
  'notifications',
  'image',
  'gallery',
  'repeat',
  'recurring',
  'help',
  'book',
  'book-open',
  'scissors',
  'services',
  'wallet',
  'finance',
  'store',
  'branches',
  'message',
  'message-circle',
  'headphones',
  'support',
  'phone',
  'star',
  'home',
  'shield',
  'sparkles',
  'layout',
  'layout-grid',
  'user-plus',
  'mail',
] as const;

export type HelpIconName = (typeof HELP_ICONS)[number];

export const HELP_AUDIENCES: { value: HelpAudience; label: string }[] = [
  { value: 'admin', label: 'מנהלים' },
  { value: 'all', label: 'כולם' },
  { value: 'client', label: 'לקוחות' },
];

/** Lowercase English words separated by hyphens — `book-for-client`. */
export const HELP_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isHelpSlug(raw: string): boolean {
  return HELP_SLUG_RE.test(raw);
}

export function slugifyHelp(raw: string): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function asHelpI18n(value: unknown): HelpI18n {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const src = value as Record<string, unknown>;
  const out: HelpI18n = {};
  for (const code of ['he', 'en', 'ar', 'ru'] as const) {
    const v = src[code];
    if (typeof v === 'string' && v.trim()) out[code] = v.trim();
  }
  return out;
}

export function compactI18n(input: HelpI18n): HelpI18n {
  const out: HelpI18n = {};
  for (const code of ['he', 'en', 'ar', 'ru'] as const) {
    const v = input[code]?.trim();
    if (v) out[code] = v;
  }
  return out;
}

export function isHelpAudience(raw: unknown): raw is HelpAudience {
  return raw === 'admin' || raw === 'client' || raw === 'all';
}

export function isHelpIcon(raw: unknown): raw is HelpIconName {
  return typeof raw === 'string' && (HELP_ICONS as readonly string[]).includes(raw);
}

export function helpPublicUrl(storagePath: string): string {
  const base = String(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '',
  ).replace(/\/$/, '');
  const path = storagePath.replace(/^\/+/, '');
  return `${base}/storage/v1/object/public/${HELP_BUCKET}/${path}`;
}
