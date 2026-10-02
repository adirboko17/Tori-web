import { Store } from "../StoreLogos";
import HomeScreen from "../app-screens/HomeScreen";

const PINK = { a: "#ff9fd2", b: "#ff4fa3", deep: "#cf2a7d", ink: "#3b0a24" };
const PURPLE = { a: "#cdb2ff", b: "#8b5cf6", deep: "#6d28d9", ink: "#1e0b3d" };
const ORANGE = { a: "#ffc56b", b: "#ff9f1a", deep: "#c46a00", ink: "#3a2100" };

// a name shown in place of a logo is always Latin: the app can't draw a Hebrew one
const NAMES = [
  { text: "Liat Nails", font: "'Varela Round', sans-serif", color: PINK.b },
  { text: "STUDIO NOA", font: "'Rubik', sans-serif", weight: 800, color: PURPLE.b },
  { text: "Shir Beauty", font: "'Google Sans', sans-serif", weight: 700, color: ORANGE.deep },
];
const SWATCHES = [PINK.b, PURPLE.b, ORANGE.b, "#0cffbe", "#0ea5e9"];
const STRIP = ["work-1.jpg", "work-4.jpg", "work-2.jpg", "work-5.jpg", "work-3.jpg", "work-6.jpg"];
const TEAM = ["נ", "ה", "ע", "ט", "ג"];
const ICONS = [
  { letter: "L", bg: PINK.b },
  { letter: "N", bg: PURPLE.b },
  { letter: "S", bg: ORANGE.b },
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
          <span
            key={n.text}
            dir="ltr"
            style={{ fontFamily: n.font, fontWeight: n.weight, color: n.color, "--k": i }}
          >
            {n.text}
          </span>
        ))}
      </div>
      <b>השם והלוגו שלכם</b>
      <small>בראש האפליקציה: הלוגו שלכם, או השם באנגלית בפונט שבחרתם</small>
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
          <small>
            <Store name="apple" />
          </small>
          <small>
            <Store name="google" />
          </small>
        </span>
      </div>
      <b>בחנויות, בשם שלכם</b>
      <small>
        {"אייקון ושם משלכם"}
        <Store name="apple" prefix="ב־" />
        <Store name="google" prefix="וב־" />
      </small>
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
        {/* the same home screen, three businesses: only the brand changes */}
        <div className="tori-brand-row">
          <Phone tilt="-5deg" glow={PINK.b}>
            <HomeScreen
              theme={PINK}
              logo={{ text: "Liat Nails", font: "'Varela Round', sans-serif" }}
              photos={["work-2.jpg", "work-6.jpg", "work-4.jpg", "work-1.jpg", "work-3.jpg", "work-5.jpg"]}
              staff={["ליאת", "רוני", "דנה", "אור", "מאי", "חן"]}
              user="נועה"
              delay={2}
            />
          </Phone>
          <Phone tilt="0deg" glow={PURPLE.b}>
            <HomeScreen
              theme={PURPLE}
              logo={{ text: "STUDIO NOA", font: "'Rubik', sans-serif", weight: 800 }}
              photos={["work-5.jpg", "work-3.jpg", "work-1.jpg", "work-6.jpg", "work-4.jpg", "work-2.jpg"]}
              staff={["נועה", "הילה", "ענבר", "טל", "גלי", "עדי"]}
              user="מיכל"
              delay={4}
            />
          </Phone>
          <Phone tilt="5deg" glow={ORANGE.b}>
            <HomeScreen
              theme={ORANGE}
              logo={{ text: "Shir Beauty", font: "'Google Sans', sans-serif", weight: 700 }}
              photos={["work-3.jpg", "work-1.jpg", "work-6.jpg", "work-2.jpg", "work-5.jpg", "work-4.jpg"]}
              staff={["שיר", "יובל", "ליה", "עמית", "רז", "תמר"]}
              user="יעל"
              delay={0}
            />
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
