export default function CapabilitiesSection() {
  return (
    <section
      id="capabilities"
      style={{ background: "var(--white)", padding: "56px 24px 90px" }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            justifyItems: "center",
            textAlign: "center",
            gap: "14px",
            maxWidth: "660px",
            margin: "0 auto 54px",
          }}
          data-reveal="1"
        >
          <h2
            style={{
              fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
              fontSize: "clamp(30px,4vw,50px)",
              lineHeight: "1.08",
              color: "var(--ink-900)",
              margin: "0",
            }}
          >
            {"הפיצ׳רים "}
            <span className="tori-word">{"של תורי"}</span>
          </h2>
          <p
            style={{
              fontSize: "17px",
              lineHeight: "1.6",
              color: "var(--ink-600)",
              margin: "0",
            }}
          >
            {"יכולות שיחודיות לתורי בלבד, אין אפליקציה שעושה את זה כמונו!"}
          </p>
        </div>
        <div className="tori-feats">
          <article className="tori-feat" data-reveal="2">
            <div className="tori-feat-media">
              <video
                src="/assets/features/f1.mp4"
                muted={true}
                loop={true}
                playsInline={true}
                preload="none"
              ></video>
            </div>
            <div className="tori-feat-body">
              <span className="tori-feat-num">{"01"}</span>
              <h3 className="tori-feat-title">
                {"סוכן AI חכם"}
                <span>{"שמבצע עבורכם משימות"}</span>
              </h3>
              <p className="tori-feat-text">
                {
                  "הסוכן עונה ללקוחות, קובע תורים, מזיז ומאשר — בשפה שלכם ובשעות שאתם קובעים. אתם עובדים, הוא מנהל את היומן."
                }
              </p>
            </div>
          </article>
          <article className="tori-feat" data-reveal="2">
            <div className="tori-feat-media">
              <video
                src="/assets/features/f5.mp4"
                muted={true}
                loop={true}
                playsInline={true}
                preload="none"
              ></video>
            </div>
            <div className="tori-feat-body">
              <span className="tori-feat-num">{"02"}</span>
              <h3 className="tori-feat-title">
                {"תזכורות ללקוחות"}
                <span>{"לפני כל תור"}</span>
              </h3>
              <p className="tori-feat-text">
                {
                  "תזכורת יום לפני ושעתיים לפני, אוטומטית. פחות הברזות, פחות שיחות תיאום, יומן שמתמלא כמו שצריך."
                }
              </p>
            </div>
          </article>
          <article className="tori-feat" data-reveal="2">
            <div className="tori-feat-media">
              <video
                src="/assets/features/f4.mp4"
                muted={true}
                loop={true}
                playsInline={true}
                preload="none"
              ></video>
            </div>
            <div className="tori-feat-body">
              <span className="tori-feat-num">{"03"}</span>
              <h3 className="tori-feat-title">
                {"רשימת המתנה חכמה"}
                <span>{"שממלאת חורים לבד"}</span>
              </h3>
              <p className="tori-feat-text">
                {
                  "מתפנה תור? המערכת מציעה אותו מיד ללקוחות המתאימים ברשימה — הראשון שמאשר מקבל, והחור נסגר."
                }
              </p>
            </div>
          </article>
          <article className="tori-feat" data-reveal="2">
            <div className="tori-feat-media">
              <video
                src="/assets/features/f3.mp4"
                muted={true}
                loop={true}
                playsInline={true}
                preload="none"
              ></video>
            </div>
            <div className="tori-feat-body">
              <span className="tori-feat-num">{"04"}</span>
              <h3 className="tori-feat-title">
                {"וידג׳ט לדף הבית"}
                <span>{"התור הבא בלי לפתוח כלום"}</span>
              </h3>
              <p className="tori-feat-text">
                {
                  "וידג׳ט ייחודי שהלקוח מצמיד למסך הבית שלו — התור הקרוב תמיד מול העיניים, והעסק שלכם נשאר נוכח."
                }
              </p>
            </div>
          </article>
          <article className="tori-feat" data-reveal="2">
            <div className="tori-feat-media">
              <video
                src="/assets/features/f6.mp4"
                muted={true}
                loop={true}
                playsInline={true}
                preload="none"
              ></video>
            </div>
            <div className="tori-feat-body">
              <span className="tori-feat-num">{"05"}</span>
              <h3 className="tori-feat-title">
                {"תורים זריזים"}
                <span>{"‎10 התורים הקרובים"}</span>
              </h3>
              <p className="tori-feat-text">
                {
                  "הלקוח רואה את עשרת הזמנים הפנויים הקרובים ומזמין בלחיצה אחת. בלי חיפוש ביומן, בלי התלבטות."
                }
              </p>
            </div>
          </article>
          <article className="tori-feat" data-reveal="2">
            <div className="tori-feat-media">
              <video
                src="/assets/features/f2.mp4"
                muted={true}
                loop={true}
                playsInline={true}
                preload="none"
              ></video>
            </div>
            <div className="tori-feat-body">
              <span className="tori-feat-num">{"06"}</span>
              <h3 className="tori-feat-title">
                {"הצהרת בריאות דינאמית"}
                <span>{"נחתמת לפני הטיפול"}</span>
              </h3>
              <p className="tori-feat-text">
                {
                  "שאלון שמתאים את עצמו לסוג הטיפול ונחתם דיגיטלית מראש — הכל מתויק בכרטיס הלקוח, בלי נייר."
                }
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
