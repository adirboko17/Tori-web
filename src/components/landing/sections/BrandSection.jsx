import { useEffect, useRef, useState } from "react";
import { Store } from "../StoreLogos";
import HomeScreen from "../app-screens/HomeScreen";

const PINK = { a: "#ff9fd2", b: "#ff4fa3", deep: "#cf2a7d", ink: "#3b0a24" };
const PURPLE = { a: "#cdb2ff", b: "#8b5cf6", deep: "#6d28d9", ink: "#1e0b3d" };
const GOLD = { a: "#f3dc94", b: "#d4a63a", deep: "#7c5a12", ink: "#2b2008" };

// the same home screen, three different businesses: only the brand changes.
// a name shown in place of a logo is always Latin: the app can't draw a Hebrew one
const BUSINESSES = [
  {
    theme: PINK,
    tilt: "-5deg",
    delay: 2,
    logo: { text: "Liat Nails", font: "'Varela Round', sans-serif" },
    photos: ["work-2.jpg", "work-6.jpg", "work-4.jpg", "work-1.jpg", "work-3.jpg", "work-5.jpg"],
    staff: ["ליאת", "רוני", "דנה", "אור", "מאי", "חן"],
    user: "נועה",
  },
  {
    theme: PURPLE,
    tilt: "0deg",
    delay: 4,
    logo: { text: "Noa Lashes", font: "'Google Sans', sans-serif", weight: 700 },
    photos: ["lash-1.jpg", "lash-2.jpg", "lash-3.jpg", "lash-4.jpg", "lash-5.jpg", "lash-6.jpg"],
    staff: ["נועה", "הילה", "ענבר", "טל", "גלי", "עדי"],
    user: "מיכל",
  },
  {
    theme: GOLD,
    tilt: "5deg",
    delay: 0,
    logo: { text: "DANI BARBER", font: "'Rubik', sans-serif", weight: 800 },
    photos: ["barber-1.jpg", "barber-2.jpg", "barber-3.jpg", "barber-4.jpg", "barber-5.jpg", "barber-6.jpg"],
    staff: ["דני", "אבי", "עומר", "רון", "תום", "יוסי"],
    user: "רועי",
  },
];
const SWATCHES = [PINK.b, PURPLE.b, GOLD.b, "#0cffbe", "#0ea5e9"];
const STRIP = ["work-1.jpg", "lash-1.jpg", "barber-1.jpg", "work-2.jpg", "lash-3.jpg", "barber-4.jpg"];
const TEAM = ["נ", "ה", "ע", "ט", "ג"];

function Phone({ tilt, glow, children }) {
  return (
    <div className="tori-brand-item" style={{ "--tilt": tilt, "--glow": glow }}>
      <div className="tori-device tori-brand-device">{children}</div>
    </div>
  );
}

/** The three phones. Where they swipe (tablet and phone), dots show which one
    is in view and a hint says there are more, until the first swipe. */
function BrandPhones() {
  const rowRef = useRef(null);
  const [active, setActive] = useState(0);
  const [swiped, setSwiped] = useState(false);

  useEffect(() => {
    const items = [...rowRef.current.children];
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = items.indexOf(entry.target);
          setActive(index);
          if (index > 0) setSwiped(true);
        }),
      { root: rowRef.current, threshold: 0.6 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  function show(index) {
    rowRef.current.children[index].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  return (
    <>
      <div className="tori-brand-row" ref={rowRef}>
        {BUSINESSES.map(({ tilt, theme, ...business }) => (
          <Phone key={business.logo.text} tilt={tilt} glow={theme.b}>
            <HomeScreen theme={theme} {...business} />
          </Phone>
        ))}
      </div>
      <div className="tori-brand-nav">
        <div className="tori-brand-dots">
          {BUSINESSES.map(({ logo }, index) => (
            <button
              key={logo.text}
              type="button"
              className={index === active ? "is-on" : undefined}
              aria-label={logo.text}
              aria-current={index === active ? "true" : undefined}
              onClick={() => show(index)}
            />
          ))}
        </div>
        <p className={swiped ? "tori-brand-hint is-gone" : "tori-brand-hint"} aria-hidden="true">
          החליקו לעוד עסקים
          <span>←</span>
        </p>
      </div>
    </>
  );
}

function NameCard() {
  return (
    <li className="tori-bento is-wide">
      <div className="tori-bento-art tori-bento-names" aria-hidden="true">
        {BUSINESSES.map(({ logo, theme }, i) => (
          <span
            key={logo.text}
            dir="ltr"
            style={{ fontFamily: logo.font, fontWeight: logo.weight, color: theme.b, "--k": i }}
          >
            {logo.text}
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
          {BUSINESSES.map(({ logo, theme }, i) => (
            <span key={logo.text} style={{ background: theme.b, "--k": i }}>
              {logo.text[0]}
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
        <BrandPhones />
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
