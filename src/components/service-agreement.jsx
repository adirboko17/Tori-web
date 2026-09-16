import "./service-agreement.css";

const cancelTimeline = [
  { title: "בקשת ביטול", date: "14 לחודש" },
  { title: "שירות פעיל עד", date: "10 לחודש הבא" },
  { title: "ביטול סופי", date: "10 לחודש הבא" },
];

export default function ServiceAgreement() {
  return (
    <div className="tori-agreement" dir="rtl" lang="he">
      <section className="tori-agreement-section">
        <h2 className="tori-agreement-h2">{"1. השירות שאנו מספקים"}</h2>
        <h3 className="tori-agreement-h3">{"אפליקציה אישית וממותגת לחלוטין"}</h3>
        <p className="tori-agreement-p">
          {
            "כל עסק מקבל אפליקציה עצמאית הנושאת את שמו, הלוגו שלו ועיצובו — ונפרסת בחנות האפליקציות תחת מותג העסק בלבד."
          }
        </p>
        <p className="tori-agreement-p">
          {
            "הפלטפורמה כוללת: ניהול תורים חכם, מערכת הזמנה עצמאית ללקוחות, תזכורות SMS אוטומטיות, ניהול עובדים ושירותים, וסטטיסטיקות עסקיות."
          }
        </p>
      </section>

      <section className="tori-agreement-section">
        <h2 className="tori-agreement-h2">{"2. תשלום ומנוי"}</h2>
        <p className="tori-agreement-p">
          {
            "דמי המנוי נגבים אוטומטית בכל ה-10 לחודש. אין דמי הקמה — התשלום הראשון הוא דמי המנוי החודשי בלבד."
          }
        </p>
        <h3 className="tori-agreement-h3">{"מחזור החיוב"}</h3>
        <p className="tori-agreement-p">
          {
            "החיוב מתבצע ב-10 לכל חודש עבור החודש הקרוב. לא יינתן החזר כספי עבור תקופה ששולמה."
          }
        </p>
        <h3 className="tori-agreement-h3">{"כשל בתשלום – מה קורה?"}</h3>
        <div className="tori-agreement-steps">
          <p className="tori-agreement-p">
            {
              "1. התראה מיידית — במידה והתשלום לא עבר מכל סיבה שהיא, בעל האפליקציה יקבל התראה להסדרת התשלום."
            }
          </p>
          <p className="tori-agreement-p">
            {
              "2. חלון זמן להסדרה – 7 ימי עסקים — לבעל העסק יש 7 ימי עסקים להסדיר את התשלום ממועד קבלת ההתראה."
            }
          </p>
          <p className="tori-agreement-p">
            {
              "3. השהיית השירות — אם התשלום לא הוסדר תוך 7 ימי עסקים, האפליקציה תוסר מחנות האפליקציות וכל המידע שבתוכה יימחק לצמיתות."
            }
          </p>
        </div>
      </section>

      <section className="tori-agreement-section">
        <h2 className="tori-agreement-h2">{"3. ביטול"}</h2>
        <h3 className="tori-agreement-h3">{"ללא התחייבות"}</h3>
        <p className="tori-agreement-p">{"ניתן לבטל בכל עת, ללא דמי ביטול."}</p>
        <h3 className="tori-agreement-h3">{"עם התחייבות"}</h3>
        <p className="tori-agreement-p">
          {"ביטול לפני תום התקופה יחייב תשלום יתרת החודשים שנותרו."}
        </p>
        <h3 className="tori-agreement-h3">{"מועד כניסת הביטול לתוקף"}</h3>
        <p className="tori-agreement-p">
          {
            "הביטול נכנס לתוקף בתאריך ה-10 של החודש העוקב לאחר בקשת הביטול. השירות ימשיך לפעול עד לאותו מועד."
          }
        </p>
        <div
          className="tori-agreement-timeline"
          role="list"
          aria-label="דוגמה למועד כניסת הביטול לתוקף"
        >
          {cancelTimeline.map((step, index) => (
            <div
              className="tori-agreement-timeline-item"
              role="listitem"
              key={step.title}
            >
              <span className="tori-agreement-timeline-num">
                {String(index + 1)}
              </span>
              <strong className="tori-agreement-timeline-title">
                {step.title}
              </strong>
              <span className="tori-agreement-timeline-date">{step.date}</span>
            </div>
          ))}
        </div>
        <p className="tori-agreement-note">
          <strong>{"חשוב לדעת: "}</strong>
          {
            "עם סיום המנוי, האפליקציה תוסר מחנות האפליקציות ולקוחות העסק לא יוכלו עוד להשתמש בה."
          }
        </p>
      </section>

      <section className="tori-agreement-section">
        <h2 className="tori-agreement-h2">{"4. התחייבויות תורי"}</h2>
        <ul className="tori-agreement-ul">
          <li>{"הפלטפורמה תועמד לשימוש רציף ותקין."}</li>
          <li>{"הקמת האפליקציה תושלם תוך 72 שעות מקבלת כל החומרים."}</li>
          <li>
            {"תמיכה טכנית זמינה בימים א'–ה', בין השעות 09:00–17:00."}
          </li>
          <li>{"המידע שלכם ושל לקוחותיכם ישמר בסודיות מלאה."}</li>
        </ul>
        <h3 className="tori-agreement-h3">
          {"הגבלת אחריות – חנות האפליקציות"}
        </h3>
        <p className="tori-agreement-callout">
          {
            "תורי אינה אחראית לחסימה, הסרה או הגבלה של האפליקציה על ידי Apple או Google מכל סיבה שהיא. החלטות חנויות האפליקציות הן בסמכותן הבלעדית ואינן בשליטת תורי."
          }
        </p>
      </section>

      <section className="tori-agreement-section">
        <h2 className="tori-agreement-h2">{"5. התחייבויות המשתמש"}</h2>
        <ul className="tori-agreement-ul">
          <li>
            {
              "יש לספק את כל החומרים הנדרשים להקמה (לוגו, פרטי עסק, שירותים, תמונות)."
            }
          </li>
          <li>{"אין להעביר את זכות השימוש לצד שלישי."}</li>
          <li>{"יש לעשות שימוש הוגן ותקין בפלטפורמה."}</li>
          <li>
            {"האחריות על התוכן שמועלה לפלטפורמה חלה על המשתמש בלבד."}
          </li>
        </ul>
      </section>

      <section className="tori-agreement-section">
        <h2 className="tori-agreement-h2">
          {"6. קניין רוחני, פרטיות וסודיות"}
        </h2>
        <p className="tori-agreement-p">
          {
            "הפלטפורמה, הטכנולוגיה והעיצוב הינם קניינה הבלעדי של תורי. המשתמש מקבל רישיון שימוש בלבד."
          }
        </p>
        <p className="tori-agreement-p">
          {
            "המידע לא יועבר לצד שלישי ללא הסכמתכם, בהתאם לחוק הגנת הפרטיות הישראלי."
          }
        </p>
        <h3 className="tori-agreement-h3">{"ממשק הניהול – סודיות מלאה"}</h3>
        <p className="tori-agreement-p">
          {
            "ממשק הניהול של העסק הוא סודי ומיועד לבעל העסק בלבד. ללקוחות הקצה אין ולא תהיה גישה לממשק זה, לנתונים העסקיים או לכל מידע ניהולי אחר."
          }
        </p>
      </section>

      <section className="tori-agreement-section">
        <h2 className="tori-agreement-h2">{"7. שונות"}</h2>
        <p className="tori-agreement-p">
          {
            "סמכות השיפוט הבלעדית תהיה לבתי המשפט המוסמכים במחוז תל אביב. תורי שומרת את הזכות לעדכן תנאים אלו בהודעה מוקדמת של 14 ימים."
          }
        </p>
        <p className="tori-agreement-close">
          {
            'בלחיצה על "אני מאשר/ת את תנאי ההסכם", הלקוח מאשר כי קרא את ההסכם, הבין את תנאיו ומסכים להם במלואם.'
          }
        </p>
      </section>
    </div>
  );
}
