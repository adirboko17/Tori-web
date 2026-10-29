"use client";
import { useEffect, useRef, useState } from "react";

const TYPES = ["ציפורניים", "גבות וריסים", "קוסמטיקה", "מספרה / ברבר", "קליניקה", "אחר"];
const WHATSAPP =
  "https://wa.me/972535575303?text=" + encodeURIComponent("היי, השארתי פרטים בדף של תורי ואשמח לשמוע עוד");
const PHONE_RE = /^0\d{8,9}$/;

/** The campaign tags the visitor arrived with, as one short line for the lead's notes. */
function readUtm() {
  const params = new URLSearchParams(window.location.search);
  return ["utm_source", "utm_medium", "utm_campaign", "utm_content"]
    .filter((key) => params.get(key))
    .map((key) => `${key.slice(4)}=${params.get(key)}`)
    .join(" ");
}

/** Tells the ad platforms a lead was left (each one loads only after cookie consent). */
function reportLead() {
  window.fbq?.("track", "Lead");
  window.gtag?.("event", "generate_lead");
  window.dataLayer?.push({ event: "lead_submitted" });
}

function check(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "צריך למלא שם";
  if (!PHONE_RE.test(values.phone.replace(/[\s-]/g, ""))) errors.phone = "צריך מספר טלפון תקין, למשל 050-1234567";
  if (!values.businessType) errors.businessType = "צריך לבחור תחום";
  return errors;
}

function ArrowDot() {
  return (
    <span className="lp-cta-dot" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
    </span>
  );
}

function Done({ name }) {
  const ref = useRef(null);
  useEffect(() => ref.current.focus(), []);
  return (
    <div className="lp-done" ref={ref} tabIndex={-1} role="status">
      <span className="lp-done-check" aria-hidden="true">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5L20 7" />
        </svg>
      </span>
      <strong className="lp-done-title">{`תודה ${name}, קיבלנו!`}</strong>
      <span className="lp-done-text">נחזור אליכם תוך שעה לשיחה קצרה, בלי התחייבות. בימים א׳ עד ה׳, בין 9:00 ל־17:00.</span>
      <a className="lp-wa" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
        דברו איתנו עכשיו בוואטסאפ
      </a>
    </div>
  );
}

/** The lead form: name, phone and business type, with errors that a screen
    reader announces and focus that moves to the first field to fix. */
export default function LeadForm() {
  const [values, setValues] = useState({ name: "", phone: "", businessType: "", business: "", website: "" });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");
  const [serverError, setServerError] = useState("");
  const formRef = useRef(null);

  function set(key) {
    return (e) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
    };
  }

  async function submit(e) {
    e.preventDefault();
    if (state === "sending") return;
    const found = check(values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      formRef.current.querySelector(`[data-field="${first}"]`).focus();
      return;
    }
    setState("sending");
    setServerError("");
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, utm: readUtm() }),
    }).catch(() => null);
    const data = await response?.json().catch(() => null);
    if (!response?.ok) {
      setState("idle");
      setServerError(data?.error || "השליחה נכשלה. בדקו את החיבור ונסו שוב.");
      return;
    }
    reportLead();
    setState("done");
  }

  if (state === "done") return <Done name={values.name.trim().split(" ")[0]} />;

  const sending = state === "sending";
  return (
    <form ref={formRef} className="lp-form" onSubmit={submit} noValidate aria-labelledby="lp-form-title">
      <div className="lp-field">
        <label htmlFor="lp-name">שם מלא</label>
        <input
          id="lp-name"
          data-field="name"
          className="lp-input"
          autoComplete="name"
          placeholder="איך קוראים לך?"
          value={values.name}
          onChange={set("name")}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "lp-name-err" : undefined}
        />
        {errors.name && <span className="lp-err" id="lp-name-err">{errors.name}</span>}
      </div>

      <div className="lp-field">
        <label htmlFor="lp-phone">טלפון</label>
        <input
          id="lp-phone"
          data-field="phone"
          className="lp-input"
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="tel-national"
          placeholder="050-1234567"
          value={values.phone}
          onChange={set("phone")}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "lp-phone-err" : undefined}
        />
        {errors.phone && <span className="lp-err" id="lp-phone-err">{errors.phone}</span>}
      </div>

      <fieldset
        className="lp-field lp-types"
        aria-describedby={errors.businessType ? "lp-type-err" : undefined}
      >
        <legend>תחום העסק</legend>
        <div className="lp-pills">
          {TYPES.map((type, i) => (
            <label key={type} className="lp-pill">
              <input
                type="radio"
                name="businessType"
                value={type}
                data-field={i === 0 ? "businessType" : undefined}
                checked={values.businessType === type}
                onChange={set("businessType")}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
        {errors.businessType && <span className="lp-err" id="lp-type-err">{errors.businessType}</span>}
      </fieldset>

      <div className="lp-field">
        <label htmlFor="lp-business">
          שם העסק <small>לא חובה</small>
        </label>
        <input
          id="lp-business"
          className="lp-input"
          autoComplete="organization"
          placeholder="למשל: שירן ניילס"
          value={values.business}
          onChange={set("business")}
        />
      </div>

      <div className="lp-trap" aria-hidden="true">
        <label htmlFor="lp-website">אתר</label>
        <input id="lp-website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
      </div>

      <button className="lp-cta lp-submit" type="submit" disabled={sending} aria-busy={sending}>
        <span>{sending ? "שולחים..." : "אני רוצה אפליקציה כזו"}</span>
        <ArrowDot />
      </button>
      <p className="lp-form-note" role="alert">
        {serverError || "בלי התחייבות. הפרטים נשארים אצלנו בלבד."}
      </p>
    </form>
  );
}

export { ArrowDot };
