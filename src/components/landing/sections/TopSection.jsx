import HomeScreen from "../app-screens/HomeScreen";

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
                <HomeScreen />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
