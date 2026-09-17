"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";

type Customer = {
  id: string;
  name: string;
  phone: string;
  plan: string;
  prepaidCredits: number;
  smsRemaining: number | null;
  createdAt: string;
  adminCount: number;
  purchaseCount: number;
  purchaseTotalIls: number;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers ?? []))
      .catch(() => setError("טעינת הלקוחות נכשלה."));
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.phone]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [customers, query]);

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <p className="admin-kicker">עסקים</p>
          <h1 className="admin-title">לקוחות</h1>
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
                <th>טלפון</th>
                <th>יתרת SMS</th>
                <th>מנהלים</th>
                <th>רכישות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <Link href={`/admin/customers/${customer.id}`}>
                      {customer.name}
                    </Link>
                  </td>
                  <td dir="ltr">{customer.phone || "—"}</td>
                  <td>
                    {customer.smsRemaining == null
                      ? "—"
                      : customer.smsRemaining.toLocaleString("he-IL")}
                  </td>
                  <td>{customer.adminCount}</td>
                  <td>
                    {customer.purchaseCount} /{" "}
                    {customer.purchaseTotalIls.toLocaleString("he-IL")} ₪
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
