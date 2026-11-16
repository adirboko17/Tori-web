"use client";
import { useEffect, useRef, useState } from "react";
import "./black-friday.css";

/* The Black Friday offer: an annual plan at 149 ILS a month, until the end
   of November. It opens a few seconds after the page loads, once per visit,
   and counts down to the deadline. After the deadline it never shows. */

const DEADLINE = new Date("2026-11-30T23:59:59+02:00").getTime();
const SEEN_KEY = "tori-bf-2026-seen";
const OPEN_AFTER_MS = 4000;
const WHATSAPP =
  "https://wa.me/972535575303?text=" + encodeURIComponent("היי, אני רוצה את מבצע הבלאק פריידי: מנוי שנתי ב־149 ₪ לחודש");

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

function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);
  return (
    <div className="bf-clock" role="timer" aria-label="הזמן שנשאר עד סוף המבצע">
      {left(now).map(([value, label]) => (
        <span key={label} className="bf-unit">
          <b>{String(value).padStart(2, "0")}</b>
          <small>{label}</small>
        </span>
      ))}
    </div>
  );
}

export default function BlackFridayPopup() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const returnFocus = useRef(null);

  useEffect(() => {
    if (Date.now() >= DEADLINE || seen()) return;
    const timer = setTimeout(() => {
      returnFocus.current = document.activeElement;
      markSeen();
      setOpen(true);
    }, OPEN_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    dialogRef.current.focus();
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnFocus.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="bf-backdrop" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div
        ref={dialogRef}
        className="bf-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bf-title"
        tabIndex={-1}
      >
        <button type="button" className="bf-close" onClick={() => setOpen(false)} aria-label="סגירה">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <span className="bf-tag">BLACK FRIDAY</span>
        <h2 id="bf-title" className="bf-title">
          מנוי שנתי ב־
          <span className="bf-price">
            <bdi>149</bdi> ₪
          </span>
          <span className="bf-per"> לחודש</span>
        </h2>
        <p className="bf-text">במקום 249 ₪ לחודש. אפליקציה ממותגת לעסק שלך, לא כולל מע״מ.</p>
        <span className="bf-until">המבצע נגמר בסוף נובמבר</span>
        <Countdown />
        <a className="bf-cta" href={WHATSAPP} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
          אני רוצה את המבצע
        </a>
        <button type="button" className="bf-later" onClick={() => setOpen(false)}>
          אולי אחר כך
        </button>
      </div>
    </div>
  );
}
