import type { SupabaseClient } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/sms/supabase-admin';
import { supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from '@/lib/superadmin/env';

export const BRANDING_BUCKET = 'app_design';
export const BRANDING_ROOT = 'branding';

/** Text files inside a branding folder that the dashboard renders inline. */
export const TEXT_BRANDING_FILES = ['.env', 'app.config.json', 'theme.json'] as const;

export function brandingPath(clientName: string, fileName: string): string {
  return `${BRANDING_ROOT}/${clientName}/${fileName}`;
}

/* ------------------------------------------------------------------ *
 * Upload / download
 * ------------------------------------------------------------------ */

export async function uploadBrandingFile(args: {
  clientName: string;
  fileName: string;
  body: string;
  contentType: string;
  isBase64?: boolean;
}): Promise<string | null> {
  const client = getServiceSupabase();
  const path = brandingPath(args.clientName, args.fileName);

  try {
    const payload: Uint8Array = args.isBase64
      ? Buffer.from(args.body.replace(/^data:[^;]+;base64,/, ''), 'base64')
      : new TextEncoder().encode(args.body);

    const { error } = await client.storage.from(BRANDING_BUCKET).upload(path, payload, {
      contentType: args.contentType,
      upsert: true,
      cacheControl: args.isBase64 ? '0' : '3600',
    });

    if (error) {
      console.error(`[storage] upload ${path}:`, error.message);
      return null;
    }

    const { data } = client.storage.from(BRANDING_BUCKET).getPublicUrl(path);
    return data?.publicUrl ?? null;
  } catch (err) {
    console.error(`[storage] upload ${path} threw:`, err);
    return null;
  }
}

export async function downloadBrandingFileText(
  clientName: string,
  fileName: string,
): Promise<string | null> {
  const client = getServiceSupabase();
  try {
    const { data, error } = await client.storage
      .from(BRANDING_BUCKET)
      .download(brandingPath(clientName, fileName));
    if (error || !data) return null;
    return await data.text();
  } catch (err) {
    console.error(`[storage] download ${clientName}/${fileName}:`, err);
    return null;
  }
}

export function brandingPublicUrl(clientName: string, fileName: string): string {
  const { data } = getServiceSupabase()
    .storage.from(BRANDING_BUCKET)
    .getPublicUrl(brandingPath(clientName, fileName));
  return data?.publicUrl ?? '';
}

/* ------------------------------------------------------------------ *
 * Folder resolution
 * ------------------------------------------------------------------ */

/**
 * Finds the storage folder for a business. Prefers `business_profile.branding_client_name`;
 * falls back to scanning every `branding/*` folder for a `.env` naming this business id.
 */
export async function resolveBrandingClientName(
  businessId: string,
  hint: string | null,
): Promise<string | null> {
  const h = hint?.trim();
  if (h) return h;

  const client = getServiceSupabase();
  const { data: folders, error } = await client.storage.from(BRANDING_BUCKET).list(BRANDING_ROOT);
  if (error || !folders?.length) return null;

  for (const folder of folders) {
    if (folder.name.includes('.')) continue; // a file, not a client folder
    const text = await downloadBrandingFileText(folder.name, '.env');
    if (!text) continue;
    const m = text.match(/^\s*BUSINESS_ID\s*=\s*(\S+)/m);
    if (m && m[1] === businessId) return folder.name;
  }
  return null;
}

export async function listBrandingFolder(clientName: string) {
  const client = getServiceSupabase();
  const { data, error } = await client.storage
    .from(BRANDING_BUCKET)
    .list(`${BRANDING_ROOT}/${clientName}`);
  if (error) {
    console.error(`[storage] list branding/${clientName}:`, error.message);
    return [];
  }
  return data ?? [];
}

/* ------------------------------------------------------------------ *
 * .env merging
 * ------------------------------------------------------------------ */

/**
 * Replaces `KEY=` lines in place, appending anything unmatched under a
 * `# Pulseem SMS (OTP)` comment block. Ported from the RN app so the produced
 * `.env` stays byte-compatible with what `scripts/pull-branding.mjs` expects.
 */
export function mergeEnvKeyValues(content: string, pairs: Record<string, string>): string {
  const keys = new Set(Object.keys(pairs));
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const used = new Set<string>();
  const out: string[] = [];

  for (const line of lines) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && keys.has(m[1])) {
      out.push(`${m[1]}=${pairs[m[1]]}`);
      used.add(m[1]);
    } else {
      out.push(line);
    }
  }

  const tail: string[] = [];
  for (const k of keys) {
    if (!used.has(k)) tail.push(`${k}=${pairs[k]}`);
  }

  if (tail.length) {
    const body = out.join('\n').replace(/\s+$/, '');
    const sep = body && !body.endsWith('\n') ? '\n' : '';
    const block = `\n# Pulseem SMS (OTP)\n${tail.join('\n')}\n`;
    return (body ? body + sep : '') + block;
  }
  return out.join('\n');
}

