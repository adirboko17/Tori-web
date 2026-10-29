"use client";
import { useEffect, useRef, useState } from "react";
import { AppStoreLogo, GooglePlayLogo } from "@/components/landing/StoreLogos";
import PhoneVideo, { PhoneStill } from "./PhoneVideo";
import LeadForm, { ArrowDot } from "./LeadForm";
import FeatureCarousel from "./FeatureCarousel";

/* The lead campaign page: a hero with the real app, four capabilities that
   play their recordings, and a short form. Built for phones first. */

const SHOTS = "/assets/campaign/";
const CLIENTS = ["shirlavy", "lb", "as", "te", "lp"];

const PROMISES = [
  ["חוזרים אליכם תוך שעה", "שיחה קצרה, בלי התחייבות"],
  ["‎299 ₪ לחודש, מחיר קבוע", "בלי דמי הקמה ובלי הפתעות"],
  ["עובדים כבר מהיום הראשון", "אתר זמני עד שהאפליקציה מאושרת בחנויות"],
];

function Check() {
  return (
    <span className="lp-check" aria-hidden="true">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5L20 7" />
      </svg>
    </span>
  );
}

function Hero() {
  return (
    <section className="lp-hero" aria-labelledby="lp-title">
      <div className="lp-hero-copy">
        <h1 id="lp-title" className="lp-title">
          <span className="lp-line" style={{ "--i": 0 }}>האפליקציה לקביעה</span>
          <span className="lp-line" style={{ "--i": 1 }}>וניהול תורים</span>
          <span className="lp-line" style={{ "--i": 2 }}>
            <span className="lp-mark">המתקדמת ביותר</span>
          </span>
          <span className="lp-line" style={{ "--i": 3 }}>בישראל.</span>
        </h1>
        <p className="lp-sub">עם השם, הלוגו והצבעים של העסק. הלקוחות קובעים לבד, מסביב לשעון, ואתם עובדים בשקט.</p>
        <div className="lp-hero-actions">
          <a className="lp-cta" href="#lead">
            <span>אני רוצה אפליקציה כזו</span>
            <ArrowDot />
          </a>
          <span className="lp-hero-note">‎299 ₪ לחודש · בלי דמי הקמה · בלי התחייבות</span>
          <div className="lp-stores" aria-label="זמינה בחנויות">
            <span className="lp-store" dir="ltr">
              <AppStoreLogo />
              App Store
            </span>
            <span className="lp-store" dir="ltr">
              <GooglePlayLogo />
              Google Play
            </span>
          </div>
        </div>
      </div>

      <div className="lp-fan">
        <PhoneStill src={SHOTS + "biz-home.jpg"} className="lp-fan-side lp-fan-start" />
        <PhoneVideo demo="customer/stories" poster={SHOTS + "stories.jpg"} eager className="lp-fan-main" />
        <PhoneStill src={SHOTS + "book.jpg"} className="lp-fan-side lp-fan-end" />
      </div>

      <div className="lp-proof">
        <span>
          <bdi dir="ltr" className="lp-proof-num">+70</bdi>
          {" עסקים שכבר משתמשים בתורי"}
        </span>
        <div className="lp-proof-logos">
          {CLIENTS.map((name) => (
            <img key={name} src={"/assets/clients/" + name + ".webp"} alt="" />
          ))}
        </div>
      </div>
    </section>
  );
}

function Lead() {
  return (
    <section id="lead" className="lp-lead" aria-labelledby="lp-form-title">
      <div className="lp-lead-card">
        <div className="lp-lead-copy">
          <h2 id="lp-form-title" className="lp-h2">
            {"בואו נבנה לכם "}
            <span className="lp-mark">אפליקציה</span>
          </h2>
          <p>משאירים פרטים, ואנחנו עושים את כל השאר. מה שצריך מכם זה לוגו ושם.</p>
          <ul className="lp-promises">
            {PROMISES.map(([title, sub]) => (
              <li key={title}>
                <Check />
                <span>
                  <strong>{title}</strong>
                  <span>{sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}

/** On the phone, a button pinned to the bottom once the hero button has
    scrolled away, hidden again while the form itself is on screen. */
function StickyCta() {
  const [show, setShow] = useState(false);
  const seen = useRef({ hero: true, lead: false });
  useEffect(() => {
    const hero = document.querySelector(".lp-hero-actions");
    const lead = document.getElementById("lead");
    const watch = new IntersectionObserver((entries) => {
      for (const e of entries) seen.current[e.target === hero ? "hero" : "lead"] = e.isIntersecting;
      setShow(!seen.current.hero && !seen.current.lead);
    });
    watch.observe(hero);
    watch.observe(lead);
    return () => watch.disconnect();
  }, []);
  return (
    <div className={show ? "lp-sticky is-on" : "lp-sticky"} aria-hidden={!show}>
      <a className="lp-cta" href="#lead" tabIndex={show ? 0 : -1}>
        <span>אני רוצה אפליקציה כזו</span>
        <ArrowDot />
      </a>
    </div>
  );
}

export default function CampaignPage() {
  return (
    <div className="lp">
      <a className="lp-skip" href="#lead">דלגו לטופס</a>
      <a className="lp-promo" href="#lead">
        <strong>‎0 ₪ דמי הקמה</strong>
        <span>לזמן מוגבל</span>
        <span className="lp-promo-dot" aria-hidden="true" />
        <span>
          ‎299 ₪ לחודש<span className="lp-promo-more">, ויש לכם אפליקציה משלכם בחנויות</span>
        </span>
      </a>
      <header className="lp-bar">
        <a className="lp-logo" href="/" aria-label="תורי, לדף הבית">
          <img src="/assets/brand/tori-mark.png" alt="" width="38" height="38" />
          <img src="/assets/brand/tori-wordmark.png" alt="" className="lp-wordmark" />
        </a>
        <a className="lp-bar-link" href="#lead">השאירו פרטים</a>
      </header>
      <main>
        <Hero />
        <FeatureCarousel />
        <Lead />
      </main>
      <footer className="lp-foot">
        <span>© תורי</span>
        <a href="/privacy">מדיניות פרטיות</a>
        <a href="/accessibility">הצהרת נגישות</a>
        <a href="/terms">תנאי שימוש</a>
      </footer>
      <StickyCta />
    </div>
  );
}
