const BUSINESS_TYPES = [
  "מספרה / ברבר",
  "קוסמטיקה",
  "ציפורניים",
  "קליניקה",
  "סטודיו",
  "אחר",
];

const WHATSAPP_URL =
  "https://wa.me/972535575303?text=%D7%A9%D7%9C%D7%95%D7%9D%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A4%D7%A8%D7%98%D7%99%D7%9D%20%D7%A2%D7%9C%20Tori";

/** The done-step dot from the onboarding stepper: ink circle, lime check. */
function CheckDot() {
  return (
    <span className="tori-lead-dot" aria-hidden="true">
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 12 5 5L20 7"></path>
      </svg>
    </span>
  );
}

/** A labeled field in the onboarding form's style. */
function Field({ label, optional, children }) {
  return (
    <label className="tori-field">
      <span className="tori-field-label">
        {label}
        {optional && <small>{" · לא חובה"}</small>}
      </span>
      {children}
    </label>
  );
}

export default function LeadFormSection({ monthlyPrice = 299 }) {
  const perks = [
    ["שיחה תוך שעה", "בימים א׳–ה׳, 9:00–17:00"],
    [`‎${monthlyPrice} ₪ לחודש, מחיר קבוע`, "בלי דמי הקמה ובלי הפתעות"],
    ["אנחנו מקימים, לא אתם", "כל מה שצריך זה לוגו ושם"],
  ];
  return (
    <section
      id="lead-form"
      className="tori-lead"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        className="tori-lead-grid"
        style={{
          position: "relative",
          maxWidth: "1180px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(400px,100%),1fr))",
          alignItems: "center",
          gap: "clamp(40px,6vw,96px)",
          padding: "clamp(60px,7vw,92px) 24px",
        }}
      >
        <div data-reveal="1" style={{ minWidth: "0" }}>
          <h2
            style={{
              fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
              fontSize: "clamp(30px,4vw,50px)",
              lineHeight: "1.04",
              color: "var(--ink-900)",
              margin: "0 0 18px",
              maxWidth: "18ch",
            }}
          >
            {"רוצה אפליקציה "}
            <span className="tori-word">{"משלך?"}</span>
          </h2>
          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.6",
              color: "var(--ink-600)",
              margin: "0 0 30px",
              maxWidth: "38ch",
            }}
          >
            {
              "משאירים פרטים, ואנחנו חוזרים אליכם תוך שעה לשיחת היכרות קצרה - בלי התחייבות."
            }
          </p>
          <ul className="tori-lead-perks">
            {perks.map(([title, sub]) => (
              <li key={sub}>
                <CheckDot />
                <span>
                  <strong>{title}</strong>
                  <span>{sub}</span>
                </span>
              </li>
            ))}
          </ul>
          <a className="tori-lead-wa" href={WHATSAPP_URL}>
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.85"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
            </svg>
            {"מעדיפים וואטסאפ? דברו איתנו ישר"}
          </a>
        </div>
        <div className="tori-lead-form-col" data-reveal="2">
          <h3 className="tori-lead-title">{"בואו נתחיל"}</h3>
          <p className="tori-lead-sub">{"פחות מדקה, ואנחנו חוזרים אליכם."}</p>
          <div style={{ display: "grid", gap: "14px" }}>
            <div className="tori-lead-two">
              <Field label="שם מלא">
                <input
                  className="tori-input"
                  type="text"
                  placeholder="דנה לוי"
                  autoComplete="name"
                />
              </Field>
              <Field label="טלפון לחזרה">
                <input
                  className="tori-input"
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                  placeholder="050-000-0000"
                  autoComplete="tel"
                />
              </Field>
            </div>
            <Field label="שם העסק">
              <input
                className="tori-input"
                type="text"
                placeholder="סטודיו נועה"
              />
            </Field>
            <div className="tori-field">
              <span className="tori-field-label">{"תחום העסק"}</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {BUSINESS_TYPES.map((type, i) => (
                  <label key={type} className="tori-lead-type">
                    <input
                      type="radio"
                      name="biz-type"
                      defaultChecked={i === 0}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <Field label="הערה" optional>
              <textarea
                className="tori-input"
                rows="2"
                placeholder="כמה עובדים, איך מנהלים תורים היום"
              ></textarea>
            </Field>
            <button
              className="tori-lead-cta"
              type="button"
              data-act="submitLead"
              data-ev="click"
            >
              {"קחו אותי לשיחה"}
              <span className="tori-lead-cta-ico" aria-hidden="true">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
              </span>
            </button>
            <p
              data-ref="leadMsg"
              style={{
                display: "none",
                margin: "0",
                fontSize: "13.5px",
                lineHeight: "1.5",
                color: "var(--red-600,#C2231C)",
                textAlign: "center",
              }}
            ></p>
            <span className="tori-lead-note">{"הפרטים נשמרים אצלנו בלבד"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
