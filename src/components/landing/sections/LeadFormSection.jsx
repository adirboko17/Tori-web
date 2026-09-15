export default function LeadFormSection() {
  return (
    <section
      id="lead-form"
      style={{
        position: "relative",
        background: "var(--white)",
        overflow: "hidden",
      }}
    >
      <div
        className="tori-lead-grid"
        style={{
          position: "relative",
          maxWidth: "1180px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(400px,1fr))",
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
              "משאירים פרטים, ואנחנו חוזרים אליכם תוך שעה לשיחת היכרות קצרה — בלי התחייבות."
            }
          </p>
          <div style={{ display: "grid", gap: "14px", maxWidth: "34ch" }}>
            <div
              style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
            >
              <span
                style={{
                  flex: "0 0 auto",
                  width: "34px",
                  height: "34px",
                  borderRadius: "11px",
                  background: "var(--white)",
                  border: "1px solid var(--green-200)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--green-600)",
                  boxShadow: "0 0 14px rgba(12,255,190,.22)",
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.85"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </span>
              <span>
                <span
                  style={{
                    display: "block",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "var(--ink-900)",
                  }}
                >
                  {"שיחה תוך שעה"}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "14px",
                    color: "var(--ink-600)",
                    lineHeight: "1.5",
                  }}
                >
                  {"בימים א׳–ה׳, 9:00–17:00"}
                </span>
              </span>
            </div>
            <div
              style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
            >
              <span
                style={{
                  flex: "0 0 auto",
                  width: "34px",
                  height: "34px",
                  borderRadius: "11px",
                  background: "var(--white)",
                  border: "1px solid var(--green-200)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--green-600)",
                  boxShadow: "0 0 14px rgba(12,255,190,.22)",
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.85"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </span>
              <span>
                <span
                  style={{
                    display: "block",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "var(--ink-900)",
                  }}
                >
                  {"‎299 ₪ לחודש, מחיר קבוע"}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "14px",
                    color: "var(--ink-600)",
                    lineHeight: "1.5",
                  }}
                >
                  {"בלי דמי הקמה ובלי הפתעות"}
                </span>
              </span>
            </div>
            <div
              style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
            >
              <span
                style={{
                  flex: "0 0 auto",
                  width: "34px",
                  height: "34px",
                  borderRadius: "11px",
                  background: "var(--white)",
                  border: "1px solid var(--green-200)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--green-600)",
                  boxShadow: "0 0 14px rgba(12,255,190,.22)",
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.85"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              </span>
              <span>
                <span
                  style={{
                    display: "block",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "var(--ink-900)",
                  }}
                >
                  {"אנחנו מקימים, לא אתם"}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "14px",
                    color: "var(--ink-600)",
                    lineHeight: "1.5",
                  }}
                >
                  {"כל מה שצריך זה לוגו ושם"}
                </span>
              </span>
            </div>
          </div>
          <a
            className="ths9"
            href="https://wa.me/972535575303?text=%D7%A9%D7%9C%D7%95%D7%9D%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A4%D7%A8%D7%98%D7%99%D7%9D%20%D7%A2%D7%9C%20Tori"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "26px",
              fontSize: "15px",
              fontWeight: "500",
              color: "var(--green-700)",
            }}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.85"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
            </svg>
            {"מעדיפים וואטסאפ? דברו איתנו ישר"}
          </a>
        </div>
        <div
          className="tori-lead-form-col"
          data-reveal="2"
          style={{
            minWidth: "0",
            background: "var(--white)",
            border: "1px solid var(--ink-200)",
            borderRadius: "26px",
            padding: "clamp(22px,2.6vw,34px)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3
            style={{
              fontSize: "21px",
              fontWeight: "600",
              color: "var(--ink-900)",
              margin: "0 0 4px",
            }}
          >
            {"בואו נתחיל"}
          </h3>
          <p
            style={{
              fontSize: "13px",
              color: "var(--ink-500)",
              margin: "0 0 18px",
            }}
          >
            {"פחות מדקה, ואנחנו חוזרים אליכם."}
          </p>
          <div style={{ display: "grid", gap: "14px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                gap: "12px",
              }}
            >
              <label className="tori-field">
                <span className="tori-field-label">{"שם מלא"}</span>
                <span className="tori-field-wrap">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.85"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="tori-field-ico"
                  >
                    <circle cx="12" cy="8" r="5"></circle>
                    <path d="M20 21a8 8 0 0 0-16 0"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="דנה לוי"
                    autoComplete="name"
                  />
                </span>
              </label>
              <label className="tori-field">
                <span className="tori-field-label">{"טלפון לחזרה"}</span>
                <span className="tori-field-wrap">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.85"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="tori-field-ico"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <input
                    type="tel"
                    inputMode="tel"
                    dir="ltr"
                    style={{ textAlign: "start" }}
                    placeholder="050-000-0000"
                    autoComplete="tel"
                  />
                </span>
              </label>
            </div>
            <label className="tori-field">
              <span className="tori-field-label">{"שם העסק"}</span>
              <span className="tori-field-wrap">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.85"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="tori-field-ico"
                >
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                  <path d="M10 6h4"></path>
                  <path d="M10 10h4"></path>
                  <path d="M10 14h4"></path>
                  <path d="M10 18h4"></path>
                </svg>
                <input type="text" placeholder="סטודיו נועה" />
              </span>
            </label>
            <div style={{ display: "grid", gap: "8px" }}>
              <span className="tori-field-label">{"תחום העסק"}</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <label className="tori-chip">
                  <input type="radio" name="biz-type" defaultChecked={true} />
                  <span>{"מספרה / ברבר"}</span>
                </label>
                <label className="tori-chip">
                  <input type="radio" name="biz-type" />
                  <span>{"קוסמטיקה"}</span>
                </label>
                <label className="tori-chip">
                  <input type="radio" name="biz-type" />
                  <span>{"ציפורניים"}</span>
                </label>
                <label className="tori-chip">
                  <input type="radio" name="biz-type" />
                  <span>{"קליניקה"}</span>
                </label>
                <label className="tori-chip">
                  <input type="radio" name="biz-type" />
                  <span>{"סטודיו"}</span>
                </label>
                <label className="tori-chip">
                  <input type="radio" name="biz-type" />
                  <span>{"אחר"}</span>
                </label>
              </div>
            </div>
            <details className="tori-more">
              <summary>
                {"להוסיף הערה? "}
                <span className="tori-more-ico">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.85"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <textarea
                className="tori-textarea"
                rows="3"
                placeholder="ספרו לנו על העסק — כמה עובדים, איך מנהלים תורים היום"
              ></textarea>
            </details>
            <button
              className="ths10 ths11"
              type="button"
              data-act="submitLead"
              data-ev="click"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "9px",
                minHeight: "52px",
                borderRadius: "13px",
                background: "var(--gradient-brand)",
                color: "var(--ink-900)",
                fontSize: "17px",
                fontWeight: "600",
                border: "0",
                cursor: "pointer",
                boxShadow: "var(--shadow-brand)",
                transition:
                  "transform .18s cubic-bezier(.22,.61,.36,1),box-shadow .18s",
              }}
            >
              {"קחו אותי לשיחה"}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.85"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
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
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                fontSize: "12px",
                color: "var(--ink-400)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.85"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              {"הפרטים נשמרים אצלנו בלבד"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
