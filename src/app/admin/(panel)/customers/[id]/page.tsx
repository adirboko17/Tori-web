"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type CustomerDetail = {
  id: string;
  name: string;
  phone: string;
  prepaidCredits: number;
  smsRemaining: number | null;
  createdAt: string;
  purchaseCount: number;
  purchaseTotalIls: number;
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

function statusClass(status: string) {
  if (["paid", "fulfilled", "processing"].includes(status)) return "is-paid";
  if (status === "failed") return "is-failed";
  return "is-pending";
}

export default function AdminCustomerPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/admin/customers/${params.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "טעינת הלקוח נכשלה.");
        setCustomer(data.customer);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "טעינת הלקוח נכשלה."),
      );
  }, [params.id]);

  return (
    <>
      <Link href="/admin/customers">חזרה ללקוחות</Link>
      <div>
        <p className="admin-kicker">לקוח</p>
        <h1 className="admin-title">{customer?.name || "…"}</h1>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
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
