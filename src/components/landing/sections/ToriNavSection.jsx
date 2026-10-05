import { Fragment, useEffect, useRef } from "react";
import { watchMarkVideo } from "@/lib/mark-video";

const NAV_ITEMS = [
  { id: "pain", label: "למה תורי", hint: "הכאב שאנחנו פותרים" },
  { id: "brand", label: "מיתוג", hint: "האפליקציה בצבעים שלכם" },
  { id: "process", label: "איך זה עובד", hint: "שלושה צעדים, 72 שעות" },
  { id: "capabilities", label: "פיצ׳רים", hint: "מה תורי יודעת לעשות" },
  { id: "compare", label: "השוואה", hint: "תורי מול הדרך הישנה" },
  { id: "pricing", label: "מחיר", hint: "מחיר אחד, הכל כלול" },
  { id: "faq", label: "שאלות", hint: "כל מה ששאלתם" },
  { id: "sms", label: "רכישת SMS", hint: "עוד הודעות לעסק", href: "/sms" },
];

/** Refraction map for the liquid-glass bar: red bends x, green bends y.
    A gentle slope across the middle magnifies; steep ramps at the rim bend
    the page like the edge of a lens. */
const LENS_MAP =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60" preserveAspectRatio="none">' +
      '<linearGradient id="x"><stop offset="0" stop-color="#f00"/><stop offset=".1" stop-color="#8e0000"/><stop offset=".9" stop-color="#710000"/><stop offset="1" stop-color="#000"/></linearGradient>' +
      '<linearGradient id="y" x2="0" y2="1"><stop offset="0" stop-color="#0a0"/><stop offset=".35" stop-color="#008600"/><stop offset=".65" stop-color="#007900"/><stop offset="1" stop-color="#050"/></linearGradient>' +
      '<rect width="200" height="60" fill="url(#x)"/>' +
      '<rect width="200" height="60" fill="url(#y)" style="mix-blend-mode:screen"/>' +
      "</svg>",
  );
/** Each color channel bends a little differently: a thin rainbow at the rim. */
const LENS_CHANNELS = [
  [74, "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"],
  [68, "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"],
  [62, "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"],
];

function ArrowIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
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
  );
}

/** Keeps the lens map the exact pixel size of the glass it sits behind. */
function useLensSize() {
  const glassRef = useRef(null);
  const lensRef = useRef(null);
  useEffect(() => {
    const glass = glassRef.current;
    const lens = lensRef.current;
    const observer = new ResizeObserver(() => {
      lens.setAttribute("width", String(glass.offsetWidth));
      lens.setAttribute("height", String(glass.offsetHeight));
    });
    observer.observe(glass);
    return () => observer.disconnect();
  }, []);
  return { glassRef, lensRef };
}

