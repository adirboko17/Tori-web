"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";

type Purchase = {
  id: string;
  businessId: string;
  businessName: string;
  packageId: string;
  smsCredits: number;
  amountIls: number;
  status: string;
  createdAt: string;
};

function statusClass(status: string) {
  if (["paid", "fulfilled", "processing"].includes(status)) return "is-paid";
  if (status === "failed") return "is-failed";
  return "is-pending";
}

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/purchases")
      .then((res) => res.json())
      .then((data) => setPurchases(data.purchases ?? []))
      .catch(() => setError("טעינת הרכישות נכשלה."));
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return purchases;
    return purchases.filter((purchase) =>
      [purchase.businessName, purchase.packageId, purchase.status]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [purchases, query]);

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <p className="admin-kicker">תשלומים</p>
          <h1 className="admin-title">רכישות</h1>
        </div>
        <div className="admin-search">
          <label className="admin-field">
            חיפוש
            <input
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setQuery(event.target.value)
              }
            />
          </label>
        </div>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>עסק</th>
                <th>חבילה</th>
                <th>הודעות</th>
                <th>סכום</th>
                <th>סטטוס</th>
                <th>תאריך</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((purchase) => (
                <tr key={purchase.id}>
                  <td>
                    <Link href={`/admin/customers/${purchase.businessId}`}>
                      {purchase.businessName}
                    </Link>
                  </td>
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
  );
}
