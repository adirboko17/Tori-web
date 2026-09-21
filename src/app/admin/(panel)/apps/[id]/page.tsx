"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminJson, readFileAsDataUrl } from "@/lib/superadmin/browser";
import { formatBytes, formatDateHe, formatSmsCredits, hasPulseemCredentials } from "@/lib/superadmin/format";
import { STARTING_SMS } from "@/lib/superadmin/pulseem-plans";
import type { BusinessDetails, PulseemEditorState } from "@/lib/superadmin/types";

export default function AppDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const businessId = params.id;
  const [details, setDetails] = useState<BusinessDetails | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const data = await adminJson<BusinessDetails & { ok: true }>(`/api/admin/apps/${businessId}`);
    setDetails(data);
  }, [businessId]);

  useEffect(() => {
    load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "טעינת העסק נכשלה");
    });
  }, [load]);

  if (error) return <p className="admin-error">{error}</p>;
  if (!details?.profile) return <p className="admin-note">טוען…</p>;

  const profile = details.profile;
  const name = String(profile.display_name || "ללא שם");
  const pulseemReady = hasPulseemCredentials({
    pulseemHasApiKey: profile.pulseem_has_api_key === true,
    pulseem_user_id: typeof profile.pulseem_user_id === "string" ? profile.pulseem_user_id : null,
    pulseemHasPassword: profile.pulseem_has_password === true,
  });

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <p className="admin-kicker">
            <Link href="/admin/apps">אפליקציות</Link>
          </p>
          <h1 className="admin-title">{name}</h1>
          <p className="admin-note">
            {details.brandingFolder || "בלי תיקיית מיתוג"} · {String(profile.phone || "—")} · נוצר{" "}
            {formatDateHe(String(profile.created_at || ""))}
          </p>
        </div>
      </div>
      {notice ? <p className="admin-note">{notice}</p> : null}
      <section className="admin-stats">
        <article className="admin-stat">
          <span>משתמשים</span>
          <strong>{details.users.length}</strong>
        </article>
        <article className="admin-stat">
          <span>שירותים</span>
          <strong>{details.services.length}</strong>
        </article>
        <article className="admin-stat">
          <span>פולסים</span>
          <strong>{pulseemReady ? "מחובר" : "לא מחובר"}</strong>
        </article>
      </section>
      <p className="admin-note" dir="ltr">
        {businessId}
      </p>

      <PulseemPanel
        businessId={businessId}
        displayName={name}
        onChange={(message) => {
          setNotice(message);
          void load();
        }}
      />

      <section className="admin-card">
        <h2 className="admin-title">משתמשים</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>שם</th>
                <th>טלפון</th>
                <th>סוג</th>
                <th>נוצר</th>
              </tr>
            </thead>
            <tbody>
              {details.users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || "—"}</td>
                  <td dir="ltr">{user.phone || "—"}</td>
                  <td>{user.user_type || "—"}</td>
                  <td>{formatDateHe(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="admin-title">שירותים</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>שם</th>
                <th>מחיר</th>
                <th>דקות</th>
                <th>פעיל</th>
              </tr>
            </thead>
            <tbody>
              {details.services.map((service) => (
                <tr key={service.id}>
                  <td>{service.name || "—"}</td>
                  <td>{service.price ?? "—"}</td>
                  <td>{service.duration_minutes ?? "—"}</td>
                  <td>{service.is_active ? "כן" : "לא"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <BrandingPanel
        businessId={businessId}
        details={details}
        onUploaded={(message) => {
          setNotice(message);
          void load();
        }}
      />

      <DeletePanel businessId={businessId} name={name} onDeleted={() => router.push("/admin/apps")} />
    </>
  );
}

function PulseemPanel({
  businessId,
  displayName,
  onChange,
}: {
  businessId: string;
  displayName: string;
  onChange: (message: string) => void;
}) {
  const [state, setState] = useState<PulseemEditorState | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [subPassword, setSubPassword] = useState("");
  const [fromNumber, setFromNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [sender, setSender] = useState("");
  const [credits, setCredits] = useState("100");
  const [busy, setBusy] = useState("");

  const refresh = useCallback(async () => {
    const data = await adminJson<{ state: PulseemEditorState }>("/api/admin/pulseem/state", {
      method: "POST",
      body: JSON.stringify({ businessId }),
    });
    setState(data.state);
    setUserId(data.state.userId);
    setSender(data.state.fromNumber);
    const balanceData = await adminJson<{ directSmsCredits?: string }>(
      "/api/admin/pulseem/balance",
      {
        method: "POST",
        body: JSON.stringify({ businessId, subAccountName: displayName }),
      },
    ).catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : "לא ניתן לטעון יתרה");
      return null;
    });
    if (balanceData?.directSmsCredits) {
      setBalance(balanceData.directSmsCredits);
      setMessage("");
    }
  }, [businessId, displayName]);

  useEffect(() => {
    void refresh().catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : "טעינת פולסים נכשלה");
    });
  }, [refresh]);

  async function run(label: string, action: () => Promise<string>) {
    setBusy(label);
    setMessage("");
    try {
      const text = await action();
      setMessage(text);
      onChange(text);
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "הפעולה נכשלה");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-toolbar">
        <h2 className="admin-title">פולסים</h2>
        <strong>{balance ? `${formatSmsCredits(balance)} הודעות` : "אין יתרה"}</strong>
      </div>
      {message ? <p className="admin-note">{message}</p> : null}
      <p className="admin-note">
        כל עסק מתחיל עם 1,000 הודעות. בכל 1 לחודש היתרה המוכללת מושלמת עד 1,000, ומעבר לזה אפשר רק להטעין.
      </p>
      <div className="admin-grid-form">
        <label className="admin-field">
          סיסמה לתת-חשבון
          <input dir="ltr" value={subPassword} onChange={(event) => setSubPassword(event.target.value)} placeholder="ריק = אקראית" />
        </label>
        <label className="admin-field">
          מספר / שם שולח ליצירה
          <input dir="ltr" value={fromNumber} onChange={(event) => setFromNumber(event.target.value)} />
        </label>
      </div>
      <div className="admin-actions">
        <button
          className="admin-btn"
          type="button"
          disabled={busy !== ""}
          onClick={() => {
            const replace = Boolean(state?.hasApiKey || (state?.userId && state.hasPassword));
            if (replace && !window.confirm("לעסק כבר יש חשבון פולסים. ליצור חשבון חדש שיחליף את המפתחות?")) {
              return;
            }
            void run("provision", async () => {
              const data = await adminJson<{ loginUserName?: string | null; directSmsCredits?: number | null }>(
                "/api/admin/pulseem/provision",
                {
                  method: "POST",
                  body: JSON.stringify({
                    businessId,
                    subPassword,
                    fromNumber,
                    replaceExisting: replace,
                    directSmsCredits: STARTING_SMS,
                  }),
                },
              );
              return `תת-חשבון נוצר${data.loginUserName ? `: ${data.loginUserName}` : ""}`;
            });
          }}
        >
          {busy === "provision" ? "יוצר…" : "צור תת-חשבון"}
        </button>
      </div>
      <div className="admin-actions">
        <label className="admin-field">
          כמות קרדיטים
          <input dir="ltr" type="number" min={1} max={10000} value={credits} onChange={(event) => setCredits(event.target.value)} />
        </label>
        <button
          className="admin-btn"
          type="button"
          disabled={busy !== ""}
          onClick={() =>
            void run("transfer", async () => {
              const data = await adminJson<{ directSmsCreditsAfter?: number | null }>(
                "/api/admin/pulseem/transfer",
                {
                  method: "POST",
                  body: JSON.stringify({ businessId, directSmsCredits: Number(credits) }),
                },
              );
              return `הועברו קרדיטים. יתרה: ${data.directSmsCreditsAfter ?? "—"}`;
            })
          }
        >
          העבר קרדיטים
        </button>
      </div>
      <div className="admin-grid-form">
        <label className="admin-field">
          מזהה משתמש WS
          <input dir="ltr" value={userId} onChange={(event) => setUserId(event.target.value)} />
        </label>
        <label className="admin-field">
          סיסמה
          <input dir="ltr" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={state?.hasPassword ? "שמורה — השאר ריק כדי לא לשנות" : ""} />
        </label>
        <label className="admin-field">
          מספר שולח
          <input dir="ltr" value={sender} onChange={(event) => setSender(event.target.value)} />
        </label>
      </div>
      <div className="admin-actions">
        <button
          className="admin-btn-ghost"
          type="button"
          disabled={busy !== ""}
          onClick={() =>
            void run("test", async () => {
              const data = await adminJson<{ credits?: string; balanceNote?: string | null }>(
                "/api/admin/pulseem/test",
                {
                  method: "POST",
                  body: JSON.stringify({ businessId, userId, password, subAccountName: displayName }),
                },
              );
              return `החיבור תקין. יתרה: ${data.credits ?? "—"}${data.balanceNote ? ` · ${data.balanceNote}` : ""}`;
            })
          }
        >
          בדיקת חיבור
        </button>
        <button
          className="admin-btn"
          type="button"
          disabled={busy !== ""}
          onClick={() =>
            void run("save", async () => {
              await adminJson("/api/admin/pulseem/save", {
                method: "POST",
                body: JSON.stringify({ businessId, userId, password, fromNumber: sender }),
              });
              return "פרטי פולסים נשמרו וסונכרנו ל-.env";
            })
          }
        >
          שמירה
        </button>
      </div>
    </section>
  );
}

