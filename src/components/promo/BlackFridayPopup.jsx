"use client";
import { useEffect, useRef, useState } from "react";
import "./black-friday.css";

/* The Black Friday offer: an annual plan at 149 ILS a month instead of 249,
   until the end of November. It opens about 15 seconds after the page loads,
   once per visit. The old price is struck out, the new one rolls in, a -40%
   stamp lands, and a flip clock counts down. After the deadline it never shows. */

const DEADLINE = new Date("2026-11-30T23:59:59+02:00").getTime();
const SEEN_KEY = "tori-bf-2026-seen";
const OPEN_AFTER_MS = 15000;
const CLOSE_MS = 260;
const WHATSAPP =
  "https://wa.me/972535575303?text=" +
  encodeURIComponent("היי, אני רוצה את מבצע הבלאק פריידי: מנוי שנתי ב־149 ₪ לחודש");

function left(now) {
  const s = Math.max(0, Math.floor((DEADLINE - now) / 1000));
  return [
    [Math.floor(s / 86400), "ימים"],
    [Math.floor((s % 86400) / 3600), "שעות"],
    [Math.floor((s % 3600) / 60), "דקות"],
    [s % 60, "שניות"],
  ];
}

function seen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {}
}

/** One digit of the clock. A new value mounts a new face, which flips down. */
function FlipDigit({ value }) {
  return (
    <span className="bf-digit">
      <span key={value} className="bf-digit-face">
        {value}
      </span>
    </span>
  );
}

function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);
  return (
    <div className="bf-clock" role="timer" aria-label="הזמן שנשאר עד סוף המבצע">
      {left(now).map(([value, label], i) => (
        <div key={label} className="bf-unit" style={{ "--d": `${0.9 + i * 0.07}s` }}>
          <div className="bf-unit-digits" dir="ltr">
            {String(value)
              .padStart(2, "0")
              .split("")
              .map((digit, k) => (
                <FlipDigit key={k} value={digit} />
              ))}
          </div>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

/** The new price, each digit rolling a full turn of its reel before it stops in place. */
function RollingPrice({ value }) {
  return (
    <span className="bf-roll" dir="ltr" aria-label={`${value} שקלים`}>
      {String(value)
        .split("")
        .map((digit, i) => (
          <span key={i} className="bf-reel" aria-hidden="true">
            <span className="bf-reel-strip" style={{ "--n": digit, "--i": i }}>
              {"01234567890123456789".split("").map((n, k) => (
                <span key={k}>{n}</span>
              ))}
            </span>
          </span>
        ))}
    </span>
  );
}

/** A burst of lime and mint pieces thrown out of the stamp as it lands. */
const PIECES = [
  [-70, -60, 140], [-40, -90, 220], [10, -100, 300], [55, -80, 80], [85, -40, 190],
  [95, 10, 260], [70, 55, 40], [30, 85, 160], [-20, 90, 330], [-60, 65, 110],
  [-90, 20, 250], [-95, -25, 20], [40, -30, 200], [-30, 35, 280],
];

function Burst() {
  return (
    <span className="bf-burst" aria-hidden="true">
      {PIECES.map(([x, y, r], i) => (
        <i key={i} style={{ "--x": `${x}px`, "--y": `${y}px`, "--r": `${r}deg` }} />
      ))}
    </span>
  );
}

function Ticker() {
  const words = Array.from({ length: 8 }, (_, i) => (
    <span key={i}>
      BLACK FRIDAY <i>✦</i> בלאק פריידי <i>✦</i>
    </span>
  ));
  return (
    <div className="bf-ticker" aria-hidden="true">
      <div className="bf-ticker-track">
        {words}
        {words}
      </div>
    </div>
  );
}

export default function BlackFridayPopup() {
  const [state, setState] = useState("hidden");
  const dialogRef = useRef(null);
  const returnFocus = useRef(null);

  useEffect(() => {
    if (Date.now() >= DEADLINE || seen()) return;
    const timer = setTimeout(() => {
      returnFocus.current = document.activeElement;
      markSeen();
      setState("open");
    }, OPEN_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    setState("closing");
    setTimeout(() => setState("hidden"), CLOSE_MS);
  }

  useEffect(() => {
    if (state !== "open") return;
    dialogRef.current.focus();
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state]);

  useEffect(() => {
    if (state === "hidden") returnFocus.current?.focus?.();
  }, [state]);

  if (state === "hidden") return null;
  return (
    <div
      className={state === "closing" ? "bf-backdrop is-closing" : "bf-backdrop"}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        ref={dialogRef}
        className="bf-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bf-title"
        tabIndex={-1}
      >
        <Ticker />
        <button type="button" className="bf-close" onClick={close} aria-label="סגירה">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="bf-body">
          <span className="bf-mascot" aria-hidden="true">
            <video src="/assets/video/tori-mark-loop.webm" poster="/assets/brand/tori-mark.png" autoPlay muted loop playsInline />
          </span>
          <span className="bf-stamp" aria-hidden="true">
            <b dir="ltr">-40%</b>
            <Burst />
          </span>

          <span className="bf-kicker bf-in" style={{ "--d": ".25s" }}>
            רק עד סוף נובמבר
          </span>
          <h2 id="bf-title" className="bf-title bf-in" style={{ "--d": ".32s" }}>
            מנוי שנתי במחיר
            <br />
            שלא יחזור
          </h2>

          <div className="bf-price bf-in" style={{ "--d": ".4s" }}>
            <span className="bf-old" aria-label="במקום 249 שקלים">
              <bdi>249</bdi> ₪
            </span>
            <span className="bf-new">
              <RollingPrice value={149} />
              <span className="bf-new-unit">
                <b>₪</b>
                <small>לחודש</small>
              </span>
            </span>
          </div>
          <p className="bf-save bf-in" style={{ "--d": ".5s" }}>
            חוסכים <strong>1,200 ₪</strong> בשנה · לא כולל מע״מ
          </p>

          <Countdown />

          <a className="bf-cta bf-in" style={{ "--d": "1.15s" }} href={WHATSAPP} target="_blank" rel="noopener noreferrer" onClick={close}>
            <span>אני רוצה את המבצע</span>
            <span className="bf-cta-arrow" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </span>
          </a>
          <button type="button" className="bf-later bf-in" style={{ "--d": "1.25s" }} onClick={close}>
            לא עכשיו
          </button>
        </div>
      </div>
    </div>
  );
}
