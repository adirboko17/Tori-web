"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./cookie-consent.css";

const CONSENT_KEY = "tori-cookie-consent";
type Consent = "all" | "essential";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded?: boolean;
  version?: string;
  push?: Fbq;
};

function cleanId(value: string | undefined, pattern: RegExp) {
  const id = (value || "").trim();
  return pattern.test(id) ? id : "";
}

const META_PIXEL_ID = cleanId(
  process.env.NEXT_PUBLIC_META_PIXEL_ID,
  /^\d{5,20}$/,
);
const GA_ID = cleanId(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  /^G-[A-Za-z0-9]+$/,
);
const ADS_ID = cleanId(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID, /^AW-\d+$/);
const GTM_ID = cleanId(
  process.env.NEXT_PUBLIC_GTM_ID,
  /^GTM-[A-Za-z0-9]+$/,
);
const HAS_TOOLS = Boolean(META_PIXEL_ID || GA_ID || ADS_ID || GTM_ID);

function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "all" || value === "essential" ? value : null;
  } catch {
    return null;
  }
}

function writeConsent(value: Consent) {
  localStorage.setItem(CONSENT_KEY, value);
}

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let metaReady = false;
let googleReady = false;
let gtmReady = false;
let adsConfigured = false;

function installMeta(pixelId: string) {
  if (metaReady || window.fbq) {
    metaReady = true;
    return;
  }
  const script = document.createElement("script");
  script.async = true;
  script.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(pixelId)});`;
  document.head.appendChild(script);
  metaReady = true;
}

function ensureGoogle(primaryId: string) {
  if (!primaryId || googleReady) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  window.gtag("js", new Date());
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryId)}`;
  document.head.appendChild(script);
  googleReady = true;
}

function installGtm(containerId: string) {
  if (gtmReady) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.appendChild(script);
  gtmReady = true;
}

function trackPage(pathname: string) {
  if (META_PIXEL_ID) {
    installMeta(META_PIXEL_ID);
    window.fbq?.("track", "PageView");
  }
  if (GA_ID || ADS_ID) {
    ensureGoogle(GA_ID || ADS_ID);
    if (GA_ID) window.gtag?.("config", GA_ID, { page_path: pathname });
    if (ADS_ID && !adsConfigured) {
      window.gtag?.("config", ADS_ID);
      adsConfigured = true;
    }
  }
  if (GTM_ID) {
    installGtm(GTM_ID);
    window.dataLayer?.push({ event: "page_view", page_path: pathname });
  }
  if (pathname === "/subscribe/success") {
    const onceKey = "tori-tracked-subscribe";
    if (!sessionStorage.getItem(onceKey)) {
      sessionStorage.setItem(onceKey, "1");
      window.fbq?.("track", "Subscribe");
      window.gtag?.("event", "subscribe");
      window.dataLayer?.push({ event: "subscribe" });
    }
  }
}

export function CookieConsent() {
  const pathname = usePathname() || "/";
  const hidden = pathname.startsWith("/admin");
  const [consent, setConsent] = useState<Consent | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setOpen(!stored);
    setHydrated(true);
    const reopen = () => setOpen(true);
    window.addEventListener("tori-cookie-settings", reopen);
    return () => window.removeEventListener("tori-cookie-settings", reopen);
  }, []);

  useEffect(() => {
    if (!hydrated || hidden || consent !== "all" || !HAS_TOOLS) return;
    trackPage(pathname);
  }, [hydrated, hidden, consent, pathname]);

  if (hidden || !open) return null;

  function choose(value: Consent) {
    const stopTracking = consent === "all" && value === "essential";
    writeConsent(value);
    setConsent(value);
    setOpen(false);
    if (stopTracking) window.location.reload();
  }

  return (
    <div
      className="tori-cookie"
      role="dialog"
      aria-labelledby="tori-cookie-title"
      aria-describedby="tori-cookie-body"
      dir="rtl"
    >
      <span className="tori-cookie-badge" aria-hidden="true">
        <CookieIcon />
      </span>
      <div className="tori-cookie-text">
        <p className="tori-cookie-title" id="tori-cookie-title">
          עוגיות באתר
        </p>
        <p className="tori-cookie-body" id="tori-cookie-body">
          עוגיות הכרחיות לתשלום ולניהול. מדידה ושיווק של Meta ו־Google רק
          באישור שלך. <a href="/cookies">פרטים</a>
        </p>
      </div>
      <div className="tori-cookie-actions">
        <button
          type="button"
          className="tori-cookie-btn tori-cookie-btn-primary"
          onClick={() => choose("all")}
        >
          אישור
        </button>
        <button
          type="button"
          className="tori-cookie-btn tori-cookie-btn-secondary"
          onClick={() => choose("essential")}
        >
          רק הכרחיות
        </button>
      </div>
    </div>
  );
}

function CookieIcon() {
  return (
    <svg className="tori-cookie-icon" viewBox="0 0 48 48" fill="none">
      <defs>
        <mask id="tori-cookie-bite">
          <rect width="48" height="48" fill="#fff" />
          <circle cx="41" cy="8" r="8.5" fill="#000" />
          <circle cx="45.5" cy="19" r="4.5" fill="#000" />
          <circle cx="31" cy="3" r="3.5" fill="#000" />
        </mask>
      </defs>
      <g mask="url(#tori-cookie-bite)">
        <circle cx="24" cy="24" r="21" fill="#C98536" />
        <circle cx="24" cy="23" r="19" fill="#E9AE5E" />
        <circle cx="21" cy="19" r="12" fill="#F2C27A" opacity=".45" />
      </g>
      <circle cx="15" cy="17" r="3" fill="#5A3620" />
      <circle cx="26" cy="15" r="2.2" fill="#5A3620" />
      <circle cx="31" cy="27" r="3.2" fill="#5A3620" />
      <circle cx="18" cy="31" r="2.6" fill="#5A3620" />
      <circle cx="24" cy="38" r="1.8" fill="#5A3620" />
      <circle cx="10.5" cy="26" r="1.6" fill="#5A3620" />
      <circle cx="23" cy="24" r="1.3" fill="#7A4B2A" />
      <circle cx="14.2" cy="16.2" r=".9" fill="#8A5B38" />
      <circle cx="30.2" cy="26" r="1" fill="#8A5B38" />
    </svg>
  );
}
