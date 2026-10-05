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

const NEXT_STEPS = [
  ["עיצוב ומיתוג", "לוגו, צבע ותמונות או סרטון לדף הבית"],
  ["שירותי העסק", "שם, מחיר ומשך לכל שירות"],
  ["פרטי העסק", "כתובת ופרטים לקבלות"],
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

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

/** The site's CTA: an ink button with a lime arrow, or a spinner while busy. */
function Submit({ busy, disabled, children }: { busy: boolean; disabled: boolean; children: ReactNode }) {
  return (
    <button className={busy ? "auth-submit is-busy" : "auth-submit"} type="submit" disabled={disabled}>
      <span>{children}</span>
      <span className="auth-submit-arrow" aria-hidden="true">
        {busy ? <span className="auth-spinner" /> : <ArrowIcon />}
      </span>
    </button>
  );
}

function PageHead({ children }: { children?: ReactNode }) {
  return (
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
          <span className="auth-home-arrow" aria-hidden="true">
            <ArrowIcon />
          </span>
        </Link>
        {children}
      </div>
    </header>
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

  const copy = {
    phone: {
      chip: "ברוכים הבאים לתורי",
      title: (
        <>
          התחברות <span className="auth-word">לאזור האישי</span>
        </>
      ),
      lead: "מזינים את מספר הנייד ונשלח לכם קוד כניסה ב-SMS.",
    },
    business: {
      chip: "כמה עסקים על אותו מספר",
      title: "באיזה עסק?",
      lead:
        flow === "pay"
          ? "בחרו את העסק שממשיכים איתו לתשלום."
          : "בחרו את העסק שאליו נכנסים.",
    },
    otp: {
      chip: "אימות הנייד",
      title: (
        <>
          הזינו את <span className="auth-word">הקוד</span>
        </>
      ),
      lead: "שלחנו קוד בן 6 ספרות ב-SMS אל",
    },
    details: {
      chip: "עוד רגע מתחילים",
      title: (
        <>
          פרטי <span className="auth-word">העסק</span>
        </>
      ),
      lead: "אם כבר שילמתם עם המספר הזה, נעביר אתכם להשלמת שאר הפרטים. אם עוד לא, ממשיכים לתשלום.",
    },
  }[step];

  return (
    <main className="auth-page auth-login" dir="rtl">
      <PageHead />

      <div className="auth-stage">
        <div className="auth-box">
          <section className="auth-card" aria-live="polite">
            <div className="auth-intro" key={step}>
              <p className="auth-hello">
                <i aria-hidden="true" />
                {copy.chip}
              </p>
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
                <label className="auth-field">
                  <span className="auth-sr">מספר נייד</span>
                  <input
                    className="auth-input auth-input--phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    autoFocus
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="050-000-0000"
                    dir="ltr"
                  />
                </label>
                {error ? <p className="auth-error" role="alert">{error}</p> : null}
                <Submit busy={loading} disabled={loading}>
                  {loading ? "שולחים..." : "שליחת קוד"}
                </Submit>
                <ul className="auth-perks">
                  <li>בלי סיסמה</li>
                  <li>מספר חדש נרשם באותה הדרך</li>
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
                <Submit busy={loading} disabled={loading || code.length !== 6}>
                  {loading ? "בודקים..." : flow === "login" ? "כניסה לאזור האישי" : "המשך"}
                </Submit>
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
                  <span aria-hidden="true">
                    <CheckIcon />
                  </span>
                  הנייד אומת
                  <bdi dir="ltr">{formatPhone(phone)}</bdi>
                </p>
                <details className="auth-agreement">
                  <summary>הסכם השירות</summary>
                  <div className="auth-agreement-body">
                    <ServiceAgreement />
                  </div>
                </details>
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                  />
                  <span>קראתי ואני מאשר/ת את הסכם השירות</span>
                </label>
                <div className="auth-next">
                  <p className="auth-next-title">מה קורה אחרי התשלום?</p>
                  <p className="auth-next-lead">
                    מיד אחרי התשלום תגיעו לאזור האישי, ושם ממלאים את כל מה שצריך כדי להשלים את בניית האפליקציה:
                  </p>
                  <ul className="auth-next-list">
                    {NEXT_STEPS.map(([title, text]) => (
                      <li key={title}>
                        <span aria-hidden="true">
                          <CheckIcon />
                        </span>
                        <strong>{title}</strong>
                        <em>{text}</em>
                      </li>
                    ))}
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
                <Submit busy={loading} disabled={loading}>
                  {loading ? "פותחים משתמש..." : "המשך לתשלום"}
                </Submit>
              </form>
            ) : null}
          </section>

          <aside className="auth-visual" aria-hidden="true">
            {/* phones hide this panel, so they skip the download too */}
            <video loop playsInline autoPlay muted preload="metadata">
              <source src="/assets/media/onboarding-panel.mp4" type="video/mp4" media="(min-width: 901px)" />
            </video>
            <p className="auth-visual-copy">
              העסק שלך.
              <br />
              האפליקציה שלך.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) return value;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
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
      <PageHead>
        <button
          className="auth-logout"
          type="button"
          disabled={loggingOut}
          onClick={() => void logout()}
        >
          {loggingOut ? "מתנתקים..." : "התנתקות"}
        </button>
      </PageHead>

      <form className="auth-portal" onSubmit={(event) => void save(event)}>
        <div className="auth-portal-head">
          <p className="auth-kicker">{justPaid ? "התשלום נקלט" : "אזור אישי"}</p>
          <h1>{businessName || "הפרטים שלי"}</h1>
          <p className="auth-lead">
            {justPaid
              ? "תודה! נשאר רק להשלים את שאר פרטי העסק. הם מתעדכנים גם באפליקציה."
              : "כאן משלימים את פרטי העסק. השם, הכתובת, השירותים והעיצוב מתעדכנים גם באפליקציה."}
          </p>
          {justPaid ? (
            <p className="auth-verified">
              <span aria-hidden="true">
                <CheckIcon />
              </span>
              המנוי פעיל
              <bdi dir="ltr">{formatPhone(initial.phone)}</bdi>
            </p>
          ) : null}
        </div>

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

        {/* stays on screen while scrolling, so saving is always one tap away */}
        <div className="auth-savebar">
          {error ? <p className="auth-error" role="alert">{error}</p> : null}
          {saved ? (
            <p className="auth-verified">
              <span aria-hidden="true">
                <CheckIcon />
              </span>
              {saved}
            </p>
          ) : null}
          <Submit busy={loading} disabled={loading || Boolean(uploading)}>
            {loading ? "שומרים..." : "שמירת הפרטים"}
          </Submit>
        </div>
      </form>
    </main>
  );
}
