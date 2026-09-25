export default function ToriA11ySection() {
  return (
    <div
      className="tori-a11y "
      style={{
        position: "fixed",
        zIndex: "130",
        bottom: "24px",
        right: "24px",
        display: "grid",
        justifyItems: "right",
        gap: "14px",
        fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
      }}
    >
      <div
        className="tori-a11y-panel"
        role="dialog"
        aria-label="תפריט נגישות"
        style={{
          width: "min(92vw,332px)",
          maxHeight: "min(78vh,560px)",
          overflowY: "auto",
          background: "#fff",
          borderRadius: "22px",
          border: "1px solid rgba(23,22,22,.08)",
          boxShadow: "0 30px 70px rgba(23,22,22,.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            padding: "15px 17px",
            background: "#1557D0",
            color: "#fff",
          }}
        >
          <span
            style={{
              flex: "0 0 auto",
              display: "grid",
              placeItems: "center",
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "rgba(255,255,255,.16)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="4.2" r="2.1"></circle>
              <path d="M20 7.5c0 .8-.6 1.4-1.4 1.4l-3.7.4v3.1l1.9 7.4a1.4 1.4 0 0 1-2.7.7L12 15.4l-2.1 5.1a1.4 1.4 0 0 1-2.7-.7l1.9-7.4V9.3l-3.7-.4A1.4 1.4 0 0 1 5.6 6.1l4.3.8h4.2l4.3-.8c.8 0 1.6.6 1.6 1.4Z"></path>
            </svg>
          </span>
          <span style={{ display: "grid", gap: "1px" }}>
            <span
              style={{
                fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
                fontSize: "16px",
                lineHeight: "1.15",
              }}
            >
              {"תפריט נגישות"}
            </span>
            <span
              style={{ fontSize: "11.5px", color: "rgba(255,255,255,.72)" }}
            >
              {"התאמות תצוגה באתר"}
            </span>
          </span>
          <button
            className="ths15"
            data-act="toggleA11y"
            data-ev="click"
            aria-label="סגירת תפריט הנגישות"
            style={{
              marginInlineStart: "auto",
              width: "30px",
              height: "30px",
              border: "0",
              borderRadius: "9px",
              background: "rgba(255,255,255,.16)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div style={{ padding: "16px", display: "grid", gap: "14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              padding: "10px 12px",
              border: "1px solid rgba(23,22,22,.1)",
              borderRadius: "14px",
            }}
          >
            <span style={{ display: "grid", gap: "1px" }}>
              <span
                style={{
                  fontSize: "13.5px",
                  fontWeight: "600",
                  color: "var(--ink-900)",
                }}
              >
                {"גודל טקסט"}
              </span>
              <span
                data-ref="a11yScaleLabel"
                style={{ fontSize: "11.5px", color: "var(--ink-500)" }}
              >
                {"100%"}
              </span>
            </span>
            <span style={{ display: "flex", gap: "7px" }}>
              <button
                className="tori-a11y-step"
                data-act="a11yTextDown"
                data-ev="click"
                aria-label="הקטנת טקסט"
              >
                {"−"}
              </button>
              <button
                className="tori-a11y-step"
                data-act="a11yTextUp"
                data-ev="click"
                aria-label="הגדלת טקסט"
              >
                {"+"}
              </button>
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "9px",
            }}
          >
            <button
              className="tori-a11y-tile"
              data-act="a11yToggleContrast"
              data-ev="click"
              aria-pressed="false"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 3v18a9 9 0 0 0 0-18Z" fill="currentColor"></path>
              </svg>
              {"ניגודיות גבוהה"}
            </button>
            <button
              className="tori-a11y-tile"
              data-act="a11yToggleInvert"
              data-ev="click"
              aria-pressed="false"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                aria-hidden="true"
              >
                <path d="M12 3v18"></path>
                <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor"></path>
                <circle cx="12" cy="12" r="9"></circle>
              </svg>
              {"היפוך צבעים"}
            </button>
            <button
              className="tori-a11y-tile"
              data-act="a11yToggleGray"
              data-ev="click"
              aria-pressed="false"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                aria-hidden="true"
              >
                <circle cx="9" cy="9" r="6"></circle>
                <circle cx="15" cy="15" r="6"></circle>
              </svg>
              {"גווני אפור"}
            </button>
            <button
              className="tori-a11y-tile"
              data-act="a11yToggleLinks"
              data-ev="click"
              aria-pressed="false"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"></path>
                <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"></path>
              </svg>
              {"הדגשת קישורים"}
            </button>
            <button
              className="tori-a11y-tile"
              data-act="a11yToggleReadable"
              data-ev="click"
              aria-pressed="false"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 20V6a2 2 0 0 1 2-2h12"></path>
                <path d="M8 8h8M8 12h8M8 16h5"></path>
              </svg>
              {"גופן קריא"}
            </button>
            <button
              className="tori-a11y-tile"
              data-act="a11yToggleSpace"
              data-ev="click"
              aria-pressed="false"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
                <path d="m8 9-2-3-2 3"></path>
              </svg>
              {"ריווח שורות"}
            </button>
            <button
              className="tori-a11y-tile"
              data-act="a11yToggleStop"
              data-ev="click"
              aria-pressed="false"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <rect x="5" y="5" width="14" height="14" rx="3"></rect>
              </svg>
              {"עצירת אנימציות"}
            </button>
            <button
              className="tori-a11y-tile"
              data-act="a11yToggleFocus"
              data-ev="click"
              aria-pressed="false"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"></path>
                <circle cx="12" cy="12" r="2.6"></circle>
              </svg>
              {"סימון פוקוס"}
            </button>
            <button
              className="tori-a11y-tile"
              data-act="a11yReset"
              data-ev="click"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path>
                <path d="M3 4v4h4"></path>
              </svg>
              {"איפוס הגדרות"}
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gap: "7px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(23,22,22,.1)",
            }}
          >
            <a
              className="ths16"
            href="/accessibility"
              style={{ fontSize: "13px", fontWeight: "600", color: "#1557D0" }}
            >
              {"הצהרת הנגישות של האתר"}
            </a>
            <span
              style={{
                fontSize: "12px",
                lineHeight: "1.6",
                color: "var(--ink-500)",
              }}
            >
              {
                "נתקלתם בבעיית נגישות? רכז הנגישות שלנו זמין בטלפון ‎053-557-5303 ובמייל support@wetori.co.il, ונשיב לכל המאוחר בתוך 5 ימי עסקים."
              }
            </span>
          </div>
        </div>
      </div>
      <button
        className="tori-a11y-fab"
        data-act="toggleA11y"
        data-ev="click"
        aria-label="פתיחת תפריט נגישות"
        aria-haspopup="dialog"
        aria-expanded="false"
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="12" cy="4.2" r="2.1"></circle>
          <path d="M20 7.5c0 .8-.6 1.4-1.4 1.4l-3.7.4v3.1l1.9 7.4a1.4 1.4 0 0 1-2.7.7L12 15.4l-2.1 5.1a1.4 1.4 0 0 1-2.7-.7l1.9-7.4V9.3l-3.7-.4A1.4 1.4 0 0 1 5.6 6.1l4.3.8h4.2l4.3-.8c.8 0 1.6.6 1.6 1.4Z"></path>
        </svg>
      </button>
    </div>
  );
}
