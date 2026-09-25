"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { adminJson, readFileAsDataUrl } from "@/lib/superadmin/browser";
import { contrastText, isValidClientName, isValidHexColor } from "@/lib/superadmin/format";
import type { CreateBusinessResult } from "@/lib/superadmin/types";
import { useToast } from "../../../_ui/feedback";
import { Icon } from "../../../_ui/icon";
import { Field, PageHeader } from "../../../_ui/parts";
import { UploadTile } from "../../../_ui/upload-tile";

const INITIAL = {
  businessName: "",
  clientName: "",
  address: "",
  primaryColor: "#111111",
  adminName: "",
  adminPhone: "",
  adminPassword: "123456",
  autoPulseem: true,
  pulseemSubPassword: "",
  pulseemFromNumber: "",
  pulseemApiKey: "",
  pulseemWsUserId: "",
  pulseemWsPassword: "",
};

type Form = typeof INITIAL;
type Errors = Partial<Record<keyof Form, string>>;
type Files = { logo: File | null; icon: File | null; splash: File | null };

const STEPS = [
  { title: "פרטי העסק", description: "השם שיופיע באפליקציה ושם התיקייה באנגלית." },
  { title: "מנהל העסק", description: "המשתמש הראשון שיוכל להתחבר לאפליקציה כמנהל." },
  { title: "פולסים", description: "חשבון ה-SMS שממנו יישלחו תזכורות והודעות." },
  { title: "מיתוג", description: "צבע ותמונות. אפשר גם להעלות אחר כך מעמוד העסק." },
  { title: "סיכום", description: "בדקו שהכול נכון לפני היצירה." },
] as const;

function validate(step: number, form: Form): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (!form.businessName.trim()) errors.businessName = "צריך להזין את שם העסק";
    if (!isValidClientName(form.clientName)) {
      errors.clientName = "אותיות באנגלית וספרות בלבד, ומתחיל באות";
    }
  }
  if (step === 1) {
    if (!form.adminName.trim()) errors.adminName = "צריך להזין את שם המנהל";
    if (!form.adminPhone.trim()) errors.adminPhone = "צריך להזין טלפון";
    if (!form.adminPassword) errors.adminPassword = "צריך להזין סיסמה";
  }
  if (step === 3 && !isValidHexColor(form.primaryColor)) {
    errors.primaryColor = "צבע בפורמט ‎#RRGGBB";
  }
  return errors;
}

