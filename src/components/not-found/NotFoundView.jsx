"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Tori3D } from "@/components/tori3d/Tori3D";
import "./not-found.css";

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

/** The 404: Tori shakes its head at the missing page; a tap cheers it up. */
export default function NotFoundView() {
  const [cue, setCue] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setCue({ type: "error", id: 1 }), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="nf-page" dir="rtl">
      <header className="nf-head">
        <Link href="/" className="nf-logo" aria-label="תורי, לדף הבית">
          <img className="nf-logo-mark" src="/assets/brand/tori-mark.png" alt="" />
          <img className="nf-logo-word" src="/assets/brand/tori-wordmark.png" alt="tori" />
        </Link>
      </header>

      <section className="nf-hero">
        <div className="nf-stage">
          <span className="nf-code" aria-hidden="true">
            404
          </span>
          <Tori3D cue={cue} />
        </div>
        <h1 className="nf-title">
          <span className="nf-oops">אופס...</span>
          <span className="nf-line">
            נראה לי שאתם <span className="nf-word">לא במקום הנכון</span>
          </span>
        </h1>
        <p className="nf-sub">העמוד שחיפשתם לא קיים, או שהקישור השתנה. בואו נחזיר אתכם הביתה.</p>
        <div className="nf-actions">
          <Link href="/" className="nf-cta">
            <span>חזרה לדף הבית</span>
            <span className="nf-cta-arrow" aria-hidden="true">
              <ArrowIcon />
            </span>
          </Link>
          <a href="https://wa.me/972535575303" className="nf-ghost">
            דברו איתנו בוואטסאפ
          </a>
        </div>
      </section>
    </main>
  );
}
