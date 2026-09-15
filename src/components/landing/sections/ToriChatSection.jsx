export default function ToriChatSection() {
  return (
    <div
      className="tori-chat"
      style={{
        position: "fixed",
        zIndex: "120",
        bottom: "24px",
        left: "24px",
        display: "grid",
        justifyItems: "left",
        gap: "14px",
        fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
      }}
    >
      <div
        className="tori-chat-panel"
        role="dialog"
        aria-label="צ׳אט עם תורי"
        style={{
          width: "min(92vw,376px)",
          height: "min(74vh,548px)",
          display: "grid",
          gridTemplateRows: "auto 1fr auto auto",
          background: "var(--white)",
          borderRadius: "26px",
          overflow: "hidden",
          boxShadow:
            "0 30px 70px rgba(23,22,22,.22),0 2px 0 rgba(255,255,255,.6) inset",
          border: "1px solid rgba(23,22,22,.07)",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 18px",
            background: "var(--ink-900)",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              position: "absolute",
              insetInlineStart: "-30px",
              top: "-70px",
              width: "190px",
              height: "190px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(12,255,190,.38),rgba(12,255,190,0) 70%)",
              pointerEvents: "none",
            }}
          ></span>
          <span
            style={{
              position: "absolute",
              insetInlineEnd: "-40px",
              bottom: "-90px",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(191,255,81,.3),rgba(191,255,81,0) 70%)",
              pointerEvents: "none",
            }}
          ></span>
          <span
            style={{
              position: "relative",
              flex: "0 0 auto",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#BFFF51,#0CFFBE)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <img
              src="/assets/brand/tori-mark.png"
              alt=""
              style={{ width: "26px", height: "26px" }}
            />
          </span>
          <span
            style={{
              position: "relative",
              display: "grid",
              gap: "2px",
              minWidth: "0",
            }}
          >
            <span
              style={{
                fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
                fontSize: "17px",
                color: "var(--white)",
                lineHeight: "1.1",
              }}
            >
              {"תורי"}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "rgba(255,255,255,.62)",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#0CFFBE",
                  boxShadow: "0 0 0 3px rgba(12,255,190,.22)",
                }}
              ></span>
              {"כאן, עונה תוך שנייה"}
            </span>
          </span>
          <button
            className="ths17"
            data-act="toggleChat"
            data-ev="click"
            aria-label="סגירה"
            style={{
              position: "relative",
              marginInlineStart: "auto",
              width: "32px",
              height: "32px",
              border: "0",
              borderRadius: "10px",
              background: "rgba(255,255,255,.1)",
              color: "var(--white)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <svg
              width="16"
              height="16"
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
        <div
          className="tori-chat-scroll"
          data-ref="chatScrollRef"
          style={{
            padding: "18px 16px",
            display: "grid",
            alignContent: "start",
            gap: "12px",
            background: "var(--ink-50)",
          }}
        ></div>
        <div
          data-ref="chatChips"
          style={{
            display: "flex",
            gap: "8px",
            padding: "12px 16px 4px",
            overflowX: "auto",
            background: "var(--ink-50)",
            scrollbarWidth: "none",
          }}
        ></div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px 16px",
            background: "var(--ink-50)",
          }}
        >
          <div
            style={{
              flex: "1 1 auto",
              minWidth: "0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--white)",
              border: "1px solid rgba(23,22,22,.1)",
              borderRadius: "14px",
              padding: "9px 14px",
            }}
          >
            <input
              className="tori-chat-input"
              data-act="onChatInput"
              data-ev="change"
              placeholder="כתבו לתורי..."
              aria-label="הודעה לתורי"
            />
          </div>
          <button
            className="tori-chat-send"
            data-act="sendChat"
            data-ev="click"
            aria-label="שליחה"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: "scaleX(-1)" }}
            >
              <path d="m22 2-7 20-4-9-9-4Z"></path>
              <path d="M22 2 11 13"></path>
            </svg>
          </button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
        <button
          className="tori-chat-fab"
          data-act="toggleChat"
          data-ev="click"
          aria-label="פתיחת צ׳אט עם תורי"
        >
          <img src="/assets/brand/tori-mark.png" alt="" />
          <span className="tori-chat-x">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#171616"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