function BrandingPanel({
  businessId,
  details,
  onUploaded,
}: {
  businessId: string;
  details: BusinessDetails;
  onUploaded: (message: string) => void;
}) {
  const [logo, setLogo] = useState<File | null>(null);
  const [icon, setIcon] = useState<File | null>(null);
  const [splash, setSplash] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function upload() {
    setPending(true);
    setError("");
    try {
      const result = await adminJson<{ uploaded: string[] }>(`/api/admin/apps/${businessId}/branding`, {
        method: "POST",
        body: JSON.stringify({
          logoBase64: logo ? await readFileAsDataUrl(logo) : undefined,
          iconBase64: icon ? await readFileAsDataUrl(icon) : undefined,
          splashBase64: splash ? await readFileAsDataUrl(splash) : undefined,
        }),
      });
      onUploaded(`הועלו: ${result.uploaded.join(", ")}`);
      setLogo(null);
      setIcon(null);
      setSplash(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "העלאה נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="admin-card">
      <h2 className="admin-title">מיתוג · {details.brandingFolder || "אין תיקייה"}</h2>
      {details.brandingFiles.map((file) => (
        <details key={file.path}>
          <summary>
            {file.name} · {formatBytes(file.size)}
          </summary>
          {file.content ? <pre className="admin-pre" dir="ltr">{file.content}</pre> : null}
          {file.publicUrl ? (
            <a href={file.publicUrl} target="_blank" rel="noreferrer">
              פתיחת הקובץ
            </a>
          ) : null}
        </details>
      ))}
      <div className="admin-grid-form">
        <label className="admin-field">לוגו<input type="file" accept="image/*" onChange={(event) => setLogo(event.target.files?.[0] ?? null)} /></label>
        <label className="admin-field">אייקון<input type="file" accept="image/*" onChange={(event) => setIcon(event.target.files?.[0] ?? null)} /></label>
        <label className="admin-field">ספלאש<input type="file" accept="image/*" onChange={(event) => setSplash(event.target.files?.[0] ?? null)} /></label>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <button className="admin-btn" type="button" disabled={pending} onClick={() => void upload()}>
        {pending ? "מעלה…" : "עדכון תמונות"}
      </button>
    </section>
  );
}

function DeletePanel({
  businessId,
  name,
  onDeleted,
}: {
  businessId: string;
  name: string;
  onDeleted: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");

  async function remove() {
    setPending(true);
    setError("");
    try {
      const result = await adminJson<{
        success?: boolean;
        deletedRows?: Record<string, number>;
        tableErrors?: Record<string, string>;
        brandingFolderDeleted?: boolean;
        pulseem?: { deleted?: boolean; skipped?: boolean; error?: string };
      }>(`/api/admin/apps/${businessId}`, { method: "DELETE" });
      const rows = Object.entries(result.deletedRows ?? {})
        .map(([table, count]) => `${table}: ${count}`)
        .join(", ");
      const problems = Object.entries(result.tableErrors ?? {})
        .map(([table, message]) => `${table}: ${message}`)
        .join(" · ");
      setSummary(
        `${result.success ? "העסק נמחק" : "המחיקה לא הושלמה"}. פולסים: ${
          result.pulseem?.deleted ? "נמחק" : result.pulseem?.error || (result.pulseem?.skipped ? "דולג" : "—")
        }. תיקיית מיתוג: ${result.brandingFolderDeleted ? "נמחקה" : "לא נמחקה"}. ${rows}${
          problems ? ` שגיאות: ${problems}` : ""
        }`,
      );
      if (result.success) onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "המחיקה נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="admin-card">
      <h2 className="admin-title">מחיקת עסק</h2>
      <p className="admin-note">
        נמחקים תת-חשבון הפולסים, 12 טבלאות, שורת העסק וקבצי ה-Storage. להמשך הקלד את שם העסק: {name}
      </p>
      <label className="admin-field">
        שם העסק לאישור
        <input value={typed} onChange={(event) => setTyped(event.target.value)} />
      </label>
      {error ? <p className="admin-error">{error}</p> : null}
      {summary ? <p className="admin-note">{summary}</p> : null}
      <button className="admin-btn" type="button" disabled={pending || typed.trim() !== name.trim()} onClick={() => void remove()}>
        {pending ? "מוחק…" : "מחק עסק"}
      </button>
    </section>
  );
}
