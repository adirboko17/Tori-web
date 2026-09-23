import { getServiceSupabase } from '@/lib/sms/supabase-admin';
import { supabaseUrl } from '@/lib/superadmin/env';
import {
  HELP_BUCKET,
  asHelpI18n,
  compactI18n,
  isHelpAudience,
  isHelpIcon,
  isHelpSlug,
} from '@/lib/superadmin/help-shared';
import { storageRefFromPublicUrl } from '@/lib/superadmin/storage';
import type { HelpAudience, HelpCategory, HelpI18n, HelpVideo } from '@/lib/superadmin/types';

export class HelpCenterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HelpCenterError';
  }
}

const CATEGORY_COLUMNS =
  'id, slug, title, title_i18n, description, description_i18n, icon, sort_order, is_published, audience';

const VIDEO_COLUMNS =
  'id, category_id, slug, title, title_i18n, description, description_i18n, video_url, storage_path, thumbnail_url, duration_seconds, sort_order, is_published';

interface CategoryRow {
  id: string;
  slug: string;
  title: string;
  title_i18n: unknown;
  description: string | null;
  description_i18n: unknown;
  icon: string | null;
  sort_order: number | null;
  is_published: boolean | null;
  audience: string | null;
}

interface VideoRow {
  id: string;
  category_id: string;
  slug: string | null;
  title: string;
  title_i18n: unknown;
  description: string | null;
  description_i18n: unknown;
  video_url: string | null;
  storage_path: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  sort_order: number | null;
  is_published: boolean | null;
}

function mapVideo(row: VideoRow): HelpVideo {
  return {
    id: row.id,
    category_id: row.category_id,
    slug: row.slug,
    title: row.title,
    title_i18n: asHelpI18n(row.title_i18n),
    description: row.description,
    description_i18n: asHelpI18n(row.description_i18n),
    video_url: row.video_url ?? '',
    storage_path: row.storage_path,
    thumbnail_url: row.thumbnail_url,
    duration_seconds: row.duration_seconds,
    sort_order: row.sort_order ?? 0,
    is_published: row.is_published !== false,
  };
}

function mapCategory(row: CategoryRow, videos: HelpVideo[]): HelpCategory {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    title_i18n: asHelpI18n(row.title_i18n),
    description: row.description,
    description_i18n: asHelpI18n(row.description_i18n),
    icon: row.icon,
    sort_order: row.sort_order ?? 0,
    is_published: row.is_published !== false,
    audience: isHelpAudience(row.audience) ? row.audience : 'admin',
    videos,
  };
}

export async function getHelpCenter(): Promise<HelpCategory[]> {
  const db = getServiceSupabase();

  const { data: catData, error: catError } = await db
    .from('help_categories')
    .select(CATEGORY_COLUMNS)
    .order('sort_order', { ascending: true });

  if (catError) {
    console.error('[help] categories:', catError.message);
    throw new HelpCenterError('טעינת הקטגוריות נכשלה');
  }

  const { data: vidData, error: vidError } = await db
    .from('help_videos')
    .select(VIDEO_COLUMNS)
    .order('sort_order', { ascending: true });

  if (vidError) {
    console.error('[help] videos:', vidError.message);
    throw new HelpCenterError('טעינת הסרטונים נכשלה');
  }

  const videosByCat = new Map<string, HelpVideo[]>();
  for (const row of (vidData ?? []) as unknown as VideoRow[]) {
    const list = videosByCat.get(row.category_id) ?? [];
    list.push(mapVideo(row));
    videosByCat.set(row.category_id, list);
  }

  return ((catData ?? []) as unknown as CategoryRow[]).map((row) =>
    mapCategory(row, videosByCat.get(row.id) ?? []),
  );
}

export interface CategoryInput {
  slug: string;
  title: string;
  title_i18n?: HelpI18n;
  description?: string | null;
  description_i18n?: HelpI18n;
  icon?: string | null;
  sort_order?: number;
  is_published?: boolean;
  audience?: HelpAudience;
}

function normalizeCategoryInput(input: CategoryInput) {
  const slug = String(input.slug ?? '')
    .trim()
    .toLowerCase();
  const title = String(input.title ?? '').trim();
  if (!isHelpSlug(slug)) {
    throw new HelpCenterError('slug חייב להיות באנגלית קטנה עם מקפים, למשל book-for-client');
  }
  if (!title) throw new HelpCenterError('חסר שם לקטגוריה');

  const audience = input.audience ?? 'admin';
  if (!isHelpAudience(audience)) throw new HelpCenterError('קהל יעד לא תקין');

  const icon = input.icon?.trim() || null;
  if (icon && !isHelpIcon(icon)) {
    throw new HelpCenterError('אייקון לא נתמך');
  }

  const titleI18n = compactI18n({ he: title, ...input.title_i18n });

  return {
    slug,
    title,
    title_i18n: titleI18n,
    description: input.description?.trim() || null,
    description_i18n: compactI18n(input.description_i18n ?? {}),
    icon,
    sort_order: Number.isFinite(input.sort_order) ? Number(input.sort_order) : 0,
    is_published: input.is_published !== false,
    audience,
  };
}

