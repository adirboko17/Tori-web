"use client";

import Link from "next/link";
import { useState } from "react";
import type { AdminCustomerDetail } from "@/lib/admin/customers";
import { adminJson } from "@/lib/superadmin/browser";
import { useConfirm, useToast } from "../../../../_ui/feedback";
import { formatDate, formatDateTime, formatIls, formatNumber, purchaseStatus } from "../../../../_ui/format";
import { Icon } from "../../../../_ui/icon";
import { Badge, EmptyState, Field, SkeletonRows } from "../../../../_ui/parts";

type RecurringMatch = {
  uid: string;
  number: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  startDate: string;
  nextChargeAt: string | null;
  valid: boolean;
};

function SubscriptionCard({
  customer,
  onChange,
}: {
  customer: AdminCustomerDetail;
  onChange: () => void;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const [query, setQuery] = useState(customer.phone);
  const [matches, setMatches] = useState<RecurringMatch[] | null>(null);
  const [busy, setBusy] = useState("");
  const subscription = customer.payplusSubscription;
  const active = subscription?.status === "active";

  async function search() {
    setBusy("search");
    try {
      const data = await adminJson<{ recurrings: RecurringMatch[] }>(
        `/api/admin/payplus/recurrings?search=${encodeURIComponent(query.trim())}`,
      );
      setMatches(data.recurrings ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "החיפוש ב-PayPlus נכשל");
    } finally {
      setBusy("");
    }
  }

  async function link(uid: string) {
    setBusy(`link-${uid}`);
    try {
      const data = await adminJson<{ verified?: boolean }>(`/api/admin/customers/${customer.id}/link-recurring`, {
        method: "POST",
        body: JSON.stringify({ recurringUid: uid }),
      });
      toast.success(data.verified ? "הוראת הקבע חוברה ואומתה מול PayPlus" : "הוראת הקבע חוברה");
      setMatches(null);
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "חיבור הוראת הקבע נכשל");
    } finally {
      setBusy("");
    }
  }

  async function cancel() {
    const ok = await confirm({
      title: "לבטל את הוראת הקבע?",
      body: "החיוב הבא ב-PayPlus לא ירוץ. המחזור שכבר שולם נשאר, ובקשת ביטול פתוחה תסומן כטופלה.",
      confirmLabel: "ביטול הוראת הקבע",
      cancelLabel: "השארת המנוי",
      tone: "danger",
    });
    if (!ok) return;
    setBusy("cancel");
    try {
      await adminJson(`/api/admin/customers/${customer.id}/cancel-recurring`, { method: "POST" });
      toast.success("הוראת הקבע בוטלה");
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ביטול הוראת הקבע נכשל");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="ad-card">
      <div className="ad-card-head">
        <div>
          <h2>
            <Icon name="repeat" />
            הוראת קבע
          </h2>
          <p>המנוי החודשי ב-PayPlus</p>
        </div>
        <Badge tone={active ? "success" : "neutral"} dot>
          {active ? "פעילה" : subscription?.status === "cancelled" ? "בוטלה" : "לא מחוברת"}
        </Badge>
      </div>

      {active && subscription ? (
        <>
          <div className="ad-card-body">
            <dl className="ad-kv">
              <dt>סכום חיוב</dt>
              <dd>{formatIls(subscription.amountIls)}</dd>
              <dt>חיוב הבא</dt>
              <dd>{formatDate(subscription.nextChargeAt)}</dd>
              <dt>חיוב אחרון</dt>
              <dd>{formatDate(subscription.lastChargeAt)}</dd>
              <dt>מזהה הוראה</dt>
              <dd className="ad-ltr ad-small ad-muted">{subscription.recurringUid}</dd>
            </dl>
          </div>
          <div className="ad-card-foot">
            <button
              type="button"
              className="ad-btn is-danger-ghost"
              disabled={busy !== ""}
              onClick={() => void cancel()}
            >
              <Icon name="ban" size={16} />
              {busy === "cancel" ? "מבטל…" : "ביטול הוראת הקבע"}
            </button>
          </div>
        </>
      ) : (
        <div className="ad-card-body">
          <p className="ad-small ad-muted">
            {subscription?.status === "cancelled"
              ? `הוראת הקבע בוטלה ב-${formatDateTime(subscription.cancelledAt)}. אפשר לחבר הוראה אחרת אם צריך.`
              : "אין הוראת קבע שמורה. חפשו ב-PayPlus לפי שם או טלפון, או הדביקו מזהה הוראה."}
          </p>
          <form
            className="ad-row"
            onSubmit={(event) => {
              event.preventDefault();
              void search();
            }}
          >
            <div style={{ flex: "1 1 220px" }}>
              <Field label="חיפוש ב-PayPlus">
                <input
                  className="ad-input"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="שם, טלפון או מזהה הוראה"
                />
              </Field>
            </div>
            <div className="ad-row" style={{ alignSelf: "flex-end" }}>
              <button type="submit" className="ad-btn is-secondary" disabled={busy !== "" || !query.trim()}>
                <Icon name="search" size={16} />
                {busy === "search" ? "מחפש…" : "חיפוש"}
              </button>
              <button
                type="button"
                className="ad-btn is-ghost"
                disabled={busy !== "" || !query.trim()}
                onClick={() => void link(query.trim())}
                title="חיבור לפי מזהה ההוראה שהוזן"
              >
                חיבור לפי מזהה
              </button>
            </div>
          </form>
          {matches ? (
            matches.length ? (
              <div className="ad-table-wrap" style={{ border: "1px solid var(--line-subtle)", borderRadius: 12 }}>
                <table className="ad-table is-responsive">
                  <thead>
                    <tr>
                      <th>לקוח ב-PayPlus</th>
                      <th>טלפון</th>
                      <th>סכום</th>
                      <th>חיוב הבא</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match) => (
                      <tr key={match.uid}>
                        <td className="is-primary">
                          <span className="ad-row">
                            <strong>{match.customerName || match.number || "—"}</strong>
                            {match.valid ? null : <Badge tone="danger">לא פעילה</Badge>}
                          </span>
                        </td>
                        <td data-label="טלפון" dir="ltr">
                          {match.customerPhone || "—"}
                        </td>
                        <td data-label="סכום" className="is-num">
                          {match.amount ? formatIls(match.amount) : "—"}
                        </td>
                        <td data-label="חיוב הבא">
                          {match.nextChargeAt ? formatDate(match.nextChargeAt) : match.startDate || "—"}
                        </td>
                        <td className="is-actions">
                          <button
                            type="button"
                            className="ad-btn is-primary is-sm"
                            disabled={busy !== "" || !match.valid}
                            onClick={() => void link(match.uid)}
                          >
                            {busy === `link-${match.uid}` ? "מחבר…" : "חיבור"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="ad-small ad-muted">לא נמצאו הוראות קבע תואמות.</p>
            )
          ) : null}
        </div>
      )}
    </section>
  );
}

export function BillingTab({
  customer,
  error,
  onChange,
}: {
  customer: AdminCustomerDetail | null;
  error: string;
  onChange: () => void;
}) {
  if (!customer) {
    return (
      <section className="ad-card">
        {error ? <EmptyState icon="circle-alert" title="פרטי החיוב לא נטענו" body={error} /> : <SkeletonRows rows={4} />}
      </section>
    );
  }

  return (
    <div className="ad-stack">
      {customer.openCancellation ? (
        <div className="ad-alert is-warning">
          <Icon name="user-x" />
          <div className="ad-alert-body">
            <div className="ad-alert-title">העסק ביקש לבטל את המנוי</div>
            <p>
              הבקשה נשלחה ב-{formatDate(customer.openCancellation.requestedAt)}. האפליקציה ממשיכה לעבוד עד סוף מחזור
              החיוב. אחרי ביטול הוראת הקבע הבקשה תסומן כטופלה.
            </p>
          </div>
          <Link href="/admin/requests" className="ad-btn is-secondary is-sm">
            לבקשות
          </Link>
        </div>
      ) : null}

      <div className="ad-grid-2">
        <section className="ad-card">
          <div className="ad-card-head">
            <div>
              <h2>
                <Icon name="receipt" />
                רכישות הודעות
              </h2>
              <p>
                {customer.purchaseCount} רכישות ששולמו · סה״כ {formatIls(customer.purchaseTotalIls)}
              </p>
            </div>
          </div>
          {customer.purchases.length === 0 ? (
            <EmptyState icon="receipt" title="אין רכישות עדיין" body="רכישות של חבילות הודעות מהאפליקציה יופיעו כאן." />
          ) : (
            <div className="ad-table-wrap">
              <table className="ad-table is-responsive">
                <thead>
                  <tr>
                    <th>חבילה</th>
                    <th>הודעות</th>
                    <th>סכום</th>
                    <th>סטטוס</th>
                    <th>תאריך</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.purchases.map((purchase) => {
                    const status = purchaseStatus(purchase.status);
                    return (
                      <tr key={purchase.id}>
                        <td className="is-primary">
                          <strong>{purchase.packageLabel || purchase.packageId || "—"}</strong>
                        </td>
                        <td data-label="הודעות" className="is-num">
                          {formatNumber(purchase.smsCredits)}
                        </td>
                        <td data-label="סכום" className="is-num">
                          {formatIls(purchase.amountIls)}
                        </td>
                        <td data-label="סטטוס">
                          <span title={purchase.errorMessage ?? undefined}>
                            <Badge tone={status.tone}>{status.label}</Badge>
                          </span>
                        </td>
                        <td data-label="תאריך" className="is-nowrap ad-muted">
                          {formatDateTime(purchase.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <SubscriptionCard key={customer.payplusSubscription?.updatedAt ?? "none"} customer={customer} onChange={onChange} />
      </div>
    </div>
  );
}
