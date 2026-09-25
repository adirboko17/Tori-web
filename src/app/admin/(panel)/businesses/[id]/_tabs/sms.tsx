"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminJson } from "@/lib/superadmin/browser";
import { formatSmsCredits } from "@/lib/superadmin/format";
import { INCLUDED_SMS } from "@/lib/superadmin/pulseem-plans";
import type { PulseemEditorState } from "@/lib/superadmin/types";
import { useConfirm, useToast } from "../../../../_ui/feedback";
import { formatNumber, LOW_SMS_BALANCE } from "../../../../_ui/format";
import { Icon } from "../../../../_ui/icon";
import { EmptyState, Field } from "../../../../_ui/parts";

const TOPUP_PRESETS = [100, 250, 500, 1000] as const;
const MAX_TRANSFER = 10_000;

export function SmsTab({
  businessId,
  name,
  pulseemReady,
}: {
  businessId: string;
  name: string;
  pulseemReady: boolean;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const [state, setState] = useState<PulseemEditorState | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(true);
  const [busy, setBusy] = useState("");
  const [preset, setPreset] = useState<number | null>(500);
  const [custom, setCustom] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [sender, setSender] = useState("");

  const hasAccount = Boolean(state?.hasApiKey || (state?.userId && state.hasPassword)) || pulseemReady;

  const fetchBalance = useCallback(async () => {
    const data = await adminJson<{ directSmsCredits?: string }>("/api/admin/pulseem/balance", {
      method: "POST",
      body: JSON.stringify({ businessId, subAccountName: name }),
    });
    const parsed = Number(data.directSmsCredits);
    return Number.isFinite(parsed) ? parsed : null;
  }, [businessId, name]);

  const fetchState = useCallback(
    () =>
      adminJson<{ state: PulseemEditorState }>("/api/admin/pulseem/state", {
        method: "POST",
        body: JSON.stringify({ businessId }),
      }).then((data) => data.state),
    [businessId],
  );

  const applyState = useCallback((next: PulseemEditorState) => {
    setState(next);
    setUserId(next.userId);
    setSender(next.fromNumber);
  }, []);

  const applyBalance = useCallback((promise: Promise<number | null>) => {
    return promise
      .then((value) => {
        setBalance(value);
        setBalanceError("");
        setRefreshedAt(new Date());
      })
      .catch((error: unknown) => {
        setBalanceError(error instanceof Error ? error.message : "לא ניתן לטעון יתרה");
      })
      .finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchState().then(applyState).catch(() => undefined);
    void applyBalance(fetchBalance());
  }, [fetchState, fetchBalance, applyState, applyBalance]);

  function refreshBalance() {
    setRefreshing(true);
    return applyBalance(fetchBalance());
  }

  const amount = useMemo(() => {
    if (preset != null) return preset;
    const value = Number(custom);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  }, [preset, custom]);

  const amountValid = amount > 0 && amount <= MAX_TRANSFER;
  const pct = balance == null ? 0 : Math.max(0, Math.min(100, (balance / INCLUDED_SMS) * 100));
  const tone =
    balance == null ? "" : balance < LOW_SMS_BALANCE ? "is-low" : balance < INCLUDED_SMS / 2 ? "is-mid" : "";

  async function run(label: string, action: () => Promise<string>) {
    setBusy(label);
    try {
      toast.success(await action());
      await Promise.all([fetchState().then(applyState).catch(() => undefined), refreshBalance()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "הפעולה נכשלה");
    } finally {
      setBusy("");
    }
  }

  async function topUp() {
    if (!amountValid) return;
    const ok = await confirm({
      title: `להטעין ${formatNumber(amount)} הודעות?`,
      body: `ההודעות יועברו מהחשבון הראשי בפולסים אל ${name}. אי אפשר להחזיר אותן אחרי ההעברה.`,
      confirmLabel: "הטענה",
    });
    if (!ok) return;
    await run("transfer", async () => {
      const data = await adminJson<{ smsCreditsAfter?: number | null }>("/api/admin/pulseem/transfer", {
        method: "POST",
        body: JSON.stringify({ businessId, smsCredits: amount }),
      });
      const after = typeof data.smsCreditsAfter === "number" ? data.smsCreditsAfter : null;
      return `הוטענו ${formatNumber(amount)} הודעות${after != null ? `. יתרה חדשה: ${formatNumber(after)}` : ""}`;
    });
  }

  return (
    <div className="ad-grid-halves">
      <div className="ad-stack">
        <section className={`ad-balance ${tone}`} aria-label="יתרת SMS">
          <div className="ad-balance-head">
            <span>
              יתרת הודעות SMS
              {refreshedAt ? (
                <>
                  {" · "}עודכן{" "}
                  {refreshedAt.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                </>
              ) : null}
            </span>
            <button
              type="button"
              className={`ad-icon-btn ${refreshing ? "is-spinning" : ""}`}
              onClick={() => void refreshBalance()}
              disabled={refreshing}
              aria-label="רענון היתרה"
              title="רענון היתרה"
            >
              <Icon name="refresh-cw" size={17} />
            </button>
          </div>
          {hasAccount ? (
            <>
              <div className="ad-balance-value">
                {balance == null && refreshing ? (
                  <span className="ad-skel" />
                ) : (
                  <strong>{balance == null ? "—" : formatSmsCredits(String(balance))}</strong>
                )}
                <span>הודעות זמינות</span>
              </div>
              <div className="ad-meter" aria-hidden>
                <i style={{ width: `${pct}%` }} />
              </div>
              <div className="ad-balance-caption">
                <span>
                  {balance == null
                    ? `${formatNumber(INCLUDED_SMS)} הודעות כלולות בחודש`
                    : balance >= INCLUDED_SMS
                      ? `${formatNumber(balance - INCLUDED_SMS)}+ מעבר ל-${formatNumber(INCLUDED_SMS)} הכלולות`
                      : balance < LOW_SMS_BALANCE
                        ? "יתרה נמוכה, כדאי להטעין"
                        : `${Math.round(pct)}% מהחבילה החודשית`}
                </span>
                <span>מתחדש ל-{formatNumber(INCLUDED_SMS)} בכל 1 לחודש</span>
              </div>
              {balanceError ? (
                <div className="ad-error-box">
                  <Icon name="circle-alert" size={16} />
                  {balanceError}
                </div>
              ) : null}
            </>
          ) : (
            <p style={{ color: "rgba(255,255,255,.7)", fontSize: 14 }}>אין חשבון פולסים מחובר לעסק הזה.</p>
          )}
        </section>

        {hasAccount ? (
          <section className="ad-card">
            <div className="ad-card-head">
              <div>
                <h2>הטענת הודעות</h2>
                <p>העברה מהחשבון הראשי, עד {formatNumber(MAX_TRANSFER)} הודעות בפעם.</p>
              </div>
            </div>
            <div className="ad-card-body">
              <div className="ad-presets" role="group" aria-label="כמות להטענה">
                {TOPUP_PRESETS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="ad-preset"
                    aria-pressed={preset === value}
                    onClick={() => {
                      setPreset(value);
                      setCustom("");
                    }}
                  >
                    +{formatNumber(value)}
                  </button>
                ))}
              </div>
              <Field
                label="או כמות אחרת"
                error={amount > MAX_TRANSFER ? `מקסימום ${formatNumber(MAX_TRANSFER)} בהעברה אחת` : undefined}
              >
                <input
                  className="ad-input"
                  dir="ltr"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_TRANSFER}
                  placeholder="למשל 750"
                  value={custom}
                  onFocus={() => setPreset(null)}
                  onChange={(event) => {
                    setPreset(null);
                    setCustom(event.target.value);
                  }}
                />
              </Field>
            </div>
            <div className="ad-card-foot">
              <button
                type="button"
                className="ad-btn is-primary"
                disabled={busy !== "" || !amountValid}
                onClick={() => void topUp()}
              >
                <Icon name="zap" size={16} />
                {busy === "transfer"
                  ? "מטעין…"
                  : amountValid
                    ? `הטענת ${formatNumber(amount)} הודעות`
                    : "בחרו כמות להטענה"}
              </button>
            </div>
          </section>
        ) : (
          <section className="ad-card">
            <EmptyState
              icon="message-square"
              title="לעסק אין חשבון פולסים"
              body="תת-חשבון נוצר אוטומטית כשיוצרים עסק חדש. אם כבר יש לעסק חשבון, אפשר לחבר אותו בפרטי החיבור."
            />
          </section>
        )}
      </div>

      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h2>
              <Icon name="key-round" />
              פרטי חיבור לפולסים
            </h2>
            <p>נשמרים מוצפנים ומסונכרנים לקובץ ה-.env של המיתוג.</p>
          </div>
        </div>
        <div className="ad-card-body">
          <Field label="מזהה משתמש (WS)">
            <input className="ad-input" dir="ltr" value={userId} onChange={(event) => setUserId(event.target.value)} />
          </Field>
          <Field label="סיסמה" hint={state?.hasPassword ? "יש סיסמה שמורה. השאירו ריק כדי לא לשנות." : undefined}>
            <input
              className="ad-input"
              dir="ltr"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <Field label="מספר או שם שולח" hint="מה שהלקוחות רואים כשולח ההודעה.">
            <input className="ad-input" dir="ltr" value={sender} onChange={(event) => setSender(event.target.value)} />
          </Field>
        </div>
        <div className="ad-card-foot">
          <button
            type="button"
            className="ad-btn is-primary"
            disabled={busy !== ""}
            onClick={() =>
              void run("save", async () => {
                await adminJson("/api/admin/pulseem/save", {
                  method: "POST",
                  body: JSON.stringify({ businessId, userId, password, fromNumber: sender }),
                });
                setPassword("");
                return "פרטי פולסים נשמרו וסונכרנו";
              })
            }
          >
            <Icon name="save" size={16} />
            {busy === "save" ? "שומר…" : "שמירה"}
          </button>
          <button
            type="button"
            className="ad-btn is-secondary"
            disabled={busy !== "" || !userId.trim() || !password}
            title={!password ? "צריך להזין סיסמה כדי לבדוק" : undefined}
            onClick={() =>
              void run("test", async () => {
                const data = await adminJson<{ credits?: string; balanceNote?: string | null }>(
                  "/api/admin/pulseem/test",
                  {
                    method: "POST",
                    body: JSON.stringify({ businessId, userId, password, subAccountName: name }),
                  },
                );
                return `החיבור תקין. יתרה: ${formatSmsCredits(data.credits) ?? "—"}${
                  data.balanceNote ? ` (${data.balanceNote})` : ""
                }`;
              })
            }
          >
            {busy === "test" ? "בודק…" : "בדיקת חיבור"}
          </button>
        </div>
      </section>
    </div>
  );
}
