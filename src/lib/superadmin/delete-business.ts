import { getServiceSupabase } from '@/lib/sms/supabase-admin';
import type { DeleteBusinessResult } from '@/lib/superadmin/types';
import {
  BRANDING_BUCKET,
  BRANDING_ROOT,
  addStorageUrlToMap,
  addStorageUrlsFromList,
  removeStorageRefsInBatches,
} from './storage';
import { deletePulseemSubAccount } from './pulseem-edge';

/**
 * Child tables, deleted before `business_profile`.
 * Order mirrors the RN app: leaves first so nothing is orphaned mid-way.
 */
/**
 * Every public table that stores rows for one app.
 * Dependents come first so a foreign key cannot block the parent delete.
 */
const CHILD_TABLES = [
  'health_form_submissions',
  'health_form_questions',
  'health_form_assignments',
  'health_forms',
  'swap_request_dismissals',
  'swap_requests',
  'calendar_reminders',
  'notifications',
  'waitlist_entries',
  'appointments',
  'recurring_appointments',
  'client_service_durations',
  'scheduled_broadcasts',
  'messages',
  'designs',
  'products',
  'business_expenses',
  'business_insights',
  'business_hours_overrides',
  'business_hours',
  'business_constraints',
  'services',
  'branches',
  'assistant_personal_memory',
  'assistant_usage_months',
  'auth_otp_send_log',
  'auth_phone_otp_challenges',
  'auth_register_profile_tokens',
  'sms_topup_orders',
  'site_cancellation_requests',
  'site_payplus_subscriptions',
  'users',
] as const;

/** Ported from `superAdminApi.deleteBusiness`, with a per-table report for the UI. */
export async function deleteBusiness(businessId: string): Promise<DeleteBusinessResult> {
  const db = getServiceSupabase();

  // 1. Pulseem sub-account first — best-effort, never blocks the DB delete.
  const pulseem = await deletePulseemSubAccount(businessId);

  const deletedRows: Record<string, number> = {};
  const tableErrors: Record<string, string> = {};

  // 2. Collect every Storage object referenced by this business.
  const { data: profilePeek } = await db
    .from('business_profile')
    .select('branding_client_name, home_hero_images, home_hero_single_url')
    .eq('id', businessId)
    .maybeSingle();

  const peek = profilePeek as {
    branding_client_name?: string | null;
    home_hero_images?: unknown;
    home_hero_single_url?: unknown;
  } | null;

  const brandingFolder = peek?.branding_client_name?.trim() || null;

  const storagePathsByBucket = new Map<string, Set<string>>();
  addStorageUrlsFromList(storagePathsByBucket, peek?.home_hero_images);
  addStorageUrlToMap(storagePathsByBucket, peek?.home_hero_single_url);

  const [designsRes, usersRes, productsRes] = await Promise.all([
    db.from('designs').select('image_url, image_urls').eq('business_id', businessId),
    db.from('users').select('image_url').eq('business_id', businessId),
    db.from('products').select('image_url').eq('business_id', businessId),
  ]);

  const expensesRes = await db
    .from('business_expenses')
    .select('receipt_url')
    .eq('business_id', businessId);
  if (expensesRes.error) {
    console.warn('[deleteBusiness] business_expenses fetch skipped:', expensesRes.error.message);
  }

  for (const row of designsRes.data ?? []) {
    addStorageUrlToMap(storagePathsByBucket, (row as { image_url?: string }).image_url);
    addStorageUrlsFromList(storagePathsByBucket, (row as { image_urls?: unknown }).image_urls);
  }
  for (const row of usersRes.data ?? []) {
    addStorageUrlToMap(storagePathsByBucket, (row as { image_url?: string }).image_url);
  }
  for (const row of productsRes.data ?? []) {
    addStorageUrlToMap(storagePathsByBucket, (row as { image_url?: string }).image_url);
  }
  if (!expensesRes.error) {
    for (const row of expensesRes.data ?? []) {
      addStorageUrlToMap(storagePathsByBucket, (row as { receipt_url?: string }).receipt_url);
    }
  }

  // 3. Child tables.
  for (const table of CHILD_TABLES) {
    // `count: 'exact'` avoids `.select('id')`, which would fail on any table
    // without an `id` column.
    const { count, error } = await db
      .from(table)
      .delete({ count: 'exact' })
      .eq('business_id', businessId);

    if (error) {
      const missing =
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        /does not exist|schema cache/i.test(error.message);
      if (!missing) {
        console.error(`[deleteBusiness] ${table}:`, error.message);
        tableErrors[table] = error.message;
      }
    } else {
      deletedRows[table] = count ?? 0;
    }
  }

  const { error: adminPhoneError } = await db
    .from('site_admin_phones')
    .update({ otp_business_id: null })
    .eq('otp_business_id', businessId);
  if (adminPhoneError && adminPhoneError.code !== '42P01' && adminPhoneError.code !== 'PGRST205') {
    console.error('[deleteBusiness] site_admin_phones:', adminPhoneError.message);
    tableErrors.site_admin_phones = adminPhoneError.message;
  }

  // 4. The profile row itself.
  const { error: profileError } = await db
    .from('business_profile')
    .delete()
    .eq('id', businessId);

  if (profileError) {
    console.error('[deleteBusiness] business_profile:', profileError.message);
    return {
      success: false,
      pulseem,
      deletedRows,
      tableErrors: { ...tableErrors, business_profile: profileError.message },
      deletedStorageFiles: 0,
      brandingFolder,
      brandingFolderDeleted: false,
    };
  }

  // 5. Branding folder.
  let brandingFolderDeleted = false;
  let resolvedFolder = brandingFolder;

  if (brandingFolder) {
    brandingFolderDeleted = await removeStoragePrefix(`${BRANDING_ROOT}/${brandingFolder}`);
  } else {
    const found = await findAndRemoveBrandingFolderByBusinessId(businessId);
    resolvedFolder = found.folder;
    brandingFolderDeleted = found.deleted;
  }

  // 6. Loose objects (hero images, avatars, receipts…).
  const deletedStorageFiles = await removeStorageRefsInBatches(db, storagePathsByBucket);

  return {
    success: true,
    pulseem,
    deletedRows,
    tableErrors,
    deletedStorageFiles,
    brandingFolder: resolvedFolder,
    brandingFolderDeleted,
  };
}

