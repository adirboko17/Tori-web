"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import ServiceAgreement from "@/components/service-agreement";
import type { AccountLanguage } from "@/lib/account/profile";
import {
  ENGLISH_DISPLAY_NAME_ERROR,
  hasNonEnglishDisplayChars,
  isEnglishDisplayName,
} from "@/lib/display-name";

type ServiceRow = {
  id: string;
  name: string;
  price: string;
  duration: string;
};

export type AccountPortalInitial = {
  fullName: string;
  phone: string;
  businessName: string;
  email: string;
  appNameEn: string;
  address: string;
  idNumber: string;
  receiptName: string;
  receiptVat: string;
  language: AccountLanguage;
  brandColor: string;
  services: { id: string; name: string; price: number; durationMinutes: number }[];
};

type BusinessChoice = { id: string; name: string };

async function api(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    phone?: string;
    flow?: "login" | "pay" | "signup";
    next?: "account" | "details" | "pay";
    url?: string;
    needsBusiness?: boolean;
    businesses?: BusinessChoice[];
  };
  if (!response.ok) {
    throw new Error(data.error || "הבקשה נכשלה.");
  }
  return data;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="account-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function AccountPortal({
  initial,
  signupPhone,
  priceLabel,
}: {
  initial: AccountPortalInitial | null;
  signupPhone: string | null;
  priceLabel: string;
}) {
  if (initial) return <ProfileForm initial={initial} />;
  return <LoginForm signupPhone={signupPhone} priceLabel={priceLabel} />;
}

