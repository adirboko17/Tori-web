export default function TopSection() {
  return (
    <section
      id="top"
      className="tori-hero"
      style={{
        position: "relative",
        background: "var(--white)",
        padding: "112px 24px 130px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "1180px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "44px 40px",
        }}
      >
        <div style={{ flex: "1 1 380px", minWidth: "0" }}>
          <h1
            style={{
              fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
              fontSize: "clamp(34px,4.4vw,64px)",
              lineHeight: "1.04",
              letterSpacing: "-.01em",
              color: "var(--ink-900)",
              margin: "0",
            }}
          >
            <span className="tori-line">
              <span style={{ "--i": "0" }}>
                {"היי, אני "}
                <span className="tori-hero-mark">
                  <img
                    src="/assets/brand/tori-mark-inline.png"
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                  />
                </span>
                {" "}
                <span className="tori-word">{"תורי."}</span>
              </span>
            </span>
            <span className="tori-line">
              <span style={{ "--i": "1" }}>{"אפליקציה חכמה וחברותית"}</span>
            </span>
            <span className="tori-line">
              <span style={{ "--i": "2" }}>{"לניהול תורים"}</span>
            </span>
          </h1>
          <p
            style={{
              fontSize: "clamp(16px,1.6vw,19px)",
              lineHeight: "1.6",
              color: "var(--ink-600)",
              maxWidth: "42ch",
              margin: "24px 0 26px",
            }}
          >
            {
              "אפליקציה ממותגת אישית לעסק שלך  ב־App Store וב־Google Play תוך 72 שעות. "
            }
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <a
              href="/onboarding"
              className="tori-cta tori-magnet"
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                minHeight: "58px",
                padding: "0 14px 0 26px",
                borderRadius: "13px",
                background: "var(--ink-900)",
                color: "var(--white)",
                fontSize: "17px",
                fontWeight: "600",
                overflow: "hidden",
                isolation: "isolate",
              }}
            >
              <span style={{ position: "relative" }}>
                {"אני רוצה אפליקציה משלי"}
              </span>
              <span
                className="tori-cta-arrow"
                style={{
                  position: "relative",
                  display: "inline-grid",
                  placeItems: "center",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "var(--gradient-brand)",
                  color: "var(--ink-900)",
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
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
              </span>
            </a>
            <a
              href="#process"
              className="tori-ghost"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                minHeight: "58px",
                padding: "0 20px 0 16px",
                borderRadius: "13px",
                color: "var(--ink-900)",
                fontSize: "16px",
                fontWeight: "500",
                border: "1px solid var(--ink-200)",
                background: "var(--white)",
                flexDirection: "row-reverse",
              }}
            >
              <span
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "var(--lime-400)",
                  color: "var(--ink-900)",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flex: "0 0 auto" }}
                >
                  <polygon points="6 3 20 12 6 21 6 3"></polygon>
                </svg>
              </span>
              {"\nאיך זה עובד\n"}
            </a>
          </div>
        </div>
        <div
          className="tori-stage"
          style={{
            flex: "1 1 360px",
            minWidth: "0",
            display: "grid",
            justifyItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "min(100%,470px)",
              padding: "76px 0 70px",
            }}
          >
            <span
              style={{
                position: "absolute",
                insetInlineStart: "6%",
                top: "0",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "var(--lime-500)",
                opacity: ".8",
                pointerEvents: "none",
              }}
            ></span>
            <span
              style={{
                position: "absolute",
                insetInlineEnd: "34%",
                bottom: "2px",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "var(--green-400)",
                pointerEvents: "none",
              }}
            ></span>
            <span
              style={{
                position: "absolute",
                inset: "12% 14%",
                borderRadius: "50%",
                background:
                  "radial-gradient(closest-side,rgba(12,255,190,.55),rgba(191,255,81,.34) 60%,rgba(191,255,81,0) 100%)",
                filter: "blur(48px)",
                zIndex: "1",
                pointerEvents: "none",
              }}
            ></span>
            <div
              className="tori-hero-phone"
              style={{
                position: "relative",
                zIndex: "3",
                width: "268px",
                margin: "0 auto",
                transform: "scale(1.2) rotate(-4deg)",
                transformOrigin: "50% 50%",
              }}
            >
              <div
                className="tori-device"
                style={{
                  position: "relative",
                  width: "268px",
                  background: "var(--ink-900)",
                  borderRadius: "42px",
                  padding: "9px",
                  boxShadow:
                    "0 36px 80px rgba(23,22,22,.28),0 0 0 1px rgba(255,255,255,.08) inset",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "19px",
                    insetInline: "0",
                    display: "grid",
                    justifyItems: "center",
                    zIndex: "5",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      width: "76px",
                      height: "21px",
                      borderRadius: "12px",
                      background: "#0c0c0c",
                    }}
                  ></span>
                </span>
                <div
                  style={{
                    position: "relative",
                    background: "var(--white)",
                    borderRadius: "34px",
                    overflow: "hidden",
                    height: "500px",
                    textAlign: "start",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      height: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "26px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 20px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "var(--ink-900)",
                      }}
                    >
                      <span dir="ltr">{"9:41"}</span>
                      <span
                        style={{
                          display: "flex",
                          gap: "3px",
                          alignItems: "flex-end",
                        }}
                      >
                        <span
                          style={{
                            width: "2.5px",
                            height: "4px",
                            borderRadius: "1px",
                            background: "var(--ink-900)",
                          }}
                        ></span>
                        <span
                          style={{
                            width: "2.5px",
                            height: "6px",
                            borderRadius: "1px",
                            background: "var(--ink-900)",
                          }}
                        ></span>
                        <span
                          style={{
                            width: "2.5px",
                            height: "8px",
                            borderRadius: "1px",
                            background: "var(--ink-900)",
                          }}
                        ></span>
                        <span
                          style={{
                            width: "16px",
                            height: "9px",
                            border: "1.2px solid var(--ink-900)",
                            borderRadius: "2px",
                            marginInlineStart: "3px",
                          }}
                        ></span>
                      </span>
                    </div>
                    <div
                      style={{
                        background: "var(--gradient-brand)",
                        margin: "4px 10px 0",
                        borderRadius: "20px",
                        padding: "14px 14px 16px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <span className="tori-shine"></span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "12px",
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "11px",
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
                            style={{ flex: "0 0 auto" }}
                          >
                            <circle cx="6" cy="6" r="3"></circle>
                            <path d="M8.12 8.12 12 12"></path>
                            <path d="M20 4 8.12 15.88"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <path d="M14.8 14.8 20 20"></path>
                          </svg>
                        </span>
                        <span
                          style={{
                            position: "relative",
                            width: "30px",
                            height: "30px",
                            borderRadius: "9px",
                            background: "rgba(255,255,255,.62)",
                            display: "grid",
                            placeItems: "center",
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
                            <path d="M10.268 21a2 2 0 0 0 3.464 0"></path>
                            <path d="M22 8c0-2.3-.8-4.3-2-6"></path>
                            <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>
                            <path d="M4 2C2.8 3.7 2 5.7 2 8"></path>
                          </svg>
                          <span className="tori-badge"></span>
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "var(--ink-900)",
                          position: "relative",
                        }}
                      >
                        {"אפרת ניילס סטודיו"}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--green-900)",
                          opacity: ".85",
                          position: "relative",
                        }}
                      >
                        {"היי דנה, מה קובעים?"}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "12px 10px 0",
                        display: "grid",
                        gap: "9px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "var(--ink-500)",
                          padding: "0 3px",
                        }}
                      >
                        {"יום חמישי · שעות פנויות"}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4,1fr)",
                          gap: "6px",
                        }}
                      >
                        <div
                          className="tori-slot"
                          style={{ animationDelay: "0s" }}
                        >
                          <span dir="ltr">{"10:00"}</span>
                        </div>
                        <div
                          className="tori-slot"
                          style={{ animationDelay: "4s" }}
                        >
                          <span dir="ltr">{"11:30"}</span>
                        </div>
                        <div
                          className="tori-slot"
                          style={{ animationDelay: "8s" }}
                        >
                          <span dir="ltr">{"12:15"}</span>
                        </div>
                        <div className="tori-slot tori-slot--off">
                          <span dir="ltr">{"13:00"}</span>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "var(--ink-500)",
                          padding: "3px 3px 0",
                        }}
                      >
                        {"שירותים"}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "7px",
                        }}
                      >
                        <div
                          style={{
                            background: "var(--ink-900)",
                            color: "var(--white)",
                            borderRadius: "14px",
                            padding: "11px",
                            display: "grid",
                            gap: "5px",
                          }}
                        >
                          <span style={{ color: "var(--green-300)" }}>
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
                              <circle cx="6" cy="6" r="3"></circle>
                              <path d="M8.12 8.12 12 12"></path>
                              <path d="M20 4 8.12 15.88"></path>
                              <circle cx="6" cy="18" r="3"></circle>
                              <path d="M14.8 14.8 20 20"></path>
                            </svg>
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: "600" }}>
                            {"לק ג'ל"}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              color: "rgba(255,255,255,.6)",
                            }}
                          >
                            {"30 דק׳ · ‎90 ₪"}
                          </span>
                        </div>
                        <div
                          style={{
                            background: "var(--ink-50)",
                            borderRadius: "14px",
                            padding: "11px",
                            display: "grid",
                            gap: "5px",
                            color: "var(--ink-900)",
                          }}
                        >
                          <span style={{ color: "var(--green-700)" }}>
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
                              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                              <path d="M20 3v4"></path>
                              <path d="M22 5h-4"></path>
                              <path d="M4 17v2"></path>
                              <path d="M5 18H3"></path>
                            </svg>
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: "600" }}>
                            {"עיצוב זקן"}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              color: "var(--ink-500)",
                            }}
                          >
                            {"15 דק׳ · ‎40 ₪"}
                          </span>
                        </div>
                      </div>
                      <div className="tori-confirm">
                        {"אישור התור "}
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
                      </div>
                    </div>
                    <div className="tori-push-stack">
                      <div
                        className="tori-push"
                        style={{ animationDelay: "0s" }}
                      >
                        <span
                          className="tori-push-tile"
                          style={{
                            background: "var(--gradient-brand)",
                            color: "var(--ink-900)",
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
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <rect
                              width="18"
                              height="18"
                              x="3"
                              y="4"
                              rx="2"
                            ></rect>
                            <path d="M3 10h18"></path>
                            <path d="m9 16 2 2 4-4"></path>
                          </svg>
                        </span>
                        <span
                          style={{ display: "grid", gap: "2px", minWidth: "0" }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "var(--ink-900)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {"נקבע לך תור ל-17:00"}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              color: "var(--ink-500)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {"דנה לוי · תספורת + זקן"}
                          </span>
                        </span>
                      </div>
                      <div
                        className="tori-push"
                        style={{ animationDelay: "4s" }}
                      >
                        <span
                          className="tori-push-tile"
                          style={{
                            background: "var(--ink-900)",
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
                            style={{ flex: "0 0 auto" }}
                          >
                            <path d="M5 22h14"></path>
                            <path d="M5 2h14"></path>
                            <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                            <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
                          </svg>
                        </span>
                        <span
                          style={{ display: "grid", gap: "2px", minWidth: "0" }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "var(--ink-900)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {"התפנה תור למחר"}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              color: "var(--ink-500)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {"11:30 · מרשימת ההמתנה"}
                          </span>
                        </span>
                      </div>
                      <div
                        className="tori-push"
                        style={{ animationDelay: "8s" }}
                      >
                        <span
                          className="tori-push-tile"
                          style={{
                            background: "var(--lime-400)",
                            color: "var(--ink-900)",
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
                            <rect
                              width="20"
                              height="12"
                              x="2"
                              y="6"
                              rx="2"
                            ></rect>
                            <circle cx="12" cy="12" r="2"></circle>
                            <path d="M6 12h.01M18 12h.01"></path>
                          </svg>
                        </span>
                        <span
                          style={{ display: "grid", gap: "2px", minWidth: "0" }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "var(--ink-900)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {"‎180 ₪ נכנסו לקופה"}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              color: "var(--ink-500)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {"שולם באפליקציה"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
