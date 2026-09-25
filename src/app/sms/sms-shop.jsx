"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, Icon, Logo } from "@/components/ui";

const RESEND_SECONDS = 30;

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

function Alert({ children }) {
  return (
    <p className="sms-alert" role="alert">
      <Icon name="circle-alert" size={18} />
      <span>{children}</span>
    </p>
  );
}

function Steps({ current }) {
  const steps = ["מספר נייד", "קוד אימות", "בחירת חבילה"];
  return (
    <ol className="sms-steps" aria-label="שלבי הרכישה">
      {steps.map((label, index) => (
        <li
          key={label}
          className={index < current ? "is-done" : index === current ? "is-current" : ""}
          aria-current={index === current ? "step" : undefined}
        >
          <span className="sms-step-dot">
            {index < current ? <Icon name="check" size={13} strokeWidth={3} /> : index + 1}
          </span>
          <span className="sms-step-label">{label}</span>
        </li>
      ))}
    </ol>
  );
}

function StepHead({ icon, title, children }) {
  return (
    <div className="sms-head">
      <span className="sms-head-icon">
        <Icon name={icon} size={24} />
      </span>
      <h1 className="sms-title">{title}</h1>
      {children ? <p className="sms-lead">{children}</p> : null}
    </div>
  );
}

function OtpInput({ value, onChange, invalid, disabled }) {
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
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

function Aside() {
  return (
    <aside className="sms-aside">
      <div className="sms-aside-glow" aria-hidden="true" />
      <p className="sms-aside-kicker">חנות ההודעות של תורי</p>
      <h2 className="sms-aside-title">
        עוד הודעות SMS, <span>בלי לחכות ל-1 לחודש</span>
      </h2>
      <div className="sms-bubble" aria-hidden="true">
        <span className="sms-bubble-from">
          <Icon name="message-square" size={14} />
          SMS · עכשיו
        </span>
        היי דנה, תזכורת לתור שלך מחר ב-10:00 ✨
      </div>
      <ul className="sms-features">
        <li>
          <Icon name="calendar-check" size={18} />
          ההודעות שנקנו נשארות ביתרה ולא מתאפסות ב-1 לחודש
        </li>
        <li>
          <Icon name="zap" size={18} />
          נוספות ליתרה אוטומטית מיד אחרי התשלום
        </li>
        <li>
          <Icon name="shield-check" size={18} />
          תשלום מאובטח בדף של PayPlus
        </li>
      </ul>
    </aside>
  );
}

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
  const counting = resendIn > 0;

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
        return;
      }
      goToOtp(data);
    } catch (error) {
      setPhoneError(error instanceof Error ? error.message : "שליחת הקוד נכשלה.");
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
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "אימות הקוד נכשל.");
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  async function checkout() {
    if (!shop.checkoutReady) {
      setStoreError("התשלום עדיין לא זמין. נסו שוב מאוחר יותר.");
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
      window.location.assign(data.url);
    } catch (error) {
      setStoreError(error instanceof Error ? error.message : "התשלום נכשל.");
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

  return (
    <div className="sms-page">
      <header className="sms-top">
        <Link href="/" aria-label="תורי, לדף הבית" className="sms-top-logo">
          <Logo size={34} />
        </Link>
        <Link href="/" className="sms-top-link">
          חזרה לאתר
          <Icon name="arrow-left" size={16} />
        </Link>
      </header>

      <main className="sms-layout">
        <section className="sms-panel">
          {booting ? (
            <div className="sms-card" aria-busy="true">
              <div className="sms-skel is-circle" />
              <div className="sms-skel is-title" />
              <div className="sms-skel is-line" />
              <div className="sms-skel is-field" />
              <div className="sms-skel is-field" />
            </div>
          ) : null}

          {!booting && step !== "store" ? <Steps current={stepIndex} /> : null}

          {!booting && step === "phone" ? (
            <form
              key="phone"
              className="sms-card"
              onSubmit={(event) => {
                event.preventDefault();
                void submitPhone();
              }}
            >
              <StepHead icon="message-square" title="כניסה לרכישת הודעות">
                הזינו את הנייד שמחובר אליכם כמנהלים בתורי. נשלח אליו קוד אימות ב-SMS.
              </StepHead>
              <label className="sms-field">
                <span className="sms-field-label">מספר נייד</span>
                <span className={`sms-phone ${phoneError ? "is-invalid" : ""}`}>
                  <Icon name="phone" size={19} />
                  <input
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                    placeholder="050-000-0000"
                    value={phone}
                    aria-invalid={phoneError ? true : undefined}
                    autoFocus
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setPhoneError("");
                    }}
                  />
                </span>
              </label>
              {phoneError ? <Alert>{phoneError}</Alert> : null}
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                block
                iconEnd={loading ? undefined : "arrow-left"}
                disabled={loading || phoneDigits.length < 9}
              >
                {loading ? "שולחים קוד…" : "שליחת קוד"}
              </Button>
              <p className="sms-fine">רק מנהלי עסקים שרשומים בתורי יכולים להיכנס.</p>
            </form>
          ) : null}

          {!booting && step === "business" ? (
            <div key="business" className="sms-card">
              <StepHead icon="building-2" title="לאיזה עסק להוסיף הודעות?">
                המספר {formatPhone(phone)} מחובר לכמה עסקים. בחרו אחד מהם.
              </StepHead>
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
                      <Icon name="check" size={14} strokeWidth={3} />
                    </span>
                  </label>
                ))}
              </div>
              {phoneError ? <Alert>{phoneError}</Alert> : null}
              <div className="sms-actions">
                <Button
                  variant="secondary"
                  size="lg"
                  block
                  disabled={loading || !businessId}
                  onClick={() => void submitBusiness()}
                >
                  {loading ? "שולחים קוד…" : "שליחת קוד"}
                </Button>
                <button type="button" className="sms-link" disabled={loading} onClick={() => setStep("phone")}>
                  <Icon name="arrow-right" size={16} />
                  מספר אחר
                </button>
              </div>
            </div>
          ) : null}

          {!booting && step === "otp" ? (
            <form
              key="otp"
              className="sms-card"
              onSubmit={(event) => {
                event.preventDefault();
                void submitOtp();
              }}
            >
              <StepHead icon="shield-check" title="הזינו את הקוד">
                שלחנו קוד בן 6 ספרות אל{" "}
                <bdi className="sms-strong" dir="ltr">
                  {formatPhone(phone)}
                </bdi>
              </StepHead>
              <OtpInput
                value={code}
                invalid={Boolean(otpError)}
                disabled={loading}
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
              <Button type="submit" variant="secondary" size="lg" block disabled={loading || code.length !== 6}>
                {loading ? "מאמתים…" : "כניסה"}
              </Button>
              <div className="sms-otp-foot">
                <button
                  type="button"
                  className="sms-link"
                  disabled={loading}
                  onClick={() => setStep(businesses.length > 1 ? "business" : "phone")}
                >
                  <Icon name="arrow-right" size={16} />
                  שינוי מספר
                </button>
                {resendIn > 0 ? (
                  <span className="sms-fine">שליחה חוזרת בעוד {resendIn} שנ׳</span>
                ) : (
                  <button type="button" className="sms-link" disabled={loading} onClick={() => void resend()}>
                    <Icon name="refresh-cw" size={15} />
                    לא קיבלתי קוד
                  </button>
                )}
              </div>
            </form>
          ) : null}

          {!booting && step === "store" && shop ? (
            <div key="store" className="sms-card is-store">
              <div className="sms-store-head">
                <div>
                  <p className="sms-kicker">
                    {shop.user.name ? `שלום ${shop.user.name}` : "רכישת הודעות"}
                  </p>
                  <h1 className="sms-title">{shop.user.businessName}</h1>
                </div>
                <button type="button" className="sms-link" disabled={loading} onClick={() => void logout()}>
                  <Icon name="log-out" size={16} />
                  יציאה
                </button>
              </div>

              <div className="sms-balance">
                <div className="sms-balance-glow" aria-hidden="true" />
                <span className="sms-balance-label">היתרה שלכם</span>
                {balance?.ok ? (
                  <>
                    <span className="sms-balance-value">
                      <strong>{formatCount(balanceTotal)}</strong>
                      <span>הודעות</span>
                    </span>
                    {balance.packageCredits || balance.prepaidCredits ? (
                      <span className="sms-balance-split">
                        <span>
                          <i className="is-lime" />
                          מהחבילה החודשית {formatCount(balance.packageCredits)}
                        </span>
                        <span>
                          <i className="is-mint" />
                          שנקנו {formatCount(balance.prepaidCredits)}
                        </span>
                      </span>
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
                        }}
                      />
                      <span className="sms-pack-radio" aria-hidden="true" />
                      <span className="sms-pack-main">
                        <span className="sms-pack-credits">
                          <strong>{formatCount(pack.smsCredits)}</strong> הודעות
                        </span>
                        <span className="sms-pack-unit">{perMessage(pack)}</span>
                      </span>
                      {pack.featured ? <span className="sms-pack-badge">מומלץ</span> : null}
                      <span className="sms-pack-price">
                        <span className="sms-currency">₪</span>
                        {formatCount(pack.amountIls)}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <p className="sms-fine sms-keep">
                <Icon name="calendar-check" size={16} />
                הודעות שנקנות כאן נשארות מעל החבילה החודשית ולא מתאפסות ב-1 לחודש.
              </p>

              {storeError ? <Alert>{storeError}</Alert> : null}
              {!shop.checkoutReady ? <Alert>התשלום עדיין לא זמין. נסו שוב מאוחר יותר.</Alert> : null}

              <div className="sms-checkout">
                <Button
                  variant="primary"
                  size="lg"
                  block
                  icon={loading ? undefined : "lock"}
                  disabled={loading || !selected || !shop.checkoutReady}
                  onClick={() => void checkout()}
                >
                  {loading
                    ? "מעבירים לתשלום…"
                    : selected
                      ? `לתשלום ₪${formatCount(selected.amountIls)}`
                      : "בחרו חבילה"}
                </Button>
                <p className="sms-secure">
                  <Icon name="shield-check" size={14} />
                  התשלום מתבצע בדף המאובטח של PayPlus
                </p>
              </div>
            </div>
          ) : null}
        </section>

        <Aside />
      </main>
    </div>
  );
}
