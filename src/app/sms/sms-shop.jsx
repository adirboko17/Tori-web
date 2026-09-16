"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Button, Input, Logo } from "@/components/ui";

function formatCount(value) {
  return Number(value).toLocaleString("he-IL");
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
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api("/api/sms/me")
      .then((data) => {
        if (cancelled || !data.user) return;
        setShop(data);
        setPackageId(
          data.packages?.find((pack) => pack.featured)?.id ?? "pack_5000",
        );
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

  const selected = shop?.packages.find((pack) => pack.id === packageId);

  async function submitPhone() {
    setPhoneError("");
    setLoading(true);
    try {
      const data = await api("/api/sms/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      if (data.phone) setPhone(data.phone);
      if (data.needsBusiness && data.businesses?.length) {
        setBusinesses(data.businesses);
        setBusinessId(data.businesses[0].id);
        setStep("business");
        return;
      }
      if (data.businessId) setBusinessId(data.businessId);
      setCode("");
      setStep("otp");
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
      if (data.phone) setPhone(data.phone);
      if (data.businessId) setBusinessId(data.businessId);
      setCode("");
      setStep("otp");
    } catch (error) {
      setPhoneError(error instanceof Error ? error.message : "שליחת הקוד נכשלה.");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp() {
    setOtpError("");
    setLoading(true);
    try {
      const data = await api("/api/sms/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, businessId, code }),
      });
      setShop(data);
      setPackageId(
        data.packages.find((pack) => pack.featured)?.id ?? data.packages[0]?.id,
      );
      setStep("store");
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "אימות הקוד נכשל.");
    } finally {
      setLoading(false);
    }
  }

  async function checkout() {
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

  return (
    <div className="sms-page">
      <div className="sms-shell">
        <header className="sms-brand">
          <Link href="/" aria-label="חזרה לאתר תורי">
            <Logo size={36} />
          </Link>
          <Link href="/">חזרה לאתר</Link>
        </header>

        {booting ? (
          <section className="sms-card">
            <p className="sms-lead">טוענים…</p>
          </section>
        ) : null}

        {!booting && step === "phone" ? (
          <section className="sms-card">
            <p className="sms-kicker">מנהלי עסק</p>
            <h1 className="sms-title">הוספת הודעות SMS</h1>
            <p className="sms-lead">
              מזין את הנייד שמחובר כמנהל בתורי. נשלח קוד רק אם המספר מזוהה.
            </p>
            <form
              className="sms-form"
              onSubmit={(event) => {
                event.preventDefault();
                void submitPhone();
              }}
            >
              <Input
                label="מספר נייד"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                placeholder="05XXXXXXXX"
                value={phone}
                error={phoneError}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setPhoneError("");
                }}
              />
              <div className="sms-actions">
                <Button type="submit" variant="secondary" size="lg" block disabled={loading}>
                  {loading ? "בודקים…" : "המשך"}
                </Button>
              </div>
            </form>
          </section>
        ) : null}

        {!booting && step === "business" ? (
          <section className="sms-card">
            <p className="sms-kicker">{phone}</p>
            <h1 className="sms-title">בחירת עסק</h1>
            <p className="sms-lead">המספר משויך לכמה עסקים. בחרו לאיזה עסק להוסיף הודעות.</p>
            <div className="sms-businesses">
              {businesses.map((business) => (
                <button
                  key={business.id}
                  type="button"
                  className="sms-choice"
                  aria-pressed={businessId === business.id}
                  onClick={() => setBusinessId(business.id)}
                >
                  <strong>{business.name}</strong>
                </button>
              ))}
            </div>
            {phoneError ? (
              <p className="sms-note" style={{ color: "var(--text-danger)" }}>
                {phoneError}
              </p>
            ) : null}
            <div className="sms-actions">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                block
                disabled={loading || !businessId}
                onClick={() => void submitBusiness()}
              >
                {loading ? "שולחים קוד…" : "שליחת קוד"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                block
                disabled={loading}
                onClick={() => setStep("phone")}
              >
                חזרה
              </Button>
            </div>
          </section>
        ) : null}

        {!booting && step === "otp" ? (
          <section className="sms-card">
            <p className="sms-kicker">נשלח אל {phone}</p>
            <h1 className="sms-title">קוד אימות</h1>
            <p className="sms-lead">הזינו את הקוד בן 6 הספרות שקיבלתם ב-SMS.</p>
            <form
              className="sms-form"
              onSubmit={(event) => {
                event.preventDefault();
                void submitOtp();
              }}
            >
              <Input
                label="קוד בן 6 ספרות"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                dir="ltr"
                maxLength={6}
                className="sms-otp"
                value={code}
                error={otpError}
                onChange={(event) => {
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setOtpError("");
                }}
              />
              <div className="sms-actions">
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  block
                  disabled={loading || code.length !== 6}
                >
                  {loading ? "מאמתים…" : "אימות"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  block
                  disabled={loading}
                  onClick={() => setStep(businesses.length > 1 ? "business" : "phone")}
                >
                  חזרה
                </Button>
              </div>
            </form>
          </section>
        ) : null}

        {!booting && step === "store" && shop ? (
          <section className="sms-card">
            <p className="sms-kicker">רכישת הודעות</p>
            <h1 className="sms-title">{shop.user.businessName}</h1>
            <div className="sms-balance">
              <span className="sms-balance-label">יתרה</span>
              <strong className="sms-balance-value">
                {formatCount(
                  shop.balance.total ||
                    shop.balance.packageCredits + shop.balance.prepaidCredits,
                )}
              </strong>
              <span className="sms-balance-unit">הודעות</span>
            </div>
            <p className="sms-note">
              הודעות שנקנות כאן נשארות מעל החבילה החודשית ולא מתאפסות ב-1 לחודש.
            </p>
            <div className="sms-packs">
              {shop.packages.map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  className="sms-pack"
                  aria-pressed={packageId === pack.id}
                  onClick={() => setPackageId(pack.id)}
                >
                  <div className="sms-pack-top">
                    <span className="sms-pack-name">{pack.label}</span>
                    {pack.featured ? <Badge tone="lime">הכי משתלם</Badge> : null}
                  </div>
                  <span className="sms-pack-price">{`${formatCount(pack.amountIls)} ₪`}</span>
                </button>
              ))}
            </div>
            {storeError ? (
              <p className="sms-note" style={{ color: "var(--text-danger)" }}>
                {storeError}
              </p>
            ) : null}
            <div className="sms-actions">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                block
                disabled={loading || !selected}
                onClick={() => {
                  if (!shop.checkoutReady) {
                    setStoreError("סליקה עדיין לא הוגדרה.");
                    return;
                  }
                  void checkout();
                }}
              >
                {loading
                  ? "מעבירים לתשלום…"
                  : shop.checkoutReady && selected
                    ? `תשלום ${formatCount(selected.amountIls)} ₪`
                    : "סליקה עדיין לא הוגדרה"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                block
                disabled={loading}
                onClick={() => void logout()}
              >
                יציאה
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
