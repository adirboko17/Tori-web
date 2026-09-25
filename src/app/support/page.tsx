import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "תמיכה" };

const PHONE_DISPLAY = "053-557-5303";
const PHONE_TEL = "+972535575303";
const WHATSAPP_URL = "https://wa.me/972535575303";
const EMAIL = "support@wetori.co.il";

const topics = [
  "בעיה בהתחברות לאפליקציה",
  "קביעת או ניהול תורים",
  "התראות ותזכורות",
  "בעיה טכנית באפליקציה",
  "שאלות כלליות ומשוב",
];

const listStyle = {
  margin: 0,
  paddingInlineStart: "1.25em",
  listStyle: "disc",
  display: "grid",
  gap: 6,
} as const;

export default function SupportPage() {
  return (
    <LegalPage title="תמיכה">
      <section style={{ display: "grid", gap: 12 }}>
        <h2>צריכים עזרה? אנחנו כאן בשבילכם</h2>
        <p>
          Tori מספקת את התשתית הטכנולוגית לאפליקציות קביעת תורים של עסקים
          שונים. אם נתקלתם בבעיה באפליקציה, יש לכם שאלה לגבי השימוש בה או שאתם
          רוצים לשלוח לנו משוב — צוות התמיכה שלנו ישמח לעזור.
        </p>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2>איך אפשר לעזור?</h2>
        <ul style={listStyle}>
          {topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      </section>

      <section style={{ display: "grid", gap: 16 }}>
        <h2>יצירת קשר</h2>
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.92em" }}>
              WhatsApp / טלפון
            </div>
            <a href={`tel:${PHONE_TEL}`} dir="ltr">
              {PHONE_DISPLAY}
            </a>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.92em" }}>
              אימייל
            </div>
            <a href={`mailto:${EMAIL}`} dir="ltr">
              {EMAIL}
            </a>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.92em" }}>
              שעות פעילות
            </div>
            <div>ימים א׳–ה׳, 09:00–17:30</div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <a
            className="tori-btn tori-btn--primary"
            href={WHATSAPP_URL}
            style={{ textDecoration: "none" }}
          >
            פנייה ב־WhatsApp
            <span aria-hidden="true">←</span>
          </a>
          <a
            className="tori-btn tori-btn--outline"
            href={`mailto:${EMAIL}`}
            style={{ textDecoration: "none" }}
          >
            שליחת אימייל
          </a>
        </div>

        <p>
          בפנייה לתמיכה מומלץ לציין את שם העסק או האפליקציה שבה אתם משתמשים,
          כדי שנוכל לטפל בפנייה במהירות.
        </p>
        <p>
          <a href="/app-privacy">מדיניות הפרטיות של Tori</a>
        </p>
      </section>
    </LegalPage>
  );
}
