import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "הצהרת נגישות" };

const listStyle = {
  margin: 0,
  paddingInlineStart: "1.25em",
  display: "grid",
  gap: 6,
} as const;

export default function Accessibility() {
  return (
    <LegalPage title="הצהרת נגישות">
      <section style={{ display: "grid", gap: 12 }}>
        <h2>1. מחויבות</h2>
        <p>
          איתי בן יאיר, עוסק מורשה מספר 209198704, מפעיל את Tori ואת האתר
          wetori.co.il. אנו פועלים להנגשת האתר בהתאם לתקנות שוויון זכויות
          לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג־2013, ולת״י 5568
          ברמה AA.
        </p>
        <p>
          ההצהרה מתארת את ההתאמות ואת המגבלות הידועות. היא אינה תעודת בדיקה
          של גורם חיצוני, ותפריט הנגישות באתר אינו תחליף להתאמה של המסכים
          עצמם.
        </p>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2>2. רכז נגישות</h2>
        <p>לפניות, בקשות והצעות לשיפור הנגישות:</p>
        <ul style={listStyle}>
          <li>שם: איתי בן יאיר</li>
          <li>
            טלפון ווואטסאפ:{" "}
            <a href="tel:+972535575303" dir="ltr">
              053-5575303
            </a>
          </li>
          <li>
            דוא״ל:{" "}
            <a href="mailto:support@wetori.co.il">support@wetori.co.il</a>
          </li>
          <li>כתובת: אורן 19, באר שבע</li>
        </ul>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2>3. התאמות באתר</h2>
        <ul style={listStyle}>
          <li>מבנה HTML עם כותרות היררכיות</li>
          <li>ניווט במקלדת, כולל Tab, Enter ו־Escape</li>
          <li>טקסט חלופי לתמונות מהותיות</li>
          <li>כיוון עברית מימין לשמאל</li>
          <li>שמות נגישים לכפתורים, לתפריטים ולחלונות</li>
          <li>סגירת חלונות מידע באמצעות המקלדת</li>
          <li>
            תפריט נגישות: הגדלת טקסט, ניגודיות, הדגשת קישורים, גופן קריא,
            ריווח טקסט ועצירת אנימציות. ההעדפות נשמרות בדפדפן של המשתמש
          </li>
        </ul>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2>4. סביבות שנבדקו</h2>
        <p>
          האתר נבדק אצלנו בגרסאות עדכניות של Chrome, Firefox, Safari ו־Edge,
          ובמכשירי iOS ו־Android. זו בדיקה פנימית, לא מבדק הסמכה.
        </p>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2>5. מגבלות ידועות</h2>
        <ul style={listStyle}>
          <li>
            סרטוני הדגמה וחלק מהתמונות השיווקיות הם תוכן חזותי, ובחלקם אין
            תיאור מפורט או כתוביות
          </li>
          <li>
            תפריט הנגישות מסייע בתצוגה, והוא אינו מתקן לבדו כל פער מול ת״י
            5568
          </li>
          <li>
            אחרי אישור עוגיות עשויים להיטען כלי מדידה של Meta ושל Google.
            הכלים האלה אינם בשליטתנו המלאה
          </li>
        </ul>
        <p>נתקן תקלה סבירה שתתגלה, לפי הפנייה לרכז הנגישות.</p>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2>6. פנייה</h2>
        <p>
          נתקלתם בבעיית נגישות? פנו לרכז הנגישות בפרטים שלמעלה. נשיב לכל
          המאוחר בתוך 5 ימי עסקים.
        </p>
        <p>עודכן לאחרונה: 25 בספטמבר 2026.</p>
      </section>
    </LegalPage>
  );
}
