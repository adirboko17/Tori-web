"use client";

import { useState } from "react";
import { adminJson } from "@/lib/superadmin/browser";
import { formatDurationSeconds } from "@/lib/superadmin/format";
import { HELP_AUDIENCES, HELP_ICONS, isHelpSlug, slugifyHelp } from "@/lib/superadmin/help-shared";
import type { HelpAudience, HelpCategory, HelpI18n, HelpVideo } from "@/lib/superadmin/types";
import { Drawer } from "../../../_ui/drawer";
import { useConfirm, useToast } from "../../../_ui/feedback";
import { Icon } from "../../../_ui/icon";
import { Badge, EmptyState, ErrorState, Field, SkeletonRows, Switch } from "../../../_ui/parts";
import { UploadTile } from "../../../_ui/upload-tile";
import { useAdminData } from "../../../_ui/use-admin-data";

function audienceLabel(audience: HelpAudience) {
  return HELP_AUDIENCES.find((item) => item.value === audience)?.label ?? audience;
}

function nextSortOrder(items: { sort_order: number }[]) {
  return items.reduce((max, item) => Math.max(max, Number(item.sort_order) || 0), 0) + 10;
}

async function uploadHelpFile(path: string, file: File) {
  const prepared = await adminJson<{ signedUrl: string; publicUrl: string; token?: string }>("/api/admin/help/upload-url", {
    method: "POST",
    body: JSON.stringify({ path, upsert: true }),
  });
  const put = await fetch(prepared.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
      ...(prepared.token ? { Authorization: `Bearer ${prepared.token}` } : {}),
    },
    body: file,
  });
  if (!put.ok) throw new Error("העלאת הקובץ נכשלה");
  return `${prepared.publicUrl}?t=${Date.now()}`;
}

function readVideoDuration(file: File) {
  return new Promise<number | null>((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(video.duration) ? Math.round(video.duration) : null);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    video.src = url;
  });
}

