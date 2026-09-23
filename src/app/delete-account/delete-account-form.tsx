"use client";

import { useState, type FormEvent } from "react";

const listStyle = {
  margin: 0,
  paddingInlineStart: "1.25em",
  listStyle: "disc",
  display: "grid",
  gap: 6,
} as const;

export function DeleteAccountForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [appName, setAppName] = useState("");
  const [note, setNote] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, appName, note, confirm }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "שליחת הבקשה נכשלה.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שליחת הבקשה נכשלה.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section style={{ display: "grid", gap: 12 }}>
        <p>
          אם יש לכם חשבון באחת מהאפליקציות המופעלות באמצעות Tori, תוכלו לבקש
          למחוק את החשבון שלכם ואת המידע המשויך אליו.
        </p>
        <p>
          ניתן למחוק חשבון גם ישירות מתוך האפליקציה: פרופיל אישי → מחיקת חשבון.
        </p>
        <p>
          אם אין לכם יותר גישה לאפליקציה, ניתן לשלוח בקשת מחיקה באמצעות הטופס
          בעמוד זה.
        </p>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2>בקשת מחיקה</h2>
        <p>מלאו את הפרטים ונטפל בבקשה לאחר אימות.</p>
        {sent ? (
          <p>הבקשה נשלחה. נטפל בה לאחר אימות הפרטים.</p>
        ) : (
          <form onSubmit={(event) => void submit(event)} style={{ display: "grid", gap: 14 }}>
            <label className="tori-field" style={{ display: "grid", gap: 6 }}>
              <span>שם מלא *</span>
              <input
                className="tori-input"
                name="fullName"
                required
                maxLength={80}
                autoComplete="name"
                placeholder="ישראל ישראלי"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </label>
            <label className="tori-field" style={{ display: "grid", gap: 6 }}>
              <span>מספר הטלפון המשויך לחשבון *</span>
              <input
                className="tori-input"
                name="phone"
                required
                dir="ltr"
                inputMode="tel"
                autoComplete="tel"
                placeholder="050-1234567"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
            <label className="tori-field" style={{ display: "grid", gap: 6 }}>
              <span>שם העסק / האפליקציה שבה השתמשתי *</span>
              <input
                className="tori-input"
                name="appName"
                required
                maxLength={120}
                placeholder="שם העסק או האפליקציה"
                value={appName}
                onChange={(event) => setAppName(event.target.value)}
              />
            </label>
            <label className="tori-field" style={{ display: "grid", gap: 6 }}>
              <span>הערה (אופציונלי)</span>
              <textarea
                className="tori-textarea"
                name="note"
                maxLength={1000}
                placeholder="פרטים נוספים שיעזרו לנו לזהות את החשבון..."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <input
                type="checkbox"
                checked={confirm}
                onChange={(event) => setConfirm(event.target.checked)}
                style={{ marginTop: 6 }}
              />
              <span>אני מבקש/ת למחוק את החשבון ואת המידע המשויך אליו. *</span>
            </label>
            {error ? <p style={{ color: "var(--text-danger)", margin: 0 }}>{error}</p> : null}
            <button className="tori-btn tori-btn--primary" type="submit" disabled={loading}>
              שליחת בקשת מחיקה
            </button>
          </form>
        )}
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2>מה נמחק?</h2>
        <p>
          בעת מחיקת החשבון יימחק המידע האישי המשויך לחשבון ככל שאינו נדרש
          להישמר לצורך חובה חוקית, אבטחה או מניעת הונאה.
        </p>
        <p>המידע עשוי לכלול:</p>
        <ul style={listStyle}>
          <li>שם</li>
          <li>מספר טלפון</li>
          <li>מזהה משתמש</li>
          <li>פרטי חשבון</li>
          <li>מידע הקשור לתורים</li>
          <li>Push Token ומזהים טכניים המשויכים לחשבון</li>
        </ul>
        <p>
          מדיניות פרטיות:{" "}
          <a href="https://wetori.co.il/app-privacy">https://wetori.co.il/app-privacy</a>
        </p>
        <p>
          תמיכה:{" "}
          <a href="https://wetori.co.il/support">https://wetori.co.il/support</a>
        </p>
      </section>
    </>
  );
}
