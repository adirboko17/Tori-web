"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminJson } from "@/lib/superadmin/browser";
import type { DeleteBusinessResult } from "@/lib/superadmin/types";
import { useConfirm, useToast } from "../../../../_ui/feedback";
import { Icon } from "../../../../_ui/icon";

function CopyRow({ label, value }: { label: string; value: string | null }) {
  const toast = useToast();
  return (
    <>
      <dt>{label}</dt>
      <dd>
        {value ? (
          <span className="ad-row" style={{ flexWrap: "nowrap" }}>
            <span className="ad-ltr ad-small" style={{ overflowWrap: "anywhere" }}>
              {value}
            </span>
            <button
              type="button"
              className="ad-icon-btn"
              aria-label={`העתקת ${label}`}
              onClick={() =>
                navigator.clipboard
                  .writeText(value)
                  .then(() => toast.success(`${label} הועתק`))
                  .catch(() => toast.error("ההעתקה נכשלה"))
              }
            >
              <Icon name="copy" size={16} />
            </button>
          </span>
        ) : (
          "—"
        )}
      </dd>
    </>
  );
}

export function SettingsTab({
  businessId,
  name,
  brandingFolder,
  pulseemUserId,
}: {
  businessId: string;
  name: string;
  brandingFolder: string | null;
  pulseemUserId: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<DeleteBusinessResult | null>(null);

  async function remove() {
    const ok = await confirm({
      title: `למחוק את ${name}?`,
      body: "יימחקו תת-חשבון הפולסים, כל הנתונים של האפליקציה (משתמשים, תורים, שירותים) וקבצי המיתוג. אי אפשר לשחזר.",
      confirmLabel: "מחיקה לצמיתות",
      tone: "danger",
      typeToConfirm: name,
    });
    if (!ok) return;
    setPending(true);
    setResult(null);
    try {
      const data = await adminJson<DeleteBusinessResult>(`/api/admin/apps/${businessId}`, { method: "DELETE" });
      if (data.success) {
        toast.success(`${name} נמחק`);
        router.push("/admin/businesses");
        router.refresh();
        return;
      }
      setResult(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "המחיקה נכשלה");
    } finally {
      setPending(false);
    }
  }

  const problems = result ? Object.entries(result.tableErrors ?? {}) : [];

  return (
    <div className="ad-grid-halves">
      <section className="ad-card">
        <div className="ad-card-head">
          <h2>
            <Icon name="settings" />
            מזהים טכניים
          </h2>
        </div>
        <div className="ad-card-body">
          <dl className="ad-kv">
            <CopyRow label="מזהה עסק" value={businessId} />
            <CopyRow label="תיקיית מיתוג" value={brandingFolder} />
            <CopyRow label="משתמש פולסים" value={pulseemUserId} />
          </dl>
          {brandingFolder ? (
            <div className="ad-field">
              <span className="ad-field-label">משיכת המיתוג לפרויקט האפליקציה</span>
              <pre className="ad-code">{`node scripts/pull-branding.mjs ${brandingFolder}`}</pre>
            </div>
          ) : null}
        </div>
      </section>

      <section className="ad-card is-danger">
        <div className="ad-card-head">
          <div>
            <h2>
              <Icon name="triangle-alert" />
              מחיקת העסק
            </h2>
            <p>פעולה בלתי הפיכה</p>
          </div>
        </div>
        <div className="ad-card-body">
          <p className="ad-small ad-muted">
            המחיקה מסירה את תת-חשבון הפולסים, את כל הנתונים של האפליקציה ואת קבצי המיתוג. לפני המחיקה כדאי לוודא
            שהוראת הקבע ב-PayPlus בוטלה.
          </p>
          {result ? (
            <div className="ad-alert is-danger">
              <Icon name="circle-alert" />
              <div className="ad-alert-body">
                <div className="ad-alert-title">המחיקה לא הושלמה</div>
                <p>
                  פולסים:{" "}
                  {result.pulseem?.deleted ? "נמחק" : result.pulseem?.error || (result.pulseem?.skipped ? "דולג" : "—")}.
                  {" "}תיקיית מיתוג: {result.brandingFolderDeleted ? "נמחקה" : "לא נמחקה"}.
                </p>
                {problems.length ? (
                  <p className="ad-ltr" style={{ textAlign: "right" }}>
                    {problems.map(([table, message]) => `${table}: ${message}`).join(" · ")}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        <div className="ad-card-foot">
          <button type="button" className="ad-btn is-danger" disabled={pending} onClick={() => void remove()}>
            <Icon name="trash-2" size={16} />
            {pending ? "מוחק…" : "מחיקת העסק"}
          </button>
        </div>
      </section>
    </div>
  );
}