export async function createHelpCategory(input: CategoryInput): Promise<HelpCategory> {
  const row = normalizeCategoryInput(input);
  const db = getServiceSupabase();

  const { data, error } = await db.from('help_categories').insert(row).select(CATEGORY_COLUMNS).single();
  if (error) {
    if (error.code === '23505') throw new HelpCenterError('כבר קיימת קטגוריה עם ה-slug הזה');
    console.error('[help] insert category:', error.message);
    throw new HelpCenterError('יצירת הקטגוריה נכשלה');
  }
  return mapCategory(data as unknown as CategoryRow, []);
}

export async function updateHelpCategory(id: string, input: Partial<CategoryInput>): Promise<HelpCategory> {
  const db = getServiceSupabase();
  const { data: existing, error: existingError } = await db
    .from('help_categories')
    .select(CATEGORY_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (existingError || !existing) throw new HelpCenterError('הקטגוריה לא נמצאה');

  const current = existing as unknown as CategoryRow;
  const merged = normalizeCategoryInput({
    slug: input.slug ?? current.slug,
    title: input.title ?? current.title,
    title_i18n: input.title_i18n ?? asHelpI18n(current.title_i18n),
    description: input.description === undefined ? current.description : input.description,
    description_i18n: input.description_i18n ?? asHelpI18n(current.description_i18n),
    icon: input.icon === undefined ? current.icon : input.icon,
    sort_order: input.sort_order ?? current.sort_order ?? 0,
    is_published: input.is_published ?? current.is_published !== false,
    audience: input.audience ?? (isHelpAudience(current.audience) ? current.audience : 'admin'),
  });

  const { data, error } = await db
    .from('help_categories')
    .update(merged)
    .eq('id', id)
    .select(CATEGORY_COLUMNS)
    .single();

  if (error) {
    if (error.code === '23505') throw new HelpCenterError('כבר קיימת קטגוריה עם ה-slug הזה');
    console.error('[help] update category:', error.message);
    throw new HelpCenterError('עדכון הקטגוריה נכשל');
  }

  const { data: vids } = await db
    .from('help_videos')
    .select(VIDEO_COLUMNS)
    .eq('category_id', id)
    .order('sort_order', { ascending: true });

  return mapCategory(
    data as unknown as CategoryRow,
    ((vids ?? []) as unknown as VideoRow[]).map(mapVideo),
  );
}

export async function deleteHelpCategory(id: string): Promise<void> {
  const db = getServiceSupabase();

  const { data: vids } = await db
    .from('help_videos')
    .select('storage_path, video_url, thumbnail_url')
    .eq('category_id', id);

  const { error } = await db.from('help_categories').delete().eq('id', id);
  if (error) {
    console.error('[help] delete category:', error.message);
    throw new HelpCenterError('מחיקת הקטגוריה נכשלה');
  }

  const paths = collectHelpStoragePaths(vids ?? []);
  if (paths.length) {
    const { error: storageError } = await db.storage.from(HELP_BUCKET).remove(paths);
    if (storageError) console.error('[help] delete category files:', storageError.message);
  }
}

export interface VideoInput {
  category_id: string;
  slug?: string | null;
  title: string;
  title_i18n?: HelpI18n;
  description?: string | null;
  description_i18n?: HelpI18n;
  video_url: string;
  storage_path?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  sort_order?: number;
  is_published?: boolean;
}

function normalizeVideoInput(input: VideoInput) {
  const categoryId = String(input.category_id ?? '').trim();
  const title = String(input.title ?? '').trim();
  const videoUrl = String(input.video_url ?? '').trim();
  const slugRaw = input.slug?.trim().toLowerCase() || null;

  if (!categoryId) throw new HelpCenterError('חסר מזהה קטגוריה');
  if (!title) throw new HelpCenterError('חסר שם לסרטון');
  if (!videoUrl || !/^https:\/\//i.test(videoUrl)) {
    throw new HelpCenterError('נדרש קישור https ישיר לקובץ וידאו');
  }
  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(videoUrl)) {
    throw new HelpCenterError('לא ניתן להשתמש בקישור YouTube/Vimeo — נדרש קובץ ישיר (mp4)');
  }
  if (slugRaw && !isHelpSlug(slugRaw)) {
    throw new HelpCenterError('slug חייב להיות באנגלית קטנה עם מקפים');
  }

  const duration =
    input.duration_seconds == null ? null : Math.max(0, Math.round(Number(input.duration_seconds)));

  return {
    category_id: categoryId,
    slug: slugRaw,
    title,
    title_i18n: compactI18n({ he: title, ...input.title_i18n }),
    description: input.description?.trim() || null,
    description_i18n: compactI18n(input.description_i18n ?? {}),
    video_url: videoUrl,
    storage_path: input.storage_path?.trim() || null,
    thumbnail_url: input.thumbnail_url?.trim() || null,
    duration_seconds: Number.isFinite(duration as number) ? duration : null,
    sort_order: Number.isFinite(input.sort_order) ? Number(input.sort_order) : 0,
    is_published: input.is_published !== false,
  };
}