export default function ToriNavSection() {
  const { glassRef, lensRef } = useLensSize();
  const markVideoRef = useRef(null);
  // the animated mark shows only where its transparency really renders
  useEffect(() => watchMarkVideo(markVideoRef.current), []);
  return (
    <header
      className="tori-nav"
      style={{
        position: "fixed",
        top: "0",
        insetInline: "0",
        zIndex: "40",
        pointerEvents: "none",
      }}
    >
      <svg className="tori-nav-filter" width="0" height="0" aria-hidden="true">
        <filter
          id="glass-distortion"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            ref={lensRef}
            href={LENS_MAP}
            x="0"
            y="0"
            width="1000"
            height="60"
            preserveAspectRatio="none"
            result="lens"
          />
          {LENS_CHANNELS.map(([scale, matrix], i) => (
            <Fragment key={i}>
              <feDisplacementMap
                in="SourceGraphic"
                in2="lens"
                scale={scale}
                xChannelSelector="R"
                yChannelSelector="G"
                result={"shift" + i}
              />
              <feColorMatrix
                in={"shift" + i}
                type="matrix"
                values={matrix}
                result={"ch" + i}
              />
            </Fragment>
          ))}
          <feBlend in="ch0" in2="ch1" mode="screen" result="rg" />
          <feBlend in="rg" in2="ch2" mode="screen" />
        </filter>
      </svg>

      <nav
        className="tori-nav-bar"
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: "26px",
          boxSizing: "border-box",
        }}
      >
        <div
          ref={glassRef}
          className="tori-nav-glass tori-nav-glass-distort"
          aria-hidden="true"
          style={{
            backdropFilter: "url(#glass-distortion) blur(4px) saturate(1.8) brightness(1.08)",
            WebkitBackdropFilter: "url(#glass-distortion) blur(4px) saturate(1.8) brightness(1.08)",
          }}
        />
        <div className="tori-nav-glass tori-nav-glass-tint" aria-hidden="true" />
        <div className="tori-nav-glass tori-nav-glass-shine" aria-hidden="true" />
        <a
          href="#top"
          className="tori-nav-logo"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0",
            flex: "0 0 auto",
          }}
        >
          <span className="tori-nav-mark">
            <img className="tori-nav-mark-still" src="/assets/brand/tori-mark.png" alt="" />
            <video
              ref={markVideoRef}
              muted={true}
              loop={true}
              playsInline={true}
              autoPlay={true}
              preload="auto"
            >
              <source
                src="/assets/video/tori-mark-loop.webm"
                type="video/webm"
              />
            </video>
          </span>
          <img
            className="tori-nav-word"
            src="/assets/brand/tori-wordmark.png"
            alt="tori"
            style={{ height: "21px", width: "auto" }}
          />
        </a>
        <div
          className="tori-nav-links"
          style={{
            position: "relative",
            display: "flex",
            gap: "4px",
            flex: "1",
            justifyContent: "center",
            fontSize: "15px",
            color: "var(--ink-600)",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href ?? "#" + item.id}
              data-nav={item.href ? undefined : item.id}
              style={{ fontWeight: "500", borderRadius: "5px" }}
            >
              {item.label}
            </a>
          ))}
        </div>
        <a
          href="/onboarding"
          className="tori-nav-cta"
          style={{
            whiteSpace: "nowrap",
            flex: "0 0 auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "9px",
            minHeight: "44px",
            padding: "0 18px 0 12px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--ink-900)",
            position: "relative",
            overflow: "hidden",
            isolation: "isolate",
          }}
        >
          <span
            className="tori-nav-cta-label"
            style={{ position: "relative", fontSize: "15px" }}
          >
            {"התחילו עכשיו"}
          </span>
          <span
            className="tori-nav-cta-short"
            style={{ display: "none", position: "relative", fontSize: "15px" }}
          >
            {"הצטרפו לתורי"}
          </span>
          <span
            className="tori-nav-cta-arrow"
            style={{
              position: "relative",
              display: "inline-grid",
              placeItems: "center",
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "var(--ink-900)",
              color: "var(--green-300)",
            }}
          >
            <ArrowIcon />
          </span>
        </a>
        <button
          type="button"
          className="tori-burger"
          data-act="toggleMenu"
          aria-label="פתיחת תפריט"
          aria-expanded="false"
          aria-controls="tori-mobile-menu"
        >
          <span className="tori-burger-box" aria-hidden="true">
            <span></span>
            <span></span>
          </span>
        </button>
      </nav>

      <div
        className="tori-menu"
        id="tori-mobile-menu"
        data-ref="menuRef"
        hidden
      >
        <div className="tori-menu-glow-clip" aria-hidden="true">
          <span className="tori-menu-glow"></span>
        </div>
        <nav className="tori-menu-list" aria-label="תפריט ראשי">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.id}
              href={item.href ?? "#" + item.id}
              data-menu-link={item.href ? undefined : item.id}
              data-act="closeMenu"
              style={{ "--i": i }}
            >
              <span className="tori-menu-num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="tori-menu-text">
                <span className="tori-menu-label">{item.label}</span>
                <span className="tori-menu-hint">{item.hint}</span>
              </span>
              <span className="tori-menu-chev" aria-hidden="true">
                <ArrowIcon size={17} />
              </span>
            </a>
          ))}
        </nav>
        <div className="tori-menu-foot" style={{ "--i": NAV_ITEMS.length }}>
          <a href="/onboarding" className="tori-menu-cta" data-act="closeMenu">
            <span>{"אני רוצה אפליקציה משלי"}</span>
            <span className="tori-menu-cta-ico" aria-hidden="true">
              <ArrowIcon size={17} />
            </span>
          </a>
          <a
            href="https://wa.me/972500000000"
            className="tori-menu-wa"
            data-act="closeMenu"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            {"דברו איתנו בוואטסאפ"}
          </a>
        </div>
      </div>
    </header>
  );
}
