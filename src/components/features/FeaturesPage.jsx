"use client";
import { useEffect, useRef } from "react";
import { initializeLanding } from "../landing/interactions";
import ToriNavSection from "../landing/sections/ToriNavSection";
import Footer25Section from "../landing/sections/Footer25Section";
import ToriA11ySection from "../landing/sections/ToriA11ySection";
import ToriChatSection from "../landing/sections/ToriChatSection";
import FeatureStudio from "./FeatureStudio";

/** /features: every tori capability with its phone demo, in the site's frame. */
export default function FeaturesPage() {
  const rootRef = useRef(null);
  useEffect(() => initializeLanding(rootRef.current), []);
  return (
    <div className="tori-lp" dir="rtl" lang="he" ref={rootRef}>
      <div className="tori-promo">ללא דמי הקמה - ללא התחייבות</div>
      <ToriNavSection base="/" />
      <main>
        <FeatureStudio />
        <section className="tf-end">
          <h2>
            {"כל זה, "}
            <span className="tori-word">{"בשם שלכם."}</span>
          </h2>
          <p>{"אפליקציה ממותגת לעסק שלכם, עם כל היכולות האלה, במחיר חודשי אחד."}</p>
          <a href="/onboarding" className="tf-end-cta">
            {"אני רוצה אפליקציה משלי"}
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </span>
          </a>
        </section>
      </main>
      <Footer25Section />
      <ToriA11ySection />
      <ToriChatSection />
    </div>
  );
}
