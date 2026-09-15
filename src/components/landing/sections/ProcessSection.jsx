export default function ProcessSection() {
  return (
    <section
      id="process"
      style={{ background: "var(--white)", padding: "90px 24px" }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            maxWidth: "640px",
            margin: "0 auto 46px",
          }}
          data-reveal="1"
        >
          <h2
            style={{
              fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
              fontSize: "clamp(30px,4vw,50px)",
              lineHeight: "1.1",
              color: "var(--ink-900)",
              margin: "0 0 12px",
            }}
          >
            {"אפליקציה מותאמת אישית"}
            <br />
            {"תוך "}
            <span className="tori-word">{"72 שעות!"}</span>
          </h2>
          <p
            style={{
              fontSize: "17px",
              lineHeight: "1.6",
              color: "var(--ink-600)",
              margin: "0",
            }}
          >
            {"אתם שולחים לנו פרטים, אנחנו מבצעים ישר."}
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "16px",
          }}
        >
          <a href="#lead-form" className="tori-step" data-reveal="1">
            <span className="tori-step-num">{"01"}</span>
            <svg
              className="tori-step-ico"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
              <path d="m21.854 2.147-10.94 10.939"></path>
            </svg>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "var(--ink-900)",
                margin: "14px 0 0",
              }}
            >
              {"שולחים פרטים"}
            </h3>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "var(--ink-600)",
                margin: "0",
                maxWidth: "30ch",
              }}
            >
              {"שם האפליקציה בחנות ושם העסק שממנו יישלחו התזכורות."}
            </p>
          </a>
          <a href="#lead-form" className="tori-step" data-reveal="2">
            <span className="tori-step-num">{"02"}</span>
            <svg
              className="tori-step-ico"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
            </svg>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "var(--ink-900)",
                margin: "14px 0 0",
              }}
            >
              {"בוחרים מיתוג"}
            </h3>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "var(--ink-600)",
                margin: "0",
                maxWidth: "30ch",
              }}
            >
              {"צבעי מותג ולוגו — ואנחנו מתאימים את הכל."}
            </p>
          </a>
          <a href="#lead-form" className="tori-step" data-reveal="3">
            <span className="tori-step-num">{"03"}</span>
            <svg
              className="tori-step-ico"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "var(--ink-900)",
                margin: "14px 0 0",
              }}
            >
              {"אנחנו בונים"}
            </h3>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "var(--ink-600)",
                margin: "0",
                maxWidth: "30ch",
              }}
            >
              {"מקימים את האפליקציה במיתוג מלא ומעלים לחנויות."}
            </p>
          </a>
          <a href="#lead-form" className="tori-step" data-reveal="1">
            <span className="tori-step-num">{"04"}</span>
            <svg
              className="tori-step-ico"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" x2="12" y1="15" y2="3"></line>
            </svg>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "var(--ink-900)",
                margin: "14px 0 0",
              }}
            >
              {"מורידים"}
            </h3>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "var(--ink-600)",
                margin: "0",
                maxWidth: "30ch",
              }}
            >
              {"האפליקציה אצלך בטלפון — מ־App Store ומ־Google Play."}
            </p>
          </a>
          <a href="#lead-form" className="tori-step" data-reveal="2">
            <span className="tori-step-num">{"05"}</span>
            <svg
              className="tori-step-ico"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <path d="M12 11h4"></path>
              <path d="M12 16h4"></path>
              <path d="M8 11h.01"></path>
              <path d="M8 16h.01"></path>
            </svg>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "var(--ink-900)",
                margin: "14px 0 0",
              }}
            >
              {"מוסיפים תוכן"}
            </h3>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "var(--ink-600)",
                margin: "0",
                maxWidth: "30ch",
              }}
            >
              {"שעות עבודה, שירותים ומחירון — הכל בניהול עצמי פשוט."}
            </p>
          </a>
          <a href="#lead-form" className="tori-step" data-reveal="3">
            <span className="tori-step-num">{"06"}</span>
            <svg
              className="tori-step-ico"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line>
              <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
            </svg>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "var(--ink-900)",
                margin: "14px 0 0",
              }}
            >
              {"משתפים לקוחות"}
            </h3>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "var(--ink-600)",
                margin: "0",
                maxWidth: "30ch",
              }}
            >
              {"שולחים קישור להורדה — והיומן מתחיל להתמלא לבד."}
            </p>
          </a>
        </div>
        <div style={{ textAlign: "center", marginTop: "36px" }} data-reveal="1">
          <a
            href="/onboarding"
            className="tori-cta"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: "11px",
              minHeight: "56px",
              padding: "0 13px 0 26px",
              borderRadius: "13px",
              background: "var(--ink-900)",
              color: "var(--white)",
              fontSize: "17px",
              fontWeight: "600",
              overflow: "hidden",
              isolation: "isolate",
            }}
          >
            <span style={{ position: "relative" }}>{"בואו נתחיל"}</span>
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
        </div>
      </div>
    </section>
  );
}