function LoginForm({
  signupPhone,
  priceLabel,
}: {
  signupPhone: string | null;
  priceLabel: string;
}) {
  const [step, setStep] = useState<"phone" | "business" | "otp" | "details">(
    signupPhone ? "details" : "phone",
  );
  const [phone, setPhone] = useState(signupPhone ?? "");
  const [code, setCode] = useState("");
  const [flow, setFlow] = useState<"login" | "pay" | "signup">("signup");
  const [businessId, setBusinessId] = useState("");
  const [businesses, setBusinesses] = useState<BusinessChoice[]>([]);
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  function resetToPhone() {
    setError("");
    setCode("");
    setBusinessId("");
    setBusinesses([]);
    setStep("phone");
  }

  async function sendCode(nextBusinessId = businessId) {
    setError("");
    setLoading(true);
    try {
      const data = await api("/api/account/send-otp", {
        phone,
        businessId: nextBusinessId,
      });
      if (data.flow) setFlow(data.flow);
      if (data.needsBusiness && data.businesses?.length) {
        setBusinesses(data.businesses);
        setStep("business");
        return;
      }
      if (data.phone) setPhone(data.phone);
      setCode("");
      setResendIn(30);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שליחת הקוד נכשלה.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(value: string) {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const data = await api("/api/account/verify-otp", { phone, code: value });
      if (data.next === "pay" && data.url) {
        window.location.assign(data.url);
        return;
      }
      if (data.next === "details") {
        setStep("details");
        setLoading(false);
        return;
      }
      window.location.assign("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "אימות הקוד נכשל.");
      setCode("");
      setLoading(false);
    }
  }

  async function register(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (fullName.trim().length < 2) {
      setError("צריך למלא שם מלא.");
      return;
    }
    if (!isEnglishDisplayName(businessName)) {
      setError(ENGLISH_DISPLAY_NAME_ERROR);
      return;
    }
    if (!agreed) {
      setError("צריך לאשר את הסכם השירות.");
      return;
    }
    setLoading(true);
    try {
      const data = await api("/api/account/register", {
        fullName,
        businessName,
        agreed: true,
      });
      if (!data.url) throw new Error("לא נפתח קישור לתשלום.");
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "פתיחת המשתמש נכשלה.");
      setLoading(false);
    }
  }

  const stepIndex = step === "details" ? 2 : step === "otp" ? 1 : 0;
  const copy = {
    phone: {
      kicker: "ברוכים הבאים לתורי",
      title: "נכנסים עם הנייד",
      lead: "מספר חדש נרשם תוך דקה. מספר שכבר שילם נכנס ישר לאזור האישי.",
    },
    business: {
      kicker: "כמה עסקים על אותו מספר",
      title: "באיזה עסק?",
      lead:
        flow === "pay"
          ? "בחרו את העסק שממשיכים איתו לתשלום."
          : "בחרו את העסק שאליו נכנסים.",
    },
    otp: {
      kicker: "אימות הנייד",
      title: "הזינו את הקוד",
      lead: "שלחנו קוד בן 6 ספרות ב-SMS אל",
    },
    details: {
      kicker: "עוד רגע מתחילים",
      title: "פרטי העסק",
      lead: "אחרי האישור נפתח לכם משתמש וממשיכים לתשלום. את שאר הפרטים משלימים באזור האישי.",
    },
  }[step];

  return (
    <main className="auth-page" dir="rtl">
      <span className="auth-glow auth-glow--a" aria-hidden="true" />
      <span className="auth-glow auth-glow--b" aria-hidden="true" />
      <header className="auth-head">
        <Link href="/" className="auth-logo" aria-label="חזרה לאתר תורי">
          <span className="auth-mark">
            <img src="/assets/brand/tori-mark.png" alt="" />
            <video loop playsInline autoPlay muted preload="auto" src="/assets/video/tori-mark-loop.webm" />
          </span>
          <img className="auth-wordmark" src="/assets/brand/tori-wordmark.png" alt="tori" />
        </Link>
        <Link href="/" className="auth-home">
          חזרה לאתר
        </Link>
      </header>

      <div className="auth-stage">
        <section className="auth-card" aria-live="polite">
          <ol className="auth-steps" aria-label="שלבים">
            {["נייד", "קוד", "פרטים"].map((label, index) => (
              <li
                key={label}
                className={
                  index < stepIndex ? "is-done" : index === stepIndex ? "is-current" : undefined
                }
              >
                <span>{label}</span>
              </li>
            ))}
          </ol>

          <div className="auth-intro" key={step}>
            <span className="auth-badge" aria-hidden="true">
              <StepIcon step={step} />
            </span>
            <p className="auth-kicker">{copy.kicker}</p>
            <h1>{copy.title}</h1>
            <p className="auth-lead">
              {copy.lead}
              {step === "otp" ? (
                <>
                  {" "}
                  <bdi className="auth-phone" dir="ltr">
                    {formatPhone(phone)}
                  </bdi>
                </>
              ) : null}
            </p>
          </div>

          {step === "phone" ? (
            <form
              className="auth-form"
              onSubmit={(event) => {
                event.preventDefault();
                void sendCode("");
              }}
            >
              <label className="auth-phone-field">
                <span className="auth-label">מספר נייד</span>
                <span className="auth-phone-box">
                  <span className="auth-flag" aria-hidden="true">
                    IL
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    autoFocus
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="050-000-0000"
                    dir="ltr"
                  />
                </span>
              </label>
              {error ? <p className="auth-error" role="alert">{error}</p> : null}
              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? <span className="auth-spinner" aria-hidden="true" /> : null}
                {loading ? "שולחים קוד..." : "שליחת קוד ב-SMS"}
              </button>
              <ul className="auth-perks">
                <li>בלי סיסמה</li>
                <li>קוד חד-פעמי לנייד</li>
                <li>הרשמה תוך דקה</li>
              </ul>
            </form>
          ) : null}

          {step === "business" ? (
            <div className="auth-form">
              <div className="auth-choices">
                {businesses.map((business) => (
                  <button
                    key={business.id}
                    className="auth-choice"
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setBusinessId(business.id);
                      void sendCode(business.id);
                    }}
                  >
                    <span className="auth-choice-initial" aria-hidden="true">
                      {business.name.trim().charAt(0) || "ע"}
                    </span>
                    <span>{business.name}</span>
                  </button>
                ))}
              </div>
              {error ? <p className="auth-error" role="alert">{error}</p> : null}
              <button className="auth-link" type="button" onClick={() => resetToPhone()}>
                שינוי מספר
              </button>
            </div>
          ) : null}

          {step === "otp" ? (
            <form
              className="auth-form"
              onSubmit={(event) => {
                event.preventDefault();
                void verifyCode(code);
              }}
            >
              <label className="auth-otp">
                <span className="auth-sr">קוד שנשלח ב-SMS</span>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  value={code}
                  disabled={loading}
                  onChange={(event) => {
                    const next = event.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(next);
                    if (next.length === 6) void verifyCode(next);
                  }}
                  dir="ltr"
                />
                <span className="auth-otp-boxes" dir="ltr" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, index) => (
                    <span
                      key={index}
                      className={
                        index === Math.min(code.length, 5) && !loading
                          ? "is-active"
                          : code[index]
                            ? "is-filled"
                            : undefined
                      }
                    >
                      {code[index] ?? ""}
                    </span>
                  ))}
                </span>
              </label>
              {error ? <p className="auth-error" role="alert">{error}</p> : null}
              <button className="auth-submit" type="submit" disabled={loading || code.length !== 6}>
                {loading ? <span className="auth-spinner" aria-hidden="true" /> : null}
                {loading ? "בודקים..." : flow === "login" ? "כניסה לאזור האישי" : "המשך"}
              </button>
              <div className="auth-row">
                <button className="auth-link" type="button" onClick={() => resetToPhone()}>
                  שינוי מספר
                </button>
                <button
                  className="auth-link"
                  type="button"
                  disabled={loading || resendIn > 0}
                  onClick={() => void sendCode(businessId)}
                >
                  {resendIn > 0 ? `שליחה חוזרת בעוד ${resendIn}` : "שליחת קוד חדש"}
                </button>
              </div>
            </form>
          ) : null}

          {step === "details" ? (
            <form className="auth-form" onSubmit={(event) => void register(event)}>
              <label className="auth-field">
                <span className="auth-label">שם מלא</span>
                <input
                  className="auth-input"
                  autoComplete="name"
                  autoFocus
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="איך קוראים לך?"
                />
              </label>
              <label className="auth-field">
                <span className="auth-label">שם האפליקציה באנגלית</span>
                <input
                  className="auth-input"
                  autoComplete="organization"
                  value={businessName}
                  onChange={(event) => {
                    const next = event.target.value;
                    setBusinessName(next);
                    if (hasNonEnglishDisplayChars(next)) setError(ENGLISH_DISPLAY_NAME_ERROR);
                    else setError((current) => (current === ENGLISH_DISPLAY_NAME_ERROR ? "" : current));
                  }}
                  placeholder="Studio Noa"
                  dir="ltr"
                />
              </label>
              <p className="auth-verified">
                <span aria-hidden="true">✓</span>
                הנייד אומת
                <bdi dir="ltr">{formatPhone(phone)}</bdi>
              </p>
              <details className="auth-agreement">
                <summary>הסכם השירות</summary>
                <div className="auth-agreement-body">
                  <ServiceAgreement />
                </div>
              </details>
              <label className={agreed ? "auth-check is-checked" : "auth-check"}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                />
                <span className="auth-check-box" aria-hidden="true" />
                <span>קראתי ואני מאשר/ת את הסכם השירות</span>
              </label>
              {priceLabel ? (
                <div className="auth-price">
                  <span>מנוי חודשי</span>
                  <strong>{priceLabel}</strong>
                </div>
              ) : null}
              {error ? <p className="auth-error" role="alert">{error}</p> : null}
              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? <span className="auth-spinner" aria-hidden="true" /> : null}
                {loading ? "פותחים משתמש..." : "המשך לתשלום"}
              </button>
            </form>
          ) : null}
        </section>

        <aside className="auth-visual" aria-hidden="true">
          <video loop playsInline autoPlay muted preload="metadata" src="/assets/media/onboarding-panel.mp4" />
          <div className="auth-visual-copy">
            <strong>האפליקציה של העסק שלך</strong>
            <span>תורים, לקוחות ותזכורות במקום אחד.</span>
          </div>
        </aside>
      </div>
    </main>
  );
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) return value;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function StepIcon({ step }: { step: "phone" | "business" | "otp" | "details" }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (step === "otp") {
    return (
      <svg {...common}>
        <rect x="4" y="10" width="16" height="10" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <path d="M12 14v2" />
      </svg>
    );
  }
  if (step === "details" || step === "business") {
    return (
      <svg {...common}>
        <path d="M4 10h16l-1.5-5h-13z" />
        <path d="M5 10v9h14v-9" />
        <path d="M10 19v-5h4v5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  );
}

function ProfileForm({ initial }: { initial: AccountPortalInitial }) {
  const [fullName, setFullName] = useState(initial.fullName);
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [email, setEmail] = useState(initial.email);
  const [appNameEn, setAppNameEn] = useState(initial.appNameEn);
  const [address, setAddress] = useState(initial.address);
  const [idNumber, setIdNumber] = useState(initial.idNumber);
  const [receiptName, setReceiptName] = useState(initial.receiptName);
  const [receiptVat, setReceiptVat] = useState(initial.receiptVat);
  const [language, setLanguage] = useState(initial.language);
  const [brandColor, setBrandColor] = useState(initial.brandColor || "#D4A574");
  const [password, setPassword] = useState("");
  const [services, setServices] = useState<ServiceRow[]>(
    initial.services.length
      ? initial.services.map((service) => ({
          id: service.id,
          name: service.name,
          price: String(service.price),
          duration: String(service.durationMinutes),
        }))
      : [{ id: "", name: "", price: "", duration: "" }],
  );
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(false);

  function updateService(index: number, patch: Partial<ServiceRow>) {
    setServices((rows) =>
      rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaved("");
    if (!isEnglishDisplayName(businessName)) {
      setError(ENGLISH_DISPLAY_NAME_ERROR);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          businessName,
          email,
          appNameEn,
          address,
          idNumber,
          receiptName,
          receiptVat,
          language,
          brandColor,
          password,
          services: services.map((service) => ({
            id: service.id,
            name: service.name,
            price: Number(service.price),
            durationMinutes: Number(service.duration),
          })),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "שמירת הפרטים נכשלה.");
      setPassword("");
      setSaved("הפרטים נשמרו.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירת הפרטים נכשלה.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/account/logout", { method: "POST" });
    window.location.assign("/account");
  }

  return (
    <main className="account-page">
      <div className="account-shell">
        <header className="account-brand">
          <Link href="/" aria-label="חזרה לאתר תורי">
            <img src="/assets/brand/tori-app-icon.png" width={36} height={36} alt="tori" />
          </Link>
          <button className="tori-btn tori-btn--ghost" type="button" onClick={() => void logout()}>
            יציאה
          </button>
        </header>
        <form className="account-card" onSubmit={(event) => void save(event)}>
          <p className="account-kicker">אזור אישי</p>
          <h1>{businessName || "הפרטים שלי"}</h1>
          <p className="account-lead">
            כאן משלימים את פרטי העסק. השם, הכתובת, השירותים והעיצוב מתעדכנים גם באפליקציה.
          </p>

          <section className="account-section">
            <h2>פרטי ההרשמה</h2>
            <div className="account-grid">
              <Field label="שם מלא">
                <input className="tori-input" value={fullName} onChange={(event) => setFullName(event.target.value)} />
              </Field>
              <Field label="מספר טלפון">
                <input className="tori-input" value={initial.phone} disabled dir="ltr" />
              </Field>
              <Field label="שם האפליקציה באנגלית">
                <input
                  className="tori-input"
                  value={businessName}
                  onChange={(event) => {
                    const next = event.target.value;
                    setBusinessName(next);
                    if (hasNonEnglishDisplayChars(next)) setError(ENGLISH_DISPLAY_NAME_ERROR);
                    else setError((current) => (current === ENGLISH_DISPLAY_NAME_ERROR ? "" : current));
                  }}
                  placeholder="Studio Noa"
                  dir="ltr"
                />
              </Field>
            </div>
          </section>

          <section className="account-section">
            <h2>פרטים להשלמה</h2>
            <div className="account-grid">
              <Field label="אימייל לקבלות">
                <input className="tori-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} dir="ltr" />
              </Field>
              <Field label="שם באנגלית">
                <input className="tori-input" value={appNameEn} onChange={(event) => setAppNameEn(event.target.value)} dir="ltr" placeholder="StudioNoa" />
              </Field>
              <Field label="כתובת העסק">
                <input className="tori-input" value={address} onChange={(event) => setAddress(event.target.value)} />
              </Field>
              <Field label="תעודת זהות">
                <input className="tori-input" inputMode="numeric" value={idNumber} onChange={(event) => setIdNumber(event.target.value)} dir="ltr" />
              </Field>
              <Field label="שם על הקבלה">
                <input className="tori-input" value={receiptName} onChange={(event) => setReceiptName(event.target.value)} />
              </Field>
              <Field label="מספר ח.פ">
                <input className="tori-input" inputMode="numeric" value={receiptVat} onChange={(event) => setReceiptVat(event.target.value)} dir="ltr" />
              </Field>
              <Field label="שפת האפליקציה">
                <select className="tori-select" value={language} onChange={(event) => setLanguage(event.target.value as AccountLanguage)}>
                  <option value="he">עברית</option>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </Field>
              <Field label="צבע המותג">
                <input className="tori-input" type="color" value={brandColor} onChange={(event) => setBrandColor(event.target.value)} />
              </Field>
              <Field label="סיסמה למנהל/ת">
                <input className="tori-input" type="password" inputMode="numeric" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="6 ספרות, אם רוצים להחליף" dir="ltr" />
              </Field>
            </div>
          </section>

          <section className="account-section">
            <h2>שירותים</h2>
            {services.map((service, index) => (
              <div className="account-service" key={`${service.id}-${index}`}>
                <Field label={index === 0 ? "שם" : ""}>
                  <input className="tori-input" value={service.name} onChange={(event) => updateService(index, { name: event.target.value })} />
                </Field>
                <Field label={index === 0 ? "מחיר" : ""}>
                  <input className="tori-input" inputMode="decimal" value={service.price} onChange={(event) => updateService(index, { price: event.target.value })} dir="ltr" />
                </Field>
                <Field label={index === 0 ? "דקות" : ""}>
                  <input className="tori-input" inputMode="numeric" value={service.duration} onChange={(event) => updateService(index, { duration: event.target.value })} dir="ltr" />
                </Field>
                <button
                  className="tori-btn tori-btn--ghost"
                  type="button"
                  onClick={() => setServices((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
                >
                  הסרה
                </button>
              </div>
            ))}
            <button
              className="tori-btn tori-btn--secondary"
              type="button"
              onClick={() =>
                setServices((rows) => [...rows, { id: "", name: "", price: "", duration: "" }])
              }
            >
              הוספת שירות
            </button>
          </section>

          {error ? <p className="account-error">{error}</p> : null}
          {saved ? <p className="account-note">{saved}</p> : null}
          <button className="tori-btn tori-btn--primary" type="submit" disabled={loading}>
            {loading ? "שומרים..." : "שמירת הפרטים"}
          </button>
        </form>
      </div>
    </main>
  );
}
