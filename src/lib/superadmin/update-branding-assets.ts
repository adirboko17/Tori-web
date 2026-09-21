import { getServiceSupabase } from '@/lib/sms/supabase-admin';
import { resolveBrandingClientName, uploadBrandingFile } from './storage';

export const BRANDING_ASSET_FILES = {
  logo: 'logo.png',
  icon: 'icon.png',
  splash: 'splash.png',
} as const;

export type BrandingAssetKey = keyof typeof BRANDING_ASSET_FILES;

const MAX_IMAGE_BASE64_CHARS = 8 * 1024 * 1024;

export class BrandingAssetsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrandingAssetsError';
  }
}

function normalizeBase64(raw: unknown, label: string): string | undefined {
  const s = typeof raw === 'string' ? raw.trim() : '';
  if (!s) return undefined;
  if (s.length > MAX_IMAGE_BASE64_CHARS) {
    throw new BrandingAssetsError(`הקובץ ${label} גדול מדי (מקסימום ~6MB)`);
  }
  return s;
}

export async function updateBrandingAssets(
  businessId: string,
  input: {
    logoBase64?: unknown;
    iconBase64?: unknown;
    splashBase64?: unknown;
  },
): Promise<{ uploaded: string[]; warnings: string[]; brandingFolder: string }> {
  const db = getServiceSupabase();
  const { data, error } = await db
    .from('business_profile')
    .select('id, branding_client_name')
    .eq('id', businessId)
    .maybeSingle();

  if (error) throw new BrandingAssetsError('טעינת העסק נכשלה');
  if (!data) throw new BrandingAssetsError('העסק לא נמצא');

  const hint = (data as { branding_client_name?: string | null }).branding_client_name ?? null;
  const clientName = await resolveBrandingClientName(businessId, hint);
  if (!clientName) {
    throw new BrandingAssetsError(
      'אין תיקיית מיתוג לעסק הזה. צריך שם אפליקציה (branding_client_name) כדי להעלות קבצים.',
    );
  }

  const images: Array<[BrandingAssetKey, string | undefined, string]> = [
    ['logo', normalizeBase64(input.logoBase64, 'הלוגו'), 'הלוגו'],
    ['icon', normalizeBase64(input.iconBase64, 'האייקון'), 'האייקון'],
    ['splash', normalizeBase64(input.splashBase64, 'הספלאש'), 'הספלאש'],
  ];

  const toUpload = images.filter(([, b64]) => !!b64) as Array<[BrandingAssetKey, string, string]>;
  if (toUpload.length === 0) {
    throw new BrandingAssetsError('לא נבחרה תמונה לעדכון');
  }

  const uploaded: string[] = [];
  const warnings: string[] = [];

  await Promise.all(
    toUpload.map(async ([key, base64, label]) => {
      const fileName = BRANDING_ASSET_FILES[key];
      const url = await uploadBrandingFile({
        clientName,
        fileName,
        body: base64,
        contentType: 'image/png',
        isBase64: true,
      });
      if (url) uploaded.push(fileName);
      else warnings.push(`העלאת ${label} נכשלה`);
    }),
  );

  if (uploaded.length === 0) {
    throw new BrandingAssetsError(warnings[0] || 'העלאת הקבצים ל-Storage נכשלה');
  }

  return { uploaded, warnings, brandingFolder: clientName };
}
