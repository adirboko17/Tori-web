const NAV_ITEMS = [
  { id: "pain", label: "למה תורי", hint: "הכאב שאנחנו פותרים" },
  { id: "brand", label: "מיתוג", hint: "האפליקציה בצבעים שלכם" },
  { id: "process", label: "איך זה עובד", hint: "שלושה צעדים, 72 שעות" },
  { id: "capabilities", label: "פיצ׳רים", hint: "מה תורי יודעת לעשות" },
  { id: "compare", label: "השוואה", hint: "תורי מול הדרך הישנה" },
  { id: "pricing", label: "מחיר", hint: "מחיר אחד, הכל כלול" },
  { id: "faq", label: "שאלות", hint: "כל מה ששאלתם" },
];

function ArrowIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
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
  );
}

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
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={"#" + item.id}
              data-nav={item.id}
              style={{ fontWeight: "500", borderRadius: "5px" }}
            >
              {item.label}
            </a>
          ))}
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
            <ArrowIcon />
          </span>
        </a>
        <button
          type="button"
          className="tori-burger"
          data-act="toggleMenu"
          aria-label="פתיחת תפריט"
          aria-expanded="false"
          aria-controls="tori-mobile-menu"
        >
          <span className="tori-burger-box" aria-hidden="true">
            <span></span>
            <span></span>
          </span>
        </button>
      </nav>

      <div
        className="tori-menu"
        id="tori-mobile-menu"
        data-ref="menuRef"
        hidden
      >
        <span className="tori-menu-glow" aria-hidden="true"></span>
        <nav className="tori-menu-list" aria-label="תפריט ראשי">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.id}
              href={"#" + item.id}
              data-menu-link={item.id}
              data-act="closeMenu"
              style={{ "--i": i }}
            >
              <span className="tori-menu-num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="tori-menu-text">
                <span className="tori-menu-label">{item.label}</span>
                <span className="tori-menu-hint">{item.hint}</span>
              </span>
              <span className="tori-menu-chev" aria-hidden="true">
                <ArrowIcon size={17} />
              </span>
            </a>
          ))}
        </nav>
        <div className="tori-menu-foot" style={{ "--i": NAV_ITEMS.length }}>
          <a href="/onboarding" className="tori-menu-cta" data-act="closeMenu">
            <span>{"אני רוצה אפליקציה משלי"}</span>
            <span className="tori-menu-cta-ico" aria-hidden="true">
              <ArrowIcon size={17} />
            </span>
          </a>
          <a
            href="https://wa.me/972500000000"
            className="tori-menu-wa"
            data-act="closeMenu"
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
              aria-hidden="true"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            {"דברו איתנו בוואטסאפ"}
          </a>
        </div>
      </div>
    </header>
  );
}
