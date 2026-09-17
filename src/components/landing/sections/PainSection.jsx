export default function PainSection({ monthlyPrice = 299 }) {
  return (
    <section
      id="pain"
      style={{ background: "var(--white)", padding: "90px 24px 80px" }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            maxWidth: "640px",
            margin: "0 auto 40px",
          }}
          data-reveal="1"
        >
          <h2
            style={{
              fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
              fontSize: "clamp(30px,4vw,50px)",
              lineHeight: "1.1",
              color: "var(--ink-900)",
              margin: "0 0 14px",
            }}
          >
            {"אתם מבזבזים "}
            <span className="tori-word">{"שעות"}</span>
            <br />
            {"בהתנהלות מול לקוחות?"}
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "18px",
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              background: "var(--ink-900)",
              color: "var(--white)",
              borderRadius: "24px",
              padding: "26px 26px 0",
              minHeight: "340px",
              display: "grid",
              gridTemplateRows: "auto auto 1fr",
              gap: "12px",
            }}
            className="tori-lift"
            data-reveal="1"
          >
            <span
              style={{
                justifySelf: "start",
                border: "1px solid rgba(255,255,255,.7)",
                borderRadius: "5px",
                padding: "4px 11px",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              {"הודעה · 22:41"}
            </span>
            <div>
              <h3
                style={{
                  fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
                  fontSize: "clamp(24px,2.4vw,30px)",
                  lineHeight: "1.15",
                  margin: "0 0 8px",
                  color: "var(--white)",
                }}
              >
                {"״אפשר לבוא מחר ב־16:00?״"}
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.55",
                  color: "rgba(255,255,255,.7)",
                  margin: "0",
                }}
              >
                {"ובזמן שאת/ה עונה — הלקוח כבר פנה למתחרה."}
              </p>
            </div>
            <div style={{ position: "relative", minHeight: "170px" }}>
              <div
                className="tori-bub1"
                style={{
                  position: "absolute",
                  insetInlineEnd: "0",
                  bottom: "70px",
                  transform: "rotate(-4deg)",
                  background: "var(--white)",
                  color: "var(--ink-900)",
                  borderRadius: "16px",
                  borderEndEndRadius: "4px",
                  padding: "12px 16px",
                  fontSize: "15px",
                  maxWidth: "100%",
                  fontWeight: "500",
                  boxShadow: "0 14px 30px rgba(0,0,0,.35)",
                  whiteSpace: "nowrap",
                }}
              >
                {"אפשר לבוא מחר ב־16:00?"}
              </div>
              <div
                className="tori-bub2"
                style={{
                  position: "absolute",
                  insetInlineStart: "0",
                  bottom: "12px",
                  transform: "rotate(3deg)",
                  background: "var(--gradient-brand)",
                  color: "var(--ink-900)",
                  borderRadius: "16px",
                  borderEndStartRadius: "4px",
                  padding: "12px 16px",
                  fontSize: "15px",
                  fontWeight: "500",
                  boxShadow: "0 14px 30px rgba(0,0,0,.35)",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flex: "0 0 auto" }}
                >
                  <path d="M18 6 7 17l-5-5"></path>
                  <path d="m22 10-7.5 7.5L13 16"></path>
                </svg>
                {"נקבע — אצל המתחרה"}
              </div>
            </div>
          </div>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              background: "var(--ink-50)",
              color: "var(--ink-900)",
              borderRadius: "24px",
              padding: "26px 26px 0",
              minHeight: "340px",
              display: "grid",
              gridTemplateRows: "auto auto 1fr",
              gap: "12px",
            }}
            className="tori-lift"
            data-reveal="2"
          >
            <span
              style={{
                justifySelf: "start",
                border: "1px solid var(--ink-900)",
                borderRadius: "5px",
                padding: "4px 11px",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              {"הודעה · 08:05"}
            </span>
            <div>
              <h3
                style={{
                  fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
                  fontSize: "clamp(24px,2.4vw,30px)",
                  lineHeight: "1.15",
                  margin: "0 0 8px",
                  color: "var(--ink-900)",
                }}
              >
                {"״אני לא אגיע בסוף ביום שני״"}
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.55",
                  color: "var(--ink-600)",
                  margin: "0",
                }}
              >
                {"ביטול של הרגע האחרון = הכנסה שנעלמת."}
              </p>
            </div>
            <div style={{ position: "relative", minHeight: "170px" }}>
              <div
                className="tori-cancel"
                style={{
                  position: "absolute",
                  insetInlineStart: "0",
                  insetInlineEnd: "0",
                  bottom: "-14px",
                  transform: "rotate(-3deg)",
                  background: "var(--white)",
                  borderRadius: "18px",
                  padding: "14px 16px",
                  boxShadow: "0 18px 40px rgba(23,22,22,.14)",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  alignItems: "center",
                  gap: "12px",
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    className="tori-strike"
                    style={{
                      display: "inline-block",
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "var(--ink-400)",
                      fontFeatureSettings: "'tnum' 1",
                      lineHeight: "1.1",
                    }}
                  >
                    {"11:30"}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--ink-400)" }}>
                    {"יום ב׳"}
                  </div>
                </div>
                <div
                  style={{
                    minWidth: "0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "var(--ink-900)",
                    }}
                  >
                    {"צבע + פן"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ink-500)" }}>
                    {"60 דק׳"}
                  </div>
                </div>
                <span
                  className="tori-loss"
                  style={{
                    background: "var(--red-100)",
                    color: "var(--red-700)",
                    borderRadius: "5px",
                    padding: "5px 10px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {"‎-320 ₪"}
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              background: "var(--lime-400)",
              color: "var(--ink-900)",
              borderRadius: "24px",
              padding: "26px 26px 0",
              minHeight: "340px",
              display: "grid",
              gridTemplateRows: "auto auto 1fr",
              gap: "12px",
            }}
            className="tori-lift"
            data-reveal="3"
          >
            <span
              style={{
                justifySelf: "start",
                border: "1px solid var(--ink-900)",
                borderRadius: "5px",
                padding: "4px 11px",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              {"הודעה · 13:17"}
            </span>
            <div>
              <h3
                style={{
                  fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
                  fontSize: "clamp(24px,2.4vw,30px)",
                  lineHeight: "1.15",
                  margin: "0 0 8px",
                  color: "var(--ink-900)",
                }}
              >
                {"״מתי בדיוק התור שלי?״"}
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.55",
                  color: "var(--ink-800)",
                  margin: "0",
                }}
              >
                {"עוד תזכורת ידנית שגוזלת לך את היום."}
              </p>
            </div>
            <div style={{ position: "relative", minHeight: "170px" }}>
              <div
                className="tori-q"
                style={{
                  position: "absolute",
                  insetInlineStart: "34px",
                  insetInlineEnd: "34px",
                  bottom: "52px",
                  "--qr": "2deg",
                  transform: "rotate(2deg)",
                  background: "rgba(255,255,255,.55)",
                  borderRadius: "14px",
                  height: "46px",
                  animationDelay: "-.5s",
                }}
              ></div>
              <div
                className="tori-q"
                style={{
                  position: "absolute",
                  insetInlineStart: "18px",
                  insetInlineEnd: "18px",
                  bottom: "26px",
                  "--qr": "-1deg",
                  transform: "rotate(-1deg)",
                  background: "rgba(255,255,255,.8)",
                  borderRadius: "14px",
                  height: "46px",
                  animationDelay: "-.25s",
                }}
              ></div>
              <div
                className="tori-q"
                style={{
                  position: "absolute",
                  insetInlineStart: "0",
                  insetInlineEnd: "0",
                  bottom: "-8px",
                  background: "var(--white)",
                  borderRadius: "16px",
                  padding: "12px 14px",
                  boxShadow: "0 16px 34px rgba(60,90,0,.18)",
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                }}
              >
                <span
                  className="tori-ring"
                  style={{
                    flex: "0 0 auto",
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    background: "var(--ink-900)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--green-300)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      flex: "0 0 auto",
                      filter: "drop-shadow(0 0 5px rgba(12,255,190,.7))",
                    }}
                  >
                    <path d="M10.268 21a2 2 0 0 0 3.464 0"></path>
                    <path d="M22 8c0-2.3-.8-4.3-2-6"></path>
                    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>
                    <path d="M4 2C2.8 3.7 2 5.7 2 8"></path>
                  </svg>
                </span>
                <div
                  style={{
                    flex: "1",
                    minWidth: "0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--ink-900)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {"תזכורת — ידנית, שוב"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--ink-500)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {"הלקוחה השלישית היום ששואלת"}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--ink-400)",
                    whiteSpace: "nowrap",
                    flex: "0 0 auto",
                  }}
                >
                  {"עכשיו"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: "18px",
            background: "var(--ink-50)",
            borderRadius: "24px",
            padding: "28px 30px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "20px 40px",
          }}
          data-reveal="2"
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "12px",
              justifyContent: "space-between",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
                fontSize: "clamp(56px,6vw,80px)",
                lineHeight: "1",
                color: "var(--ink-900)",
              }}
            >
              <span data-count="20">{"20"}</span>
            </span>
            <span
              style={{
                fontSize: "16px",
                color: "var(--ink-600)",
                lineHeight: "1.3",
              }}
            >
              {"שעות בחודש"}
              <br />
              {"על תיאומים"}
            </span>
          </div>
          <div style={{ flex: "1 1 300px", minWidth: "0" }}>
            <div
              style={{
                fontSize: "25px",
                fontWeight: "600",
                color: "var(--ink-900)",
                marginBottom: "6px",
              }}
            >
              {`הזמן שלך שווה הרבה יותר מ־${monthlyPrice} ₪ לחודש.`}
            </div>
            <div
              style={{
                fontSize: "15px",
                lineHeight: "1.55",
                color: "var(--ink-600)",
              }}
            >
              {
                "שעה ביום על הודעות = 20 שעות בחודש. תורי מחזירה לך אותן ומשלמת על עצמה כבר בלקוח הראשון."
              }
            </div>
          </div>
          <a
            href="#lead-form"
            className="tori-cta"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: "11px",
              minHeight: "52px",
              padding: "0 12px 0 24px",
              borderRadius: "13px",
              background: "var(--ink-900)",
              color: "var(--white)",
              fontSize: "16px",
              fontWeight: "600",
              overflow: "hidden",
              isolation: "isolate",
            }}
          >
            <span style={{ position: "relative" }}>
              {"אני רוצה תורי עכשיו"}
            </span>
            <span
              className="tori-cta-arrow"
              style={{
                position: "relative",
                display: "inline-grid",
                placeItems: "center",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--gradient-brand)",
                color: "var(--ink-900)",
              }}
            >
              <svg
                width="15"
                height="15"
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
      </div>
    </section>
  );
}
