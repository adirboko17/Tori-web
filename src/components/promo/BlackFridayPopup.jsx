"use client";
import { useEffect, useState } from "react";
import "./black-friday.css";

/* The Black Friday offer: an annual plan at 149 ILS a month instead of 249,
   until the end of November. About 25 seconds into the visit a card slides up
   from the bottom without covering the page, once per visit. The old price is
   struck out, the new one rolls into place, and a flip clock counts down.
   After the deadline it never shows. */

const DEADLINE = new Date("2026-11-30T23:59:59+02:00").getTime();
const SEEN_KEY = "tori-bf-2026-seen";
const OPEN_AFTER_MS = 25000;
const CLOSE_MS = 320;
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
      {left(now).map(([value, label]) => (
        <div key={label} className="bf-unit">
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

  useEffect(() => {
    if (Date.now() >= DEADLINE || seen()) return;
    const timer = setTimeout(() => {
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
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state]);

  if (state === "hidden") return null;
  return (
    <aside
      className={state === "closing" ? "bf-card is-closing" : "bf-card"}
      role="dialog"
      aria-labelledby="bf-title"
    >
      <Ticker />
      <button type="button" className="bf-close" onClick={close} aria-label="סגירת המבצע">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="bf-body">
        <div className="bf-head">
          <img className="bf-mascot" src="/assets/brand/tori-mark.png" alt="" width="52" height="52" />
          <div className="bf-head-text">
            <span className="bf-kicker">רק עד סוף נובמבר · ‎-40%</span>
            <h2 id="bf-title" className="bf-title">
              מנוי שנתי במחיר שלא יחזור
            </h2>
          </div>
        </div>

        <div className="bf-price">
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
        <p className="bf-save">
          חוסכים <strong>1,200 ₪</strong> בשנה · לא כולל מע״מ
        </p>

        <Countdown />

        <a className="bf-cta" href={WHATSAPP} target="_blank" rel="noopener noreferrer" onClick={close}>
          <span>אני רוצה את המבצע</span>
          <span className="bf-cta-arrow" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </span>
        </a>
      </div>
    </aside>
  );
}
