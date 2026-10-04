"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import ServiceAgreement from "@/components/service-agreement";
import {
  MAX_HERO_IMAGES,
  MAX_UPLOAD_BYTES,
  SENDER_NAME_MAX,
  acceptsFor,
  cleanSenderName,
  type AccountDesign,
  type HeroKind,
  type UploadKind,
} from "@/lib/account/design";
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
  design: AccountDesign;
};

const HERO_OPTIONS: { value: HeroKind; label: string }[] = [
  { value: "none", label: "ברירת המחדל" },
  { value: "image", label: "תמונה אחת" },
  { value: "video", label: "סרטון" },
  { value: "images", label: "כמה תמונות" },
];

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
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="auth-field">
      <span className="auth-label">{label}</span>
      {children}
      {hint ? <span className="auth-hint">{hint}</span> : null}
    </label>
  );
}

/** Uploads straight to Storage with a one-time URL from the server. */
async function uploadDesignFile(kind: UploadKind, file: File) {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("הקובץ גדול מ-10MB.");
  const response = await fetch("/api/account/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, contentType: file.type, size: file.size }),
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    uploadUrl?: string;
    publicUrl?: string;
    apikey?: string;
  };
  if (!response.ok || !data.uploadUrl || !data.publicUrl) {
    throw new Error(data.error || "העלאת הקובץ נכשלה.");
  }
  const form = new FormData();
  form.append("cacheControl", "3600");
  form.append("", file);
  const put = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "x-upsert": "false", ...(data.apikey ? { apikey: data.apikey } : {}) },
    body: form,
  });
  if (!put.ok) {
    throw new Error(put.status === 413 ? "הקובץ גדול מ-10MB." : "העלאת הקובץ נכשלה. נסו שוב.");
  }
  return data.publicUrl;
}

