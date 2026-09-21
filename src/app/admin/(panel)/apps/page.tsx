"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { adminJson } from "@/lib/superadmin/browser";
import { formatDateHe, formatSmsCredits } from "@/lib/superadmin/format";
import type { BusinessOverview, BusinessStats } from "@/lib/superadmin/types";

type Balance = { credits: string | null; message?: string };

export default function AppsPage() {
  const [businesses, setBusinesses] = useState<BusinessOverview[]>([]);
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [balances, setBalances] = useState<Record<string, Balance>>({});
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    adminJson<{ businesses: BusinessOverview[]; stats: BusinessStats }>("/api/admin/apps")
      .then(async (data) => {
        setBusinesses(data.businesses);
        setStats(data.stats);
        if (data.businesses.length === 0) return;
        const balancesData = await adminJson<{ balances: Record<string, Balance> }>(
          "/api/admin/pulseem/balances",
          {
            method: "POST",
            body: JSON.stringify({ businessIds: data.businesses.map((item) => item.id) }),
          },
        );
        setBalances(balancesData.balances);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "טעינת האפליקציות נכשלה");
      })
      .finally(() => setLoaded(true));
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return businesses;
    return businesses.filter((item) =>
      [item.display_name, item.branding_client_name, item.phone, item.adminPhone, item.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [businesses, query]);

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <p className="admin-kicker">סופר אדמין</p>
          <h1 className="admin-title">אפליקציות</h1>
        </div>
        <Link className="admin-btn" href="/admin/apps/new">
          אפליקציה חדשה
        </Link>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <section className="admin-stats">
        <article className="admin-stat">
          <span>אפליקציות</span>
          <strong>{stats ? stats.businesses : "…"}</strong>
        </article>
        <article className="admin-stat">
          <span>לקוחות</span>
          <strong>{stats ? stats.clients : "…"}</strong>
        </article>
        <article className="admin-stat">
          <span>מנהלים</span>
          <strong>{stats ? stats.admins : "…"}</strong>
        </article>
      </section>
      <label className="admin-search">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="חיפוש לפי שם, טלפון או מזהה"
        />
      </label>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>עסק</th>
              <th>טלפון</th>
              <th>לקוחות</th>
              <th>מנהלים</th>
              <th>יתרת SMS</th>
              <th>נוצר</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => {
              const balance = balances[item.id];
              return (
                <tr key={item.id}>
                  <td>
                    <Link href={`/admin/apps/${item.id}`}>
                      {item.display_name || "ללא שם"}
                    </Link>
                    <div className="admin-note">{item.branding_client_name || "—"}</div>
                  </td>
                  <td dir="ltr">{item.phone || item.adminPhone || "—"}</td>
                  <td>{item.clientCount}</td>
                  <td>{item.adminCount}</td>
                  <td>
                    {balance?.credits
                      ? formatSmsCredits(balance.credits)
                      : balance?.message || "…"}
                  </td>
                  <td>{formatDateHe(item.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!loaded ? <p className="admin-note">טוען אפליקציות…</p> : null}
      {loaded && !error && businesses.length === 0 ? <p className="admin-note">אין אפליקציות עדיין.</p> : null}
    </>
  );
}
