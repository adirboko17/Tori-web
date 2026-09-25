import { LegalPage } from "@/components/legal-page";
import { CookieSettingsButton } from "@/components/tracking/cookie-settings-button";

export const metadata = { title: "מדיניות עוגיות" };

const listStyle = {
  margin: 0,
  paddingInlineStart: "1.25em",
  display: "grid",
  gap: 6,
} as const;

export default function CookiesPage() {
  return (
    <LegalPage title="מדיניות עוגיות">
      <p>
        מדיניות זו חלה על האתר wetori.co.il. היא אינה חלה על אפליקציות קביעת
        התורים של בתי העסק. עודכן לאחרונה: 25 בספטמבר 2026.
      </p>

      <section style={{ display: "grid", gap: 12 }}>
        <h2>1. עוגיות הכרחיות</h2>
        <p>
          עוגיות אלה נדרשות כדי שהאתר יפעל. אי אפשר לכבות אותן מתוך הבאנר,
          כי בלי הן תהליך התשלום או כניסת המנהל לא עובדים.
        </p>
        <ul style={listStyle}>
          <li>עוגיית תהליך תשלום, לשמירת מצב ההזמנה עד סיום הסליקה</li>
          <li>עוגיית התחברות של מנהל המערכת, באזור הניהול בלבד</li>
        </ul>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2>2. שמירה במכשיר, בלי עוגייה</h2>
        <p>
          העדפות תפריט הנגישות נשמרות באחסון המקומי של הדפדפן, במכשיר שלך.
          גם הבחירה בבנר העוגיות נשמרת שם. אפשר למחוק את שתיהן בהגדרות
          הדפדפן.
        </p>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2>3. מדידה ושיווק, רק אחרי אישור</h2>
        <p>
          רק אם בחרתם «אישור» בבנר, האתר טוען את הכלים הבאים. בלי אישור הם
          לא נטענים ולא נשלח אליהם מידע.
        </p>
        <ul style={listStyle}>
          <li>
            Meta Pixel של פייסבוק: מזהה ביקורים באתר ומודד פניות ותשלום, כדי
            להציג ולמדוד פרסום ב־Meta
          </li>
          <li>
            Google Analytics, ו־Google Ads אם חובר: מודדים שימוש באתר
            ותוצאות של מודעות
          </li>
        </ul>
        <p>
          הכלים מקבלים כתובת IP, מזהה דפדפן, עמודים שנצפו ופעולות כמו
          השלמת תשלום. Meta ו־Google עשויות לעבד את המידע מחוץ לישראל, לפי
          המדיניות שלהן. המידע הזה אינו כולל את תוכן האפליקציה של העסק, את
          רשימת הלקוחות או את פרטי כרטיס האשראי.
        </p>
        <p>
          <CookieSettingsButton />
        </p>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2>4. כמה זמן נשמרת הבחירה</h2>
        <p>
          הבחירה נשמרת בדפדפן עד שמוחקים את נתוני האתר, או עד שלוחצים שוב
          על «הגדרות עוגיות» ובוחרים מחדש.
        </p>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2>5. יצירת קשר</h2>
        <p>
          דוא״ל:{" "}
          <a href="mailto:support@wetori.co.il">support@wetori.co.il</a>
          <br />
          טלפון:{" "}
          <a href="tel:+972535575303" dir="ltr">
            053-5575303
          </a>
        </p>
      </section>
    </LegalPage>
  );
}