function UploadSlot({
  kind,
  url,
  busy,
  disabled,
  wide,
  onPick,
  onRemove,
}: {
  kind: UploadKind;
  url: string;
  busy: boolean;
  disabled: boolean;
  wide?: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const video = kind === "hero-video";
  return (
    <div className={wide ? "auth-upload auth-upload--wide" : "auth-upload"}>
      <div className="auth-upload-preview">
        {url ? (
          video ? (
            <video src={url} muted playsInline loop autoPlay />
          ) : (
            <img src={url} alt="" />
          )
        ) : (
          <span>{video ? "עוד לא הועלה סרטון" : "עוד לא הועלתה תמונה"}</span>
        )}
      </div>
      <div className="auth-upload-actions">
        <label className={disabled ? "auth-upload-button is-disabled" : "auth-upload-button"}>
          <input
            className="auth-file-input"
            type="file"
            accept={acceptsFor(kind)}
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onPick(file);
            }}
          />
          {busy ? "מעלים..." : url ? "החלפה" : video ? "העלאת סרטון" : "העלאת תמונה"}
        </label>
        {url && !busy ? (
          <button className="auth-link" type="button" disabled={disabled} onClick={onRemove}>
            הסרה
          </button>
        ) : null}
      </div>
    </div>
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
      if (data.next === "account") {
        window.location.assign("/account?paid=1");
        return;
      }
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
      lead: "אם כבר שילמתם עם המספר הזה, נעביר אתכם להשלמת שאר הפרטים. אם עוד לא, ממשיכים לתשלום.",
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
              <div className="auth-next">
                <p className="auth-next-title">מה קורה אחרי התשלום?</p>
                <p className="auth-next-lead">
                  מיד אחרי התשלום תגיעו לאזור האישי, ושם ממלאים את כל מה שצריך כדי להשלים את בניית האפליקציה:
                </p>
                <ul className="auth-next-list">
                  <li>
                    <span aria-hidden="true">✓</span>
                    <strong>עיצוב ומיתוג</strong>
                    <em>לוגו, צבע ותמונות או סרטון לדף הבית</em>
                  </li>
                  <li>
                    <span aria-hidden="true">✓</span>
                    <strong>שירותי העסק</strong>
                    <em>שם, מחיר ומשך לכל שירות</em>
                  </li>
                  <li>
                    <span aria-hidden="true">✓</span>
                    <strong>פרטי העסק</strong>
                    <em>כתובת ופרטים לקבלות</em>
                  </li>
                </ul>
                <p className="auth-next-foot">לא צריך להכין כלום מראש. הכל נשמר, ואפשר לחזור ולעדכן בכל רגע.</p>
              </div>
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
  const [fromNumber, setFromNumber] = useState(initial.design.fromNumber);
  const [logoUrl, setLogoUrl] = useState(initial.design.logoUrl);
  const [heroKind, setHeroKind] = useState<HeroKind>(initial.design.heroKind);
  const [heroImageUrl, setHeroImageUrl] = useState(
    initial.design.heroKind === "image" ? initial.design.heroUrl : "",
  );
  const [heroVideoUrl, setHeroVideoUrl] = useState(
    initial.design.heroKind === "video" ? initial.design.heroUrl : "",
  );
  const [heroImages, setHeroImages] = useState(initial.design.heroImages);
  const [uploading, setUploading] = useState<UploadKind | "">("");
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
  const [justPaid, setJustPaid] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("paid") !== "1") return;
    setJustPaid(true);
    url.searchParams.delete("paid");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(null, "", next);
  }, []);

  async function upload(kind: UploadKind, files: File[], apply: (urls: string[]) => void) {
    if (!files.length) return;
    setError("");
    setSaved("");
    setUploading(kind);
    const urls: string[] = [];
    try {
      for (const file of files) urls.push(await uploadDesignFile(kind, file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "העלאת הקובץ נכשלה.");
    } finally {
      if (urls.length) apply(urls);
      setUploading("");
    }
  }

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
          design: {
            fromNumber,
            logoUrl,
            heroKind,
            heroUrl: heroKind === "video" ? heroVideoUrl : heroImageUrl,
            heroImages,
          },
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
    if (loggingOut) return;
    setLoggingOut(true);
    await fetch("/api/account/logout", { method: "POST" }).catch(() => null);
    window.location.assign("/account");
  }

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
        <div className="auth-head-actions">
          <Link href="/" className="auth-home">
            חזרה לאתר
          </Link>
          <button
            className="auth-home auth-logout"
            type="button"
            disabled={loggingOut}
            onClick={() => void logout()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
              <path d="M10 8l-4 4 4 4" />
              <path d="M6 12h10" />
            </svg>
            {loggingOut ? "מתנתקים..." : "התנתקות"}
          </button>
        </div>
      </header>

      <div className="auth-stage auth-stage--wide">
        <form className="auth-card auth-card--wide" onSubmit={(event) => void save(event)}>
          <ol className="auth-steps" aria-label="שלבים">
            {["נייד", "קוד", "פרטים"].map((label, index) => (
              <li key={label} className={index < 2 ? "is-done" : "is-current"}>
                <span>{label}</span>
              </li>
            ))}
          </ol>

          <div className="auth-intro">
            <span className="auth-badge" aria-hidden="true">
              <StepIcon step="details" />
            </span>
            <p className="auth-kicker">{justPaid ? "התשלום נקלט" : "אזור אישי"}</p>
            <h1>{businessName || "הפרטים שלי"}</h1>
            <p className="auth-lead">
              {justPaid
                ? "תודה! נשאר רק להשלים את שאר פרטי העסק. הם מתעדכנים גם באפליקציה."
                : "כאן משלימים את פרטי העסק. השם, הכתובת, השירותים והעיצוב מתעדכנים גם באפליקציה."}
            </p>
          </div>

          {justPaid ? (
            <p className="auth-verified">
              <span aria-hidden="true">✓</span>
              המנוי פעיל
              <bdi dir="ltr">{formatPhone(initial.phone)}</bdi>
            </p>
          ) : null}

          <section className="auth-section">
            <h2>פרטי ההרשמה</h2>
            <div className="auth-grid">
              <Field label="שם מלא">
                <input className="auth-input" value={fullName} onChange={(event) => setFullName(event.target.value)} />
              </Field>
              <Field label="מספר טלפון">
                <input className="auth-input" value={initial.phone} disabled dir="ltr" />
              </Field>
              <Field label="שם האפליקציה באנגלית">
                <input
                  className="auth-input"
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

          <section className="auth-section">
            <h2>פרטים להשלמה</h2>
            <div className="auth-grid">
              <Field label="אימייל לקבלות">
                <input className="auth-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} dir="ltr" />
              </Field>
              <Field label="שם באנגלית">
                <input className="auth-input" value={appNameEn} onChange={(event) => setAppNameEn(event.target.value)} dir="ltr" placeholder="StudioNoa" />
              </Field>
              <Field
                label="שם השולח ב-SMS"
                hint={`השם שהלקוחות שלך יראו בהודעות. באנגלית, בלי רווחים, עד ${SENDER_NAME_MAX} תווים.`}
              >
                <input
                  className="auth-input"
                  value={fromNumber}
                  onChange={(event) => setFromNumber(cleanSenderName(event.target.value))}
                  dir="ltr"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="StudioNoa"
                />
              </Field>
              <Field label="כתובת העסק">
                <input className="auth-input" value={address} onChange={(event) => setAddress(event.target.value)} />
              </Field>
              <Field label="תעודת זהות">
                <input className="auth-input" inputMode="numeric" value={idNumber} onChange={(event) => setIdNumber(event.target.value)} dir="ltr" />
              </Field>
              <Field label="שם על הקבלה">
                <input className="auth-input" value={receiptName} onChange={(event) => setReceiptName(event.target.value)} />
              </Field>
              <Field label="מספר ח.פ">
                <input className="auth-input" inputMode="numeric" value={receiptVat} onChange={(event) => setReceiptVat(event.target.value)} dir="ltr" />
              </Field>
              <Field label="שפת האפליקציה">
                <select className="auth-input auth-select" value={language} onChange={(event) => setLanguage(event.target.value as AccountLanguage)}>
                  <option value="he">עברית</option>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </Field>
              <Field label="צבע המותג">
                <span className="auth-input auth-color">
                  <input type="color" value={brandColor} onChange={(event) => setBrandColor(event.target.value)} />
                  <bdi dir="ltr">{brandColor.toUpperCase()}</bdi>
                </span>
              </Field>
              <Field label="סיסמה למנהל/ת">
                <input className="auth-input" type="password" inputMode="numeric" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="6 ספרות, אם רוצים להחליף" dir="ltr" />
              </Field>
            </div>
          </section>

          <section className="auth-section">
            <h2>עיצוב האפליקציה</h2>
            <p className="auth-section-lead">הכל כאן אופציונלי. מה שלא תעלו יישאר בעיצוב ברירת המחדל.</p>

            <div className="auth-design-block">
              <h3>לוגו</h3>
              <p className="auth-hint">מופיע בראש דף הבית. הכי טוב PNG עם רקע שקוף.</p>
              <UploadSlot
                kind="logo"
                url={logoUrl}
                busy={uploading === "logo"}
                disabled={Boolean(uploading)}
                onPick={(file) => void upload("logo", [file], ([url]) => setLogoUrl(url))}
                onRemove={() => setLogoUrl("")}
              />
            </div>

            <div className="auth-design-block">
              <h3>תמונת הפתיחה בדף הבית</h3>
              <div className="auth-hero-kinds" role="radiogroup" aria-label="תמונת הפתיחה בדף הבית">
                {HERO_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={heroKind === option.value ? "auth-chip is-active" : "auth-chip"}
                  >
                    <input
                      className="auth-file-input"
                      type="radio"
                      name="hero-kind"
                      value={option.value}
                      checked={heroKind === option.value}
                      onChange={() => setHeroKind(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              {heroKind === "none" ? (
                <p className="auth-hint">דף הבית יוצג עם התמונות של עיצוב ברירת המחדל.</p>
              ) : null}

              {heroKind === "image" ? (
                <UploadSlot
                  kind="hero-image"
                  url={heroImageUrl}
                  wide
                  busy={uploading === "hero-image"}
                  disabled={Boolean(uploading)}
                  onPick={(file) => void upload("hero-image", [file], ([url]) => setHeroImageUrl(url))}
                  onRemove={() => setHeroImageUrl("")}
                />
              ) : null}

              {heroKind === "video" ? (
                <>
                  <p className="auth-hint">סרטון MP4 או MOV עד 10MB. הוא מתנגן בלולאה ובלי קול.</p>
                  <UploadSlot
                    kind="hero-video"
                    url={heroVideoUrl}
                    wide
                    busy={uploading === "hero-video"}
                    disabled={Boolean(uploading)}
                    onPick={(file) => void upload("hero-video", [file], ([url]) => setHeroVideoUrl(url))}
                    onRemove={() => setHeroVideoUrl("")}
                  />
                </>
              ) : null}

              {heroKind === "images" ? (
                <>
                  <p className="auth-hint">{`עד ${MAX_HERO_IMAGES} תמונות שמתחלפות בדף הבית.`}</p>
                  <div className="auth-hero-grid">
                    {heroImages.map((src, index) => (
                      <div className="auth-hero-thumb" key={src}>
                        <img src={src} alt="" />
                        <button
                          type="button"
                          aria-label="הסרת התמונה"
                          disabled={Boolean(uploading)}
                          onClick={() =>
                            setHeroImages((rows) => rows.filter((_, rowIndex) => rowIndex !== index))
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {heroImages.length < MAX_HERO_IMAGES ? (
                      <label className={uploading ? "auth-hero-add is-disabled" : "auth-hero-add"}>
                        <input
                          className="auth-file-input"
                          type="file"
                          multiple
                          accept={acceptsFor("hero-images")}
                          disabled={Boolean(uploading)}
                          onChange={(event) => {
                            const files = Array.from(event.target.files ?? []).slice(
                              0,
                              MAX_HERO_IMAGES - heroImages.length,
                            );
                            event.target.value = "";
                            void upload("hero-images", files, (urls) =>
                              setHeroImages((rows) => [...rows, ...urls].slice(0, MAX_HERO_IMAGES)),
                            );
                          }}
                        />
                        {uploading === "hero-images" ? "מעלים..." : "+ הוספת תמונות"}
                      </label>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </section>

          <section className="auth-section">
            <h2>שירותים</h2>
            {services.map((service, index) => (
              <div className="auth-service" key={`${service.id}-${index}`}>
                <Field label="שם השירות">
                  <input className="auth-input" value={service.name} onChange={(event) => updateService(index, { name: event.target.value })} />
                </Field>
                <Field label="מחיר ₪">
                  <input className="auth-input" inputMode="decimal" value={service.price} onChange={(event) => updateService(index, { price: event.target.value })} dir="ltr" />
                </Field>
                <Field label="דקות">
                  <input className="auth-input" inputMode="numeric" value={service.duration} onChange={(event) => updateService(index, { duration: event.target.value })} dir="ltr" />
                </Field>
                <button
                  className="auth-remove"
                  type="button"
                  aria-label="הסרת השירות"
                  onClick={() => setServices((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className="auth-add"
              type="button"
              onClick={() =>
                setServices((rows) => [...rows, { id: "", name: "", price: "", duration: "" }])
              }
            >
              + הוספת שירות
            </button>
          </section>

          {error ? <p className="auth-error" role="alert">{error}</p> : null}
          {saved ? <p className="auth-verified"><span aria-hidden="true">✓</span>{saved}</p> : null}
          <button className="auth-submit" type="submit" disabled={loading || Boolean(uploading)}>
            {loading ? <span className="auth-spinner" aria-hidden="true" /> : null}
            {loading ? "שומרים..." : "שמירת הפרטים"}
          </button>
        </form>
      </div>
    </main>
  );
}
