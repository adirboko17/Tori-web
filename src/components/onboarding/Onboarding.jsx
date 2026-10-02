"use client";
import { useEffect, useRef } from "react";
import ServiceAgreement from "@/components/service-agreement";
import { initializeOnboarding } from "./interactions";

export default function Onboarding() {
  const rootRef = useRef(null);
  useEffect(() => {
    try {
      return initializeOnboarding(rootRef.current);
    } catch (error) {
      console.error("onboarding init failed", error);
      return undefined;
    }
  }, []);
  return (
    <div
      className="ob"
      dir="rtl"
      lang="he"
      data-step="1"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        fontFamily: "'Google Sans',system-ui,sans-serif",
        color: "#171616",
        background:
          "#F2FBF7 url('/assets/media/tori-pattern.png') center/1200px auto repeat",
      }}
      ref={rootRef}
    >
      <span
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: "0",
          zIndex: "0",
          background: "rgba(255,255,255,.62)",
          pointerEvents: "none",
        }}
      />
      <header
        className="ob-head"
        style={{
          position: "relative",
          zIndex: "2",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "18px clamp(16px,4vw,40px)",
        }}
      >
        <a href="/" className="ob-logo" style={{ display: "inline-flex", alignItems: "center", gap: "11px", textDecoration: "none" }}>
          <span className="ob-mark">
            <img
              src="/assets/brand/tori-mark.png"
              alt=""
              style={{ position: "absolute", left: "50%", top: "50%", width: "42px", height: "42px", transform: "translate(-50%,-50%)" }}
            />
            <video data-ref="markVideoRef" loop playsInline autoPlay muted preload="auto" src="/assets/video/tori-mark-loop.webm" />
          </span>
          <img src="/assets/brand/tori-wordmark.png" alt="tori" style={{ height: "26px", width: "auto" }} />
        </a>
        <a href="/" className="ob-back-home" style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "9px", minHeight: "46px", padding: "0 12px 0 18px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", color: "#171616", textDecoration: "none" }}>
          חזרה לדף הבית
        </a>
      </header>
      <div style={{ position: "relative", zIndex: "1", display: "grid", placeItems: "center", padding: "6px clamp(16px,4vw,40px) 26px" }}>
        <div
          className="ob-shell"
          style={{
            width: "min(1140px,100%)",
            minHeight: "640px",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) clamp(250px,30%,400px)",
            background: "#fff",
            borderRadius: "30px",
            boxShadow: "0 40px 100px rgba(23,22,22,.16)",
            overflow: "hidden",
          }}
        >
          <div className="ob-content" style={{ display: "grid", gridTemplateRows: "minmax(0,1fr) auto", gap: "18px", padding: "clamp(22px,3.4vw,44px)", minWidth: "0" }}>
            <div className="ob-scroll" style={{ minWidth: "0", overflowY: "auto", display: "grid", gap: "16px", alignContent: "start" }}>
              <div style={{ display: "grid", gap: "4px" }}>
                <h1 style={{ fontSize: "clamp(23px,2.5vw,31px)", lineHeight: "1.08", margin: "0", fontWeight: "700" }}>
                  בואו נכיר את העסק
                </h1>
                <p style={{ margin: "0", fontSize: "14.5px", lineHeight: "1.5", color: "#5C5A58", maxWidth: "52ch" }}>
                  שם, טלפון ושם העסק. את שאר הפרטים משלימים באזור האישי אחרי התשלום.
                </p>
              </div>
              <div className="ob-two" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(205px,1fr))", gap: "10px 16px" }}>
                <label style={{ display: "grid", gap: "5px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#3D3B3A" }}>שם מלא</span>
                  <input className="ob-input" data-act="on.fullName" data-ev="change" placeholder="דנה לוי" autoComplete="name" />
                </label>
                <label style={{ display: "grid", gap: "5px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#3D3B3A" }}>מספר טלפון</span>
                  <input className="ob-input" type="tel" data-act="on.phone" data-ev="change" placeholder="050-000-0000" autoComplete="tel" dir="ltr" style={{ textAlign: "right" }} />
                </label>
                <label style={{ display: "grid", gap: "5px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#3D3B3A" }}>שם העסק</span>
                  <input className="ob-input" data-act="on.appName" data-ev="change" placeholder="סטודיו נועה" />
                </label>
              </div>
              <div data-ref="contractRef" style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid #E3E3E0", borderRadius: "16px", padding: "16px 18px", background: "#FAFAF8" }}>
                <ServiceAgreement />
              </div>
              <label style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 16px", borderRadius: "14px", border: "1px solid #E3E3E0", background: "#fff", cursor: "pointer" }}>
                <input type="checkbox" className="ob-check" data-ref="agree" data-act="onAgree" data-ev="change" />
                <span style={{ fontSize: "14.5px", lineHeight: "1.5" }}>
                  קראתי את הסכם השירות ואני מסכים/ה לתנאים.
                </span>
              </label>
              <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5", color: "#5C5A58" }}>
                299 ₪ לחודש + מע״מ, כהוראת קבע. התשלום מתבצע בדף מאובטח, בלי לשמור פרטי כרטיס אצלנו.
              </p>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              <p data-ref="errorLine" role="alert" style={{ display: "none", margin: "0", fontSize: "13.5px", color: "#E5484D" }}>
                <span data-ref="errorText" />
              </p>
              <div className="ob-nav-cta" style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="button" className="ob-primary" data-ref="nextBtn" data-act="next" data-ev="click">
                  <span data-ref="payBtnLabel">לתשלום</span>
                </button>
              </div>
              <p data-ref="payStatus" style={{ margin: "0", fontSize: "13px", color: "#5C5A58" }} />
            </div>
          </div>
          <aside className="ob-panel" style={{ position: "relative", background: "#171616", overflow: "hidden", minWidth: "0" }}>
            <video
              data-ref="panelVideoRef"
              src="/assets/media/onboarding-panel.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="ob-panel-video"
              style={{ position: "absolute", inset: "-2%", width: "104%", height: "104%", objectFit: "cover" }}
            />
          </aside>
        </div>
      </div>
      <footer style={{ position: "relative", zIndex: "2", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", flexWrap: "wrap", padding: "14px clamp(16px,4vw,40px) 26px", fontSize: "13px", color: "#5C5A58" }}>
        <span>© 2026 tori · כל הזכויות שמורות</span>
        <span style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
          <a href="/">דף הבית</a>
          <a href="/account">אזור אישי</a>
          <a href="https://wa.me/972535575303">תמיכה בוואטסאפ</a>
        </span>
      </footer>
    </div>
  );
}
