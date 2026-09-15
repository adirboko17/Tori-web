export default function PricingSection() {
  return (
    <section
      id="pricing"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--ink-900)",
        padding: "clamp(72px,9vw,110px) 24px",
      }}
    >
      <div
        style={{ position: "relative", maxWidth: "1120px", margin: "0 auto" }}
        data-reveal="1"
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "clamp(36px,4.5vw,58px)",
          }}
        >
          <h2
            style={{
              fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
              fontSize: "clamp(30px,4vw,50px)",
              lineHeight: "1.1",
              color: "var(--white)",
              margin: "0",
            }}
          >
            {"מחיר אחד. פשוט."}
            <br />
            {"ללא "}
            <span className="tori-word-line">{"דמי הקמה!"}</span>
          </h2>
        </div>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              insetInlineEnd: "-14%",
              top: "-38%",
              width: "620px",
              height: "620px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(191,255,81,.22),rgba(191,255,81,0) 68%)",
              pointerEvents: "none",
            }}
          ></span>
          <span
            style={{
              position: "absolute",
              insetInlineStart: "-16%",
              bottom: "-46%",
              width: "680px",
              height: "680px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(12,255,190,.20),rgba(12,255,190,0) 68%)",
              pointerEvents: "none",
            }}
          ></span>
          <div
            className="tori-price-grid"
            style={{
              position: "relative",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: "clamp(30px,5vw,76px)",
            }}
          >
            <div
              style={{
                flex: "0 1 400px",
                minWidth: "0",
                display: "grid",
                gap: "18px",
                justifyItems: "start",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}
              >
                <span
                  style={{
                    fontFamily:
                      "'Google Sans','Open Sans',system-ui,sans-serif",
                    fontSize: "clamp(64px,8vw,104px)",
                    lineHeight: ".86",
                    color: "var(--white)",
                    width: "197px",
                  }}
                >
                  {"‎"}
                  <span data-count="299">{"299"}</span>
                </span>
                <span
                  style={{ display: "grid", gap: "2px", paddingBottom: "6px" }}
                >
                  <span
                    style={{
                      fontFamily:
                        "'Google Sans','Open Sans',system-ui,sans-serif",
                      fontSize: "clamp(26px,3vw,38px)",
                      lineHeight: "1",
                      color: "var(--green-300)",
                    }}
                  >
                    {"₪"}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "rgba(255,255,255,.62)",
                    }}
                  >
                    {"לחודש"}
                  </span>
                  <span
                    style={{
                      fontSize: "11.5px",
                      fontWeight: "400",
                      color: "rgba(255,255,255,.46)",
                    }}
                  >
                    {"לא כולל מע״מ"}
                  </span>
                </span>
              </div>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "rgba(255,255,255,.72)",
                  margin: "0",
                  maxWidth: "34ch",
                }}
              >
                {"מחיר קבוע, בלי דמי הקמה ובלי התחייבות. מתנתקים מתי שרוצים."}
              </p>
              <a
                href="/onboarding"
                className="tori-cta"
                style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "13px",
                  minHeight: "64px",
                  padding: "0 14px 0 30px",
                  borderRadius: "16px",
                  background: "var(--gradient-brand)",
                  color: "var(--ink-900)",
                  fontSize: "19px",
                  fontWeight: "600",
                  overflow: "hidden",
                  isolation: "isolate",
                  boxShadow: "0 18px 40px rgba(12,255,190,.28)",
                }}
              >
                <span style={{ position: "relative" }}>
                  {"אני בפנים, בואו נתחיל"}
                </span>
                <span
                  className="tori-cta-arrow"
                  style={{
                    position: "relative",
                    display: "inline-grid",
                    placeItems: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "var(--ink-900)",
                    color: "var(--green-300)",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
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
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13.5px",
                  color: "rgba(255,255,255,.58)",
                }}
              >
                <svg
                  width="15"
                  height="15"
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
                {"חוזרים אליכם תוך שעה · באוויר תוך 72 שעות"}
              </span>
            </div>
            <div style={{ flex: "0 1 470px", minWidth: "0", display: "grid" }}>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "13px 0",
                  borderTop: "1px solid rgba(255,255,255,.12)",
                }}
              >
                <span
                  style={{
                    flex: "0 0 auto",
                    display: "grid",
                    placeItems: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "var(--gradient-brand)",
                    color: "var(--ink-900)",
                    marginTop: "1px",
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flex: "0 0 auto" }}
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </span>
                <span style={{ display: "grid", gap: "2px", minWidth: "0" }}>
                  <span
                    style={{
                      fontSize: "15.5px",
                      fontWeight: "600",
                      color: "var(--white)",
                    }}
                  >
                    {"אפליקציה במיתוג שלכם"}
                  </span>
                  <span
                    style={{
                      fontSize: "13.5px",
                      lineHeight: "1.5",
                      color: "rgba(255,255,255,.6)",
                    }}
                  >
                    {"שם, לוגו וצבעים שלכם — בשתי החנויות."}
                  </span>
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "13px 0",
                  borderTop: "1px solid rgba(255,255,255,.12)",
                }}
              >
                <span
                  style={{
                    flex: "0 0 auto",
                    display: "grid",
                    placeItems: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "var(--gradient-brand)",
                    color: "var(--ink-900)",
                    marginTop: "1px",
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flex: "0 0 auto" }}
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </span>
                <span style={{ display: "grid", gap: "2px", minWidth: "0" }}>
                  <span
                    style={{
                      fontSize: "15.5px",
                      fontWeight: "600",
                      color: "var(--white)",
                    }}
                  >
                    {"יומן, לקוחות ותשלומים"}
                  </span>
                  <span
                    style={{
                      fontSize: "13.5px",
                      lineHeight: "1.5",
                      color: "rgba(255,255,255,.6)",
                    }}
                  >
                    {"מערכת ניהול מלאה, בלי כלים נוספים."}
                  </span>
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "13px 0",
                  borderTop: "1px solid rgba(255,255,255,.12)",
                }}
              >
                <span
                  style={{
                    flex: "0 0 auto",
                    display: "grid",
                    placeItems: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "var(--gradient-brand)",
                    color: "var(--ink-900)",
                    marginTop: "1px",
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flex: "0 0 auto" }}
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </span>
                <span style={{ display: "grid", gap: "2px", minWidth: "0" }}>
                  <span
                    style={{
                      fontSize: "15.5px",
                      fontWeight: "600",
                      color: "var(--white)",
                    }}
                  >
                    {"תזכורות אוטומטיות"}
                  </span>
                  <span
                    style={{
                      fontSize: "13.5px",
                      lineHeight: "1.5",
                      color: "rgba(255,255,255,.6)",
                    }}
                  >
                    {"פחות הברזות, בלי לרדוף אחרי אף אחד."}
                  </span>
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "13px 0",
                  borderTop: "1px solid rgba(255,255,255,.12)",
                }}
              >
                <span
                  style={{
                    flex: "0 0 auto",
                    display: "grid",
                    placeItems: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "var(--gradient-brand)",
                    color: "var(--ink-900)",
                    marginTop: "1px",
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flex: "0 0 auto" }}
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </span>
                <span style={{ display: "grid", gap: "2px", minWidth: "0" }}>
                  <span
                    style={{
                      fontSize: "15.5px",
                      fontWeight: "600",
                      color: "var(--white)",
                    }}
                  >
                    {"עדכונים ותחזוקה"}
                  </span>
                  <span
                    style={{
                      fontSize: "13.5px",
                      lineHeight: "1.5",
                      color: "rgba(255,255,255,.6)",
                    }}
                  >
                    {"הכל מתעדכן אצלנו — אתם רק עובדים."}
                  </span>
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "13px 0",
                  borderTop: "1px solid rgba(255,255,255,.12)",
                }}
              >
                <span
                  style={{
                    flex: "0 0 auto",
                    display: "grid",
                    placeItems: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "var(--gradient-brand)",
                    color: "var(--ink-900)",
                    marginTop: "1px",
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flex: "0 0 auto" }}
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </span>
                <span style={{ display: "grid", gap: "2px", minWidth: "0" }}>
                  <span
                    style={{
                      fontSize: "15.5px",
                      fontWeight: "600",
                      color: "var(--white)",
                    }}
                  >
                    {"תמיכה אישית"}
                  </span>
                  <span
                    style={{
                      fontSize: "13.5px",
                      lineHeight: "1.5",
                      color: "rgba(255,255,255,.6)",
                    }}
                  >
                    {"בן אדם שעונה, לא צ׳אט בוט."}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
