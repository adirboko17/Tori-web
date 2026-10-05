"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { PaymentTrust } from "./payment-trust";
import { Tori3D } from "@/components/tori3d/Tori3D";

const RESEND_SECONDS = 30;
const STEP_LABELS = ["מספר נייד", "קוד אימות", "בחירת חבילה"];

function formatCount(value) {
  return Number(value).toLocaleString("he-IL");
}

function formatPhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (/^05\d{8}$/.test(digits)) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return value;
}

function perMessage(pack) {
  if (!pack.smsCredits) return "";
  const agorot = (Number(pack.amountIls) / Number(pack.smsCredits)) * 100;
  return `${agorot.toLocaleString("he-IL", { maximumFractionDigits: 1 })} אג׳ להודעה`;
}

async function api(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "הבקשה נכשלה. נסו שוב.");
  }
  return data;
}

function ArrowIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function CheckIcon({ size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

/** The homepage CTA: ink pill with a brand-gradient arrow, or the reverse for checkout. */
function Cta({ children, busy, tone = "ink", type = "button", ...rest }) {
  return (
    <button type={type} className={`sms-cta is-${tone} ${busy ? "is-busy" : ""}`} {...rest}>
      <span className="sms-cta-label">{children}</span>
      <span className="sms-cta-arrow" aria-hidden="true">
        {busy ? <span className="sms-spinner" /> : <ArrowIcon size={tone === "brand" ? 18 : 16} />}
      </span>
    </button>
  );
}

function Alert({ children }) {
  return (
    <p className="sms-alert" role="alert">
      <Icon name="circle-alert" size={18} />
      <span>{children}</span>
    </p>
  );
}

/** The onboarding's stepper: done steps turn ink with a check. */
function Progress({ current }) {
  return (
    <ol className="sms-steps" aria-label={`שלב ${current + 1} מתוך ${STEP_LABELS.length}`}>
      {STEP_LABELS.map((label, index) => (
        <li
          key={label}
          className={index < current ? "is-done" : index === current ? "is-current" : ""}
          aria-current={index === current ? "step" : undefined}
        >
          <span className="sms-steps-num">{index < current ? <CheckIcon size={12} /> : index + 1}</span>
          <span className="sms-steps-label">{label}</span>
        </li>
      ))}
    </ol>
  );
}

function OtpInput({ value, onChange, invalid, disabled, onFocusChange }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const active = Math.min(value.length, 5);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  return (
    <div className={`sms-otp ${invalid ? "is-invalid" : ""}`} dir="ltr">
      <input
        ref={inputRef}
        className="sms-otp-input"
        name="code"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        maxLength={6}
        value={value}
        disabled={disabled}
        aria-label="קוד אימות בן 6 ספרות"
        aria-invalid={invalid || undefined}
        onFocus={() => {
          setFocused(true);
          onFocusChange?.(true);
        }}
        onBlur={() => {
          setFocused(false);
          onFocusChange?.(false);
        }}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
      />
      <div className="sms-otp-cells" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <span
            key={index}
            className={[
              "sms-otp-cell",
              value[index] ? "is-filled" : "",
              focused && index === active ? "is-active" : "",
            ].join(" ")}
          >
            {value[index] ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** What the floating bubble next to Tori says at each step. */
function stageMessage(step, selected) {
  if (step === "otp") return { from: "SMS · tori", text: "קוד האימות שלך: ••••••" };
  if (step === "store")
    return {
      from: "תורי · יתרה",
      text: selected ? `+${formatCount(selected.smsCredits)} הודעות מחכות לכם` : "בחרו חבילה ונמשיך",
    };
  return { from: "SMS · עכשיו", text: "היי דנה, תזכורת לתור שלך מחר ב־10:00" };
}

function Stage({ mood, cue, step, selected }) {
  const message = stageMessage(step, selected);
  return (
    <div className="sms-stage">
      <div className="sms-stage-glow" aria-hidden="true" />
      <div className="sms-stage-ring" aria-hidden="true" />
      <Tori3D mood={mood} cue={cue} className="sms-tori" />
      <div className="sms-float is-message" key={message.text} aria-hidden="true">
        <span className="sms-float-ico">
          <Icon name="message-square" size={16} />
        </span>
        <span>
          <small>{message.from}</small>
          <b>{message.text}</b>
        </span>
      </div>
      <div className="sms-float is-stat" aria-hidden="true">
        <b>
          <CheckIcon size={16} />
        </b>
        <span>
          <strong>נשאר ביתרה</strong>
          גם אחרי ה־1 לחודש
        </span>
      </div>
    </div>
  );
}

const PERKS = [
  {
    icon: "calendar-check",
    title: "לא מתאפס ב־1 לחודש",
    text: "הודעות שנקנות כאן נשמרות ביתרה, מעל החבילה החודשית.",
  },
  {
    icon: "zap",
    title: "ביתרה מיד",
    text: "ההודעות נוספות אוטומטית ברגע שהתשלום עובר.",
  },
  {
    icon: "shield-check",
    title: "תשלום מאובטח",
    text: "משלמים בדף המאובטח של PayPlus. אנחנו לא שומרים פרטי אשראי.",
  },
];

export function SmsShop() {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState("");
  const [code, setCode] = useState("");
  const [shop, setShop] = useState(null);
  const [packageId, setPackageId] = useState("pack_5000");
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [storeError, setStoreError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [resendIn, setResendIn] = useState(0);
  const [typing, setTyping] = useState(false);
  const [cue, setCue] = useState(null);
  const counting = resendIn > 0;

  function react(type) {
    setCue({ type, id: Date.now() + Math.random() });
  }

  useEffect(() => {
    let cancelled = false;
    api("/api/sms/me")
      .then((data) => {
        if (cancelled || !data.user) return;
        setShop(data);
        setPackageId(data.packages?.find((pack) => pack.featured)?.id ?? data.packages?.[0]?.id);
        setStep("store");
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!counting) return;
    const timer = window.setInterval(() => setResendIn((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [counting]);

  const selected = shop?.packages.find((pack) => pack.id === packageId);
  const phoneDigits = phone.replace(/\D/g, "");

  function goToOtp(data) {
    if (data.phone) setPhone(data.phone);
    if (data.businessId) setBusinessId(data.businessId);
    setCode("");
    setOtpError("");
    setNotice("");
    setResendIn(RESEND_SECONDS);
    setStep("otp");
    react("hop");
  }

  async function submitPhone() {
    setPhoneError("");
    setLoading(true);
    try {
      const data = await api("/api/sms/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      if (data.needsBusiness && data.businesses?.length) {
        if (data.phone) setPhone(data.phone);
        setBusinesses(data.businesses);
        setBusinessId(data.businesses[0].id);
        setStep("business");
        react("hop");
        return;
      }
      goToOtp(data);
    } catch (error) {
      setPhoneError(error instanceof Error ? error.message : "שליחת הקוד נכשלה.");
      react("error");
    } finally {
      setLoading(false);
    }
  }

  async function submitBusiness() {
    setPhoneError("");
    setLoading(true);
    try {
      const data = await api("/api/sms/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone, businessId }),
      });
      goToOtp(data);
    } catch (error) {
      setPhoneError(error instanceof Error ? error.message : "שליחת הקוד נכשלה.");
      react("error");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setOtpError("");
    setNotice("");
    setLoading(true);
    try {
      await api("/api/sms/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone, businessId }),
      });
      setCode("");
      setResendIn(RESEND_SECONDS);
      setNotice("שלחנו קוד חדש.");
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "שליחת הקוד נכשלה.");
      react("error");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(value = code) {
    if (value.length !== 6) return;
    setOtpError("");
    setNotice("");
    setLoading(true);
    try {
      const data = await api("/api/sms/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, businessId, code: value }),
      });
      setShop(data);
      setPackageId(data.packages.find((pack) => pack.featured)?.id ?? data.packages[0]?.id);
      setStep("store");
      react("happy");
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "אימות הקוד נכשל.");
      setCode("");
      react("error");
    } finally {
      setLoading(false);
    }
  }

  async function checkout() {
    if (!shop.checkoutReady) {
      setStoreError("התשלום עדיין לא זמין. נסו שוב מאוחר יותר.");
      react("error");
      return;
    }
    setStoreError("");
    setLoading(true);
    try {
      const data = await api("/api/sms/checkout", {
        method: "POST",
        body: JSON.stringify({ packageId }),
      });
      if (!data.url) throw new Error("לא התקבל קישור תשלום.");
      react("happy");
      window.location.assign(data.url);
    } catch (error) {
      setStoreError(error instanceof Error ? error.message : "התשלום נכשל.");
      react("error");
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await api("/api/sms/logout", { method: "POST" });
    } finally {
      setShop(null);
      setCode("");
      setBusinesses([]);
      setBusinessId("");
      setStep("phone");
      setLoading(false);
    }
  }

  const stepIndex = step === "otp" ? 1 : step === "store" ? 2 : 0;
  const balance = shop?.balance;
  const balanceTotal = balance ? balance.total || balance.packageCredits + balance.prepaidCredits : 0;
  const packageShare =
    balance?.ok && balanceTotal ? Math.round((balance.packageCredits / balanceTotal) * 100) : 0;
  const mood = loading ? "busy" : typing ? "look" : "idle";

  return (
    <div className="sms-page" dir="rtl">
      <header className="sms-nav">
        <Link href="/" aria-label="תורי, לדף הבית" className="sms-nav-logo">
          <img className="sms-nav-mark" src="/assets/brand/tori-mark.png" alt="" />
          <img className="sms-nav-word" src="/assets/brand/tori-wordmark.png" alt="tori" />
        </Link>
        <Link href="/" className="sms-nav-back">
          חזרה לאתר
          <span aria-hidden="true">
            <ArrowIcon size={14} />
          </span>
        </Link>
      </header>

      <main className="sms-hero">
        <div className="sms-copy">
          <p className="sms-chip">
            <i aria-hidden="true" />
            חנות ההודעות של תורי
          </p>
          <h1 className="sms-h1">
            <span className="sms-line">
              <span style={{ "--i": 0 }}>עוד הודעות SMS,</span>
            </span>
            <span className="sms-line">
              <span style={{ "--i": 1 }}>
                <span className="sms-word">בלי לחכות</span> ל־1 לחודש
              </span>
            </span>
          </h1>
          <p className="sms-sub">
            נגמרו ההודעות של החודש? מוסיפים חבילה בדקה, והתזכורות ממשיכות לצאת ללקוחות כרגיל.
          </p>
        </div>

        <Stage mood={mood} cue={cue} step={step} selected={selected} />

        <section className={`sms-card ${step === "store" ? "is-store" : ""}`} aria-live="polite">
          {booting ? (
            <div className="sms-skeleton" aria-busy="true">
              <div className="sms-skel is-bar" />
              <div className="sms-skel is-title" />
              <div className="sms-skel is-line" />
              <div className="sms-skel is-field" />
              <div className="sms-skel is-btn" />
            </div>
          ) : null}

          {!booting && step !== "store" ? <Progress current={stepIndex} /> : null}

          {!booting && step === "phone" ? (
            <form
              key="phone"
              className="sms-step"
              onSubmit={(event) => {
                event.preventDefault();
                void submitPhone();
              }}
            >
              <div className="sms-step-head">
                <h2>כניסה לרכישת הודעות</h2>
                <p>הזינו את הנייד שמחובר אליכם כמנהלים בתורי, ונשלח אליו קוד אימות.</p>
              </div>
              <label className="sms-field">
                <span className="sms-field-label">מספר נייד</span>
                <input
                  className={`sms-input is-phone ${phoneError ? "is-invalid" : ""}`}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="050-000-0000"
                  value={phone}
                  aria-invalid={phoneError ? true : undefined}
                  autoFocus
                  onFocus={() => setTyping(true)}
                  onBlur={() => setTyping(false)}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setPhoneError("");
                  }}
                />
              </label>
              {phoneError ? <Alert>{phoneError}</Alert> : null}
              <Cta type="submit" busy={loading} disabled={loading || phoneDigits.length < 9}>
                {loading ? "שולחים קוד…" : "שליחת קוד"}
              </Cta>
              <p className="sms-fine">
                <Icon name="lock" size={13} />
                רק מנהלי עסקים שרשומים בתורי יכולים להיכנס.
              </p>
            </form>
          ) : null}

          {!booting && step === "business" ? (
            <div key="business" className="sms-step">
              <div className="sms-step-head">
                <h2>לאיזה עסק להוסיף הודעות?</h2>
                <p>
                  המספר{" "}
                  <bdi dir="ltr" className="sms-strong">
                    {formatPhone(phone)}
                  </bdi>{" "}
                  מחובר לכמה עסקים. בחרו אחד מהם.
                </p>
              </div>
              <div className="sms-choices" role="radiogroup" aria-label="בחירת עסק">
                {businesses.map((business) => (
                  <label key={business.id} className="sms-choice">
                    <input
                      type="radio"
                      name="business"
                      checked={businessId === business.id}
                      onChange={() => setBusinessId(business.id)}
                    />
                    <span className="sms-choice-avatar">{business.name.trim().charAt(0)}</span>
                    <span className="sms-choice-name">{business.name}</span>
                    <span className="sms-choice-check">
                      <CheckIcon />
                    </span>
                  </label>
                ))}
              </div>
              {phoneError ? <Alert>{phoneError}</Alert> : null}
              <Cta busy={loading} disabled={loading || !businessId} onClick={() => void submitBusiness()}>
                {loading ? "שולחים קוד…" : "שליחת קוד"}
              </Cta>
              <button type="button" className="sms-link" disabled={loading} onClick={() => setStep("phone")}>
                <Icon name="arrow-right" size={15} />
                מספר אחר
              </button>
            </div>
          ) : null}

          {!booting && step === "otp" ? (
            <form
              key="otp"
              className="sms-step"
              onSubmit={(event) => {
                event.preventDefault();
                void submitOtp();
              }}
            >
              <div className="sms-step-head">
                <h2>הזינו את הקוד</h2>
                <p>
                  שלחנו קוד בן 6 ספרות אל{" "}
                  <bdi className="sms-strong" dir="ltr">
                    {formatPhone(phone)}
                  </bdi>
                </p>
              </div>
              <OtpInput
                value={code}
                invalid={Boolean(otpError)}
                disabled={loading}
                onFocusChange={setTyping}
                onChange={(next) => {
                  setCode(next);
                  setOtpError("");
                  if (next.length === 6) void submitOtp(next);
                }}
              />
              {otpError ? <Alert>{otpError}</Alert> : null}
              {notice ? (
                <p className="sms-notice" role="status">
                  <Icon name="circle-check" size={18} />
                  {notice}
                </p>
              ) : null}
              <Cta type="submit" busy={loading} disabled={loading || code.length !== 6}>
                {loading ? "מאמתים…" : "כניסה"}
              </Cta>
              <div className="sms-otp-foot">
                <button
                  type="button"
                  className="sms-link"
                  disabled={loading}
                  onClick={() => setStep(businesses.length > 1 ? "business" : "phone")}
                >
                  <Icon name="arrow-right" size={15} />
                  שינוי מספר
                </button>
                {resendIn > 0 ? (
                  <span className="sms-fine">
                    שליחה חוזרת בעוד <b className="sms-tabular">{resendIn}</b> שנ׳
                  </span>
                ) : (
                  <button type="button" className="sms-link" disabled={loading} onClick={() => void resend()}>
                    <Icon name="refresh-cw" size={14} />
                    לא קיבלתי קוד
                  </button>
                )}
              </div>
            </form>
          ) : null}

          {!booting && step === "store" && shop ? (
            <div key="store" className="sms-step">
              <div className="sms-store-head">
                <div>
                  <p className="sms-kicker">{shop.user.name ? `שלום ${shop.user.name}` : "רכישת הודעות"}</p>
                  <h2>{shop.user.businessName}</h2>
                </div>
                <button type="button" className="sms-link" disabled={loading} onClick={() => void logout()}>
                  <Icon name="log-out" size={15} />
                  יציאה
                </button>
              </div>

              <div className="sms-balance">
                <span className="sms-balance-label">היתרה שלכם עכשיו</span>
                {balance?.ok ? (
                  <>
                    <span className="sms-balance-value">
                      <strong>{formatCount(balanceTotal)}</strong>
                      <span>הודעות</span>
                    </span>
                    {balance.packageCredits || balance.prepaidCredits ? (
                      <>
                        <span className="sms-balance-bar" aria-hidden="true">
                          <i style={{ width: `${packageShare}%` }} />
                        </span>
                        <span className="sms-balance-split">
                          <span>
                            <i className="is-lime" />
                            חבילה חודשית {formatCount(balance.packageCredits)}
                          </span>
                          <span>
                            <i className="is-mint" />
                            שנקנו {formatCount(balance.prepaidCredits)}
                          </span>
                        </span>
                      </>
                    ) : null}
                  </>
                ) : (
                  <span className="sms-balance-missing">לא הצלחנו לטעון את היתרה כרגע. אפשר לרכוש בכל זאת.</span>
                )}
              </div>

              <fieldset className="sms-packs">
                <legend className="sms-section-title">בחרו חבילה</legend>
                <div className="sms-pack-list">
                  {shop.packages.map((pack) => (
                    <label key={pack.id} className={`sms-pack ${pack.featured ? "is-featured" : ""}`}>
                      <input
                        type="radio"
                        name="package"
                        checked={packageId === pack.id}
                        onChange={() => {
                          setPackageId(pack.id);
                          setStoreError("");
                          react("hop");
                        }}
                      />
                      {pack.featured ? <span className="sms-pack-badge">הכי משתלם</span> : null}
                      <span className="sms-pack-check" aria-hidden="true">
                        <CheckIcon size={12} />
                      </span>
                      <span className="sms-pack-credits">
                        <strong>{formatCount(pack.smsCredits)}</strong>
                        <span>הודעות</span>
                      </span>
                      <span className="sms-pack-foot">
                        <span className="sms-pack-price">
                          <span className="sms-currency">₪</span>
                          {formatCount(pack.amountIls)}
                        </span>
                        <span className="sms-pack-unit">{perMessage(pack)}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {storeError ? <Alert>{storeError}</Alert> : null}
              {!shop.checkoutReady ? <Alert>התשלום עדיין לא זמין. נסו שוב מאוחר יותר.</Alert> : null}

              <Cta
                busy={loading}
                disabled={loading || !selected || !shop.checkoutReady}
                onClick={() => void checkout()}
              >
                {loading
                  ? "מעבירים לתשלום…"
                  : selected
                    ? `לתשלום ₪${formatCount(selected.amountIls)}`
                    : "בחרו חבילה"}
              </Cta>
              <PaymentTrust />
              <p className="sms-legal">
                <Link href="/terms">תנאי שימוש</Link>
                <span aria-hidden="true">·</span>
                <Link href="/privacy">מדיניות פרטיות</Link>
              </p>
            </div>
          ) : null}
        </section>
      </main>

      <section className="sms-perks" aria-label="למה לקנות כאן">
        <div className="sms-perks-glow is-lime" aria-hidden="true" />
        <div className="sms-perks-glow is-mint" aria-hidden="true" />
        <div className="sms-perks-inner">
          <h2>
            קונים פעם אחת,
            <br />
            <span className="sms-word-line">משתמשים מתי שצריך.</span>
          </h2>
          <ul>
            {PERKS.map((perk, index) => (
              <li key={perk.title}>
                <span className="sms-perk-num">{String(index + 1).padStart(2, "0")}</span>
                <span className="sms-perk-ico" aria-hidden="true">
                  <Icon name={perk.icon} size={22} />
                </span>
                <b>{perk.title}</b>
                <p>{perk.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="sms-foot">
        <Link href="/" aria-label="תורי, לדף הבית">
          <img src="/assets/brand/tori-wordmark.png" alt="tori" />
        </Link>
        <span>אפליקציית תורים ממותגת לעסק שלך</span>
        <nav aria-label="קישורים">
          <Link href="/privacy">פרטיות</Link>
          <Link href="/support">תמיכה</Link>
        </nav>
      </footer>
    </div>
  );
}