function Summary({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="ad-summary-list">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ResultView({
  form,
  result,
  onReset,
}: {
  form: Form;
  result: CreateBusinessResult;
  onReset: () => void;
}) {
  const checks: { ok: boolean; label: string; detail?: string }[] = [
    { ok: true, label: "פרופיל העסק, המנהל ושלושה שירותים נוצרו" },
    {
      ok: result.pulseemCreated,
      label: result.pulseemCreated ? "תת-חשבון פולסים נוצר" : "פולסים לא חובר",
      detail: result.pulseemCreated ? result.pulseemLoginUserName : result.pulseemError,
    },
    {
      ok: result.uploadWarnings.length === 0,
      label: result.uploadedFiles.length ? `הועלו ${result.uploadedFiles.length} קבצי מיתוג` : "לא הועלו קבצי מיתוג",
      detail: result.uploadWarnings.join(" · ") || result.uploadedFiles.join(", ") || undefined,
    },
  ];

  return (
    <div style={{ maxWidth: 720, width: "100%", margin: "0 auto" }} className="ad-stack">
      <section className="ad-card">
        <div className="ad-card-body" style={{ justifyItems: "center", textAlign: "center", paddingBlock: 32 }}>
          <span className="ad-empty-icon" style={{ background: "var(--tori-lime)", color: "var(--ink-900)", width: 56, height: 56 }}>
            <Icon name="check" size={28} />
          </span>
          <h1 style={{ font: "var(--weight-semibold) 24px/1.3 var(--font-ui)" }}>
            {form.businessName || result.clientName} נוצר בהצלחה
          </h1>
          <p className="ad-muted">האפליקציה מוכנה להגדרות הבאות.</p>
        </div>
        <div className="ad-list" style={{ borderTop: "1px solid var(--line-subtle)" }}>
          {checks.map((check) => (
            <div key={check.label} className="ad-list-item">
              <span className={`ad-list-icon ${check.ok ? "is-success" : "is-warning"}`}>
                <Icon name={check.ok ? "check" : "triangle-alert"} size={17} />
              </span>
              <span className="ad-list-main">
                <span className="ad-list-title">{check.label}</span>
                {check.detail ? <span className="ad-list-sub">{check.detail}</span> : null}
              </span>
            </div>
          ))}
        </div>
        <div className="ad-card-body" style={{ borderTop: "1px solid var(--line-subtle)" }}>
          <div className="ad-field">
            <span className="ad-field-label">משיכת המיתוג לפרויקט האפליקציה</span>
            <pre className="ad-code">{`node scripts/pull-branding.mjs ${result.clientName}`}</pre>
          </div>
        </div>
        <div className="ad-card-foot">
          <Link href={`/admin/businesses/${result.businessId}`} className="ad-btn is-primary">
            לעמוד העסק
            <Icon name="arrow-left" size={16} />
          </Link>
          <button type="button" className="ad-btn is-secondary" onClick={onReset}>
            יצירת עסק נוסף
          </button>
        </div>
      </section>
    </div>
  );
}

export default function NewBusinessPage() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(INITIAL);
  const [files, setFiles] = useState<Files>({ logo: null, icon: null, splash: null });
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<CreateBusinessResult | null>(null);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function next() {
    const found = validate(step, form);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goTo(target: number) {
    if (target < step) setStep(target);
  }

  async function create() {
    for (let index = 0; index < STEPS.length - 1; index += 1) {
      const found = validate(index, form);
      if (Object.values(found).some(Boolean)) {
        setErrors(found);
        setStep(index);
        return;
      }
    }
    setPending(true);
    try {
      const created = await adminJson<CreateBusinessResult>("/api/admin/apps/create", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          logoBase64: files.logo ? await readFileAsDataUrl(files.logo) : undefined,
          iconBase64: files.icon ? await readFileAsDataUrl(files.icon) : undefined,
          splashBase64: files.splash ? await readFileAsDataUrl(files.splash) : undefined,
        }),
      });
      setResult(created);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "יצירת העסק נכשלה");
    } finally {
      setPending(false);
    }
  }

  function reset() {
    setResult(null);
    setForm(INITIAL);
    setFiles({ logo: null, icon: null, splash: null });
    setErrors({});
    setStep(0);
  }

  if (result) return <ResultView form={form} result={result} onReset={reset} />;

  const last = step === STEPS.length - 1;
  const colorValid = isValidHexColor(form.primaryColor);

  return (
    <div style={{ maxWidth: 760, width: "100%", margin: "0 auto" }} className="ad-stack">
      <PageHeader
        back={{ href: "/admin/businesses", label: "עסקים" }}
        title="עסק חדש"
        description="נוצרים פרופיל עסק, משתמש מנהל, שלושה שירותים, תת-חשבון פולסים ותיקיית מיתוג."
      />

      <ol className="ad-steps" aria-label="שלבי היצירה" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {STEPS.map((item, index) => {
          const state = index === step ? "is-current" : index < step ? "is-done" : "";
          return (
            <li key={item.title}>
              <button
                type="button"
                className={`ad-step ${state}`}
                style={{ width: "100%", cursor: index < step ? "pointer" : "default" }}
                aria-current={index === step ? "step" : undefined}
                onClick={() => goTo(index)}
              >
                <span className="ad-step-num">{index < step ? <Icon name="check" size={14} /> : index + 1}</span>
                <span>{item.title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <form
        className="ad-card"
        onSubmit={(event) => {
          event.preventDefault();
          if (last) void create();
          else next();
        }}
      >
        <div className="ad-card-head">
          <div>
            <h2>
              {step + 1}. {STEPS[step].title}
            </h2>
            <p>{STEPS[step].description}</p>
          </div>
        </div>

        <div className="ad-card-body">
          {step === 0 ? (
            <div className="ad-form-grid">
              <Field label="שם העסק" error={errors.businessName} full>
                <input
                  className="ad-input"
                  value={form.businessName}
                  onChange={(event) => set("businessName", event.target.value)}
                  placeholder="למשל: סטודיו שרה"
                  autoFocus
                />
              </Field>
              <Field
                label="שם האפליקציה באנגלית"
                error={errors.clientName}
                hint="משמש לתיקיית המיתוג ולתת-חשבון פולסים. אי אפשר לשנות אחר כך."
              >
                <input
                  className="ad-input"
                  dir="ltr"
                  value={form.clientName}
                  onChange={(event) => set("clientName", event.target.value.replace(/\s/g, ""))}
                  placeholder="SarahStudio"
                />
              </Field>
              <Field label="כתובת" hint="לא חובה">
                <input className="ad-input" value={form.address} onChange={(event) => set("address", event.target.value)} />
              </Field>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="ad-form-grid">
              <Field label="שם המנהל" error={errors.adminName} full>
                <input
                  className="ad-input"
                  value={form.adminName}
                  onChange={(event) => set("adminName", event.target.value)}
                  autoFocus
                />
              </Field>
              <Field label="טלפון נייד" error={errors.adminPhone}>
                <input
                  className="ad-input"
                  dir="ltr"
                  type="tel"
                  inputMode="tel"
                  value={form.adminPhone}
                  onChange={(event) => set("adminPhone", event.target.value)}
                  placeholder="050-0000000"
                />
              </Field>
              <Field label="סיסמה ראשונית" error={errors.adminPassword} hint="ברירת המחדל 123456. המנהל יוכל לשנות באפליקציה.">
                <input
                  className="ad-input"
                  dir="ltr"
                  value={form.adminPassword}
                  onChange={(event) => set("adminPassword", event.target.value)}
                />
              </Field>
            </div>
          ) : null}

          {step === 2 ? (
            <>
              <div className="ad-radio-cards" role="radiogroup" aria-label="אופן החיבור לפולסים">
                <label className="ad-radio-card">
                  <input type="radio" name="pulseem" checked={form.autoPulseem} onChange={() => set("autoPulseem", true)} />
                  <span>
                    <strong>תת-חשבון חדש</strong>
                    <span>נוצר ומתחבר אוטומטית. מומלץ.</span>
                  </span>
                </label>
                <label className="ad-radio-card">
                  <input type="radio" name="pulseem" checked={!form.autoPulseem} onChange={() => set("autoPulseem", false)} />
                  <span>
                    <strong>חשבון קיים</strong>
                    <span>לעסק שכבר יש לו חשבון פולסים.</span>
                  </span>
                </label>
              </div>
              {form.autoPulseem ? (
                <div className="ad-form-grid">
                  <Field label="סיסמה לתת-החשבון" hint="ריק = סיסמה אקראית">
                    <input
                      className="ad-input"
                      dir="ltr"
                      value={form.pulseemSubPassword}
                      onChange={(event) => set("pulseemSubPassword", event.target.value)}
                    />
                  </Field>
                  <Field label="מספר או שם שולח" hint="ריק = שם האפליקציה">
                    <input
                      className="ad-input"
                      dir="ltr"
                      value={form.pulseemFromNumber}
                      onChange={(event) => set("pulseemFromNumber", event.target.value)}
                    />
                  </Field>
                </div>
              ) : (
                <div className="ad-form-grid">
                  <Field label="מפתח API" full>
                    <input
                      className="ad-input"
                      dir="ltr"
                      value={form.pulseemApiKey}
                      onChange={(event) => set("pulseemApiKey", event.target.value)}
                    />
                  </Field>
                  <Field label="מזהה משתמש WS">
                    <input
                      className="ad-input"
                      dir="ltr"
                      value={form.pulseemWsUserId}
                      onChange={(event) => set("pulseemWsUserId", event.target.value)}
                    />
                  </Field>
                  <Field label="סיסמת WS">
                    <input
                      className="ad-input"
                      dir="ltr"
                      type="password"
                      autoComplete="new-password"
                      value={form.pulseemWsPassword}
                      onChange={(event) => set("pulseemWsPassword", event.target.value)}
                    />
                  </Field>
                  <Field label="מספר שולח" full>
                    <input
                      className="ad-input"
                      dir="ltr"
                      value={form.pulseemFromNumber}
                      onChange={(event) => set("pulseemFromNumber", event.target.value)}
                    />
                  </Field>
                </div>
              )}
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div className="ad-form-grid">
                <Field label="צבע ראשי" error={errors.primaryColor}>
                  <span className="ad-color">
                    <input
                      type="color"
                      value={colorValid ? form.primaryColor : "#111111"}
                      onChange={(event) => set("primaryColor", event.target.value)}
                      aria-label="בחירת צבע"
                    />
                    <input
                      className="ad-input"
                      dir="ltr"
                      value={form.primaryColor}
                      onChange={(event) => set("primaryColor", event.target.value)}
                    />
                  </span>
                </Field>
                <div className="ad-field">
                  <span className="ad-field-label">תצוגה מקדימה</span>
                  <span
                    className="ad-row"
                    style={{
                      minHeight: 40,
                      padding: "0 14px",
                      borderRadius: 12,
                      background: colorValid ? form.primaryColor : "var(--ink-900)",
                      color: contrastText(colorValid ? form.primaryColor : "#111111"),
                      fontWeight: 600,
                    }}
                  >
                    {form.businessName || "שם העסק"}
                  </span>
                </div>
              </div>
              <div className="ad-upload-grid">
                <UploadTile label="לוגו" hint="PNG שקוף, לפחות 512px" file={files.logo} onChange={(logo) => setFiles((current) => ({ ...current, logo }))} />
                <UploadTile label="אייקון" hint="ריבוע 1024×1024" file={files.icon} onChange={(icon) => setFiles((current) => ({ ...current, icon }))} />
                <UploadTile
                  label="מסך פתיחה"
                  hint="לאורך, 1242×2688"
                  file={files.splash}
                  onChange={(splash) => setFiles((current) => ({ ...current, splash }))}
                />
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <div className="ad-stack">
              <Summary
                rows={[
                  ["שם העסק", form.businessName],
                  ["שם האפליקציה", <span key="c" dir="ltr">{form.clientName}</span>],
                  ["כתובת", form.address || "—"],
                  ["מנהל", form.adminName],
                  ["טלפון המנהל", <span key="p" dir="ltr">{form.adminPhone}</span>],
                  ["פולסים", form.autoPulseem ? "תת-חשבון חדש" : "חשבון קיים"],
                  [
                    "מיתוג",
                    <span key="b" className="ad-row" style={{ justifyContent: "flex-end" }}>
                      <span
                        aria-hidden
                        style={{ width: 16, height: 16, borderRadius: 5, background: form.primaryColor, border: "1px solid var(--line-subtle)" }}
                      />
                      <span dir="ltr">{form.primaryColor}</span>
                      <span className="ad-muted">
                        · {[files.logo && "לוגו", files.icon && "אייקון", files.splash && "מסך פתיחה"].filter(Boolean).join(", ") || "בלי תמונות"}
                      </span>
                    </span>,
                  ],
                ]}
              />
              <div className="ad-alert is-info">
                <Icon name="info" />
                <div className="ad-alert-body">
                  <p>היצירה לוקחת כחצי דקה. אל תסגרו את הדף עד שתופיע הודעת הסיום.</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="ad-card-foot">
          <button type="submit" className={`ad-btn ${last ? "is-brand" : "is-primary"}`} disabled={pending}>
            {last ? (pending ? "יוצר את העסק…" : "יצירת העסק") : "המשך"}
            {last ? null : <Icon name="arrow-left" size={16} />}
          </button>
          {step > 0 ? (
            <button type="button" className="ad-btn is-ghost" disabled={pending} onClick={() => setStep(step - 1)}>
              חזרה
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
