export default function ToriNavSection() {
  return (
    <header
      className="tori-nav"
      style={{
        position: "fixed",
        top: "0",
        insetInline: "0",
        zIndex: "40",
        pointerEvents: "none",
      }}
    >
      <nav
        className="tori-nav-bar"
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: "26px",
          boxSizing: "border-box",
        }}
      >
        <a
          href="#top"
          className="tori-nav-logo"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0",
            flex: "0 0 auto",
          }}
        >
          <span className="tori-nav-mark">
            <video
              muted={true}
              loop={true}
              playsInline={true}
              autoPlay={true}
              preload="auto"
            >
              <source
                src="/assets/video/tori-mark-loop.webm"
                type="video/webm"
              />
            </video>
          </span>
          <img
            className="tori-nav-word"
            src="/assets/brand/tori-wordmark.png"
            alt="tori"
            style={{ height: "21px", width: "auto" }}
          />
        </a>
        <div
          className="tori-nav-links"
          style={{
            position: "relative",
            display: "flex",
            gap: "4px",
            flex: "1",
            justifyContent: "center",
            fontSize: "15px",
            color: "var(--ink-600)",
          }}
        >
          <a
            href="#pain"
            data-nav="pain"
            style={{ fontWeight: "500", borderRadius: "5px" }}
          >
            {"למה תורי"}
          </a>
          <a
            href="#brand"
            data-nav="brand"
            style={{ fontWeight: "500", borderRadius: "5px" }}
          >
            {"מיתוג"}
          </a>
          <a
            href="#process"
            data-nav="process"
            style={{ fontWeight: "500", borderRadius: "5px" }}
          >
            {"איך זה עובד"}
          </a>
          <a
            href="#capabilities"
            data-nav="capabilities"
            style={{ fontWeight: "500", borderRadius: "5px" }}
          >
            {"פיצ׳רים"}
          </a>
          <a
            href="#compare"
            data-nav="compare"
            style={{ fontWeight: "500", borderRadius: "5px" }}
          >
            {"השוואה"}
          </a>
          <a
            href="#pricing"
            data-nav="pricing"
            style={{ fontWeight: "500", borderRadius: "5px" }}
          >
            {"מחיר"}
          </a>
          <a
            href="#faq"
            data-nav="faq"
            style={{ fontWeight: "500", borderRadius: "5px" }}
          >
            {"שאלות"}
          </a>
        </div>
        <a
          href="/onboarding"
          className="tori-nav-cta"
          style={{
            whiteSpace: "nowrap",
            flex: "0 0 auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "9px",
            minHeight: "44px",
            padding: "0 18px 0 12px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--ink-900)",
            position: "relative",
            overflow: "hidden",
            isolation: "isolate",
          }}
        >
          <span style={{ position: "relative", fontSize: "15px" }}>
            {"התחילו עכשיו"}
          </span>
          <span
            className="tori-nav-cta-arrow"
            style={{
              position: "relative",
              display: "inline-grid",
              placeItems: "center",
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "var(--ink-900)",
              color: "var(--green-300)",
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
      </nav>
    </header>
  );
}
