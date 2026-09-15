export default function FaqSection() {
  return (
    <section
      id="faq"
      style={{
        background: "var(--surface-page)",
        padding: "86px 24px",
        borderTop: "1px solid var(--line-subtle)",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "44px",
        }}
      >
        <div style={{ flex: "0 1 320px" }} data-reveal="1">
          <h2
            style={{
              fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
              fontSize: "clamp(30px,4vw,50px)",
              lineHeight: "1.1",
              color: "var(--ink-900)",
              margin: "0 0 18px",
            }}
          >
            {"שאלות שעולות "}
            <span className="tori-word">{"לכולם."}</span>
          </h2>
          <a
            className="ths3"
            href="https://wa.me/972535575303?text=%D7%A9%D7%9C%D7%95%D7%9D%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A4%D7%A8%D7%98%D7%99%D7%9D%20%D7%A2%D7%9C%20Tori"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
              fontSize: "16px",
              fontWeight: "500",
              color: "var(--green-700)",
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
              style={{}}
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
            </svg>
            {"יש שאלה אחרת? דברו איתנו בוואטסאפ"}
          </a>
        </div>
        <div
          style={{
            flex: "1 1 420px",
            minWidth: "0",
            display: "grid",
            gap: "10px",
          }}
          data-reveal="2"
        >
          <details
            className="ths4"
            style={{
              background: "var(--white)",
              borderRadius: "16px",
              padding: "18px 20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                fontSize: "17px",
                fontWeight: "500",
                color: "var(--ink-900)",
              }}
            >
              {"מה אם לא יהיה לי זמן להקים?"}
              <svg
                className="tori-plus"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--ink-900)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  flex: "0 0 auto",
                  transition: "transform .2s cubic-bezier(.22,.61,.36,1)",
                }}
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </summary>
            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.65",
                color: "var(--ink-600)",
                margin: "12px 0 0",
              }}
            >
              {
                "אנחנו עושים הכל בשבילך — מהעיצוב ועד ההעלאה לחנויות. את/ה רק שולח/ת פרטים ולוגו."
              }
            </p>
          </details>
          <details
            className="ths5"
            style={{
              background: "var(--white)",
              borderRadius: "16px",
              padding: "18px 20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                fontSize: "17px",
                fontWeight: "500",
                color: "var(--ink-900)",
              }}
            >
              {"מה אם אני לא מרוצה?"}
              <svg
                className="tori-plus"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--ink-900)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  flex: "0 0 auto",
                  transition: "transform .2s cubic-bezier(.22,.61,.36,1)",
                }}
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </summary>
            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.65",
                color: "var(--ink-600)",
                margin: "12px 0 0",
              }}
            >
              {"בלי התחייבות. אפשר להתנתק בכל רגע, בלי קנסות ובלי שאלות."}
            </p>
          </details>
          <details
            className="ths6"
            style={{
              background: "var(--white)",
              borderRadius: "16px",
              padding: "18px 20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                fontSize: "17px",
                fontWeight: "500",
                color: "var(--ink-900)",
              }}
            >
              {"האם הלקוחות שלי באמת יורידו?"}
              <svg
                className="tori-plus"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--ink-900)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  flex: "0 0 auto",
                  transition: "transform .2s cubic-bezier(.22,.61,.36,1)",
                }}
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </summary>
            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.65",
                color: "var(--ink-600)",
                margin: "12px 0 0",
              }}
            >
              {
                "כן — אפליקציה ממותגת מייצרת יותר נאמנות ושימוש חוזר מאשר וואטסאפ. הלקוחות רואים את המותג שלך כל פעם שהם פותחים את הטלפון."
              }
            </p>
          </details>
          <details
            className="ths7"
            style={{
              background: "var(--white)",
              borderRadius: "16px",
              padding: "18px 20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                fontSize: "17px",
                fontWeight: "500",
                color: "var(--ink-900)",
              }}
            >
              {"האם זה מתאים גם לעסק קטן?"}
              <svg
                className="tori-plus"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--ink-900)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  flex: "0 0 auto",
                  transition: "transform .2s cubic-bezier(.22,.61,.36,1)",
                }}
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </summary>
            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.65",
                color: "var(--ink-600)",
                margin: "12px 0 0",
              }}
            >
              {
                "בהחלט. תורי מתאימה לכל סוגי העסקים — מספרות, קוסמטיקה, קליניקות, סטודיו ועוד."
              }
            </p>
          </details>
          <details
            className="ths8"
            style={{
              background: "var(--white)",
              borderRadius: "16px",
              padding: "18px 20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                fontSize: "17px",
                fontWeight: "500",
                color: "var(--ink-900)",
              }}
            >
              {"האם יש שירות לקוחות?"}
              <svg
                className="tori-plus"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--ink-900)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  flex: "0 0 auto",
                  transition: "transform .2s cubic-bezier(.22,.61,.36,1)",
                }}
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </summary>
            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.65",
                color: "var(--ink-600)",
                margin: "12px 0 0",
              }}
            >
              {"כן — מענה אנושי בוואטסאפ ובטלפון, בימים א׳–ה׳ בין 9:00–17:00."}
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
