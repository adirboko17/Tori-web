export default function BrandSection() {
  return (
    <section
      id="brand"
      style={{
        background: "var(--surface-page)",
        padding: "86px 24px",
        borderTop: "1px solid var(--line-subtle)",
        borderBottom: "1px solid var(--line-subtle)",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div
          style={{
            maxWidth: "46ch",
            margin: "0 auto 34px",
            textAlign: "center",
          }}
          data-reveal="1"
        >
          <h2
            style={{
              fontFamily: "'Google Sans','Open Sans',system-ui,sans-serif",
              fontSize: "clamp(30px,4vw,50px)",
              lineHeight: "1.1",
              color: "var(--ink-900)",
              margin: "0 0 16px",
            }}
          >
            {"נראה כמו שלך,"}
            <br />
            {"כי זה באמת "}
            <span className="tori-word">{"שלך."}</span>
          </h2>
          <p
            style={{
              fontSize: "17px",
              lineHeight: "1.6",
              color: "var(--ink-600)",
              margin: "0 auto",
              maxWidth: "44ch",
            }}
          >
            {
              "שנו את השם, בחרו צבע, העלו לוגו ותראו את האפליקציה שלכם מתעדכנת מיד. זה בדיוק מה שהלקוחות שלכם יורידו."
            }
          </p>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(22px,3vw,44px)",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(12px,2vw,26px) 0",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: "1 1 380px",
              minWidth: "0",
              maxWidth: "452px",
              display: "grid",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--ink-200)",
                borderRadius: "20px",
                padding: "22px",
                boxShadow: "var(--shadow-md)",
                display: "grid",
                gap: "20px",
              }}
            >
              <div style={{ display: "grid", gap: "10px" }}>
                <span className="tori-field-label">{"צבע המותג"}</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <button
                    type="button"
                    className="tori-pal"
                    data-on="true"
                    data-act="pick0"
                    data-ev="click"
                    aria-label="ירוק tori"
                  >
                    <span
                      style={{
                        background: "linear-gradient(135deg,#BFFF51,#0CFFBE)",
                      }}
                    ></span>
                  </button>
                  <button
                    type="button"
                    className="tori-pal"
                    data-on="false"
                    data-act="pick1"
                    data-ev="click"
                    aria-label="ורוד"
                  >
                    <span
                      style={{
                        background: "linear-gradient(135deg,#FF2E93,#FF8ACF)",
                      }}
                    ></span>
                  </button>
                  <button
                    type="button"
                    className="tori-pal"
                    data-on="false"
                    data-act="pick2"
                    data-ev="click"
                    aria-label="סגול"
                  >
                    <span
                      style={{
                        background: "linear-gradient(135deg,#7C3AED,#A855F7)",
                      }}
                    ></span>
                  </button>
                  <button
                    type="button"
                    className="tori-pal"
                    data-on="false"
                    data-act="pick3"
                    data-ev="click"
                    aria-label="אדום"
                  >
                    <span
                      style={{
                        background: "linear-gradient(135deg,#F5433C,#FF8A6B)",
                      }}
                    ></span>
                  </button>
                  <button
                    type="button"
                    className="tori-pal"
                    data-on="false"
                    data-act="pick4"
                    data-ev="click"
                    aria-label="תכלת"
                  >
                    <span
                      style={{
                        background: "linear-gradient(135deg,#0EA5E9,#67D5FF)",
                      }}
                    ></span>
                  </button>
                  <button
                    type="button"
                    className="tori-pal"
                    data-on="false"
                    data-act="pick5"
                    data-ev="click"
                    aria-label="כתום"
                  >
                    <span
                      style={{
                        background: "linear-gradient(135deg,#F59E0B,#FCD34D)",
                      }}
                    ></span>
                  </button>
                </div>
              </div>
              <div style={{ display: "grid", gap: "10px" }}>
                <span className="tori-field-label">{"הלוגו של העסק"}</span>
                <div className="tori-seg2">
                  <button
                    type="button"
                    data-on="false"
                    data-act="pickUpload"
                    data-ev="click"
                  >
                    {"העלאת לוגו"}
                  </button>
                  <button
                    type="button"
                    data-on="true"
                    data-act="pickText"
                    data-ev="click"
                  >
                    {"השם כלוגו"}
                  </button>
                </div>
                <div
                  className="tori-branch is-off"
                  data-branch="modeUpload"
                  style={{ display: "contents" }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <label className="tori-upload">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" x2="12" y1="3" y2="15"></line>
                      </svg>
                      <span>{"בחירת קובץ"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        data-act="onLogo"
                        data-ev="change"
                      />
                    </label>
                    <div
                      className="tori-branch is-off"
                      data-branch="hasLogo"
                      style={{ display: "contents" }}
                    >
                      <button
                        className="ths1"
                        type="button"
                        data-act="clearLogo"
                        data-ev="click"
                        style={{
                          all: "unset",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "var(--ink-500)",
                        }}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                        {"הסרה"}
                      </button>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--ink-400)" }}>
                      {"PNG · JPG · SVG"}
                    </span>
                  </div>
                </div>
                <div
                  className="tori-branch"
                  data-branch="modeText"
                  style={{ display: "contents" }}
                >
                  <div style={{ display: "grid", gap: "10px" }}>
                    <span className="tori-field-wrap">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="tori-field-ico"
                      >
                        <polyline points="4 7 4 4 20 4 20 7"></polyline>
                        <line x1="9" x2="15" y1="20" y2="20"></line>
                        <line x1="12" x2="12" y1="4" y2="20"></line>
                      </svg>
                      <input
                        type="text"
                        defaultValue="ליאת ציפורניים"
                        data-act="onName"
                        data-ev="input"
                        placeholder="ליאת ציפורניים"
                        maxLength="22"
                      />
                    </span>
                    <div style={{ display: "flex", gap: "7px" }}>
                      <button
                        type="button"
                        className="tori-font"
                        data-on="true"
                        data-act="font0"
                        data-ev="click"
                        title="Varela Round"
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-tenant-round)",
                            fontSize: "17px",
                          }}
                        >
                          {"עגול"}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="tori-font"
                        data-on="false"
                        data-act="font1"
                        data-ev="click"
                        title="Secular One"
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-tenant-heavy)",
                            fontSize: "17px",
                          }}
                        >
                          {"כבד"}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="tori-font"
                        data-on="false"
                        data-act="font2"
                        data-ev="click"
                        title="Suez One"
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-tenant-bold)",
                            fontSize: "17px",
                          }}
                        >
                          {"בולט"}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="tori-font"
                        data-on="false"
                        data-act="font3"
                        data-ev="click"
                        title="Amatic SC"
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-tenant-script)",
                            fontSize: "21px",
                          }}
                        >
                          {"כתב יד"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gap: "9px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <span className="tori-field-label">{"גודל"}</span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--ink-500)",
                      fontFeatureSettings: "'tnum' 1",
                    }}
                    data-ref="sizeLabel"
                  >
                    {"100%"}
                  </span>
                </div>
                <input
                  type="range"
                  className="tori-range"
                  min="60"
                  max="150"
                  step="5"
                  defaultValue="100"
                  data-act="onSize"
                  data-ev="input"
                  aria-label="גודל הלוגו"
                />
              </div>
            </div>
            <p
              style={{
                fontSize: "13px",
                lineHeight: "1.55",
                color: "var(--ink-500)",
                margin: "0",
                maxWidth: "38ch",
              }}
            >
              {"הכל נשאר במחשב שלך — התמונה לא נשלחת לשום מקום."}
            </p>
          </div>
          <div
            style={{
              position: "relative",
              flex: "0 0 auto",
              maxWidth: "100%",
              minWidth: "0",
              display: "grid",
              justifyItems: "center",
              gap: "14px",
            }}
            data-reveal="2"
          >
            <div
              className="tori-live-phone"
              data-ref="phoneRef"
              style={{
                position: "relative",
                "--c1": "#0CFFBE",
                "--c2": "#BFFF51",
                "--fg": "#171616",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: "-16% -22%",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(closest-side,rgba(12,255,190,.55),rgba(191,255,81,.34) 55%,rgba(191,255,81,0) 78%)",
                  filter: "blur(26px)",
                  zIndex: "0",
                  pointerEvents: "none",
                }}
              ></span>
              <div
                className="tori-brand-phone"
                style={{
                  position: "relative",
                  zIndex: "1",
                  width: "322px",
                  background: "#1A1A1C",
                  borderRadius: "46px",
                  padding: "9px",
                  boxShadow: "0 34px 70px rgba(23,22,22,.28)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    background: "#EFEAE4",
                    borderRadius: "38px",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "relative", height: "236px" }}>
                    <img
                      src="/assets/imagery/work-mosaic.jpg"
                      alt=""
                      style={{
                        position: "absolute",
                        inset: "0",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: "0",
                        background:
                          "linear-gradient(180deg,rgba(20,18,18,.42) 0%,rgba(20,18,18,.05) 42%,rgba(20,18,18,0) 100%)",
                      }}
                    ></div>
                    <div
                      style={{
                        position: "absolute",
                        top: "9px",
                        insetInline: "0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 18px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#fff",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="8" r="5"></circle>
                          <path d="M20 21a8 8 0 0 0-16 0"></path>
                        </svg>
                        {"16:45"}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          gap: "4px",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            width: "16px",
                            height: "8px",
                            border: "1.2px solid #fff",
                            borderRadius: "2px",
                            position: "relative",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              inset: "1.2px",
                              insetInlineEnd: "5px",
                              background: "#fff",
                              borderRadius: "1px",
                            }}
                          ></span>
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: "30px",
                        insetInline: "12px",
                        height: "130px",
                        display: "grid",
                        placeItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        className="tori-branch is-off"
                        data-branch="showLogoImg"
                        style={{ display: "contents" }}
                      >
                        <img
                          data-ref="logoImg"
                          alt=""
                          style={{
                            maxWidth: "calc(150px * var(--logo-scale,1))",
                            maxHeight: "calc(54px * var(--logo-scale,1))",
                            objectFit: "contain",
                            filter: "drop-shadow(0 2px 10px rgba(0,0,0,.45))",
                          }}
                        />
                      </div>
                      <div
                        className="tori-branch"
                        data-branch="showLogoText"
                        style={{ display: "contents" }}
                      >
                        <span
                          data-ref="logoText"
                          style={{
                            fontFamily:
                              "var(--logo-font,var(--font-tenant-round))",
                            fontSize: "calc(27px * var(--logo-scale,1))",
                            lineHeight: "1.08",
                            color: "var(--white)",
                            maxWidth: "230px",
                            textAlign: "center",
                            background: "rgba(23,22,22,.58)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            borderRadius: "16px",
                            padding: "6px 14px 8px",
                          }}
                        >
                          {"ליאת ציפורניים"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      marginTop: "-16px",
                      background: "#F4F1EC",
                      borderRadius: "22px 22px 0 0",
                      padding: "14px 12px 12px",
                      display: "grid",
                      gap: "9px",
                    }}
                  >
                    <div
                      style={{
                        height: "4px",
                        width: "38px",
                        borderRadius: "99px",
                        background: "rgba(23,22,22,.16)",
                        justifySelf: "center",
                        marginBottom: "2px",
                      }}
                    ></div>
                    <div
                      style={{
                        position: "relative",
                        borderRadius: "16px",
                        background:
                          "linear-gradient(90deg,var(--c2),var(--c1))",
                        padding: "12px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 8px 20px rgba(23,22,22,.16)",
                        color: "var(--fg)",
                      }}
                    >
                      <span style={{ display: "grid", gap: "1px" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "500",
                            opacity: ".85",
                          }}
                        >
                          {"יום חמישי"}
                        </span>
                        <span
                          style={{
                            fontSize: "19px",
                            fontWeight: "600",
                            lineHeight: "1.1",
                          }}
                        >
                          {"10 בספט׳"}
                        </span>
                      </span>
                      <span
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,.9)",
                          display: "grid",
                          placeItems: "center",
                          lineHeight: "1",
                          boxShadow: "0 4px 10px rgba(23,22,22,.14)",
                        }}
                      >
                        <span
                          style={{ display: "grid", justifyItems: "center" }}
                        >
                          <span
                            style={{
                              fontSize: "15px",
                              fontWeight: "700",
                              color: "var(--ink-900)",
                            }}
                          >
                            {"1"}
                          </span>
                          <span
                            style={{ fontSize: "7px", color: "var(--ink-500)" }}
                          >
                            {"תורים"}
                          </span>
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        background: "var(--white)",
                        borderRadius: "14px",
                        padding: "11px 12px",
                        display: "grid",
                        gap: "8px",
                        boxShadow: "0 2px 8px rgba(23,22,22,.07)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        <span style={{ color: "var(--c1)" }}>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "var(--ink-800)",
                          }}
                        >
                          {"התור הבא שלך"}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                          borderTop: "1px solid var(--ink-100)",
                          paddingTop: "8px",
                        }}
                      >
                        <span style={{ color: "var(--ink-400)" }}>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <rect
                              width="18"
                              height="18"
                              x="3"
                              y="4"
                              rx="2"
                            ></rect>
                            <path d="M3 10h18"></path>
                          </svg>
                        </span>
                        <span
                          style={{ fontSize: "11px", color: "var(--ink-500)" }}
                        >
                          {"אין תורים קרובים היום"}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3,1fr)",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          background: "var(--white)",
                          borderRadius: "13px",
                          padding: "9px 6px 8px",
                          display: "grid",
                          justifyItems: "center",
                          gap: "5px",
                          boxShadow: "0 2px 8px rgba(23,22,22,.08)",
                        }}
                      >
                        <span
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: "var(--c1)",
                            display: "grid",
                            placeItems: "center",
                            color: "var(--fg)",
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: "600",
                            color: "var(--ink-800)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {"לקוחות"}
                        </span>
                      </div>
                      <div
                        style={{
                          background: "var(--white)",
                          borderRadius: "13px",
                          padding: "9px 6px 8px",
                          display: "grid",
                          justifyItems: "center",
                          gap: "5px",
                          boxShadow: "0 2px 8px rgba(23,22,22,.08)",
                        }}
                      >
                        <span
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: "var(--c1)",
                            display: "grid",
                            placeItems: "center",
                            color: "var(--fg)",
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                          </svg>
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: "600",
                            color: "var(--ink-800)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {"הודעת שידור"}
                        </span>
                      </div>
                      <div
                        style={{
                          background: "var(--white)",
                          borderRadius: "13px",
                          padding: "9px 6px 8px",
                          display: "grid",
                          justifyItems: "center",
                          gap: "5px",
                          boxShadow: "0 2px 8px rgba(23,22,22,.08)",
                        }}
                      >
                        <span
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: "var(--c1)",
                            display: "grid",
                            placeItems: "center",
                            color: "var(--fg)",
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M10.268 21a2 2 0 0 0 3.464 0"></path>
                            <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>
                          </svg>
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: "600",
                            color: "var(--ink-800)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {"התראות"}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        background: "var(--white)",
                        borderRadius: "16px",
                        padding: "9px 11px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 -2px 10px rgba(23,22,22,.06)",
                        marginTop: "2px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: "var(--c1)",
                            display: "grid",
                            placeItems: "center",
                            color: "var(--fg)",
                            boxShadow: "0 4px 10px rgba(23,22,22,.16)",
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                            <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          </svg>
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: "600",
                            color: "var(--ink-800)",
                          }}
                        >
                          {"רשימת המתנה"}
                        </span>
                      </span>
                      <span
                        style={{
                          display: "flex",
                          gap: "11px",
                          alignItems: "center",
                          color: "var(--ink-400)",
                        }}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M8 2v4"></path>
                          <path d="M16 2v4"></path>
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="4"
                            rx="2"
                          ></rect>
                          <path d="M3 10h18"></path>
                        </svg>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                          <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                        </svg>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "13px",
                color: "var(--ink-500)",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
              {"הגלריה מתחלפת לתמונות העבודות שלכם"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