/**
 * Merges Pulseem keys into `branding/<client>/.env` in Storage, creating the file
 * when the folder exists but has no `.env` yet. Also back-fills
 * `business_profile.branding_client_name` when it was resolved by scanning.
 */
export async function syncPulseemEnvToBrandingStorage(
  businessId: string,
  envPlaintext: Record<string, string>,
): Promise<boolean> {
  const db = getServiceSupabase();

  const { data: hintRow } = await db
    .from('business_profile')
    .select('branding_client_name')
    .eq('id', businessId)
    .maybeSingle();

  const hint = (hintRow as { branding_client_name?: string | null } | null)?.branding_client_name;
  const clientName = await resolveBrandingClientName(businessId, hint ?? null);

  if (clientName && !hint?.trim()) {
    await db
      .from('business_profile')
      .update({ branding_client_name: clientName })
      .eq('id', businessId);
  }

  if (!clientName) return false;

  let envText = await downloadBrandingFileText(clientName, '.env');
  if (!envText) {
    envText = [
      `# Synced from Super Admin — ${clientName}`,
      `EXPO_PUBLIC_SUPABASE_URL=${supabaseUrl()}`,
      `EXPO_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey()}`,
      `EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceRoleKey()}`,
      `BUSINESS_ID=${businessId}`,
      `CLIENT_NAME=${clientName}`,
      '',
    ].join('\n');
  }

  const merged = mergeEnvKeyValues(envText, envPlaintext);
  const uploaded = await uploadBrandingFile({
    clientName,
    fileName: '.env',
    body: merged,
    contentType: 'text/plain',
  });
  return !!uploaded;
}

/* ------------------------------------------------------------------ *
 * Public URL → storage ref (used when deleting a business)
 * ------------------------------------------------------------------ */

export interface StorageRef {
  bucket: string;
  path: string;
}

export function storageRefFromPublicUrl(url: string): StorageRef | null {
  const s = String(url || '').trim();
  if (!s) return null;

  const marker = '/storage/v1/object/public/';
  const i = s.indexOf(marker);
  if (i === -1) return null;

  const rest = s.slice(i + marker.length);
  const slash = rest.indexOf('/');
  if (slash <= 0) return null;

  const bucket = rest.slice(0, slash);
  let objectPath = rest.slice(slash + 1);

  const q = objectPath.indexOf('?');
  if (q !== -1) objectPath = objectPath.slice(0, q);
  if (!objectPath) return null;

  try {
    objectPath = decodeURIComponent(objectPath);
  } catch {
    /* keep raw */
  }
  return { bucket, path: objectPath };
}

export function addStorageUrlToMap(map: Map<string, Set<string>>, url: unknown) {
  if (typeof url !== 'string') return;
  const ref = storageRefFromPublicUrl(url);
  if (!ref) return;
  let set = map.get(ref.bucket);
  if (!set) {
    set = new Set();
    map.set(ref.bucket, set);
  }
  set.add(ref.path);
}

export function addStorageUrlsFromList(map: Map<string, Set<string>>, urls: unknown) {
  if (!Array.isArray(urls)) return;
  for (const u of urls) addStorageUrlToMap(map, u);
}

/** Storage `remove()` caps the number of keys per call — chunk at 100. */
export async function removeStorageRefsInBatches(
  client: SupabaseClient,
  byBucket: Map<string, Set<string>>,
): Promise<number> {
  const BATCH = 100;
  let removed = 0;

  for (const [bucket, set] of byBucket) {
    const paths = [...set];
    for (let i = 0; i < paths.length; i += BATCH) {
      const chunk = paths.slice(i, i + BATCH);
      const { error } = await client.storage.from(bucket).remove(chunk);
      if (error) console.error(`[storage] remove ${bucket}:`, error.message);
      else removed += chunk.length;
    }
  }
  return removed;
}
