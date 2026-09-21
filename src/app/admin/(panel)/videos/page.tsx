"use client";

import { useEffect, useState } from "react";
import { adminJson } from "@/lib/superadmin/browser";
import {
  HELP_AUDIENCES,
  HELP_ICONS,
  isHelpSlug,
  slugifyHelp,
} from "@/lib/superadmin/help-shared";
import { formatDurationSeconds } from "@/lib/superadmin/format";
import type { HelpAudience, HelpCategory, HelpI18n } from "@/lib/superadmin/types";

export default function VideosPage() {
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function reload() {
    const data = await adminJson<{ categories: HelpCategory[] }>("/api/admin/help");
    setCategories(data.categories);
  }

  useEffect(() => {
    reload().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "טעינת הסרטונים נכשלה");
    });
  }, []);

  return (
    <>
      <div>
        <p className="admin-kicker">סופר אדמין</p>
        <h1 className="admin-title">סרטוני עזרה</h1>
        <p className="admin-note">תוכן גלובלי לכל העסקים. הקבצים נשמרים ב-Storage של מרכז העזרה.</p>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      {notice ? <p className="admin-note">{notice}</p> : null}
      <CategoryForm
        onSaved={async (message) => {
          setNotice(message);
          await reload();
        }}
      />
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onChange={async (message) => {
            setNotice(message);
            await reload();
          }}
        />
      ))}
    </>
  );
}

function CategoryForm({ onSaved }: { onSaved: (message: string) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("help");
  const [audience, setAudience] = useState<HelpAudience>("admin");
  const [sortOrder, setSortOrder] = useState("10");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const clean = slug.trim().toLowerCase();
    if (!title.trim() || !isHelpSlug(clean)) {
      setError("צריך שם ו-slug באנגלית קטנה עם מקפים");
      return;
    }
    setPending(true);
    setError("");
    try {
      const title_i18n: HelpI18n = { he: title.trim() };
      if (titleEn.trim()) title_i18n.en = titleEn.trim();
      await adminJson("/api/admin/help/categories", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          title_i18n,
          slug: clean,
          description,
          icon,
          audience,
          sort_order: Number(sortOrder) || 0,
          is_published: true,
        }),
      });
      setTitle("");
      setTitleEn("");
      setSlug("");
      setDescription("");
      await onSaved("הקטגוריה נוספה");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירה נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-card admin-form" onSubmit={(event) => void submit(event)}>
      <h2 className="admin-title">קטגוריה חדשה</h2>
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="admin-grid-form">
        <label className="admin-field">
          שם
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="admin-field">
          English
          <input
            dir="ltr"
            value={titleEn}
            onChange={(event) => {
              setTitleEn(event.target.value);
              if (!slug) setSlug(slugifyHelp(event.target.value));
            }}
          />
        </label>
        <label className="admin-field">
          slug
          <input dir="ltr" value={slug} onChange={(event) => setSlug(event.target.value)} />
        </label>
        <label className="admin-field">
          אייקון
          <select value={icon} onChange={(event) => setIcon(event.target.value)}>
            {HELP_ICONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          קהל
          <select value={audience} onChange={(event) => setAudience(event.target.value as HelpAudience)}>
            {HELP_AUDIENCES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          סדר
          <input dir="ltr" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
        </label>
      </div>
      <label className="admin-field">
        תיאור
        <textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <button className="admin-btn" type="submit" disabled={pending}>
        {pending ? "שומר…" : "הוספת קטגוריה"}
      </button>
    </form>
  );
}

function CategoryEdit({
  category,
  onSaved,
}: {
  category: HelpCategory;
  onSaved: (message: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(category.title);
  const [slug, setSlug] = useState(category.slug);
  const [audience, setAudience] = useState<HelpAudience>(category.audience);
  const [published, setPublished] = useState(category.is_published);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await adminJson(`/api/admin/help/categories/${category.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          slug,
          audience,
          is_published: published,
          title_i18n: { ...category.title_i18n, he: title },
        }),
      });
      await onSaved("הקטגוריה עודכנה");
    } catch (err) {
      setError(err instanceof Error ? err.message : "עדכון הקטגוריה נכשל");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-grid-form" onSubmit={(event) => void save(event)}>
      <label className="admin-field">
        שם
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="admin-field">
        slug
        <input dir="ltr" value={slug} onChange={(event) => setSlug(event.target.value)} />
      </label>
      <label className="admin-field">
        קהל
        <select value={audience} onChange={(event) => setAudience(event.target.value as HelpAudience)}>
          {HELP_AUDIENCES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-field">
        <span>
          <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /> מפורסם
        </span>
      </label>
      {error ? <p className="admin-error">{error}</p> : null}
      <button className="admin-btn" type="submit" disabled={pending}>
        {pending ? "שומר…" : "עדכון קטגוריה"}
      </button>
    </form>
  );
}

function CategoryCard({
  category,
  onChange,
}: {
  category: HelpCategory;
  onChange: (message: string) => Promise<void>;
}) {
  const [error, setError] = useState("");

  async function removeCategory() {
    if (!window.confirm(`למחוק את הקטגוריה ${category.title} ואת הסרטונים שלה?`)) return;
    try {
      await adminJson(`/api/admin/help/categories/${category.id}`, { method: "DELETE" });
      await onChange("הקטגוריה נמחקה");
    } catch (err) {
      setError(err instanceof Error ? err.message : "מחיקה נכשלה");
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-title">{category.title}</h2>
          <p className="admin-note">
            {category.slug} · {HELP_AUDIENCES.find((item) => item.value === category.audience)?.label} ·{" "}
            {category.is_published ? "מפורסם" : "טיוטה"} · {category.icon}
          </p>
        </div>
        <button className="admin-btn-ghost" type="button" onClick={() => void removeCategory()}>
          מחיקת קטגוריה
        </button>
      </div>
      <CategoryEdit category={category} onSaved={onChange} />
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>סרטון</th>
              <th>משך</th>
              <th>סטטוס</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {category.videos.map((video) => (
              <tr key={video.id}>
                <td>
                  {video.title}
                  <div className="admin-note">{video.slug || video.video_url}</div>
                </td>
                <td dir="ltr">{formatDurationSeconds(video.duration_seconds)}</td>
                <td>{video.is_published ? "מפורסם" : "טיוטה"}</td>
                <td className="admin-actions">
                  <button
                    className="admin-btn-ghost"
                    type="button"
                    onClick={() => {
                      void adminJson(`/api/admin/help/videos/${video.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ is_published: !video.is_published }),
                      })
                        .then(() => onChange(video.is_published ? "הסרטון הוסתר" : "הסרטון פורסם"))
                        .catch((err: unknown) =>
                          setError(err instanceof Error ? err.message : "עדכון הסרטון נכשל"),
                        );
                    }}
                  >
                    {video.is_published ? "הסתרה" : "פרסום"}
                  </button>
                  <button
                    className="admin-btn-ghost"
                    type="button"
                    onClick={() => {
                      if (!window.confirm(`למחוק את הסרטון ${video.title}?`)) return;
                      void adminJson(`/api/admin/help/videos/${video.id}`, { method: "DELETE" })
                        .then(() => onChange("הסרטון נמחק"))
                        .catch((err: unknown) =>
                          setError(err instanceof Error ? err.message : "מחיקת הסרטון נכשלה"),
                        );
                    }}
                  >
                    מחיקה
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <VideoForm category={category} onSaved={onChange} />
    </section>
  );
}

