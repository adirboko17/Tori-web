"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Tori3D } from "@/components/tori3d/Tori3D";
import "./sms.css";

export function SmsResult({ tone, title, children, primaryLabel }) {
  const success = tone === "success";
  const [cue, setCue] = useState(null);

  // celebrate (or shake it off) once the page has settled
  useEffect(() => {
    const timer = window.setTimeout(() => setCue({ type: success ? "happy" : "error", id: 1 }), 900);
    return () => window.clearTimeout(timer);
  }, [success]);

  return (
    <div className="sms-page" dir="rtl">
      <header className="sms-nav">
        <Link href="/" aria-label="תורי, לדף הבית" className="sms-nav-logo">
          <img className="sms-nav-mark" src="/assets/brand/tori-mark.png" alt="" />
          <img className="sms-nav-word" src="/assets/brand/tori-wordmark.png" alt="tori" />
        </Link>
      </header>
      <main className="sms-result">
        <div className="sms-result-card">
          <p className={`sms-result-badge is-${tone}`}>
            <span aria-hidden="true">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {success ? <path d="m5 12 5 5L20 7" /> : <path d="M18 6 6 18M6 6l12 12" />}
              </svg>
            </span>
            {success ? "העסקה אושרה" : "העסקה לא עברה"}
          </p>
          <h1>{title}</h1>
          <p>{children}</p>
          <div className="sms-result-actions">
            <Link className={`sms-cta ${success ? "is-ink" : "is-brand"}`} href="/sms">
              <span className="sms-cta-label">{primaryLabel}</span>
              <span className="sms-cta-arrow" aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
              </span>
            </Link>
            <Link className="sms-link sms-result-home" href="/">
              לדף הבית
            </Link>
          </div>
        </div>
        <div className="sms-stage">
          <div className="sms-stage-glow" aria-hidden="true" />
          <div className="sms-stage-ring" aria-hidden="true" />
          <Tori3D cue={cue} />
        </div>
      </main>
    </div>
  );
}
