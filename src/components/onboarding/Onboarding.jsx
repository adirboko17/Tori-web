"use client";
import { useEffect, useRef } from "react";
import { initializeOnboarding } from "./interactions";
export default function Onboarding() {
  const rootRef = useRef(null);
  useEffect(() => initializeOnboarding(rootRef.current), []);
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
        textWrap: "pretty",
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
      ></span>
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
        <a
          href="/"
          className="ob-logo"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "11px",
            textDecoration: "none",
          }}
        >
          <span className="ob-mark">
            <img
              src="/assets/brand/tori-mark.png"
              alt=""
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "42px",
                height: "42px",
                transform: "translate(-50%,-50%)",
              }}
            />
            <video
              data-ref="markVideoRef"
              loop={true}
              playsInline={true}
              autoPlay={true}
              preload="auto"
              src="/assets/video/tori-mark-loop.webm"
              muted
            ></video>
          </span>
          <img
            src="/assets/brand/tori-wordmark.png"
            alt="tori"
            style={{ height: "26px", width: "auto" }}
          />
        </a>
        <a
          href="/"
          className="ob-back-home"
          style={{
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            gap: "9px",
            minHeight: "46px",
            padding: "0 12px 0 18px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "600",
            color: "#171616",
            textDecoration: "none",
            position: "relative",
            overflow: "hidden",
            isolation: "isolate",
          }}
        >
          <span
            className="ob-back-arrow"
            style={{
              position: "relative",
              display: "inline-grid",
              placeItems: "center",
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "#171616",
              color: "#7BFFD4",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7M19 12H5"></path>
            </svg>
          </span>
          <span style={{ position: "relative" }}>{"חזרה לדף הבית"}</span>
        </a>
      </header>
      <div
        style={{
          position: "relative",
          zIndex: "1",
          display: "grid",
          placeItems: "center",
          padding: "6px clamp(16px,4vw,40px) 26px",
          boxSizing: "border-box",
        }}
      >
        <div
          className="ob-shell"
          style={{
            width: "min(1140px,100%)",
            height: "740px",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) clamp(250px,30%,400px)",
            background: "#fff",
            borderRadius: "30px",
            boxShadow: "0 40px 100px rgba(23,22,22,.16)",
            overflow: "hidden",
          }}
        >
          <div
            className="ob-content"
            style={{
              display: "grid",
              gridTemplateRows: "auto minmax(0,1fr) auto",
              gap: "20px",
              padding: "clamp(22px,3.4vw,44px)",
              minWidth: "0",
              minHeight: "0",
            }}
          >
            <div style={{ display: "grid", gap: "14px" }}>
              <a
                href="/"
                className="ob-logo-inline"
                style={{
                  display: "none",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                }}
              >
                <img
                  src="/assets/brand/tori-mark.png"
                  alt=""
                  style={{ width: "28px", height: "28px" }}
                />
                <img
                  src="/assets/brand/tori-wordmark.png"
                  alt="tori"
                  style={{ height: "14px", width: "auto" }}
                />
              </a>
              <ol
                className="ob-stepper"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0",
                  margin: "0",
                  padding: "0",
                  listStyle: "none",
                }}
              >
                <li
                  className="ob-stepper-item"
                  data-state="active"
                  style={{
                    flex: "1 1 0",
                    minWidth: "0",
                    display: "grid",
                    justifyItems: "center",
                    gap: "8px",
                    position: "relative",
                  }}
                >
                  <span className="ob-stepper-line"></span>
                  <span className="ob-stepper-num">{"1"}</span>
                  <span className="ob-stepper-title">{"פרטי העסק"}</span>
                </li>
                <li
                  className="ob-stepper-item"
                  data-state="todo"
                  style={{
                    flex: "1 1 0",
                    minWidth: "0",
                    display: "grid",
                    justifyItems: "center",
                    gap: "8px",
                    position: "relative",
                  }}
                >
                  <span className="ob-stepper-line"></span>
                  <span className="ob-stepper-num">{"2"}</span>
                  <span className="ob-stepper-title">{"עיצוב ומיתוג"}</span>
                </li>
                <li
                  className="ob-stepper-item"
                  data-state="todo"
                  style={{
                    flex: "1 1 0",
                    minWidth: "0",
                    display: "grid",
                    justifyItems: "center",
                    gap: "8px",
                    position: "relative",
                  }}
                >
                  <span className="ob-stepper-line"></span>
                  <span className="ob-stepper-num">{"3"}</span>
                  <span className="ob-stepper-title">{"שירותים"}</span>
                </li>
                <li
                  className="ob-stepper-item"
                  data-state="todo"
                  style={{
                    flex: "1 1 0",
                    minWidth: "0",
                    display: "grid",
                    justifyItems: "center",
                    gap: "8px",
                    position: "relative",
                  }}
                >
                  <span className="ob-stepper-line"></span>
                  <span className="ob-stepper-num">{"4"}</span>
                  <span className="ob-stepper-title">{"חבילת SMS"}</span>
                </li>
                <li
                  className="ob-stepper-item"
                  data-state="todo"
                  style={{
                    flex: "1 1 0",
                    minWidth: "0",
                    display: "grid",
                    justifyItems: "center",
                    gap: "8px",
                    position: "relative",
                  }}
                >
                  <span className="ob-stepper-line"></span>
                  <span className="ob-stepper-num">{"5"}</span>
                  <span className="ob-stepper-title">{"הסכם"}</span>
                </li>
                <li
                  className="ob-stepper-item"
                  data-state="todo"
                  style={{
                    flex: "1 1 0",
                    minWidth: "0",
                    display: "grid",
                    justifyItems: "center",
                    gap: "8px",
                    position: "relative",
                  }}
                >
                  <span className="ob-stepper-line"></span>
                  <span className="ob-stepper-num">{"6"}</span>
                  <span className="ob-stepper-title">{"תשלום"}</span>
                </li>
              </ol>
            </div>
            <div
              className="ob-scroll"
              style={{
                minWidth: "0",
                minHeight: "0",
                overflowY: "auto",
                padding: "4px 6px 4px 10px",
              }}
            >
              <div className="ob-panel-step" data-step-panel="1">
                <div
                  className="ob-step"
                  style={{ display: "grid", gap: "16px" }}
                >
                  <div style={{ display: "grid", gap: "4px" }}>
                    <h1
                      style={{
                        fontSize: "clamp(23px,2.5vw,31px)",
                        lineHeight: "1.08",
                        margin: "0",
                        fontWeight: "700",
                        letterSpacing: "-.01em",
                      }}
                    >
                      {"בואו נכיר את העסק"}
                    </h1>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "14.5px",
                        lineHeight: "1.5",
                        color: "#5C5A58",
                        maxWidth: "52ch",
                      }}
                    >
                      {
                        "הפרטים שמופיעים באפליקציה ובהודעות ללקוחות. את השם, העיצוב והצבעים אפשר לשנות גם אחר כך."
                      }
                    </p>
                  </div>
                  <div
                    className="ob-two"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(205px,1fr))",
                      gap: "10px 16px",
                    }}
                  >
                    <label style={{ display: "grid", gap: "5px" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#3D3B3A",
                        }}
                      >
                        {"שם מלא"}
                      </span>
                      <input
                        className="ob-input "
                        data-act="on.fullName"
                        data-ev="change"
                        placeholder="דנה לוי"
                        autoComplete="name"
                      />
                    </label>
                    <label style={{ display: "grid", gap: "5px" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#3D3B3A",
                        }}
                      >
                        {"מספר פלאפון"}
                      </span>
                      <input
                        className="ob-input "
                        type="tel"
                        data-act="on.phone"
                        data-ev="change"
                        placeholder="050-000-0000"
                        autoComplete="tel"
                        dir="ltr"
                        style={{ textAlign: "right" }}
                      />
                    </label>
                    <label style={{ display: "grid", gap: "5px" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#3D3B3A",
                        }}
                      >
                        {"שם האפליקציה"}
                      </span>
                      <input
                        className="ob-input "
                        data-act="on.appName"
                        data-ev="change"
                        placeholder="סטודיו נועה"
                      />
                    </label>
                    <label style={{ display: "grid", gap: "5px" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#3D3B3A",
                        }}
                      >
                        {"שם באנגלית "}
                        <span style={{ fontWeight: "400", color: "#7A7876" }}>
                          {"· לשליחת הודעות"}
                        </span>
                      </span>
                      <input
                        className="ob-input "
                        data-act="on.appNameEn"
                        data-ev="change"
                        placeholder="Studio Noa"
                        dir="ltr"
                        style={{ textAlign: "right" }}
                      />
                    </label>
                    <label style={{ display: "grid", gap: "5px" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#3D3B3A",
                        }}
                      >
                        {"אימייל לקבלות"}
                      </span>
                      <input
                        className="ob-input "
                        type="email"
                        data-act="on.email"
                        data-ev="change"
                        placeholder="noa@studio.co.il"
                        autoComplete="email"
                        dir="ltr"
                        style={{ textAlign: "right" }}
                      />
                    </label>
                    <label style={{ display: "grid", gap: "5px" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#3D3B3A",
                        }}
                      >
                        {"סיסמה למנהל/ת"}
                      </span>
                      <input
                        className="ob-input "
                        type="password"
                        data-act="on.adminPassword"
                        data-ev="change"
                        placeholder="לפחות 8 תווים"
                        autoComplete="new-password"
                        dir="ltr"
                        style={{ textAlign: "right" }}
                      />
                    </label>
                    <label style={{ display: "grid", gap: "5px" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#3D3B3A",
                        }}
                      >
                        {"כתובת העסק"}
                      </span>
                      <input
                        className="ob-input "
                        data-act="on.address"
                        data-ev="change"
                        placeholder="הרצל 12, באר שבע"
                        autoComplete="street-address"
                      />
                    </label>
                    <label style={{ display: "grid", gap: "5px" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#3D3B3A",
                        }}
                      >
                        {"תעודת זהות"}
                      </span>
                      <input
                        className="ob-input "
                        inputMode="numeric"
                        data-act="on.idNumber"
                        data-ev="change"
                        placeholder="9 ספרות"
                        dir="ltr"
                        style={{ textAlign: "right" }}
                      />
                    </label>
                  </div>
                  <div style={{ display: "grid", gap: "7px" }}>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#3D3B3A",
                      }}
                    >
                      {"שפת האפליקציה"}
                    </span>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    >
                      <button
                        type="button"
                        className="ob-seg"
                        aria-pressed="true"
                        data-act="lang:he"
                        data-ev="click"
                      >
                        {"עברית"}
                      </button>
                      <button
                        type="button"
                        className="ob-seg"
                        aria-pressed="false"
                        data-act="lang:ru"
                        data-ev="click"
                      >
                        {"русский"}
                      </button>
                      <button
                        type="button"
                        className="ob-seg"
                        aria-pressed="false"
                        data-act="lang:en"
                        data-ev="click"
                      >
                        {"English"}
                      </button>
                      <button
                        type="button"
                        className="ob-seg"
                        aria-pressed="false"
                        data-act="lang:ar"
                        data-ev="click"
                      >
                        {"العربية"}
                      </button>
                    </div>
                  </div>
                  <div
                    className="ob-branch is-off"
                    data-branch="hasError"
                    style={{ display: "contents" }}
                  >
                    <p
                      data-ref="errorBox"
                      style={{
                        margin: "0",
                        fontSize: "13.5px",
                        color: "#E5484D",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <circle cx="12" cy="12" r="9"></circle>
                        <path d="M12 8v4M12 16h.01"></path>
                      </svg>
                    </p>
                  </div>
                </div>
              </div>
              <div className="ob-panel-step is-off" data-step-panel="2">
                <div
                  className="ob-step"
                  style={{ display: "grid", gap: "12px" }}
                >
                  <div style={{ display: "grid", gap: "4px" }}>
                    <h1
                      style={{
                        fontSize: "clamp(23px,2.5vw,31px)",
                        lineHeight: "1.08",
                        margin: "0",
                        fontWeight: "700",
                        letterSpacing: "-.01em",
                      }}
                    >
                      {"איך האפליקציה תיראה?"}
                    </h1>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "14.5px",
                        lineHeight: "1.55",
                        color: "#5C5A58",
                        maxWidth: "52ch",
                      }}
                    >
                      {
                        "את השם, הצבעים והתמונות אפשר להחליף גם אחרי ההשקה — שום דבר כאן לא סופי."
                      }
                    </p>
                  </div>
                  <div
                    className="ob-field"
                    style={{ display: "grid", gap: "10px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13.5px",
                          fontWeight: "600",
                          color: "#171616",
                        }}
                      >
                        {"לוגו"}
                      </span>
                      <div
                        style={{
                          display: "inline-flex",
                          gap: "6px",
                          padding: "3px",
                          borderRadius: "999px",
                          background: "#F1F1EE",
                        }}
                      >
                        <button
                          type="button"
                          className="ob-pill"
                          aria-pressed="true"
                          data-act="pickLogoText"
                          data-ev="click"
                        >
                          {"שם כטקסט"}
                        </button>
                        <button
                          type="button"
                          className="ob-pill"
                          aria-pressed="false"
                          data-act="pickLogoImg"
                          data-ev="click"
                        >
                          {"קובץ לוגו"}
                        </button>
                      </div>
                    </div>
                    <div
                      className="ob-branch"
                      data-branch="logoIsText"
                      style={{ display: "contents" }}
                    >
                      <input
                        className="ob-input"
                        data-act="on.logoText"
                        data-ev="change"
                        placeholder=""
                      />
                    </div>
                    <div
                      className="ob-branch is-off"
                      data-branch="logoIsImg"
                      style={{ display: "contents" }}
                    >
                      <label
                        className="ob-drop"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          minHeight: "76px",
                          padding: "0 18px",
                        }}
                      >
                        <div
                          className="ob-branch is-off"
                          data-branch="hasLogo"
                          style={{ display: "contents" }}
                        >
                          <img
                            data-ref="logoImg"
                            alt=""
                            style={{
                              maxHeight: "46px",
                              maxWidth: "120px",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                        <div
                          className="ob-branch"
                          data-branch="noLogo"
                          style={{ display: "contents" }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 16V4m0 0-4 4m4-4 4 4"></path>
                            <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"></path>
                          </svg>
                          <span>{"גררו לוגו או לחצו · PNG / SVG"}</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          data-act="onLogoFile"
                          data-ev="change"
                        />
                      </label>
                    </div>
                  </div>
                  <div
                    className="ob-field"
                    style={{ display: "grid", gap: "10px" }}
                  >
                    <span
                      style={{
                        fontSize: "13.5px",
                        fontWeight: "600",
                        color: "#171616",
                      }}
                    >
                      {"צבע המותג"}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <button
                        type="button"
                        className="ob-swatch"
                        data-pal="0"
                        aria-pressed="true"
                        aria-label="tori"
                        data-act="pal:0"
                        data-ev="click"
                      ></button>
                      <button
                        type="button"
                        className="ob-swatch"
                        data-pal="1"
                        aria-pressed="false"
                        aria-label="ורוד"
                        data-act="pal:1"
                        data-ev="click"
                      ></button>
                      <button
                        type="button"
                        className="ob-swatch"
                        data-pal="2"
                        aria-pressed="false"
                        aria-label="סגול"
                        data-act="pal:2"
                        data-ev="click"
                      ></button>
                      <button
                        type="button"
                        className="ob-swatch"
                        data-pal="3"
                        aria-pressed="false"
                        aria-label="כתום"
                        data-act="pal:3"
                        data-ev="click"
                      ></button>
                      <button
                        type="button"
                        className="ob-swatch"
                        data-pal="4"
                        aria-pressed="false"
                        aria-label="תכלת"
                        data-act="pal:4"
                        data-ev="click"
                      ></button>
                      <button
                        type="button"
                        className="ob-swatch"
                        data-pal="5"
                        aria-pressed="false"
                        aria-label="זהב"
                        data-act="pal:5"
                        data-ev="click"
                      ></button>
                      <button
                        type="button"
                        className="ob-swatch"
                        data-pal="6"
                        aria-pressed="false"
                        aria-label="שחור"
                        data-act="pal:6"
                        data-ev="click"
                      ></button>
                      <button
                        type="button"
                        className="ob-swatch"
                        data-pal="7"
                        aria-pressed="false"
                        aria-label="מנטה"
                        data-act="pal:7"
                        data-ev="click"
                      ></button>
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "13px",
                          color: "#5C5A58",
                          cursor: "pointer",
                          paddingInlineStart: "8px",
                          marginInlineStart: "2px",
                          borderInlineStart: "1px solid #E3E3E0",
                        }}
                      >
                        <input
                          type="color"
                          defaultValue="#0CFFBE"
                          data-act="onCustomColor"
                          data-ev="change"
                          style={{
                            width: "34px",
                            height: "34px",
                            border: "0",
                            padding: "0",
                            background: "none",
                            borderRadius: "50%",
                            cursor: "pointer",
                          }}
                        />
                        {"צבע משלי"}
                      </label>
                    </div>
                  </div>
                  <div
                    className="ob-field"
                    style={{ display: "grid", gap: "10px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13.5px",
                          fontWeight: "600",
                          color: "#171616",
                        }}
                      >
                        {"תמונות ווידאו"}
                      </span>
                      <span style={{ fontSize: "12.5px", color: "#7A7876" }}>
                        {"עד 10 תמונות, או וידאו של 15 שניות"}
                      </span>
                    </div>
                    <label
                      className="ob-drop"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        minHeight: "76px",
                        padding: "0 18px",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                        <circle cx="9" cy="10" r="1.6"></circle>
                        <path d="m21 15-4.5-4.5L8 19"></path>
                      </svg>
                      <span>{"גררו לכאן תמונות או וידאו, או לחצו לבחירה"}</span>
                      <input
                        type="file"
                        accept="image/*,video/mp4,video/quicktime"
                        multiple={true}
                        data-act="onMediaFiles"
                        data-ev="change"
                      />
                    </label>
                    <div
                      className="ob-branch is-off"
                      data-branch="hasMedia"
                      style={{ display: "contents" }}
                    >
                      <div
                        data-ref="mediaGrid"
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill,minmax(64px,1fr))",
                          gap: "8px",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ob-panel-step is-off" data-step-panel="3">
                <div
                  className="ob-step"
                  style={{ display: "grid", gap: "16px" }}
                >
                  <div style={{ display: "grid", gap: "4px" }}>
                    <h1
                      style={{
                        fontSize: "clamp(23px,2.5vw,31px)",
                        lineHeight: "1.08",
                        margin: "0",
                        fontWeight: "700",
                        letterSpacing: "-.01em",
                      }}
                    >
                      {"מה הלקוחות קובעים אצלך?"}
                    </h1>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "14.5px",
                        lineHeight: "1.5",
                        color: "#5C5A58",
                        maxWidth: "52ch",
                      }}
                    >
                      {
                        "מספיק להתחיל עם השירותים העיקריים — מוסיפים ועורכים בכל רגע מתוך האפליקציה."
                      }
                    </p>
                  </div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0,1fr) 110px 110px 38px",
                        gap: "10px",
                        padding: "0 4px",
                        fontSize: "12.5px",
                        fontWeight: "600",
                        color: "#7A7876",
                      }}
                    >
                      <span>{"שם השירות"}</span>
                      <span>{"זמן (דק׳)"}</span>
                      <span>{"עלות (₪)"}</span>
                      <span></span>
                    </div>
                    <div
                      data-ref="svList"
                      style={{ display: "grid", gap: "10px" }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0,1fr) 110px 110px 38px",
                          gap: "10px",
                          alignItems: "center",
                          animation: "ob-in .3s ease both",
                        }}
                      >
                        <input
                          className="ob-input"
                          data-act="svName:0"
                          data-ev="change"
                          placeholder="למשל: תספורת"
                        />
                        <input
                          className="ob-input"
                          inputMode="numeric"
                          data-act="svDur:0"
                          data-ev="change"
                          placeholder="45"
                          dir="ltr"
                          style={{ textAlign: "center" }}
                        />
                        <input
                          className="ob-input"
                          inputMode="numeric"
                          data-act="svPrice:0"
                          data-ev="change"
                          placeholder="120"
                          dir="ltr"
                          style={{ textAlign: "center" }}
                        />
                        <button
                          type="button"
                          className="ob-icon-btn"
                          data-act="svRemove:0"
                          data-ev="click"
                          aria-label="הסרת שירות"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"></path>
                          </svg>
                        </button>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0,1fr) 110px 110px 38px",
                          gap: "10px",
                          alignItems: "center",
                          animation: "ob-in .3s ease both",
                        }}
                      >
                        <input
                          className="ob-input"
                          data-act="svName:1"
                          data-ev="change"
                          placeholder="למשל: תספורת"
                        />
                        <input
                          className="ob-input"
                          inputMode="numeric"
                          data-act="svDur:1"
                          data-ev="change"
                          placeholder="45"
                          dir="ltr"
                          style={{ textAlign: "center" }}
                        />
                        <input
                          className="ob-input"
                          inputMode="numeric"
                          data-act="svPrice:1"
                          data-ev="change"
                          placeholder="120"
                          dir="ltr"
                          style={{ textAlign: "center" }}
                        />
                        <button
                          type="button"
                          className="ob-icon-btn"
                          data-act="svRemove:1"
                          data-ev="click"
                          aria-label="הסרת שירות"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="ob-add"
                        data-act="addService"
                        data-ev="click"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        >
                          <path d="M12 5v14M5 12h14"></path>
                        </svg>
                        {"הוספת שירות"}
                      </button>
                    </div>
                  </div>
                  <div
                    className="ob-branch is-off"
                    data-branch="hasError"
                    style={{ display: "contents" }}
                  >
                    <p
                      style={{
                        margin: "0",
                        fontSize: "13.5px",
                        color: "#E5484D",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div className="ob-panel-step is-off" data-step-panel="4">
                <div
                  className="ob-step"
                  style={{ display: "grid", gap: "16px" }}
                >
                  <div style={{ display: "grid", gap: "4px" }}>
                    <h1
                      style={{
                        fontSize: "clamp(23px,2.5vw,31px)",
                        lineHeight: "1.08",
                        margin: "0",
                        fontWeight: "700",
                        letterSpacing: "-.01em",
                      }}
                    >
                      {"חבילת SMS"}
                    </h1>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "14.5px",
                        lineHeight: "1.5",
                        color: "#5C5A58",
                        maxWidth: "54ch",
                      }}
                    >
                      {"כל מנוי מקבל "}
                      <strong style={{ color: "#171616" }}>
                        {"1,000 הודעות חינם בחודש"}
                      </strong>
                      {
                        ", והמכסה מתאפסת בתחילת כל חודש. כאן בוחרים כמה הודעות להוסיף מעל זה."
                      }
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "9px",
                      padding: "11px 13px",
                      borderRadius: "13px",
                      background: "#F4F9F6",
                      border: "1px solid #DDEBE4",
                    }}
                  >
                    <span
                      style={{
                        flex: "0 0 auto",
                        color: "#0F7A5C",
                        marginTop: "1px",
                      }}
                    >
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
                        <circle cx="12" cy="12" r="9"></circle>
                        <path d="M12 8h.01M11 12h1v4h1"></path>
                      </svg>
                    </span>
                    <span
                      style={{
                        fontSize: "12.5px",
                        lineHeight: "1.5",
                        color: "#3D3B3A",
                      }}
                    >
                      {"חבילות ה-SMS הן "}
                      <strong>{"רכישה חד-פעמית"}</strong>
                      {
                        " ואינן מתווספות למנוי החודשי. המנוי נשאר 299 ₪ + מע״מ בחודש."
                      }
                    </span>
                  </div>
                  <div
                    className="ob-two"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: "12px",
                    }}
                  >
                    <button
                      type="button"
                      className="ob-pkg"
                      data-pop="false"
                      data-free="true"
                      aria-pressed="true"
                      data-act="pkg:0"
                      data-ev="click"
                    >
                      <span className="ob-pkg-tag">{"כלול במנוי"}</span>
                      <span
                        style={{
                          fontSize: "25px",
                          fontWeight: "700",
                          lineHeight: "1",
                          letterSpacing: "-.01em",
                        }}
                      >
                        {"1,000"}
                      </span>
                      <span style={{ fontSize: "12.5px", color: "#7A7876" }}>
                        {"הודעות"}
                      </span>
                      <span className="ob-pkg-price">{"‎חינם"}</span>
                      <span
                        style={{
                          fontSize: "11.5px",
                          lineHeight: "1.35",
                          color: "#7A7876",
                          textWrap: "balance",
                        }}
                      >
                        {"‎מתאפס ל־1,000 בכל חודש"}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="ob-pkg"
                      data-pop="true"
                      data-free="false"
                      aria-pressed="false"
                      data-act="pkg:1"
                      data-ev="click"
                    >
                      <span className="ob-pkg-tag">{"הפופולרי ביותר"}</span>
                      <span
                        style={{
                          fontSize: "25px",
                          fontWeight: "700",
                          lineHeight: "1",
                          letterSpacing: "-.01em",
                        }}
                      >
                        {"6,000"}
                      </span>
                      <span style={{ fontSize: "12.5px", color: "#7A7876" }}>
                        {"הודעות"}
                      </span>
                      <span className="ob-pkg-price">{"‎‎399 ₪"}</span>
                      <span
                        style={{
                          fontSize: "11.5px",
                          lineHeight: "1.35",
                          color: "#7A7876",
                          textWrap: "balance",
                        }}
                      >
                        {"‎‎1,000 חינם + 5,000 · 0.08 ₪ להודעה"}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="ob-pkg"
                      data-pop="false"
                      data-free="false"
                      aria-pressed="false"
                      data-act="pkg:2"
                      data-ev="click"
                    >
                      <span className="ob-pkg-tag">{"לעסק עמוס"}</span>
                      <span
                        style={{
                          fontSize: "25px",
                          fontWeight: "700",
                          lineHeight: "1",
                          letterSpacing: "-.01em",
                        }}
                      >
                        {"11,000"}
                      </span>
                      <span style={{ fontSize: "12.5px", color: "#7A7876" }}>
                        {"הודעות"}
                      </span>
                      <span className="ob-pkg-price">{"‎‎699 ₪"}</span>
                      <span
                        style={{
                          fontSize: "11.5px",
                          lineHeight: "1.35",
                          color: "#7A7876",
                          textWrap: "balance",
                        }}
                      >
                        {"‎‎1,000 חינם + 10,000 · 0.07 ₪ להודעה"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="ob-panel-step is-off" data-step-panel="5">
                <div
                  className="ob-step"
                  style={{ display: "grid", gap: "20px" }}
                >
                  <div style={{ display: "grid", gap: "4px" }}>
                    <h1
                      style={{
                        fontSize: "clamp(23px,2.5vw,31px)",
                        lineHeight: "1.08",
                        margin: "0",
                        fontWeight: "700",
                        letterSpacing: "-.01em",
                      }}
                    >
                      {"הסכם השירות"}
                    </h1>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "14.5px",
                        lineHeight: "1.5",
                        color: "#5C5A58",
                        maxWidth: "52ch",
                      }}
                    >
                      {"קצר וברור. אין התחייבות לתקופה — מתנתקים מתי שרוצים."}
                    </p>
                  </div>
                  <div
                    className="ob-scroll"
                    data-ref="contractRef"
                    data-act="onContractScroll"
                    data-ev="scroll"
                    style={{
                      maxHeight: "300px",
                      border: "1px solid #E3E3E0",
                      borderRadius: "16px",
                      padding: "20px 22px",
                      background: "#FAFAF8",
                      fontSize: "14px",
                      lineHeight: "1.75",
                      color: "#3D3B3A",
                      display: "grid",
                      gap: "12px",
                    }}
                  >
                    <strong style={{ color: "#171616", fontSize: "15px" }}>
                      {"הסכם שימוש בשירות tori"}
                    </strong>
                    <p style={{ margin: "0" }}>
                      <strong>{"1. השירות."}</strong>
                      {
                        " tori מספקת לעסק אפליקציה ממותגת לניהול תורים ב־App Store וב־Google Play, כולל יומן, תזכורות, תשלומים וניהול לקוחות. ההקמה מתבצעת על ידי tori תוך 72 שעות מקבלת הפרטים והלוגו."
                      }
                    </p>
                    <p style={{ margin: "0" }}>
                      <strong>{"2. תמורה."}</strong>
                      {
                        " דמי שימוש חודשיים קבועים בסך 299 ₪ בתוספת מע״מ כדין, ללא דמי הקמה. חבילות SMS נרכשות בנפרד ואינן פגות."
                      }
                    </p>
                    <p style={{ margin: "0" }}>
                      <strong>{"3. תקופה וביטול."}</strong>
                      {
                        " ההסכם מתחדש מדי חודש. ניתן לבטל בכל עת בהודעה בכתב; הביטול ייכנס לתוקף בסוף תקופת החיוב הנוכחית, ללא קנסות."
                      }
                    </p>
                    <p style={{ margin: "0" }}>
                      <strong>{"4. תוכן ומיתוג."}</strong>
                      {
                        " העסק מצהיר כי הלוגו, התמונות והתכנים שהוא מעלה בבעלותו או ברשותו, ומעניק ל־tori רישיון להשתמש בהם לצורך הפעלת האפליקציה בלבד."
                      }
                    </p>
                    <p style={{ margin: "0" }}>
                      <strong>{"5. פרטיות ומידע."}</strong>
                      {
                        " פרטי הלקוחות של העסק נשמרים בשרתים מאובטחים בישראל, בהתאם לחוק הגנת הפרטיות. tori לא תעשה במידע שימוש מלבד לצורך מתן השירות."
                      }
                    </p>
                    <p style={{ margin: "0" }}>
                      <strong>{"6. זמינות ותמיכה."}</strong>
                      {
                        " tori תפעל לזמינות של 99.5% ותספק תמיכה אנושית בימים א׳–ה׳ בין 9:00–17:00."
                      }
                    </p>
                    <p style={{ margin: "0" }}>
                      <strong>{"7. חנויות האפליקציות."}</strong>
                      {
                        " פרסום האפליקציה כפוף לאישור Apple ו־Google. tori תטפל בתהליך האישור מול החנויות."
                      }
                    </p>
                    <p style={{ margin: "0" }}>
                      <strong>{"8. שינויים."}</strong>
                      {
                        " שם האפליקציה, העיצוב, הצבעים והשירותים ניתנים לשינוי בכל עת מתוך ממשק הניהול, ללא עלות נוספת."
                      }
                    </p>
                    <p style={{ margin: "0", color: "#7A7876" }}>
                      {"עדכון אחרון: ספטמבר 2026"}
                    </p>
                  </div>
                  <label
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      padding: "16px 18px",
                      borderRadius: "14px",
                      border: "1px solid #E3E3E0",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="ob-check"
                      data-ref="agree"
                      data-act="onAgree"
                      data-ev="change"
                    />
                    <span
                      style={{
                        fontSize: "14.5px",
                        lineHeight: "1.5",
                        color: "#171616",
                      }}
                    >
                      {
                        "קראתי את נוסח הסכם השירות להדגמה. האישור כאן אינו יוצר מנוי או התחייבות."
                      }
                      <span
                        data-ref="contractHint"
                        style={{
                          display: "block",
                          fontSize: "12.5px",
                          color: "#7A7876",
                          marginTop: "2px",
                        }}
                      >
                        {"גללו את ההסכם עד הסוף לפני האישור."}
                      </span>
                    </span>
                  </label>
                  <div
                    className="ob-branch is-off"
                    data-branch="hasError"
                    style={{ display: "contents" }}
                  >
                    <p
                      style={{
                        margin: "0",
                        fontSize: "13.5px",
                        color: "#E5484D",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div className="ob-panel-step is-off" data-step-panel="6">
                <div
                  className="ob-step"
                  style={{ display: "grid", gap: "16px" }}
                >
                  <div style={{ display: "grid", gap: "4px" }}>
                    <h1
                      style={{
                        fontSize: "clamp(23px,2.5vw,31px)",
                        lineHeight: "1.08",
                        margin: "0",
                        fontWeight: "700",
                        letterSpacing: "-.01em",
                      }}
                    >
                      {"תשלום והפעלה"}
                    </h1>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "14.5px",
                        lineHeight: "1.5",
                        color: "#5C5A58",
                        maxWidth: "52ch",
                      }}
                    >
                      {
                        "זו סביבת הדגמה — פרטי כרטיס אינם נאספים ולא מתבצע חיוב. אפשר לשמור את העסק ולהיכנס לממשק הניהול."
                      }
                    </p>
                  </div>
                  <div
                    className="ob-pay"
                    style={{
                      display: "grid",
                      gridTemplateRows: "auto minmax(0,1fr)",
                      gap: "14px",
                      minHeight: "0",
                    }}
                  >
                    <div style={{ display: "grid", gap: "9px", minWidth: "0" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit,minmax(220px,1fr))",
                          gap: "10px",
                        }}
                      >
                        <label style={{ display: "grid", gap: "5px" }}>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#3D3B3A",
                            }}
                          >
                            {"שם בעל/ת הכרטיס"}
                          </span>
                          <input
                            className="ob-input "
                            data-act="on.cardName"
                            data-ev="change"
                            placeholder="NOA BARAK"
                            autoComplete="cc-name"
                            dir="ltr"
                            style={{
                              textAlign: "right",
                              letterSpacing: ".04em",
                            }}
                            disabled
                            aria-label="שם בעל הכרטיס — להמחשה בלבד"
                          />
                        </label>
                        <label style={{ display: "grid", gap: "5px" }}>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#3D3B3A",
                            }}
                          >
                            {"מספר כרטיס"}
                          </span>
                          <input
                            className="ob-input "
                            inputMode="numeric"
                            data-act="on.cardNumber"
                            data-ev="change"
                            placeholder="0000 0000 0000 0000"
                            autoComplete="cc-number"
                            dir="ltr"
                            style={{
                              textAlign: "right",
                              letterSpacing: ".06em",
                            }}
                            disabled
                            aria-label="שדה תשלום להמחשה בלבד"
                          />
                        </label>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: "10px",
                        }}
                      >
                        <label style={{ display: "grid", gap: "5px" }}>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#3D3B3A",
                            }}
                          >
                            {"תוקף"}
                          </span>
                          <input
                            className="ob-input "
                            inputMode="numeric"
                            data-act="on.cardExp"
                            data-ev="change"
                            placeholder="MM/YY"
                            autoComplete="cc-exp"
                            dir="ltr"
                            style={{ textAlign: "center" }}
                            disabled
                            aria-label="שדה תשלום להמחשה בלבד"
                          />
                        </label>
                        <label style={{ display: "grid", gap: "5px" }}>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#3D3B3A",
                            }}
                          >
                            {"CVV"}
                          </span>
                          <input
                            className="ob-input "
                            inputMode="numeric"
                            data-act="on.cardCvv"
                            data-ev="change"
                            placeholder="123"
                            autoComplete="cc-csc"
                            dir="ltr"
                            style={{ textAlign: "center" }}
                            disabled
                            aria-label="שדה תשלום להמחשה בלבד"
                          />
                        </label>
                        <label style={{ display: "grid", gap: "5px" }}>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#3D3B3A",
                            }}
                          >
                            {"ת.ז."}
                          </span>
                          <input
                            className="ob-input"
                            inputMode="numeric"
                            data-act="on.idNumber"
                            data-ev="change"
                            dir="ltr"
                            style={{ textAlign: "center" }}
                          />
                        </label>
                      </div>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "7px",
                          fontSize: "12.5px",
                          color: "#7A7876",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="4"
                            y="11"
                            width="16"
                            height="10"
                            rx="2"
                          ></rect>
                          <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
                        </svg>
                        {"תשלום יופעל לאחר חיבור לספק סליקה"}
                      </span>
                    </div>
                    <div
                      className="ob-summary"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0,1fr) minmax(0,.85fr)",
                        gap: "10px 26px",
                        padding: "20px 22px",
                        borderRadius: "20px",
                        background: "#171616",
                        color: "#fff",
                        alignSelf: "end",
                        alignContent: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gap: "7px",
                          alignContent: "start",
                          minWidth: "0",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#0CFFBE",
                          }}
                        >
                          {"סיכום"}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            fontSize: "13.5px",
                          }}
                        >
                          <span style={{ color: "rgba(255,255,255,.72)" }}>
                            {"tori · מנוי חודשי"}
                          </span>
                          <span
                            style={{ fontWeight: "600", whiteSpace: "nowrap" }}
                          >
                            {"‎299 ₪"}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            fontSize: "13.5px",
                          }}
                        >
                          <span style={{ color: "rgba(255,255,255,.72)" }}>
                            {"SMS · "}
                            <span data-ref="smsCount">{"כלול במנוי"}</span>
                            {" · חד-פעמי"}
                          </span>
                          <span
                            data-ref="smsPrice"
                            style={{ fontWeight: "600", whiteSpace: "nowrap" }}
                          >
                            {"‎0 ₪"}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            fontSize: "13.5px",
                          }}
                        >
                          <span style={{ color: "rgba(255,255,255,.72)" }}>
                            {"דמי הקמה"}
                          </span>
                          <span style={{ fontWeight: "600", color: "#BFFF51" }}>
                            {"‎0 ₪"}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            fontSize: "13.5px",
                          }}
                        >
                          <span style={{ color: "rgba(255,255,255,.72)" }}>
                            {"מע״מ 18%"}
                          </span>
                          <span
                            data-ref="vat"
                            style={{ fontWeight: "600", whiteSpace: "nowrap" }}
                          >
                            {"‎54 ₪"}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gap: "10px",
                          alignContent: "center",
                          minWidth: "0",
                          paddingInlineStart: "26px",
                          borderInlineStart: "1px solid rgba(255,255,255,.14)",
                        }}
                      >
                        <div style={{ display: "grid", gap: "2px" }}>
                          <span
                            style={{
                              fontSize: "13px",
                              color: "rgba(255,255,255,.6)",
                            }}
                          >
                            {"לתשלום היום"}
                          </span>
                          <span
                            data-ref="total"
                            style={{
                              fontSize: "32px",
                              fontWeight: "700",
                              letterSpacing: "-.02em",
                              lineHeight: "1",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {"‎353 ₪"}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="ob-primary ob-primary-inv"
                          style={{ width: "100%", justifyContent: "center" }}
                          data-ref="nextBtnPay"
                          data-act="next"
                          data-ev="click"
                        >
                          {"לשלב הבא"}
                          <span
                            style={{
                              display: "inline-grid",
                              placeItems: "center",
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              background: "#171616",
                              color: "#BFFF51",
                            }}
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m12 19-7-7 7-7M19 12H5"></path>
                            </svg>
                          </span>
                        </button>
                        <span
                          style={{
                            fontSize: "11.5px",
                            color: "rgba(255,255,255,.55)",
                            lineHeight: "1.45",
                          }}
                        >
                          {
                            "חבילת ה-SMS היא רכישה חד-פעמית. מהחודש הבא ‎299 ₪ + מע״מ בחודש, בלי התחייבות."
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="ob-branch is-off"
                    data-branch="hasError"
                    style={{ display: "contents" }}
                  >
                    <p
                      style={{
                        margin: "0",
                        fontSize: "13.5px",
                        color: "#E5484D",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                className="ob-branch is-off"
                data-branch="isDone"
                style={{ display: "contents" }}
              >
                <div
                  className="ob-step"
                  style={{
                    display: "grid",
                    justifyItems: "center",
                    textAlign: "center",
                    gap: "18px",
                    padding: "40px 0",
                  }}
                >
                  <span
                    style={{
                      width: "84px",
                      height: "84px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#BFFF51,#0CFFBE)",
                      display: "grid",
                      placeItems: "center",
                      color: "#171616",
                      animation: "ob-pop .6s cubic-bezier(.34,1.42,.64,1) both",
                    }}
                  >
                    <svg
                      width="38"
                      height="38"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12 5 5L20 7"></path>
                    </svg>
                  </span>
                  <h1
                    style={{
                      fontSize: "clamp(28px,3.2vw,40px)",
                      lineHeight: "1.1",
                      margin: "0",
                      fontWeight: "700",
                      letterSpacing: "-.01em",
                    }}
                  >
                    {"העסק שלך מוכן להדגמה"}
                  </h1>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "16px",
                      lineHeight: "1.65",
                      color: "#5C5A58",
                      maxWidth: "46ch",
                    }}
                  >
                    {
                      "הפרטים והשירותים נשמרו בדפדפן הזה. אפשר להיכנס לממשק הניהול ולנסות את האפליקציה. לא בוצע חיוב ולא נשלחה בקשה לחנויות."
                    }
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: "10px",
                      marginTop: "8px",
                    }}
                  >
                    <a
                      href="/dashboard"
                      className="ob-primary"
                      style={{ textDecoration: "none" }}
                    >
                      {"לממשק הניהול"}
                      <span
                        style={{
                          display: "inline-grid",
                          placeItems: "center",
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background: "#BFFF51",
                          color: "#171616",
                        }}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m12 19-7-7 7-7M19 12H5"></path>
                        </svg>
                      </span>
                    </a>
                    <a
                      href="https://wa.me/972535575303"
                      className="ob-ghost"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        textDecoration: "none",
                      }}
                    >
                      {"שאלות? וואטסאפ"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              <p
                data-ref="errorLine"
                style={{
                  display: "none",
                  margin: "0",
                  fontSize: "13.5px",
                  color: "#E5484D",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M12 8v4M12 16h.01"></path>
                </svg>
                <span data-ref="errorText"></span>
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  paddingTop: "8px",
                  borderTop: "1px solid #EEEEEB",
                }}
              >
                <div>
                  <div
                    className="ob-branch is-off"
                    data-branch="canBack"
                    style={{ display: "contents" }}
                  >
                    <button
                      type="button"
                      className="ob-ghost"
                      data-act="back"
                      data-ev="click"
                    >
                      {"חזרה"}
                    </button>
                  </div>
                </div>
                <div
                  className="ob-nav-cta"
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <button
                    type="button"
                    className="ob-primary"
                    data-ref="nextBtn"
                    data-act="next"
                    data-ev="click"
                  >
                    {"לשלב הבא"}
                    <span
                      style={{
                        display: "inline-grid",
                        placeItems: "center",
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        background: "#BFFF51",
                        color: "#171616",
                      }}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m12 19-7-7 7-7M19 12H5"></path>
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <aside
            className="ob-panel"
            style={{
              position: "relative",
              background: "#171616",
              overflow: "hidden",
              minWidth: "0",
            }}
          >
            <video
              data-ref="panelVideoRef"
              src="/assets/media/onboarding-panel.mp4"
              autoPlay={true}
              loop={true}
              playsInline={true}
              preload="auto"
              className="ob-panel-video"
              style={{
                position: "absolute",
                inset: "-2%",
                width: "104%",
                height: "104%",
                objectFit: "cover",
                display: "block",
              }}
              muted
            ></video>
          </aside>
        </div>
      </div>
      <footer
        style={{
          position: "relative",
          zIndex: "2",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          flexWrap: "wrap",
          padding: "14px clamp(16px,4vw,40px) 26px",
          fontSize: "13px",
          color: "#5C5A58",
        }}
      >
        <span>{"© 2026 tori · כל הזכויות שמורות"}</span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          <a href="/">{"דף הבית"}</a>
          <a href="https://wa.me/972535575303">{"תמיכה בוואטסאפ"}</a>
          <a href="mailto:hello@tori.co.il">{"hello@tori.co.il"}</a>
        </span>
      </footer>
    </div>
  );
}
