"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminPurchase } from "@/lib/admin/customers";
import { formatDateTime, formatIls, formatNumber, monthKey, purchaseStatus } from "../../_ui/format";
import {
  Badge,
  EmptyState,
  ErrorState,
  FilterChips,
  SearchField,
  SkeletonRows,
  StatCard,
} from "../../_ui/parts";
import { MainPulseemStat, useMainPulseemBalance } from "../../_ui/pulseem-main";
import { useAdminData } from "../../_ui/use-admin-data";

type Filter = "all" | "paid" | "pending" | "failed";

const PAID = ["paid", "fulfilled", "processing"];

function matches(purchase: AdminPurchase, filter: Filter) {
  if (filter === "paid") return PAID.includes(purchase.status);
  if (filter === "pending") return purchase.status === "pending";
  if (filter === "failed") return purchase.status === "failed";
  return true;
}

export default function PurchasesPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const { data, error, loading, reload } = useAdminData<{ purchases: AdminPurchase[] }>("/api/admin/purchases");
  const mainBalance = useMainPulseemBalance();
  const purchases = useMemo(() => data?.purchases ?? [], [data]);

  const month = useMemo(() => {
    const current = monthKey(new Date());
    const paid = purchases.filter(
      (purchase) => PAID.includes(purchase.status) && monthKey(purchase.paidAt || purchase.createdAt) === current,
    );
    return {
      total: paid.reduce((sum, purchase) => sum + purchase.amountIls, 0),
      count: paid.length,
      credits: paid.reduce((sum, purchase) => sum + purchase.smsCredits, 0),
      failed: purchases.filter((purchase) => purchase.status === "failed").length,
    };
  }, [purchases]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        (["all", "paid", "pending", "failed"] as Filter[]).map((value) => [
          value,
          purchases.filter((purchase) => matches(purchase, value)).length,
        ]),
      ) as Record<Filter, number>,
    [purchases],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return purchases.filter(
      (purchase) =>
        matches(purchase, filter) &&
        (!needle || `${purchase.businessName} ${purchase.packageLabel ?? ""}`.toLowerCase().includes(needle)),
    );
  }, [purchases, filter, query]);

  return (
    <>
      <section className="ad-stats" aria-label="סיכום רכישות">
        <StatCard highlight loading={loading} icon="banknote" label="הכנסות SMS החודש" value={formatIls(month.total)} hint={`${month.count} רכישות`} />
        <MainPulseemStat balance={mainBalance} />
        <StatCard loading={loading} icon="message-square" label="הודעות שנמכרו החודש" value={formatNumber(month.credits)} />
        <StatCard
          loading={loading}
          icon="circle-x"
          label="רכישות שנכשלו"
          value={formatNumber(month.failed)}
          hint="תשלום שנדחה או הטענה שלא הושלמה"
        />
      </section>

      <section className="ad-card">
        <div className="ad-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="חיפוש לפי עסק או חבילה" />
          <FilterChips
            label="סינון לפי סטטוס"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "הכול", count: loading ? undefined : counts.all },
              { value: "paid", label: "שולמו", count: loading ? undefined : counts.paid },
              { value: "pending", label: "ממתינות לתשלום", count: loading ? undefined : counts.pending },
              { value: "failed", label: "נכשלו", count: loading ? undefined : counts.failed },
            ]}
          />
        </div>
        {error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <SkeletonRows rows={6} avatar={false} />
        ) : visible.length === 0 ? (
          <EmptyState icon="receipt" title="אין רכישות להצגה" body="רכישות של חבילות הודעות מהאפליקציות יופיעו כאן." />
        ) : (
          <>
            <div className="ad-table-wrap">
              <table className="ad-table is-responsive">
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
                  {visible.map((purchase) => {
                    const status = purchaseStatus(purchase.status);
                    return (
                      <tr key={purchase.id}>
                        <td className="is-primary">
                          <Link href={`/admin/businesses/${purchase.businessId}?tab=billing`} className="ad-entity-title">
                            {purchase.businessName}
                          </Link>
                          {purchase.errorMessage && purchase.status === "failed" ? (
                            <span className="ad-entity-sub" style={{ color: "var(--red-700)", whiteSpace: "normal" }}>
                              {purchase.errorMessage}
                            </span>
                          ) : null}
                        </td>
                        <td data-label="חבילה">{purchase.packageLabel || purchase.packageId || "—"}</td>
                        <td data-label="הודעות" className="is-num">
                          {formatNumber(purchase.smsCredits)}
                        </td>
                        <td data-label="סכום" className="is-num">
                          {formatIls(purchase.amountIls)}
                        </td>
                        <td data-label="סטטוס">
                          <Badge tone={status.tone}>{status.label}</Badge>
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
            <div className="ad-table-foot">מוצגות {visible.length} מתוך {purchases.length} הרכישות האחרונות</div>
          </>
        )}
      </section>
    </>
  );
}
