import { randomUUID } from 'node:crypto';
import { getServiceSupabase } from '@/lib/sms/supabase-admin';
import { supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from '@/lib/superadmin/env';
import { hashAdminPassword, sanitizeClientName } from '@/lib/superadmin/format';
import type { CreateBusinessResult } from '@/lib/superadmin/types';
import {
  buildAppConfig,
  buildEnvFile,
  buildTheme,
  type BrandingTemplateInput,
} from './branding-templates';
import { mergeEnvKeyValues, uploadBrandingFile } from './storage';
import { provisionPulseemSubAccount } from './pulseem-edge';

export interface CreateBusinessInput {
  businessName: string;
  clientName: string;
  adminName: string;
  adminPhone: string;
  adminPassword: string;
  address?: string;
  primaryColor?: string;

  /** Base64 (with or without a data: prefix). */
  logoBase64?: string;
  iconBase64?: string;
  splashBase64?: string;

  /** Auto path: provision a Pulseem sub-account via the Edge Function. */
  autoPulseem?: boolean;
  pulseemSubPassword?: string;

  /** Manual path: credentials entered by hand. */
  pulseemApiKey?: string;
  pulseemFromNumber?: string;
  pulseemWsUserId?: string;
  pulseemWsPassword?: string;
}

export class CreateBusinessError extends Error {}

/**
 * Ported from `superAdminApi.createBusiness`.
 *
 * Order matters: profile → admin (rollback on failure) → services → Pulseem → Storage.
 * Pulseem provisioning runs against the live business row, so it must come after the
 * profile insert; it is non-fatal by design.
 */
export async function createBusiness(input: CreateBusinessInput): Promise<CreateBusinessResult> {
  const db = getServiceSupabase();

  const businessName = input.businessName.trim();
  const clientName = sanitizeClientName(input.clientName);
  const adminName = input.adminName.trim();
  const adminPhone = input.adminPhone.trim();
  const adminPassword = input.adminPassword;

  if (!businessName) throw new CreateBusinessError('שם העסק חסר');
  if (!clientName) throw new CreateBusinessError('שם האפליקציה באנגלית חייב להכיל אות או ספרה');
  if (!/^[a-zA-Z]/.test(clientName)) {
    throw new CreateBusinessError('שם האפליקציה באנגלית חייב להתחיל באות');
  }
  if (!adminName) throw new CreateBusinessError('שם המנהל חסר');
  if (!adminPhone) throw new CreateBusinessError('טלפון המנהל חסר');
  if (!adminPassword) throw new CreateBusinessError('סיסמת המנהל חסרה');

  const businessId = randomUUID();
  const slug = clientName.toLowerCase();
  const color = input.primaryColor?.trim() || '#000000';

  // Manual credentials go straight into the profile; the auto path lets the
  // Edge Function write the (encrypted) columns itself.
  const manualApiKey = input.pulseemApiKey?.trim() || '';
  const manualWsUser = input.pulseemWsUserId?.trim() || '';
  const manualWsPass = input.pulseemWsPassword?.trim() || '';
  const fromNumber = input.pulseemFromNumber?.trim() || clientName;

  /* ---------------- 1. business_profile ---------------- */

  const { error: profileError } = await db.from('business_profile').insert({
    id: businessId,
    display_name: businessName,
    address: input.address?.trim() || '',
    phone: adminPhone,
    primary_color: color,
    branding_client_name: clientName,
    home_hero_images: [],
    break_by_user: {},
    booking_open_days_by_user: {},
    min_cancellation_hours: 24,
    booking_open_days: 7,
    pulseem_from_number: fromNumber,
    ...(manualWsUser ? { pulseem_user_id: manualWsUser } : {}),
  });

  if (profileError) {
    console.error('[createBusiness] profile insert:', profileError.message);
    throw new CreateBusinessError(`יצירת פרופיל העסק נכשלה: ${profileError.message}`);
  }

  /* ---------------- 2. admin user (rollback on failure) ---------------- */

  const { data: adminRow, error: userError } = await db
    .from('users')
    .insert({
      name: adminName,
      phone: adminPhone,
      user_type: 'admin',
      business_id: businessId,
      password_hash: hashAdminPassword(adminPassword),
    })
    .select('id')
    .single();

  if (userError || !adminRow?.id) {
    console.error('[createBusiness] admin insert:', userError?.message);
    await db.from('business_profile').delete().eq('id', businessId);
    throw new CreateBusinessError(
      `יצירת משתמש המנהל נכשלה (העסק בוטל): ${userError?.message ?? 'שגיאה לא ידועה'}`,
    );
  }

  const adminUserId = (adminRow as { id: string }).id;

  /* ---------------- 3. default services (non-fatal) ---------------- */

  const uploadWarnings: string[] = [];

  const { error: servicesError } = await db.from('services').insert([
    {
      name: 'שירות 1',
      price: 150,
      duration_minutes: 60,
      is_active: true,
      business_id: businessId,
      worker_id: adminUserId,
    },
    {
      name: 'שירות 2',
      price: 50,
      duration_minutes: 30,
      is_active: true,
      business_id: businessId,
      worker_id: adminUserId,
    },
    {
      name: 'שירות 3',
      price: 80,
      duration_minutes: 45,
      is_active: true,
      business_id: businessId,
      worker_id: adminUserId,
    },
  ]);

  if (servicesError) {
    console.error('[createBusiness] services (non-fatal):', servicesError.message);
    uploadWarnings.push(`יצירת שירותי ברירת המחדל נכשלה: ${servicesError.message}`);
  }

  /* ---------------- 4. Pulseem ---------------- */

  let pulseemCreated = false;
  let pulseemError: string | undefined;
  let pulseemLoginUserName: string | undefined;
  let pulseemDirectSmsCredits: number | undefined;
  let envPulseemPairs: Record<string, string> | undefined;

  if (input.autoPulseem && !manualApiKey) {
    const result = await provisionPulseemSubAccount({
      businessId,
      subPassword: input.pulseemSubPassword,
      fromNumber,
      directSmsCredits: 1000,
    });

    if (result.ok) {
      pulseemCreated = true;
      pulseemLoginUserName = result.loginUserName;
      pulseemDirectSmsCredits = result.directSmsCredits;
      envPulseemPairs = result.envPlaintext;
    } else {
      // Non-fatal: the business exists and can be wired to Pulseem later.
      pulseemError = result.errorMessage;
      console.warn('[createBusiness] pulseem provision failed (non-fatal):', pulseemError);
    }
  } else if (manualApiKey || manualWsPass) {
    const saved = await saveManualPulseemCredentials(businessId, {
      apiKey: manualApiKey,
      wsPassword: manualWsPass,
    });
    if (saved.ok) {
      pulseemCreated = !!manualApiKey;
    } else {
      pulseemError = saved.errorMessage;
      console.warn('[createBusiness] manual pulseem save failed (non-fatal):', pulseemError);
    }
  }

  /* ---------------- 5. Storage branding files ---------------- */

  // The Edge Function owns the freshly minted sub-account secrets — fold its
  // plaintext view into the template so the keys land in their proper section
  // instead of being appended after the commented placeholders.
  const provisioned = envPulseemPairs ?? {};

  const templateInput: BrandingTemplateInput = {
    businessId,
    businessName,
    clientName,
    slug,
    primaryColor: color,
    supabaseUrl: supabaseUrl(),
    supabaseAnonKey: supabaseAnonKey(),
    supabaseServiceRoleKey: supabaseServiceRoleKey(),
    pulseemApiKey: provisioned.PULSEEM_API_KEY || manualApiKey || undefined,
    pulseemFromNumber: provisioned.PULSEEM_FROM_NUMBER || fromNumber,
    pulseemUserId: provisioned.PULSEEM_USER_ID || manualWsUser || undefined,
    pulseemPassword: provisioned.PULSEEM_PASSWORD || manualWsPass || undefined,
  };

  let envContent = buildEnvFile(templateInput);
  // Anything the Edge Function returned that the template doesn't model yet.
  const extraPairs = Object.fromEntries(
    Object.entries(provisioned).filter(([k]) => !envContent.includes(`${k}=`)),
  );
  if (Object.keys(extraPairs).length > 0) {
    envContent = mergeEnvKeyValues(envContent, extraPairs);
  }

  const uploads: { fileName: string; result: Promise<string | null> }[] = [
    {
      fileName: '.env',
      result: uploadBrandingFile({
        clientName,
        fileName: '.env',
        body: envContent,
        contentType: 'text/plain',
      }),
    },
    {
      fileName: 'app.config.json',
      result: uploadBrandingFile({
        clientName,
        fileName: 'app.config.json',
        body: JSON.stringify(buildAppConfig(templateInput), null, 2),
        contentType: 'application/json',
      }),
    },
    {
      fileName: 'theme.json',
      result: uploadBrandingFile({
        clientName,
        fileName: 'theme.json',
        body: JSON.stringify(buildTheme(templateInput), null, 2),
        contentType: 'application/json',
      }),
    },
  ];

  const images: [string, string | undefined][] = [
    ['logo.png', input.logoBase64],
    ['icon.png', input.iconBase64],
    ['splash.png', input.splashBase64],
  ];

  for (const [fileName, base64] of images) {
    if (!base64) continue;
    uploads.push({
      fileName,
      result: uploadBrandingFile({
        clientName,
        fileName,
        body: base64,
        contentType: 'image/png',
        isBase64: true,
      }),
    });
  }

  const settled = await Promise.allSettled(uploads.map((u) => u.result));
  const uploadedFiles: string[] = [];

  settled.forEach((outcome, i) => {
    const name = uploads[i].fileName;
    if (outcome.status === 'fulfilled' && outcome.value) uploadedFiles.push(name);
    else uploadWarnings.push(`העלאת ${name} ל-Storage נכשלה`);
  });

  return {
    businessId,
    clientName,
    pulseemCreated,
    pulseemError,
    pulseemLoginUserName,
    pulseemDirectSmsCredits,
    uploadedFiles,
    uploadWarnings,
  };
}

/**
 * Manual Pulseem path — encryption happens in the Edge Function
 * (`encrypt_for_insert`); plaintext secrets never reach `business_profile`.
 */
async function saveManualPulseemCredentials(
  businessId: string,
  fields: { apiKey: string; wsPassword: string },
): Promise<{ ok: boolean; errorMessage?: string }> {
  const { invokeEdge, MSG_PULSEEM_401 } = await import('./pulseem-edge');

  const { data, status } = await invokeEdge<{
    pulseem_api_key?: string;
    pulseem_password?: string;
  }>('pulseem-admin-credentials', {
    action: 'encrypt_for_insert',
    ...(fields.apiKey ? { pulseem_api_key: fields.apiKey } : {}),
    ...(fields.wsPassword ? { pulseem_password: fields.wsPassword } : {}),
  });

  if (!data) {
    return {
      ok: false,
      errorMessage:
        status === 401
          ? MSG_PULSEEM_401
          : 'הצפנת פרטי פולסים נכשלה — ודא פריסת pulseem-admin-credentials ו-PULSEEM_FIELD_ENCRYPTION_KEY.',
    };
  }

  const patch: Record<string, unknown> = {};
  if (fields.apiKey) {
    if (!data.pulseem_api_key) return { ok: false, errorMessage: 'הצפנת מפתח ה-API נכשלה' };
    patch.pulseem_api_key = data.pulseem_api_key;
    patch.pulseem_has_api_key = true;
  }
  if (fields.wsPassword) {
    if (!data.pulseem_password) return { ok: false, errorMessage: 'הצפנת סיסמת ה-WS נכשלה' };
    patch.pulseem_password = data.pulseem_password;
    patch.pulseem_has_password = true;
  }

  const db = getServiceSupabase();
  const { error } = await db.from('business_profile').update(patch).eq('id', businessId);
  if (error) return { ok: false, errorMessage: `שמירת פרטי פולסים נכשלה: ${error.message}` };

  return { ok: true };
}
