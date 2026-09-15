"use client";
import { useEffect, useRef } from "react";
import { initializeLanding } from "./interactions";
import ToriLoaderSection from "./sections/ToriLoaderSection";
import ToriNavSection from "./sections/ToriNavSection";
import TopSection from "./sections/TopSection";
import CapabilitiesSection from "./sections/CapabilitiesSection";
import PainSection from "./sections/PainSection";
import ProcessSection from "./sections/ProcessSection";
import BrandSection from "./sections/BrandSection";
import FeaturesSection from "./sections/FeaturesSection";
import CompareSection from "./sections/CompareSection";
import PricingSection from "./sections/PricingSection";
import FaqSection from "./sections/FaqSection";
import LeadFormSection from "./sections/LeadFormSection";
import Footer25Section from "./sections/Footer25Section";
import ToriA11ySection from "./sections/ToriA11ySection";
import ToriChatSection from "./sections/ToriChatSection";
export default function Landing() {
  const rootRef = useRef(null);
  useEffect(() => initializeLanding(rootRef.current), []);
  return (
    <div
      className="tori-lp"
      dir="rtl"
      lang="he"
      style={{
        fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
        color: "var(--ink-800)",
        background: "var(--white)",
        overflowX: "hidden",
      }}
      ref={rootRef}
    >
      <ToriLoaderSection />
      <ToriNavSection />
      <TopSection />
      <CapabilitiesSection />
      <PainSection />
      <ProcessSection />
      <BrandSection />
      <FeaturesSection />
      <CompareSection />
      <PricingSection />
      <FaqSection />
      <LeadFormSection />
      <Footer25Section />
      <ToriA11ySection />
      <ToriChatSection />
    </div>
  );
}
