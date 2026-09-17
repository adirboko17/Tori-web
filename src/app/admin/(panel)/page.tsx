"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Dashboard = {
  monthlyPriceIls: number;
  total: number;
  packages: number;
  customers: number;
  purchases: number;
  openCancellations: number;
};

async function loadDashboard(): Promise<Dashboard> {
  const [pricing, packages, customers, purchases, cancellations] = await Promise.all([
    fetch("/api/admin/pricing").then((res) => res.json()),
    fetch("/api/admin/packages").then((res) => res.json()),
    fetch("/api/admin/customers").then((res) => res.json()),
    fetch("/api/admin/purchases").then((res) => res.json()),
    fetch("/api/admin/cancellations").then((res) => res.json()),
  ]);
  return {
    monthlyPriceIls: Number(pricing.monthlyPriceIls ?? 0),
    total: Number(pricing.total ?? 0),
    packages: (packages.packages ?? []).length,
    customers: (customers.customers ?? []).length,
    purchases: (purchases.purchases ?? []).length,
    openCancellations: Number(cancellations.openCount ?? 0),
  };
}

export default function AdminHomePage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard()
      .then(setData)
      .catch(() => setError("טעינת לוח הבקרה נכשלה."));
  }, []);

  return (
    <>
      <div>
        <p className="admin-kicker">סקירה</p>
        <h1 className="admin-title">לוח בקרה</h1>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      {data && data.openCancellations > 0 ? (
        <section className="admin-alert">
          <div>
            <p className="admin-kicker">דורש טיפול</p>
            <h2 className="admin-title">
              {data.openCancellations} לקוחות ביקשו לבטל את האפליקציה
            </h2>
            <p className="admin-note">
              האפליקציה שלהם אמורה להמשיך לעבוד עד סוף מחזור החיוב הנוכחי.
              אחרי שתבטלו את החיוב, סמנו את הבקשה כטופלה.
            </p>
          </div>
          <Link className="admin-btn" href="/admin/cancellations">
            לבקשות הביטול
          </Link>
        </section>
      ) : null}
      <section className="admin-stats">
        <article className="admin-stat">
          <span>מחיר חודשי</span>
          <strong>{data ? `${data.monthlyPriceIls} ₪` : "…"}</strong>
        </article>
        <article className="admin-stat">
          <span>חיוב כולל מע״מ</span>
          <strong>{data ? `${data.total} ₪` : "…"}</strong>
        </article>
        <article className="admin-stat">
          <span>חבילות הודעות</span>
          <strong>{data ? data.packages : "…"}</strong>
        </article>
        <article className="admin-stat">
          <span>לקוחות</span>
          <strong>{data ? data.customers : "…"}</strong>
        </article>
        <article className="admin-stat">
          <span>רכישות</span>
          <strong>{data ? data.purchases : "…"}</strong>
        </article>
        <article className="admin-stat">
          <span>בקשות ביטול פתוחות</span>
          <strong>{data ? data.openCancellations : "…"}</strong>
        </article>
      </section>
    </>
  );
}