export async function createHelpVideo(input: VideoInput): Promise<HelpVideo> {
  const row = normalizeVideoInput(input);
  const db = getServiceSupabase();

  const { data: cat } = await db.from('help_categories').select('id').eq('id', row.category_id).maybeSingle();
  if (!cat) throw new HelpCenterError('הקטגוריה לא נמצאה');

  const { data, error } = await db.from('help_videos').insert(row).select(VIDEO_COLUMNS).single();
  if (error) {
    if (error.code === '23505') throw new HelpCenterError('כבר קיים סרטון עם ה-slug הזה בקטגוריה');
    console.error('[help] insert video:', error.message);
    throw new HelpCenterError('יצירת הסרטון נכשלה');
  }
  return mapVideo(data as unknown as VideoRow);
}

export async function updateHelpVideo(id: string, input: Partial<VideoInput>): Promise<HelpVideo> {
  const db = getServiceSupabase();
  const { data: existing, error: existingError } = await db
    .from('help_videos')
    .select(VIDEO_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (existingError || !existing) throw new HelpCenterError('הסרטון לא נמצא');

  const current = existing as unknown as VideoRow;
  const merged = normalizeVideoInput({
    category_id: input.category_id ?? current.category_id,
    slug: input.slug === undefined ? current.slug : input.slug,
    title: input.title ?? current.title,
    title_i18n: input.title_i18n ?? asHelpI18n(current.title_i18n),
    description: input.description === undefined ? current.description : input.description,
    description_i18n: input.description_i18n ?? asHelpI18n(current.description_i18n),
    video_url: input.video_url ?? current.video_url ?? '',
    storage_path: input.storage_path === undefined ? current.storage_path : input.storage_path,
    thumbnail_url: input.thumbnail_url === undefined ? current.thumbnail_url : input.thumbnail_url,
    duration_seconds: input.duration_seconds === undefined ? current.duration_seconds : input.duration_seconds,
    sort_order: input.sort_order ?? current.sort_order ?? 0,
    is_published: input.is_published ?? current.is_published !== false,
  });

  const { data, error } = await db
    .from('help_videos')
    .update(merged)
    .eq('id', id)
    .select(VIDEO_COLUMNS)
    .single();

  if (error) {
    if (error.code === '23505') throw new HelpCenterError('כבר קיים סרטון עם ה-slug הזה בקטגוריה');
    console.error('[help] update video:', error.message);
    throw new HelpCenterError('עדכון הסרטון נכשל');
  }
  return mapVideo(data as unknown as VideoRow);
}

export async function deleteHelpVideo(id: string): Promise<void> {
  const db = getServiceSupabase();
  const { data: existing } = await db
    .from('help_videos')
    .select('storage_path, video_url, thumbnail_url')
    .eq('id', id)
    .maybeSingle();

  const { error } = await db.from('help_videos').delete().eq('id', id);
  if (error) {
    console.error('[help] delete video:', error.message);
    throw new HelpCenterError('מחיקת הסרטון נכשלה');
  }

  const paths = collectHelpStoragePaths(existing ? [existing] : []);
  if (paths.length) {
    const { error: storageError } = await db.storage.from(HELP_BUCKET).remove(paths);
    if (storageError) console.error('[help] delete video files:', storageError.message);
  }
}

const HELP_OBJECT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*(?:-thumb)?\.(mp4|jpg|jpeg|png|webp)$/;

export function assertHelpObjectPath(path: string): string {
  const clean = path.replace(/^\/+/, '').trim().toLowerCase();
  if (!HELP_OBJECT_RE.test(clean)) {
    throw new HelpCenterError('נתיב הקובץ אינו תקין — category-slug/video-slug.mp4');
  }
  return clean;
}

export async function createHelpUploadUrl(path: string, upsert = true): Promise<{
  path: string;
  signedUrl: string;
  token: string;
  publicUrl: string;
}> {
  const clean = assertHelpObjectPath(path);
  const db = getServiceSupabase();
  const { data, error } = await db.storage.from(HELP_BUCKET).createSignedUploadUrl(clean, { upsert });
  if (error || !data) {
    console.error('[help] signed upload:', error?.message);
    throw new HelpCenterError('לא ניתן להכין העלאה ל-Storage');
  }

  const signed = data.signedUrl.startsWith('http')
    ? data.signedUrl
    : `${supabaseUrl()}/storage/v1${data.signedUrl.startsWith('/') ? '' : '/'}${data.signedUrl}`;

  return {
    path: clean,
    signedUrl: signed,
    token: data.token,
    publicUrl: `${supabaseUrl()}/storage/v1/object/public/${HELP_BUCKET}/${clean}`,
  };
}

function collectHelpStoragePaths(
  rows: Array<{ storage_path?: string | null; video_url?: string | null; thumbnail_url?: string | null }>,
): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    if (row.storage_path) set.add(row.storage_path.replace(/^\/+/, ''));
    for (const url of [row.video_url, row.thumbnail_url]) {
      if (!url) continue;
      const ref = storageRefFromPublicUrl(url);
      if (ref?.bucket === HELP_BUCKET) set.add(ref.path);
    }
  }
  return [...set];
}
