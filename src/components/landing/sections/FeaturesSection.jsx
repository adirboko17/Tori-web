export default function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        position: "relative",
        background: "var(--ink-50)",
        padding: "84px 24px",
        overflow: "hidden",
        borderTop: "1px solid var(--line-subtle)",
      }}
    >
      <div
        data-reveal="1"
        style={{ position: "relative", maxWidth: "1200px", margin: "0 auto" }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "grid",
              justifyItems: "center",
              textAlign: "center",
              gap: "14px",
              marginBottom: "34px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
                fontSize: "clamp(30px,4vw,50px)",
                lineHeight: "1.05",
                color: "var(--ink-900)",
                margin: "0",
              }}
            >
              {"שני צדדים,"}
              <br />
              {"אפליקציה "}
              <span className="tori-word">{"אחת."}</span>
            </h2>
            <p
              style={{
                fontSize: "17px",
                lineHeight: "1.6",
                color: "var(--ink-600)",
                margin: "0",
                maxWidth: "46ch",
              }}
            >
              {
                "ללקוח — אפליקציה שקובעים בה תור בעשר שניות. לכם — מערכת ניהול מלאה. אותה אפליקציה, שני מסכים."
              }
            </p>
            <a
              className="ths2"
              href="/onboarding"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                minHeight: "46px",
                padding: "0 10px 0 18px",
                borderRadius: "12px",
                background: "var(--ink-900)",
                color: "var(--white)",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {"לקבלת האפליקציה"}
              <span
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--gradient-brand)",
                  color: "var(--ink-900)",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flex: "0 0 auto" }}
                >
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
              </span>
            </a>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
              gap: "20px",
            }}
          >
            <div
              style={{
                borderRadius: "28px",
                background: "var(--white)",
                border: "1px solid var(--ink-200)",
                boxShadow: "var(--shadow-md)",
                padding: "30px 28px 32px",
                display: "grid",
                gap: "20px",
                alignContent: "start",
              }}
            >
              <div style={{ display: "grid", gap: "9px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    justifySelf: "start",
                    alignItems: "center",
                    gap: "7px",
                    minHeight: "28px",
                    padding: "0 11px",
                    borderRadius: "8px",
                    background: "var(--ink-50)",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: ".08em",
                    color: "var(--ink-700)",
                  }}
                >
                  {"מסך הלקוח"}
                </span>
                <span
                  style={{
                    fontFamily:
                      "'Google Sans','Open Sans',system-ui,sans-serif",
                    fontSize: "23px",
                    lineHeight: "1.2",
                    color: "var(--ink-900)",
                  }}
                >
                  {"קובע תור בעשר שניות, בכל שעה"}
                </span>
              </div>
              <div style={{ display: "grid", gap: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      flex: "0 0 auto",
                      display: "grid",
                      placeItems: "center",
                      width: "36px",
                      height: "36px",
                      borderRadius: "11px",
                      background: "rgba(191,255,81,.30)",
                      color: "var(--ink-900)",
                    }}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flex: "0 0 auto" }}
                    >
                      <path d="M8 2v4"></path>
                      <path d="M16 2v4"></path>
                      <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                      <path d="M3 10h18"></path>
                      <path d="m9 16 2 2 4-4"></path>
                    </svg>
                  </span>
                  <span style={{ display: "grid", gap: "3px", minWidth: "0" }}>
                    <span
                      style={{
                        fontSize: "15.5px",
                        fontWeight: "600",
                        color: "var(--ink-900)",
                      }}
                    >
                      {"קביעת תור 24/7"}
                    </span>
                    <span
                      style={{
                        fontSize: "13.5px",
                        lineHeight: "1.5",
                        color: "var(--ink-600)",
                      }}
                    >
                      {"בלי טלפונים, בלי הודעות שמחכות לתשובה."}
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      flex: "0 0 auto",
                      display: "grid",
                      placeItems: "center",
                      width: "36px",
                      height: "36px",
                      borderRadius: "11px",
                      background: "rgba(191,255,81,.30)",
                      color: "var(--ink-900)",
                    }}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flex: "0 0 auto" }}
                    >
                      <path d="M10.268 21a2 2 0 0 0 3.464 0"></path>
                      <path d="M22 8c0-2.3-.8-4.3-2-6"></path>
                      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>
                      <path d="M4 2C2.8 3.7 2 5.7 2 8"></path>
                    </svg>
                  </span>
                  <span style={{ display: "grid", gap: "3px", minWidth: "0" }}>
                    <span
                      style={{
                        fontSize: "15.5px",
                        fontWeight: "600",
                        color: "var(--ink-900)",
                      }}
                    >
                      {"תזכורות אוטומטיות"}
                    </span>
                    <span
                      style={{
                        fontSize: "13.5px",
                        lineHeight: "1.5",
                        color: "var(--ink-600)",
                      }}
                    >
                      {"יום לפני ושעתיים לפני — פחות הברזות."}
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      flex: "0 0 auto",
                      display: "grid",
                      placeItems: "center",
                      width: "36px",
                      height: "36px",
                      borderRadius: "11px",
                      background: "rgba(191,255,81,.30)",
                      color: "var(--ink-900)",
                    }}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flex: "0 0 auto" }}
                    >
                      <rect
                        width="18"
                        height="18"
                        x="3"
                        y="3"
                        rx="2"
                        ry="2"
                      ></rect>
                      <circle cx="9" cy="9" r="2"></circle>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                    </svg>
                  </span>
                  <span style={{ display: "grid", gap: "3px", minWidth: "0" }}>
                    <span
                      style={{
                        fontSize: "15.5px",
                        fontWeight: "600",
                        color: "var(--ink-900)",
                      }}
                    >
                      {"גלריית עבודות"}
                    </span>
                    <span
                      style={{
                        fontSize: "13.5px",
                        lineHeight: "1.5",
                        color: "var(--ink-600)",
                      }}
                    >
                      {"הלקוח רואה מה את/ה עושה, ומזמין יותר."}
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      flex: "0 0 auto",
                      display: "grid",
                      placeItems: "center",
                      width: "36px",
                      height: "36px",
                      borderRadius: "11px",
                      background: "rgba(191,255,81,.30)",
                      color: "var(--ink-900)",
                    }}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flex: "0 0 auto" }}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </span>
                  <span style={{ display: "grid", gap: "3px", minWidth: "0" }}>
                    <span
                      style={{
                        fontSize: "15.5px",
                        fontWeight: "600",
                        color: "var(--ink-900)",
                      }}
                    >
                      {"היסתוריית תורים"}
                    </span>
                    <span
                      style={{
                        fontSize: "13.5px",
                        lineHeight: "1.5",
                        color: "var(--ink-600)",
                      }}
                    >
                      {"לקוח חוזר יודע בדיוק מה עשה ומתי."}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{
                borderRadius: "28px",
                padding: "30px 28px 32px",
                display: "grid",
                gap: "20px",
                alignContent: "start",
                background: "var(--ink-900)",
                boxShadow: "0 26px 60px rgba(23,22,22,.18)",
              }}
            >
              <div style={{ display: "grid", gap: "9px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    justifySelf: "start",
                    alignItems: "center",
                    gap: "7px",
                    minHeight: "28px",
                    padding: "0 11px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,.1)",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: ".08em",
                    color: "var(--green-300)",
                  }}
                >
                  {"מסך העסק"}
                </span>
                <span
                  style={{
                    fontFamily:
                      "'Google Sans','Open Sans',system-ui,sans-serif",
                    fontSize: "23px",
                    lineHeight: "1.2",
                    color: "var(--white)",
                  }}
                >
                  {"כל היומן, הלקוחות והכסף במקום אחד"}
                </span>
              </div>
              <div style={{ display: "grid", gap: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      flex: "0 0 auto",
                      display: "grid",
                      placeItems: "center",
                      width: "36px",
                      height: "36px",
                      borderRadius: "11px",
                      background: "rgba(255,255,255,.09)",
                      color: "var(--green-300)",
                    }}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flex: "0 0 auto" }}
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </span>
                  <span style={{ display: "grid", gap: "3px", minWidth: "0" }}>
                    <span
                      style={{
                        fontSize: "15.5px",
                        fontWeight: "600",
                        color: "var(--white)",
                      }}
                    >
                      {"ניהול לקוחות"}
                    </span>
                    <span
                      style={{
                        fontSize: "13.5px",
                        lineHeight: "1.5",
                        color: "rgba(255,255,255,.64)",
                      }}
                    >
                      {"היסתוריה מלאה, מי קבוע ומי לא חזר."}
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      flex: "0 0 auto",
                      display: "grid",
                      placeItems: "center",
                      width: "36px",
                      height: "36px",
                      borderRadius: "11px",
                      background: "rgba(255,255,255,.09)",
                      color: "var(--green-300)",
                    }}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flex: "0 0 auto" }}
                    >
                      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
                      <path d="m21.854 2.147-10.94 10.939"></path>
                    </svg>
                  </span>
                  <span style={{ display: "grid", gap: "3px", minWidth: "0" }}>
                    <span
                      style={{
                        fontSize: "15.5px",
                        fontWeight: "600",
                        color: "var(--white)",
                      }}
                    >
                      {"הודעת תפוצה"}
                    </span>
                    <span
                      style={{
                        fontSize: "13.5px",
                        lineHeight: "1.5",
                        color: "rgba(255,255,255,.64)",
                      }}
                    >
                      {"מבצע לכל הלקוחות בלחיצה אחת."}
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      flex: "0 0 auto",
                      display: "grid",
                      placeItems: "center",
                      width: "36px",
                      height: "36px",
                      borderRadius: "11px",
                      background: "rgba(255,255,255,.09)",
                      color: "var(--green-300)",
                    }}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flex: "0 0 auto" }}
                    >
                      <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                      <path d="M18 17V9"></path>
                      <path d="M13 17V5"></path>
                      <path d="M8 17v-3"></path>
                    </svg>
                  </span>
                  <span style={{ display: "grid", gap: "3px", minWidth: "0" }}>
                    <span
                      style={{
                        fontSize: "15.5px",
                        fontWeight: "600",
                        color: "var(--white)",
                      }}
                    >
                      {"סטטיסטיקות"}
                    </span>
                    <span
                      style={{
                        fontSize: "13.5px",
                        lineHeight: "1.5",
                        color: "rgba(255,255,255,.64)",
                      }}
                    >
                      {"מה נמכר, מי הלקוחות הכי פעילים."}
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      flex: "0 0 auto",
                      display: "grid",
                      placeItems: "center",
                      width: "36px",
                      height: "36px",
                      borderRadius: "11px",
                      background: "rgba(255,255,255,.09)",
                      color: "var(--green-300)",
                    }}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flex: "0 0 auto" }}
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                      <line x1="2" x2="22" y1="10" y2="10"></line>
                    </svg>
                  </span>
                  <span style={{ display: "grid", gap: "3px", minWidth: "0" }}>
                    <span
                      style={{
                        fontSize: "15.5px",
                        fontWeight: "600",
                        color: "var(--white)",
                      }}
                    >
                      {"תשלום מראש"}
                    </span>
                    <span
                      style={{
                        fontSize: "13.5px",
                        lineHeight: "1.5",
                        color: "rgba(255,255,255,.64)",
                      }}
                    >
                      {"גובה על התור בעת ההזמנה."}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
