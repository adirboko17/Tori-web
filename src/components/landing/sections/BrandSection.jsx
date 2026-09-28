import HomeScreen from "../app-screens/HomeScreen";
import ProfileScreen from "../app-screens/ProfileScreen";
import CalendarScreen from "../app-screens/CalendarScreen";

const PINK = { a: "#ff9fd2", b: "#ff4fa3", deep: "#cf2a7d", ink: "#3b0a24" };
const PURPLE = { a: "#cdb2ff", b: "#8b5cf6", deep: "#6d28d9", ink: "#1e0b3d" };
const ORANGE = { a: "#ffc56b", b: "#ff9f1a", deep: "#c46a00", ink: "#3a2100" };

const NAMES = [
  { text: "ליאת ציפורניים", font: "var(--font-tenant-round)", color: PINK.b },
  { text: "סטודיו נועה", font: "var(--font-tenant-heavy)", color: PURPLE.b },
  { text: "שיר ביוטי", font: "var(--font-tenant-bold)", color: ORANGE.deep },
];
const SWATCHES = [PINK.b, PURPLE.b, ORANGE.b, "#0cffbe", "#0ea5e9"];
const STRIP = ["work-1.jpg", "work-4.jpg", "work-2.jpg", "work-5.jpg", "work-3.jpg", "work-6.jpg"];
const TEAM = ["נ", "ה", "ע", "ט", "ג"];
const ICONS = [
  { letter: "ל", bg: PINK.b },
  { letter: "נ", bg: PURPLE.b },
  { letter: "ש", bg: ORANGE.b },
];

function Phone({ tilt, glow, children }) {
  return (
    <div className="tori-brand-item" style={{ "--tilt": tilt, "--glow": glow }}>
      <div className="tori-device tori-brand-device">{children}</div>
    </div>
  );
}

function NameCard() {
  return (
    <li className="tori-bento is-wide">
      <div className="tori-bento-art tori-bento-names" aria-hidden="true">
        {NAMES.map((n, i) => (
          <span key={n.text} style={{ fontFamily: n.font, color: n.color, "--k": i }}>
            {n.text}
          </span>
        ))}
      </div>
      <b>השם והלוגו שלכם</b>
      <small>בראש האפליקציה, בפונט שבחרתם או בלוגו שלכם</small>
    </li>
  );
}

function ColorCard() {
  return (
    <li className="tori-bento is-wide">
      <div className="tori-bento-art tori-bento-colors" aria-hidden="true">
        <span className="tori-bento-btn">קביעת תור</span>
        <span className="tori-bento-swatches">
          {SWATCHES.map((c) => (
            <i key={c} style={{ background: c }} />
          ))}
        </span>
      </div>
      <b>צבע המותג שלכם</b>
      <small>כל כפתור, כרטיס ואייקון נצבע בצבע של העסק</small>
    </li>
  );
}

function GalleryCard() {
  return (
    <li className="tori-bento">
      <div className="tori-bento-art tori-bento-strip" aria-hidden="true">
        <span>
          {[...STRIP, ...STRIP].map((src, i) => (
            <img key={i} src={"/assets/imagery/" + src} alt="" decoding="async" />
          ))}
        </span>
      </div>
      <b>העבודות שלכם</b>
      <small>הגלריה בראש המסך מציגה את העבודות של העסק</small>
    </li>
  );
}

function TeamCard() {
  return (
    <li className="tori-bento">
      <div className="tori-bento-art tori-bento-team" aria-hidden="true">
        {TEAM.map((t, i) => (
          <span key={t} style={{ "--i": i }}>
            {t}
          </span>
        ))}
      </div>
      <b>הצוות שלכם</b>
      <small>כל איש צוות עם יומן, שירותים וזמינות משלו</small>
    </li>
  );
}

function StoreCard() {
  return (
    <li className="tori-bento">
      <div className="tori-bento-art tori-bento-store" aria-hidden="true">
        <span className="tori-bento-icon">
          {ICONS.map((ic, i) => (
            <span key={ic.letter} style={{ background: ic.bg, "--k": i }}>
              {ic.letter}
            </span>
          ))}
        </span>
        <span className="tori-bento-stores">
          <small>App Store</small>
          <small>Google Play</small>
        </span>
      </div>
      <b>בחנויות, בשם שלכם</b>
      <small>אייקון ושם משלכם ב-App Store וב-Google Play</small>
    </li>
  );
}

export default function BrandSection() {
  return (
    <section id="brand" className="tori-brand">
      <div className="tori-brand-inner">
        <div className="tori-brand-head" data-reveal="1">
          <h2>
            {"נראה כמו שלך,"}
            <br />
            {"כי זה באמת "}
            <span className="tori-word">{"שלך."}</span>
          </h2>
          <p>
            {
              "כל עסק מקבל אפליקציה עם המיתוג האישי שלו: השם, הלוגו, הצבעים והתמונות של העסק. הלקוחות רואים את המותג שלכם, לא את שלנו."
            }
          </p>
        </div>
        <div className="tori-brand-row">
          <Phone tilt="-5deg" glow={PINK.b}>
            <ProfileScreen theme={PINK} user="נועה כהן" phone="0528419930" />
          </Phone>
          <Phone tilt="0deg" glow={PURPLE.b}>
            <HomeScreen
              theme={PURPLE}
              logo={{ text: "סטודיו נועה", font: "var(--font-tenant-heavy)" }}
              photos={["work-5.jpg", "work-3.jpg", "work-1.jpg", "work-6.jpg", "work-4.jpg", "work-2.jpg"]}
              staff={["נועה", "הילה", "ענבר", "טל", "גלי", "עדי"]}
              user="מיכל"
              delay={4}
            />
          </Phone>
          <Phone tilt="5deg" glow={ORANGE.b}>
            <CalendarScreen theme={ORANGE} staff="שיר לוי" service="לק ג׳ל" price="180" delay={2} />
          </Phone>
        </div>
        <ul className="tori-bento-grid">
          <NameCard />
          <ColorCard />
          <GalleryCard />
          <TeamCard />
          <StoreCard />
        </ul>
      </div>
    </section>
  );
}
