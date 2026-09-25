"use client";

import { useState } from "react";
import { adminJson, readFileAsDataUrl } from "@/lib/superadmin/browser";
import { formatBytes } from "@/lib/superadmin/format";
import type { BusinessDetails } from "@/lib/superadmin/types";
import { useToast } from "../../../../_ui/feedback";
import { Icon } from "../../../../_ui/icon";
import { EmptyState } from "../../../../_ui/parts";
import { UploadTile } from "../../../../_ui/upload-tile";

const IMAGE_RE = /\.(png|jpe?g|webp|gif|svg)$/i;

export function BrandingTab({
  businessId,
  details,
  onChange,
}: {
  businessId: string;
  details: BusinessDetails;
  onChange: () => void;
}) {
  const toast = useToast();
  const [logo, setLogo] = useState<File | null>(null);
  const [icon, setIcon] = useState<File | null>(null);
  const [splash, setSplash] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  const images = details.brandingFiles.filter((file) => IMAGE_RE.test(file.name));
  const textFiles = details.brandingFiles.filter((file) => !IMAGE_RE.test(file.name));
  const hasSelection = Boolean(logo || icon || splash);

  async function upload() {
    setPending(true);
    try {
      const result = await adminJson<{ uploaded: string[] }>(`/api/admin/apps/${businessId}/branding`, {
        method: "POST",
        body: JSON.stringify({
          logoBase64: logo ? await readFileAsDataUrl(logo) : undefined,
          iconBase64: icon ? await readFileAsDataUrl(icon) : undefined,
          splashBase64: splash ? await readFileAsDataUrl(splash) : undefined,
        }),
      });
      toast.success(`הועלו: ${result.uploaded.join(", ")}`);
      setLogo(null);
      setIcon(null);
      setSplash(null);
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ההעלאה נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="ad-stack">
      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h2>
              <Icon name="upload" />
              עדכון תמונות
            </h2>
            <p>הקבצים מחליפים את הקיימים בתיקיית המיתוג.</p>
          </div>
        </div>
        <div className="ad-card-body">
          <div className="ad-upload-grid">
            <UploadTile label="לוגו" hint="PNG שקוף, לפחות 512px" file={logo} onChange={setLogo} />
            <UploadTile label="אייקון" hint="ריבוע 1024×1024" file={icon} onChange={setIcon} />
            <UploadTile label="מסך פתיחה" hint="לאורך, 1242×2688" file={splash} onChange={setSplash} />
          </div>
        </div>
        <div className="ad-card-foot">
          <button type="button" className="ad-btn is-primary" disabled={pending || !hasSelection} onClick={() => void upload()}>
            {pending ? "מעלה…" : "העלאת התמונות"}
          </button>
          {hasSelection ? (
            <button
              type="button"
              className="ad-btn is-ghost"
              disabled={pending}
              onClick={() => {
                setLogo(null);
                setIcon(null);
                setSplash(null);
              }}
            >
              ניקוי
            </button>
          ) : null}
        </div>
      </section>

      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h2>
              <Icon name="palette" />
              קבצי המיתוג
            </h2>
            <p className="ad-ltr" style={{ textAlign: "right" }}>
              {details.brandingFolder ? `app_design/branding/${details.brandingFolder}` : "אין תיקיית מיתוג"}
            </p>
          </div>
          <span className="ad-small ad-muted">{details.brandingFiles.length} קבצים</span>
        </div>
        {details.brandingFiles.length === 0 ? (
          <EmptyState icon="image" title="אין קבצי מיתוג עדיין" body="העלו לוגו, אייקון ומסך פתיחה כדי ליצור את התיקייה." />
        ) : (
          <div className="ad-card-body">
            {images.length ? (
              <div className="ad-branding-grid">
                {images.map((file) => (
                  <a key={file.path} className="ad-branding-tile" href={file.publicUrl} target="_blank" rel="noreferrer">
                    <span className="ad-branding-preview">
                      {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage asset */}
                      <img src={`${file.publicUrl}?v=${encodeURIComponent(file.updatedAt ?? "")}`} alt={file.name} />
                    </span>
                    <strong className="ad-ltr" style={{ textAlign: "right" }}>
                      {file.name}
                    </strong>
                    <span>{formatBytes(file.size)}</span>
                  </a>
                ))}
              </div>
            ) : null}
            {textFiles.map((file) => (
              <details key={file.path} className="ad-details">
                <summary>
                  <Icon name="file-text" size={16} />
                  <span className="ad-ltr">{file.name}</span>
                  <span className="ad-spacer" />
                  <span className="ad-faint ad-small">{formatBytes(file.size)}</span>
                  <Icon name="chevron-down" size={16} />
                </summary>
                <div className="ad-details-body">
                  {file.content ? (
                    <pre className="ad-code">{file.content}</pre>
                  ) : (
                    <a className="ad-link" href={file.publicUrl} target="_blank" rel="noreferrer">
                      פתיחת הקובץ
                    </a>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
