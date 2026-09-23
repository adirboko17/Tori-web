"use client";

import Link from "next/link";
import { useState } from "react";
import { adminJson, readFileAsDataUrl } from "@/lib/superadmin/browser";
import { isValidClientName, isValidHexColor } from "@/lib/superadmin/format";
import type { CreateBusinessResult } from "@/lib/superadmin/types";

const INITIAL = {
  businessName: "",
  clientName: "",
  address: "",
  primaryColor: "#111111",
  adminName: "",
  adminPhone: "",
  adminPassword: "123456",
  autoPulseem: true,
  pulseemSubPassword: "",
  pulseemFromNumber: "",
  pulseemApiKey: "",
  pulseemWsUserId: "",
  pulseemWsPassword: "",
};

export default function NewAppPage() {
  const [form, setForm] = useState(INITIAL);
  const [logo, setLogo] = useState<File | null>(null);
  const [icon, setIcon] = useState<File | null>(null);
  const [splash, setSplash] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<CreateBusinessResult | null>(null);

  function set<K extends keyof typeof INITIAL>(key: K, value: (typeof INITIAL)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.businessName.trim()) return setError("שם העסק חסר");
    if (!isValidClientName(form.clientName)) {
      return setError("שם האפליקציה באנגלית חייב להתחיל באות ולהכיל רק אותיות וספרות");
    }
    if (!isValidHexColor(form.primaryColor)) return setError("צבע ראשי לא תקין");
    if (!form.adminName.trim() || !form.adminPhone.trim() || !form.adminPassword) {
      return setError("חסרים פרטי המנהל");
    }
    setPending(true);
    try {
      const created = await adminJson<CreateBusinessResult & { ok: true }>("/api/admin/apps/create", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          logoBase64: logo ? await readFileAsDataUrl(logo) : undefined,
          iconBase64: icon ? await readFileAsDataUrl(icon) : undefined,
          splashBase64: splash ? await readFileAsDataUrl(splash) : undefined,
        }),
      });
      setResult(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "יצירת האפליקציה נכשלה");
    } finally {
      setPending(false);
    }
  }

  if (result) {
    return (
      <>
        <p className="admin-kicker">אפליקציה חדשה</p>
        <h1 className="admin-title">{form.businessName || result.clientName} נוצרה</h1>
        <section className="admin-card">
          <p>מזהה עסק: <span dir="ltr">{result.businessId}</span></p>
          <p>תיקיית מיתוג: <span dir="ltr">{result.clientName}</span></p>
          <p>
            פולסים:{" "}
            {result.pulseemCreated
              ? `נוצר${result.pulseemLoginUserName ? ` (${result.pulseemLoginUserName})` : ""}`
              : result.pulseemError || "לא חובר"}
          </p>
          <p>קבצים שהועלו: {result.uploadedFiles.join(", ") || "—"}</p>
          {result.uploadWarnings.length ? (
            <p className="admin-error">{result.uploadWarnings.join(" · ")}</p>
          ) : null}
          <pre className="admin-pre" dir="ltr">{`node scripts/pull-branding.mjs ${result.clientName}`}</pre>
          <div className="admin-actions">
            <Link className="admin-btn" href={`/admin/apps/${result.businessId}`}>
              לפרטי האפליקציה
            </Link>
            <button
              className="admin-btn-ghost"
              type="button"
              onClick={() => {
                setResult(null);
                setForm(INITIAL);
                setLogo(null);
                setIcon(null);
                setSplash(null);
              }}
            >
              יצירה נוספת
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <div>
        <p className="admin-kicker">סופר אדמין</p>
        <h1 className="admin-title">אפליקציה חדשה</h1>
        <p className="admin-note">
          נוצרים פרופיל עסק, משתמש מנהל, שלושה שירותים, חיבור פולסים וקבצי מיתוג ב-Storage.
        </p>
      </div>
      <form className="admin-card admin-form" onSubmit={(event) => void submit(event)}>
        {error ? <p className="admin-error">{error}</p> : null}
        <div className="admin-grid-form">
          <label className="admin-field">
            שם העסק
            <input value={form.businessName} onChange={(event) => set("businessName", event.target.value)} />
          </label>
          <label className="admin-field">
            שם אפליקציה באנגלית
            <input dir="ltr" value={form.clientName} onChange={(event) => set("clientName", event.target.value)} placeholder="SarahStudio" />
          </label>
          <label className="admin-field">
            כתובת
            <input value={form.address} onChange={(event) => set("address", event.target.value)} />
          </label>
          <label className="admin-field">
            צבע ראשי
            <input dir="ltr" value={form.primaryColor} onChange={(event) => set("primaryColor", event.target.value)} />
          </label>
          <label className="admin-field">
            שם המנהל
            <input value={form.adminName} onChange={(event) => set("adminName", event.target.value)} />
          </label>
          <label className="admin-field">
            טלפון המנהל
            <input dir="ltr" value={form.adminPhone} onChange={(event) => set("adminPhone", event.target.value)} />
          </label>
          <label className="admin-field">
            סיסמת המנהל
            <input dir="ltr" value={form.adminPassword} onChange={(event) => set("adminPassword", event.target.value)} />
          </label>
        </div>
        <label className="admin-field">
          <span>
            <input
              type="checkbox"
              checked={form.autoPulseem}
              onChange={(event) => set("autoPulseem", event.target.checked)}
            />{" "}
            יצירת תת-חשבון פולסים אוטומטית
          </span>
        </label>
        {form.autoPulseem ? (
          <div className="admin-grid-form">
            <label className="admin-field">
              סיסמה לתת-חשבון
              <input dir="ltr" value={form.pulseemSubPassword} onChange={(event) => set("pulseemSubPassword", event.target.value)} placeholder="ריק = אקראית" />
            </label>
            <label className="admin-field">
              מספר / שם שולח
              <input dir="ltr" value={form.pulseemFromNumber} onChange={(event) => set("pulseemFromNumber", event.target.value)} placeholder="ריק = שם האפליקציה" />
            </label>
          </div>
        ) : (
          <div className="admin-grid-form">
            <label className="admin-field">
              מפתח API
              <input dir="ltr" value={form.pulseemApiKey} onChange={(event) => set("pulseemApiKey", event.target.value)} />
            </label>
            <label className="admin-field">
              מזהה משתמש WS
              <input dir="ltr" value={form.pulseemWsUserId} onChange={(event) => set("pulseemWsUserId", event.target.value)} />
            </label>
            <label className="admin-field">
              סיסמת WS
              <input dir="ltr" type="password" value={form.pulseemWsPassword} onChange={(event) => set("pulseemWsPassword", event.target.value)} />
            </label>
            <label className="admin-field">
              מספר שולח
              <input dir="ltr" value={form.pulseemFromNumber} onChange={(event) => set("pulseemFromNumber", event.target.value)} />
            </label>
          </div>
        )}
        <div className="admin-grid-form">
          <label className="admin-field">לוגו<input type="file" accept="image/*" onChange={(event) => setLogo(event.target.files?.[0] ?? null)} /></label>
          <label className="admin-field">אייקון<input type="file" accept="image/*" onChange={(event) => setIcon(event.target.files?.[0] ?? null)} /></label>
          <label className="admin-field">ספלאש<input type="file" accept="image/*" onChange={(event) => setSplash(event.target.files?.[0] ?? null)} /></label>
        </div>
        <button className="admin-btn" type="submit" disabled={pending}>
          {pending ? "יוצר…" : "צור אפליקציה"}
        </button>
      </form>
    </>
  );
}