async function removeStoragePrefix(prefix: string): Promise<boolean> {
  const db = getServiceSupabase();

  const { data: files, error: listErr } = await db.storage.from(BRANDING_BUCKET).list(prefix);
  if (listErr) {
    console.error(`[deleteBusiness] list ${prefix}:`, listErr.message);
    return false;
  }
  if (!files?.length) return false;

  const paths = files.map((f) => `${prefix}/${f.name}`);
  const { error: remErr } = await db.storage.from(BRANDING_BUCKET).remove(paths);
  if (remErr) {
    console.error(`[deleteBusiness] remove ${prefix}:`, remErr.message);
    return false;
  }
  return true;
}

/** Fallback when `branding_client_name` is missing: find the folder whose `.env` names this business. */
async function findAndRemoveBrandingFolderByBusinessId(
  businessId: string,
): Promise<{ folder: string | null; deleted: boolean }> {
  const db = getServiceSupabase();

  const { data: folders } = await db.storage.from(BRANDING_BUCKET).list(BRANDING_ROOT);
  if (!folders?.length) return { folder: null, deleted: false };

  for (const folder of folders) {
    if (folder.name.includes('.')) continue;

    const { data: files } = await db.storage
      .from(BRANDING_BUCKET)
      .list(`${BRANDING_ROOT}/${folder.name}`);
    if (!files?.length) continue;
    if (!files.some((f) => f.name === '.env')) continue;

    const { data: envBlob } = await db.storage
      .from(BRANDING_BUCKET)
      .download(`${BRANDING_ROOT}/${folder.name}/.env`);
    if (!envBlob) continue;

    const envText = await envBlob.text();
    if (!envText.includes(businessId)) continue;

    const paths = files.map((f) => `${BRANDING_ROOT}/${folder.name}/${f.name}`);
    const { error } = await db.storage.from(BRANDING_BUCKET).remove(paths);
    return { folder: folder.name, deleted: !error };
  }

  return { folder: null, deleted: false };
}
