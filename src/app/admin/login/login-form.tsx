"use client";

import Link from "next/link";
import { useState, type ChangeEvent } from "react";

async function api(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    phone?: string;
  };
  if (!response.ok) {
    throw new Error(data.error || "הבקשה נכשלה.");
  }
  return data;
}

export function AdminLoginForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    setError("");
    setLoading(true);
    try {
      const data = await api("/api/admin/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      if (data.phone) setPhone(data.phone);
      setCode("");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שליחת הקוד נכשלה.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setError("");
    setLoading(true);
    try {
      await api("/api/admin/verify-otp", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      window.location.assign("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "אימות הקוד נכשל.");
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-shell">
      <header className="admin-brand">
        <Link href="/" aria-label="חזרה לאתר תורי">
          <img src="/assets/brand/tori-app-icon.png" width={36} height={36} alt="tori" />
        </Link>
        <Link href="/">חזרה לאתר</Link>
      </header>
      <section className="admin-card">
        <p className="admin-kicker">ממשק ניהול</p>
        {step === "phone" ? (
          <>
            <h1 className="admin-title">כניסה</h1>
            <p className="admin-lead">
              הזינו את הנייד של מנהל האתר. נשלח קוד ב-SMS רק אם המספר מאושר.
            </p>
            <form
              className="admin-form"
              onSubmit={(event) => {
                event.preventDefault();
                void sendCode();
              }}
            >
              <label className="admin-field">
                מספר נייד
                <input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="05XXXXXXXX"
                  value={phone}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setPhone(event.target.value);
                    setError("");
                  }}
                />
              </label>
              {error ? <p className="admin-error">{error}</p> : null}
              <button type="submit" className="admin-btn" disabled={loading}>
                {loading ? "שולחים קוד…" : "שליחת קוד"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="admin-title">קוד אימות</h1>
            <p className="admin-lead">הזינו את הקוד בן 6 הספרות שנשלח אל {phone}.</p>
            <form
              className="admin-form"
              onSubmit={(event) => {
                event.preventDefault();
                void verifyCode();
              }}
            >
              <label className="admin-field">
                קוד בן 6 ספרות
                <input
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  dir="ltr"
                  maxLength={6}
                  value={code}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                />
              </label>
              {error ? <p className="admin-error">{error}</p> : null}
              <button
                type="submit"
                className="admin-btn"
                disabled={loading || code.length !== 6}
              >
                {loading ? "מאמתים…" : "כניסה"}
              </button>
              <button
                type="button"
                className="admin-btn-ghost"
                disabled={loading}
                onClick={() => {
                  void sendCode();
                }}
              >
                שליחה מחדש
              </button>
              <button
                type="button"
                className="admin-btn-ghost"
                disabled={loading}
                onClick={() => {
                  setStep("phone");
                  setCode("");
                  setError("");
                }}
              >
                חזרה
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
