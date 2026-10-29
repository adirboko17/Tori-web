"use client";
import { useEffect, useRef, useState } from "react";

/* The capabilities as a stage of phones: the one in front plays its
   recording, the ones beside it lean back, and when a recording ends the
   next phone slides in. Story-style bars under it show the progress. */

const DEMOS = "/assets/demos/";
const SHOTS = "/assets/campaign/";

const FEATURES = [
  {
    demo: "customer/book",
    poster: "book",
    title: "הלקוחות קובעים לבד",
    text: "בוחרים שירות, יום ושעה, והתור ביומן. בלי טלפונים ובלי הודעות באמצע טיפול.",
  },
  {
    demo: "business/home-design",
    poster: "home-design",
    title: "בעיצוב של העסק שלך",
    text: "השם, הלוגו, הצבעים והתמונות שלכם. הלקוחות מורידים אפליקציה של העסק.",
  },
  {
    demo: "business/ai-chat",
    poster: "ai-chat",
    title: "עוזר חכם שקובע בשבילכם",
    text: "שואלים את תורי „יש מקום מחר בבוקר?”, והוא מוצא, מציע וקובע.",
  },
  {
    demo: "business/drag",
    poster: "drag",
    title: "היומן זז עם האצבע",
    text: "לחיצה ארוכה על תור, גוררים לשעה אחרת, והלקוח מקבל עדכון.",
  },
  {
    demo: "business/broadcast",
    poster: "broadcast",
    title: "מחזירים לקוחות בלחיצה",
    text: "התראה לכל מי שלא קבע תור חודש, ישר לטלפון שלהם, עכשיו או בתזמון.",
  },
  {
    demo: "business/dashboard",
    poster: "dashboard",
    title: "כל העסק במסך אחד",
    text: "התורים של היום, התור הבא, וגרף שבועי של ההכנסות.",
  },
];

/** The front phone's recording. It plays once, reports its progress, and
    tells the carousel when it ends. */
function StageVideo({ demo, poster, playing, onProgress, onEnded }) {
  const ref = useRef(null);
  useEffect(() => {
    // React leaves `muted` out of the server HTML, so the browser would refuse to autoplay
    ref.current.muted = true;
  }, []);
  useEffect(() => {
    if (playing) ref.current.play().catch(() => {});
    else ref.current.pause();
  }, [playing]);
  return (
    <video
      ref={ref}
      poster={poster}
      muted
      playsInline
      preload="auto"
      onTimeUpdate={(e) => onProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
      onEnded={onEnded}
    >
      <source src={DEMOS + demo + ".webm"} type="video/webm" />
      <source src={DEMOS + demo + ".mp4"} type="video/mp4" />
    </video>
  );
}

/** Where a phone sits for its distance from the front one: -1 is the next phone. */
function slot(i, active, count) {
  let d = i - active;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}

export default function FeatureCarousel() {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const drag = useRef(null);
  const swiped = useRef(false);
  const count = FEATURES.length;
  const feature = FEATURES[active];

  useEffect(() => {
    const watch = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    watch.observe(rootRef.current);
    return () => watch.disconnect();
  }, []);

  function go(i) {
    if (barRef.current) barRef.current.style.setProperty("--p", 0);
    setActive((i + count) % count);
  }
  function progress(p) {
    barRef.current?.style.setProperty("--p", p);
  }

  // a swipe moves one phone: toward the left is the next one, as Hebrew reads
  function onPointerDown(e) {
    drag.current = e.clientX;
  }
  function onPointerUp(e) {
    if (drag.current == null) return;
    const dx = e.clientX - drag.current;
    drag.current = null;
    swiped.current = Math.abs(dx) > 40;
    if (swiped.current) go(active + (dx > 0 ? 1 : -1));
  }

  return (
    <section
      ref={rootRef}
      className="lp-features"
      aria-labelledby="lp-features-title"
      aria-roledescription="קרוסלה"
    >
      <header className="lp-head">
        <h2 id="lp-features-title" className="lp-h2">
          {"אפליקציה עם "}
          <span className="lp-mark">המיתוג שלכם</span>
        </h2>
      </header>

      <div
        className="lp-stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
      >
        {FEATURES.map((f, i) => {
          const d = slot(i, active, count);
          const front = d === 0;
          return (
            <button
              key={f.demo}
              type="button"
              className={"lp-slide" + (front ? " is-front" : "") + (Math.abs(d) === 2 ? " is-far" : "") + (Math.abs(d) > 2 ? " is-gone" : "")}
              style={{ "--d": d, "--a": Math.abs(d) }}
              onClick={() => !front && !swiped.current && go(i)}
              tabIndex={-1}
              aria-hidden="true"
            >
              <span className="lp-phone">
                <span className="lp-phone-screen">
                  {front ? (
                    <StageVideo
                      key={f.demo}
                      demo={f.demo}
                      poster={SHOTS + f.poster + ".jpg"}
                      playing={inView && !paused}
                      onProgress={progress}
                      onEnded={() => go(active + 1)}
                    />
                  ) : (
                    <img src={SHOTS + f.poster + ".jpg"} alt="" loading="lazy" />
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="lp-caption" key={feature.demo} aria-live="polite">
        <strong className="lp-caption-title">{feature.title}</strong>
        <span className="lp-caption-text">{feature.text}</span>
      </div>

      <div className="lp-controls">
        <div className="lp-bars">
          {FEATURES.map((f, i) => (
            <button
              key={f.demo}
              type="button"
              className="lp-bar-seg"
              aria-label={f.title}
              aria-current={i === active ? "true" : undefined}
              onClick={() => go(i)}
            >
              <i ref={i === active ? barRef : undefined} className={i < active ? "is-done" : undefined} />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="lp-pause"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "המשך הדגמה" : "עצירת הדגמה"}
        >
          {paused ? (
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}
