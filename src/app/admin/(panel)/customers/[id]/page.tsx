"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ChangeEvent } from "react";

type CustomerDetail = {
  id: string;
  name: string;
  phone: string;
  prepaidCredits: number;
  smsRemaining: number | null;
  createdAt: string;
  purchaseCount: number;
  purchaseTotalIls: number;
  openCancellation: { id: string; status: string; requestedAt: string } | null;
  payplusSubscription: {
    status: string;
    recurringUid: string;
    cancelledAt: string | null;
    amountIls: number | null;
    nextChargeAt: string | null;
    lastChargeAt: string | null;
  } | null;
  admins: { id: string; name: string; phone: string }[];
  purchases: {
    id: string;
    packageId: string;
    smsCredits: number;
    amountIls: number;
    status: string;
    createdAt: string;
  }[];
};

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

function statusClass(status: string) {
  if (["paid", "fulfilled", "processing"].includes(status)) return "is-paid";
  if (status === "failed") return "is-failed";
  return "is-pending";
}

export default function AdminCustomerPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [linking, setLinking] = useState(false);
  const [searching, setSearching] = useState(false);
  const [recurringUid, setRecurringUid] = useState("");
  const [matches, setMatches] = useState<RecurringMatch[]>([]);

  async function refresh() {
    if (!params.id) return;
    const res = await fetch(`/api/admin/customers/${params.id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "טעינת הלקוח נכשלה.");
    setCustomer(data.customer);
  }

  async function searchRecurrings(query: string) {
    setError("");
    setSearching(true);
    try {
      const res = await fetch(
        `/api/admin/payplus/recurrings?search=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "חיפוש הוראות הקבע נכשל.");
      setMatches(data.recurrings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "חיפוש הוראות הקבע נכשל.");
    } finally {
      setSearching(false);
    }
  }

  async function linkRecurring(uid: string) {
    if (!params.id) return;
    setError("");
    setLinking(true);
    try {
      const res = await fetch(`/api/admin/customers/${params.id}/link-recurring`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recurringUid: uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "חיבור הוראת הקבע נכשל.");
      setRecurringUid("");
      setMatches([]);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "חיבור הוראת הקבע נכשל.");
    } finally {
      setLinking(false);
    }
  }

  async function cancelRecurring() {
    if (!params.id) return;
    if (
      !window.confirm(
        "לבטל את הוראת הקבע ב-PayPlus? החיוב הבא לא ירוץ. המחזור שכבר שולם נשאר.",
      )
    ) {
      return;
    }
    setError("");
    setCancelling(true);
    try {
      const res = await fetch(`/api/admin/customers/${params.id}/cancel-recurring`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ביטול הוראת הקבע נכשל.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ביטול הוראת הקבע נכשל.");
    } finally {
      setCancelling(false);
    }
  }

  useEffect(() => {
    if (!params.id) return;
    refresh().catch((err) =>
      setError(err instanceof Error ? err.message : "טעינת הלקוח נכשלה."),
    );
  }, [params.id]);

  useEffect(() => {
    if (customer?.phone && !recurringUid) setRecurringUid(customer.phone);
  }, [customer?.phone]);

  return (
    <>
      <Link href="/admin/customers">חזרה ללקוחות</Link>
      <div>
        <p className="admin-kicker">לקוח</p>
        <h1 className="admin-title">{customer?.name || "…"}</h1>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      {customer?.openCancellation ? (
        <section className="admin-alert">
          <div>
            <p className="admin-kicker">בקשת ביטול</p>
            <h2 className="admin-title">הלקוח ביקש לבטל את האפליקציה</h2>
            <p className="admin-note">
              האפליקציה אמורה להמשיך לעבוד עד סוף מחזור החיוב הנוכחי. אחרי
              שתבטלו את הוראת הקבע, סמנו את הבקשה כטופלה.
            </p>
          </div>
          <Link className="admin-btn" href="/admin/cancellations">
            לבקשות הביטול
          </Link>
        </section>
      ) : null}
      {customer ? (
        <>
          <section className="admin-stats">
            <article className="admin-stat">
              <span>טלפון</span>
              <strong dir="ltr">{customer.phone || "—"}</strong>
            </article>
            <article className="admin-stat">
              <span>יתרת SMS</span>
              <strong>
                {customer.smsRemaining == null
                  ? "—"
                  : customer.smsRemaining.toLocaleString("he-IL")}
              </strong>
            </article>
            <article className="admin-stat">
              <span>רכישות</span>
              <strong>
                {customer.purchaseCount} /{" "}
                {customer.purchaseTotalIls.toLocaleString("he-IL")} ₪
              </strong>
            </article>
          </section>
          <section className="admin-card">
            <h2 className="admin-title">הוראת קבע</h2>
            {customer.payplusSubscription?.status === "active" ? (
              <>
                <section className="admin-stats">
                  <article className="admin-stat">
                    <span>סכום חיוב</span>
                    <strong>
                      {customer.payplusSubscription.amountIls
                        ? `${customer.payplusSubscription.amountIls.toLocaleString("he-IL")} ₪`
                        : "—"}
                    </strong>
                  </article>
                  <article className="admin-stat">
                    <span>חיוב הבא</span>
                    <strong>
                      {customer.payplusSubscription.nextChargeAt
                        ? new Date(
                            customer.payplusSubscription.nextChargeAt,
                          ).toLocaleDateString("he-IL")
                        : "—"}
                    </strong>
                  </article>
                </section>
                <p className="admin-note">
                  נשמר מזהה הוראת קבע מ-PayPlus. ביטול ימנע את החיוב הבא.
                </p>
                <div className="admin-row-actions">
                  <button
                    type="button"
                    className="admin-btn"
                    disabled={cancelling}
                    onClick={() => void cancelRecurring()}
                  >
                    בטל הוראת קבע
                  </button>
                </div>
              </>
            ) : (
              <>
                {customer.payplusSubscription?.status === "cancelled" ? (
                  <p className="admin-note">
                    הוראת הקבע בוטלה
                    {customer.payplusSubscription.cancelledAt
                      ? ` ב-${new Date(customer.payplusSubscription.cancelledAt).toLocaleString("he-IL")}`
                      : ""}
                    . אפשר לחבר הוראה אחרת אם צריך.
                  </p>
                ) : (
                  <p className="admin-note">
                    אין הוראת קבע שמורה. חפשו ב-PayPlus לפי שם או טלפון, או
                    הדביקו את מזהה ההוראה.
                  </p>
                )}
                <div className="admin-grid-form">
                  <label className="admin-field">
                    חיפוש ב-PayPlus
                    <input
                      value={recurringUid}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setRecurringUid(event.target.value)
                      }
                      placeholder="שם, טלפון או מזהה הוראה"
                    />
                  </label>
                </div>
                <div className="admin-row-actions">
                  <button
                    type="button"
                    className="admin-btn-ghost"
                    disabled={searching || !recurringUid.trim()}
                    onClick={() => void searchRecurrings(recurringUid)}
                  >
                    חפש ב-PayPlus
                  </button>
                  <button
                    type="button"
                    className="admin-btn"
                    disabled={linking || !recurringUid.trim()}
                    onClick={() => void linkRecurring(recurringUid.trim())}
                  >
                    חבר הוראת קבע
                  </button>
                </div>
                {matches.length > 0 ? (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>לקוח ב-PayPlus</th>
                          <th>טלפון</th>
                          <th>סכום</th>
                          <th>חיוב הבא</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches.map((match) => (
                          <tr key={match.uid}>
                            <td>
                              {match.customerName || match.number || "—"}
                              {match.valid ? null : (
                                <span className="admin-status is-failed">לא פעילה</span>
                              )}
                            </td>
                            <td dir="ltr">{match.customerPhone || "—"}</td>
                            <td>
                              {match.amount
                                ? `${match.amount.toLocaleString("he-IL")} ₪`
                                : "—"}
                            </td>
                            <td>
                              {match.nextChargeAt
                                ? new Date(match.nextChargeAt).toLocaleDateString("he-IL")
                                : match.startDate || "—"}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="admin-btn"
                                disabled={linking || !match.valid}
                                onClick={() => void linkRecurring(match.uid)}
                              >
                                חבר
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </>
            )}
          </section>
          <section className="admin-card">
            <h2 className="admin-title">מנהלי העסק</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>שם</th>
                    <th>טלפון</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.admins.map((admin) => (
                    <tr key={admin.id}>
                      <td>{admin.name}</td>
                      <td dir="ltr">{admin.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="admin-card">
            <h2 className="admin-title">רכישות</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
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
                  {customer.purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td>{purchase.packageId}</td>
                      <td>{purchase.smsCredits.toLocaleString("he-IL")}</td>
                      <td>{purchase.amountIls.toLocaleString("he-IL")} ₪</td>
                      <td>
                        <span className={`admin-status ${statusClass(purchase.status)}`}>
                          {purchase.status}
                        </span>
                      </td>
                      <td>
                        {purchase.createdAt
                          ? new Date(purchase.createdAt).toLocaleString("he-IL")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