function VideoForm({
  category,
  onSaved,
}: {
  category: HelpCategory;
  onSaved: (message: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [sortOrder, setSortOrder] = useState("10");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function uploadHelpFile(path: string, file: File) {
    const prepared = await adminJson<{ signedUrl: string; publicUrl: string; token?: string }>(
      "/api/admin/help/upload-url",
      { method: "POST", body: JSON.stringify({ path, upsert: true }) },
    );
    const put = await fetch(prepared.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
        ...(prepared.token ? { Authorization: `Bearer ${prepared.token}` } : {}),
      },
      body: file,
    });
    if (!put.ok) throw new Error("העלאת הקובץ ל-Storage נכשלה");
    return `${prepared.publicUrl}?t=${Date.now()}`;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const clean = slug.trim().toLowerCase();
    if (!title.trim()) return setError("חסר שם לסרטון");
    if (clean && !isHelpSlug(clean)) return setError("slug חייב להיות באנגלית קטנה עם מקפים");
    if (!videoFile && !videoUrl.trim()) return setError("העלה קובץ או הדבק קישור https");
    setPending(true);
    setError("");
    try {
      const fileSlug = clean || "video";
      let finalUrl = videoUrl.trim();
      let storagePath: string | null = null;
      let thumbnail: string | null = null;
      if (videoFile) {
        storagePath = `${category.slug}/${fileSlug}.mp4`;
        finalUrl = await uploadHelpFile(storagePath, videoFile);
      }
      if (thumbFile) {
        const ext = thumbFile.type === "image/png" ? "png" : thumbFile.type === "image/webp" ? "webp" : "jpg";
        thumbnail = await uploadHelpFile(`${category.slug}/${fileSlug}-thumb.${ext}`, thumbFile);
      }
      const title_i18n: HelpI18n = { he: title.trim() };
      if (titleEn.trim()) title_i18n.en = titleEn.trim();
      await adminJson("/api/admin/help/videos", {
        method: "POST",
        body: JSON.stringify({
          category_id: category.id,
          slug: clean || null,
          title: title.trim(),
          title_i18n,
          description,
          video_url: finalUrl,
          storage_path: storagePath,
          thumbnail_url: thumbnail,
          duration_seconds: duration.trim() ? Number(duration) : null,
          sort_order: Number(sortOrder) || 0,
          is_published: true,
        }),
      });
      setTitle("");
      setSlug("");
      setVideoUrl("");
      setVideoFile(null);
      setThumbFile(null);
      await onSaved("הסרטון נוסף");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירת הסרטון נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={(event) => void submit(event)}>
      <h3 className="admin-title">סרטון חדש</h3>
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="admin-grid-form">
        <label className="admin-field">
          שם
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="admin-field">
          English
          <input
            dir="ltr"
            value={titleEn}
            onChange={(event) => {
              setTitleEn(event.target.value);
              if (!slug) setSlug(slugifyHelp(event.target.value));
            }}
          />
        </label>
        <label className="admin-field">
          slug
          <input dir="ltr" value={slug} onChange={(event) => setSlug(event.target.value)} />
        </label>
        <label className="admin-field">
          משך בשניות
          <input dir="ltr" value={duration} onChange={(event) => setDuration(event.target.value)} />
        </label>
        <label className="admin-field">
          סדר
          <input dir="ltr" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
        </label>
      </div>
      <label className="admin-field">
        תיאור
        <textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <label className="admin-field">
        קישור mp4 ישיר
        <input dir="ltr" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://" />
      </label>
      <div className="admin-grid-form">
        <label className="admin-field">
          קובץ וידאו
          <input type="file" accept="video/mp4" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} />
        </label>
        <label className="admin-field">
          תמונה ממוזערת
          <input type="file" accept="image/*" onChange={(event) => setThumbFile(event.target.files?.[0] ?? null)} />
        </label>
      </div>
      <button className="admin-btn" type="submit" disabled={pending}>
        {pending ? "מעלה…" : "הוספת סרטון"}
      </button>
    </form>
  );
}