function CategoryDrawer({
  category,
  sortOrder,
  onClose,
  onSaved,
}: {
  category: HelpCategory | null;
  sortOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const [title, setTitle] = useState(category?.title ?? "");
  const [titleEn, setTitleEn] = useState(category?.title_i18n.en ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const [description, setDescription] = useState(category?.description ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "help");
  const [audience, setAudience] = useState<HelpAudience>(category?.audience ?? "admin");
  const [published, setPublished] = useState(category?.is_published ?? true);
  const [pending, setPending] = useState(false);
  const cleanSlug = slug.trim().toLowerCase();
  const slugError = cleanSlug && !isHelpSlug(cleanSlug) ? "אותיות קטנות באנגלית, ספרות ומקפים" : "";
  const valid = title.trim() && isHelpSlug(cleanSlug);

  async function save() {
    if (!valid) return;
    setPending(true);
    try {
      const title_i18n: HelpI18n = { ...(category?.title_i18n ?? {}), he: title.trim() };
      if (titleEn.trim()) title_i18n.en = titleEn.trim();
      else delete title_i18n.en;
      const body = JSON.stringify({
        title: title.trim(),
        title_i18n,
        slug: cleanSlug,
        description,
        icon,
        audience,
        is_published: published,
        ...(category ? {} : { sort_order: sortOrder }),
      });
      if (category) await adminJson(`/api/admin/help/categories/${category.id}`, { method: "PATCH", body });
      else await adminJson("/api/admin/help/categories", { method: "POST", body });
      toast.success(category ? "הקטגוריה עודכנה" : "הקטגוריה נוספה");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "שמירת הקטגוריה נכשלה");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!category) return;
    const ok = await confirm({
      title: `למחוק את "${category.title}"?`,
      body: `יימחקו גם ${category.videos.length} הסרטונים שבקטגוריה.`,
      confirmLabel: "מחיקה",
      tone: "danger",
    });
    if (!ok) return;
    setPending(true);
    try {
      await adminJson(`/api/admin/help/categories/${category.id}`, { method: "DELETE" });
      toast.success("הקטגוריה נמחקה");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "מחיקת הקטגוריה נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={category ? "עריכת קטגוריה" : "קטגוריה חדשה"}
      description="קטגוריה מקבצת סרטונים במרכז העזרה של כל האפליקציות."
      onSubmit={() => void save()}
      footer={
        <>
          <button type="submit" className="ad-btn is-primary" disabled={!valid || pending}>
            {pending ? "שומר…" : category ? "שמירה" : "הוספת הקטגוריה"}
          </button>
          <button type="button" className="ad-btn is-secondary" onClick={onClose}>
            ביטול
          </button>
          {category ? (
            <>
              <span className="ad-spacer" />
              <button type="button" className="ad-btn is-danger-ghost" disabled={pending} onClick={() => void remove()}>
                <Icon name="trash-2" size={16} />
                מחיקה
              </button>
            </>
          ) : null}
        </>
      }
    >
      <Field label="שם הקטגוריה">
        <input className="ad-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="למשל: ניהול תורים" />
      </Field>
      <Field label="שם באנגלית" hint="משמש גם לכתובת הקטגוריה">
        <input
          className="ad-input"
          dir="ltr"
          value={titleEn}
          onChange={(event) => {
            setTitleEn(event.target.value);
            if (!slugTouched) setSlug(slugifyHelp(event.target.value));
          }}
          placeholder="Appointments"
        />
      </Field>
      <Field label="תיאור" hint="לא חובה">
        <textarea className="ad-textarea" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
      </Field>
      <div className="ad-form-grid">
        <Field label="למי מוצג">
          <select className="ad-select" value={audience} onChange={(event) => setAudience(event.target.value as HelpAudience)}>
            {HELP_AUDIENCES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="אייקון באפליקציה">
          <select className="ad-select" dir="ltr" value={icon} onChange={(event) => setIcon(event.target.value)}>
            {HELP_ICONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Switch checked={published} onChange={setPublished} label="מפורסמת באפליקציות" />
      <details className="ad-details" open={Boolean(slugError) || undefined}>
        <summary>
          הגדרות מתקדמות
          <span className="ad-spacer" />
          <Icon name="chevron-down" size={16} />
        </summary>
        <div className="ad-details-body">
          <Field label="מזהה בכתובת (slug)" error={slugError} hint={!cleanSlug ? "נוצר אוטומטית מהשם באנגלית" : undefined}>
            <input
              className="ad-input"
              dir="ltr"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
            />
          </Field>
        </div>
      </details>
    </Drawer>
  );
}

function VideoDrawer({
  category,
  video,
  onClose,
  onSaved,
}: {
  category: HelpCategory;
  video: HelpVideo | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [title, setTitle] = useState(video?.title ?? "");
  const [titleEn, setTitleEn] = useState(video?.title_i18n.en ?? "");
  const [slug, setSlug] = useState(video?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(video));
  const [description, setDescription] = useState(video?.description ?? "");
  const [source, setSource] = useState<"file" | "url">("file");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(video?.duration_seconds ? String(video.duration_seconds) : "");
  const [published, setPublished] = useState(video?.is_published ?? true);
  const [pending, setPending] = useState(false);
  const cleanSlug = slug.trim().toLowerCase();
  const slugError = cleanSlug && !isHelpSlug(cleanSlug) ? "אותיות קטנות באנגלית, ספרות ומקפים" : "";
  const hasSource = Boolean(video) || (source === "file" ? Boolean(videoFile) : /^https:\/\//i.test(videoUrl.trim()));
  const valid = Boolean(title.trim()) && !slugError && hasSource;

  async function pickVideo(file: File | null) {
    setVideoFile(file);
    if (file && !duration) {
      const seconds = await readVideoDuration(file);
      if (seconds) setDuration(String(seconds));
    }
  }

  async function save() {
    if (!valid) return;
    setPending(true);
    try {
      const fileSlug = cleanSlug || slugifyHelp(titleEn) || `video-${Date.now()}`;
      const title_i18n: HelpI18n = { ...(video?.title_i18n ?? {}), he: title.trim() };
      if (titleEn.trim()) title_i18n.en = titleEn.trim();
      else delete title_i18n.en;
      const payload: Record<string, unknown> = {
        title: title.trim(),
        title_i18n,
        slug: cleanSlug || null,
        description,
        duration_seconds: duration.trim() ? Number(duration) : null,
        is_published: published,
      };
      if (thumbFile) {
        const ext = thumbFile.type === "image/png" ? "png" : thumbFile.type === "image/webp" ? "webp" : "jpg";
        payload.thumbnail_url = await uploadHelpFile(`${category.slug}/${fileSlug}-thumb.${ext}`, thumbFile);
      }
      if (video) {
        await adminJson(`/api/admin/help/videos/${video.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        let storagePath: string | null = null;
        let finalUrl = videoUrl.trim();
        if (source === "file" && videoFile) {
          storagePath = `${category.slug}/${fileSlug}.mp4`;
          finalUrl = await uploadHelpFile(storagePath, videoFile);
        }
        await adminJson("/api/admin/help/videos", {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            category_id: category.id,
            video_url: finalUrl,
            storage_path: storagePath,
            thumbnail_url: payload.thumbnail_url ?? null,
            sort_order: nextSortOrder(category.videos),
          }),
        });
      }
      toast.success(video ? "הסרטון עודכן" : "הסרטון נוסף");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "שמירת הסרטון נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={video ? "עריכת סרטון" : "סרטון חדש"}
      description={`בקטגוריה "${category.title}"`}
      onSubmit={() => void save()}
      footer={
        <>
          <button type="submit" className="ad-btn is-primary" disabled={!valid || pending}>
            {pending ? (video ? "שומר…" : "מעלה…") : video ? "שמירה" : "הוספת הסרטון"}
          </button>
          <button type="button" className="ad-btn is-secondary" onClick={onClose} disabled={pending}>
            ביטול
          </button>
        </>
      }
    >
      <Field label="שם הסרטון">
        <input className="ad-input" value={title} onChange={(event) => setTitle(event.target.value)} />
      </Field>
      <Field label="שם באנגלית" hint="לא חובה">
        <input
          className="ad-input"
          dir="ltr"
          value={titleEn}
          onChange={(event) => {
            setTitleEn(event.target.value);
            if (!slugTouched) setSlug(slugifyHelp(event.target.value));
          }}
        />
      </Field>
      <Field label="תיאור" hint="לא חובה">
        <textarea className="ad-textarea" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
      </Field>

      {video ? null : (
        <div className="ad-field">
          <span className="ad-field-label">הסרטון</span>
          <div className="ad-chips" role="group" aria-label="מקור הסרטון">
            <button type="button" className="ad-chip" aria-pressed={source === "file"} onClick={() => setSource("file")}>
              <Icon name="upload" size={15} />
              העלאת קובץ
            </button>
            <button type="button" className="ad-chip" aria-pressed={source === "url"} onClick={() => setSource("url")}>
              <Icon name="link" size={15} />
              קישור ישיר
            </button>
          </div>
          {source === "file" ? (
            <label className="ad-upload">
              <input
                key={videoFile ? "selected" : "empty"}
                type="file"
                accept="video/mp4"
                onChange={(event) => void pickVideo(event.target.files?.[0] ?? null)}
              />
              <span className="ad-upload-thumb">
                <Icon name="video" size={20} />
              </span>
              <span>
                <strong>קובץ MP4</strong>
                <span>{videoFile ? videoFile.name : "לחצו לבחירת קובץ"}</span>
              </span>
            </label>
          ) : (
            <input
              className="ad-input"
              dir="ltr"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="https://…/video.mp4"
            />
          )}
        </div>
      )}

      <div className="ad-form-grid">
        <UploadTile label="תמונה ממוזערת" hint={video?.thumbnail_url ? "החלפת התמונה הקיימת" : "לא חובה"} file={thumbFile} onChange={setThumbFile} />
        <Field label="משך" hint={videoFile ? "זוהה מהקובץ" : "בשניות"}>
          <div className="ad-input-group">
            <input
              className="ad-input"
              dir="ltr"
              type="number"
              inputMode="numeric"
              min={0}
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
            <span className="ad-input-affix">שנ׳</span>
          </div>
        </Field>
      </div>
      <Switch checked={published} onChange={setPublished} label="מפורסם באפליקציות" />
      <details className="ad-details" open={Boolean(slugError) || undefined}>
        <summary>
          הגדרות מתקדמות
          <span className="ad-spacer" />
          <Icon name="chevron-down" size={16} />
        </summary>
        <div className="ad-details-body">
          <Field label="מזהה (slug)" error={slugError} hint="נוצר אוטומטית מהשם באנגלית. קובע גם את שם הקובץ.">
            <input
              className="ad-input"
              dir="ltr"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
            />
          </Field>
        </div>
      </details>
    </Drawer>
  );
}

function CategoryCard({
  category,
  onEdit,
  onAddVideo,
  onEditVideo,
  onChange,
}: {
  category: HelpCategory;
  onEdit: () => void;
  onAddVideo: () => void;
  onEditVideo: (video: HelpVideo) => void;
  onChange: () => void;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const [busyId, setBusyId] = useState("");

  async function togglePublished(video: HelpVideo, value: boolean) {
    setBusyId(video.id);
    try {
      await adminJson(`/api/admin/help/videos/${video.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_published: value }),
      });
      toast.success(value ? "הסרטון פורסם" : "הסרטון הוסתר");
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "העדכון נכשל");
    } finally {
      setBusyId("");
    }
  }

  async function remove(video: HelpVideo) {
    const ok = await confirm({
      title: `למחוק את "${video.title}"?`,
      body: "הסרטון יוסר ממרכז העזרה בכל האפליקציות.",
      confirmLabel: "מחיקה",
      tone: "danger",
    });
    if (!ok) return;
    setBusyId(video.id);
    try {
      await adminJson(`/api/admin/help/videos/${video.id}`, { method: "DELETE" });
      toast.success("הסרטון נמחק");
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "מחיקת הסרטון נכשלה");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="ad-card">
      <div className="ad-card-head">
        <div>
          <h2>
            <Icon name="book-open" />
            {category.title}
            {category.is_published ? null : <Badge>טיוטה</Badge>}
          </h2>
          <p>
            {audienceLabel(category.audience)} · {category.videos.length} סרטונים
          </p>
        </div>
        <span className="ad-row">
          <button type="button" className="ad-btn is-secondary is-sm" onClick={onAddVideo}>
            <Icon name="plus" size={16} />
            סרטון
          </button>
          <button type="button" className="ad-icon-btn" aria-label={`עריכת ${category.title}`} onClick={onEdit}>
            <Icon name="pencil" size={16} />
          </button>
        </span>
      </div>
      {category.videos.length === 0 ? (
        <div className="ad-card-body ad-small ad-muted">אין סרטונים בקטגוריה הזו עדיין.</div>
      ) : (
        <div className="ad-list">
          {category.videos.map((video) => (
            <div key={video.id} className="ad-list-item">
              <span
                className="ad-list-icon"
                style={{ width: 56, height: 36, overflow: "hidden", borderRadius: 8 }}
              >
                {video.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage asset
                  <img src={video.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Icon name="play" size={16} />
                )}
              </span>
              <span className="ad-list-main">
                <span className="ad-list-title">{video.title}</span>
                <span className="ad-list-sub">
                  <span dir="ltr">{formatDurationSeconds(video.duration_seconds)}</span>
                  {video.slug ? (
                    <>
                      {" · "}
                      <span dir="ltr">{video.slug}</span>
                    </>
                  ) : null}
                </span>
              </span>
              <span className="ad-list-actions">
                <Switch
                  checked={video.is_published}
                  disabled={busyId === video.id}
                  onChange={(value) => void togglePublished(video, value)}
                  ariaLabel={`פרסום ${video.title}`}
                  label={<span className="ad-small ad-muted ad-hide-mobile">{video.is_published ? "מפורסם" : "מוסתר"}</span>}
                />
                <a
                  className="ad-icon-btn"
                  href={video.video_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`צפייה ב${video.title}`}
                >
                  <Icon name="external-link" size={16} />
                </a>
                <button type="button" className="ad-icon-btn" aria-label={`עריכת ${video.title}`} onClick={() => onEditVideo(video)}>
                  <Icon name="pencil" size={16} />
                </button>
                <button
                  type="button"
                  className="ad-icon-btn"
                  aria-label={`מחיקת ${video.title}`}
                  disabled={busyId === video.id}
                  onClick={() => void remove(video)}
                >
                  <Icon name="trash-2" size={16} />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

type Editing =
  | { kind: "category"; category: HelpCategory | null }
  | { kind: "video"; category: HelpCategory; video: HelpVideo | null }
  | null;

export default function VideosPage() {
  const { data, error, loading, reload } = useAdminData<{ categories: HelpCategory[] }>("/api/admin/help");
  const [editing, setEditing] = useState<Editing>(null);
  const categories = data?.categories ?? [];

  return (
    <>
      <div className="ad-row">
        <span className="ad-small ad-muted">
          תוכן גלובלי לכל העסקים. הקבצים נשמרים באחסון של מרכז העזרה.
        </span>
        <span className="ad-spacer" />
        <button type="button" className="ad-btn is-primary is-sm" onClick={() => setEditing({ kind: "category", category: null })}>
          <Icon name="plus" size={16} />
          קטגוריה חדשה
        </button>
      </div>

      {error && !data ? (
        <div className="ad-card">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : loading ? (
        <div className="ad-card">
          <SkeletonRows rows={4} />
        </div>
      ) : categories.length === 0 ? (
        <div className="ad-card">
          <EmptyState icon="video" title="אין קטגוריות עדיין" body="צרו קטגוריה ראשונה ואז הוסיפו לה סרטונים." />
        </div>
      ) : (
        categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={() => setEditing({ kind: "category", category })}
            onAddVideo={() => setEditing({ kind: "video", category, video: null })}
            onEditVideo={(video) => setEditing({ kind: "video", category, video })}
            onChange={reload}
          />
        ))
      )}

      {editing?.kind === "category" ? (
        <CategoryDrawer
          key={editing.category?.id ?? "new"}
          category={editing.category}
          sortOrder={nextSortOrder(categories)}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      ) : null}
      {editing?.kind === "video" ? (
        <VideoDrawer
          key={editing.video?.id ?? `new-${editing.category.id}`}
          category={editing.category}
          video={editing.video}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      ) : null}
    </>
  );
}
