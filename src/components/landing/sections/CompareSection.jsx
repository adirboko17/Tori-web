export default function CompareSection() {
  return (
    <section
      id="compare"
      style={{
        background: "var(--white)",
        padding: "88px 24px",
        borderTop: "1px solid var(--line-subtle)",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            maxWidth: "640px",
            margin: "0 auto 44px",
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
            {"תורי מול "}
            <span className="tori-word">{"מערכות אחרות"}</span>
          </h2>
          <p
            style={{
              fontSize: "17px",
              lineHeight: "1.6",
              color: "var(--ink-600)",
              margin: "0",
            }}
          >
            {
              "כל המערכות מנהלות יומן. רק אצלנו העסק מקבל אפליקציה ממותגת משלו בחנויות, וידג׳ט במסך הבית, סוכן AI ו-1,000 הודעות כל חודש — במחיר אחד קבוע."
            }
          </p>
        </div>
        <div className="tori-vs" data-reveal="2">
          <div className="tori-vs-col" data-me="true">
            <div className="tori-vs-head">
              <img
                src="/assets/brand/tori-wordmark.png"
                alt="tori"
                style={{ height: "19px", width: "auto", filter: "invert(1)" }}
              />
              <span className="tori-vs-badge">{"הבחירה שלנו"}</span>
            </div>
            <div className="tori-vs-list">
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="y">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5L20 7"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">
                    {"אפליקציה ממותגת שלכם ב-App Store ובגוגל פליי"}
                  </span>
                  <span className="tori-vs-note">
                    {"הלקוחות מורידים אפליקציה בשם שלכם"}
                  </span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="y">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5L20 7"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">
                    {"מיתוג אישי מלא — לוגו, צבעים ותמונות"}
                  </span>
                  <span className="tori-vs-note">
                    {"הכל שלכם, גם אחרי ההשקה"}
                  </span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="y">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5L20 7"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">
                    {"וידג׳ט במסך הבית של הלקוח"}
                  </span>
                  <span className="tori-vs-note">
                    {"התור הבא נראה בלי לפתוח כלום"}
                  </span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="y">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5L20 7"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">
                    {"סוכן AI שמבצע פעולות עבורכם"}
                  </span>
                  <span className="tori-vs-note">
                    {"עונה, קובע ומנהל את היומן"}
                  </span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="y">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5L20 7"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">{"ניהול סניפים"}</span>
                  <span className="tori-vs-note">
                    {"כמה סניפים ועובדים תחת מערכת אחת"}
                  </span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="y">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5L20 7"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">
                    {"תורים זריזים — 10 התורים הקרובים"}
                  </span>
                  <span className="tori-vs-note">
                    {"לחיצה אחת ומזמינים את הזמן הפנוי הבא"}
                  </span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="y">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5L20 7"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">{"רשימת המתנה חכמה"}</span>
                  <span className="tori-vs-note">
                    {"מתפנה תור? המערכת ממלאת אותו לבד"}
                  </span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="y">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5L20 7"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">
                    {"‎1,000 הודעות SMS בכל חודש"}
                  </span>
                  <span className="tori-vs-note">
                    {"מתאפס ל-1,000 כל חודש"}
                  </span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="y">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5L20 7"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">{"בלי דמי הקמה"}</span>
                  <span className="tori-vs-note">{"‎0 ₪ הקמה"}</span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="y">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5L20 7"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">{"הקמה תוך 72 שעות"}</span>
                  <span className="tori-vs-note">{"אנחנו מקימים, לא אתם"}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="tori-vs-col">
            <div className="tori-vs-head">
              <span className="tori-vs-name">{"המתחרים"}</span>
              <span className="tori-vs-sub">
                {"מערכות תורים מבוססות קישור או עמוד עסקי"}
              </span>
            </div>
            <div className="tori-vs-list">
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="n">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">
                    {"אפליקציה ממותגת שלכם ב-App Store ובגוגל פליי"}
                  </span>
                  <span className="tori-vs-note">
                    {"הזמנה דרך קישור או עמוד עסקי"}
                  </span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="p">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  >
                    <path d="M6 12h12"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">
                    {"מיתוג אישי מלא — לוגו, צבעים ותמונות"}
                  </span>
                  <span className="tori-vs-note">
                    {"מיתוג חלקי בתוך המערכת"}
                  </span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="n">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">
                    {"וידג׳ט במסך הבית של הלקוח"}
                  </span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="n">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">
                    {"סוכן AI שמבצע פעולות עבורכם"}
                  </span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="d">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  >
                    <path d="M6 12h12"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">{"ניהול סניפים"}</span>
                  <span className="tori-vs-note">{"לפי המסלול"}</span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="n">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">
                    {"תורים זריזים — 10 התורים הקרובים"}
                  </span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="d">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  >
                    <path d="M6 12h12"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">{"רשימת המתנה חכמה"}</span>
                  <span className="tori-vs-note">{"לפי המסלול"}</span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="d">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  >
                    <path d="M6 12h12"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">
                    {"‎1,000 הודעות SMS בכל חודש"}
                  </span>
                  <span className="tori-vs-note">{"לפי המסלול"}</span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="d">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  >
                    <path d="M6 12h12"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">{"בלי דמי הקמה"}</span>
                  <span className="tori-vs-note">{"לפי המסלול"}</span>
                </span>
              </div>
              <div className="tori-vs-item">
                <span className="tori-vs-ico" data-k="d">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  >
                    <path d="M6 12h12"></path>
                  </svg>
                </span>
                <span className="tori-vs-text">
                  <span className="tori-vs-feat">{"הקמה תוך 72 שעות"}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "28px",
          }}
          data-reveal="1"
        >
          <a href="/onboarding" className="tori-vs-cta">
            {"מתחילים עכשיו"}
            <span className="tori-vs-cta-ico">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7M19 12H5"></path>
              </svg>
            </span>
          </a>
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: "12.5px",
            lineHeight: "1.6",
            color: "var(--ink-400)",
            margin: "18px auto 0",
            maxWidth: "62ch",
          }}
        >
          {
            "ההשוואה מתייחסת לאופן העבודה הנפוץ של מערכות תורים בשוק — עמוד עסקי או קישור להזמנת תור, לעומת אפליקציה ממותגת משלכם. פרטים מדויקים משתנים בין הספקים ולפי המסלול שנבחר."
          }
        </p>
      </div>
    </section>
  );
}
