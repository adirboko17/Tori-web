"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import type { AdminBusiness } from "@/lib/admin/businesses";
import { formatDate, formatNumber, LOW_SMS_BALANCE } from "../../_ui/format";
import { Icon } from "../../_ui/icon";
import {
  Avatar,
  EmptyState,
  ErrorState,
  FilterChips,
  PageHeader,
  SearchField,
  SkeletonRows,
} from "../../_ui/parts";
import { useAdminData } from "../../_ui/use-admin-data";
import { useSmsBalances, type SmsBalance } from "../../_ui/use-sms-balances";
import { SubscriptionBadge } from "./_parts";

type Filter = "all" | "active" | "cancelling" | "low" | "no-sms";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "הכול" },
  { value: "active", label: "מנוי פעיל" },
  { value: "cancelling", label: "ביקשו לבטל" },
  { value: "low", label: "יתרה נמוכה" },
  { value: "no-sms", label: "בלי פולסים" },
];

function isFilter(value: string | null): value is Filter {
  return FILTERS.some((filter) => filter.value === value);
}

function matches(business: AdminBusiness, filter: Filter, balance: SmsBalance | undefined) {
  switch (filter) {
    case "active":
      return business.subscription === "active";
    case "cancelling":
      return Boolean(business.openCancellation);
    case "low":
      return balance?.credits != null && balance.credits < LOW_SMS_BALANCE;
    case "no-sms":
      return !business.hasPulseem;
    default:
      return true;
  }
}

function SmsCell({ business, balance }: { business: AdminBusiness; balance: SmsBalance | undefined }) {
  if (!business.hasPulseem) return <span className="ad-faint">לא מחובר</span>;
  if (!balance) return <span className="ad-skel" style={{ display: "inline-block", width: 56, height: 14 }} />;
  if (balance.credits == null) {
    return (
      <span className="ad-faint" title={balance.message}>
        לא זמין
      </span>
    );
  }
  const low = balance.credits < LOW_SMS_BALANCE;
  return (
    <span
      className="ad-num"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        color: low ? "var(--red-700)" : undefined,
        fontWeight: 600,
      }}
    >
      {formatNumber(balance.credits)}
      {low ? <Icon name="triangle-alert" size={14} label="יתרה נמוכה" /> : null}
    </span>
  );
}

function BusinessesList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("filter");
  const [filter, setFilter] = useState<Filter>(isFilter(initial) ? initial : "all");
  const [query, setQuery] = useState("");
  const { data, error, loading, reload } = useAdminData<{ businesses: AdminBusiness[] }>(
    "/api/admin/businesses",
  );
  const businesses = useMemo(() => data?.businesses ?? [], [data]);
  const balances = useSmsBalances(
    businesses.filter((business) => business.hasPulseem).map((business) => business.id),
  );

  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map((option) => [
          option.value,
          businesses.filter((business) => matches(business, option.value, balances[business.id])).length,
        ]),
      ) as Record<Filter, number>,
    [businesses, balances],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return businesses.filter((business) => {
      if (!matches(business, filter, balances[business.id])) return false;
      if (!needle) return true;
      return [business.name, business.phone, business.clientName ?? "", business.address]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [businesses, balances, filter, query]);

  function changeFilter(next: Filter) {
    setFilter(next);
    router.replace(next === "all" ? "/admin/businesses" : `/admin/businesses?filter=${next}`, {
      scroll: false,
    });
  }

  return (
    <>
      <PageHeader
        title="עסקים"
        description="כל העסקים, האפליקציות והמנויים במקום אחד."
        actions={
          <Link href="/admin/businesses/new" className="ad-btn is-brand">
            <Icon name="plus" />
            עסק חדש
          </Link>
        }
      />

      <section className="ad-card">
        <div className="ad-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="חיפוש לפי שם, טלפון או שם אפליקציה" />
          <FilterChips
            label="סינון עסקים"
            value={filter}
            onChange={changeFilter}
            options={FILTERS.map((option) => ({
              ...option,
              count: loading ? undefined : counts[option.value],
            }))}
          />
        </div>

        {error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <SkeletonRows rows={6} />
        ) : visible.length === 0 ? (
          businesses.length === 0 ? (
            <EmptyState
              icon="store"
              title="עדיין אין עסקים"
              body="אחרי שתיצרו עסק ראשון הוא יופיע כאן."
              action={
                <Link href="/admin/businesses/new" className="ad-btn is-primary is-sm">
                  יצירת עסק
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon="search"
              title="לא נמצאו עסקים"
              body="נסו חיפוש אחר או הסירו את הסינון."
              action={
                <button
                  type="button"
                  className="ad-btn is-secondary is-sm"
                  onClick={() => {
                    setQuery("");
                    changeFilter("all");
                  }}
                >
                  ניקוי הסינון
                </button>
              }
            />
          )
        ) : (
          <>
            <div className="ad-table-wrap">
              <table className="ad-table is-responsive">
                <thead>
                  <tr>
                    <th>עסק</th>
                    <th>טלפון</th>
                    <th>יתרת SMS</th>
                    <th>מנוי</th>
                    <th>לקוחות</th>
                    <th>הצטרפות</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((business) => {
                    const href = `/admin/businesses/${business.id}`;
                    return (
                      <tr key={business.id} className="is-clickable" onClick={() => router.push(href)}>
                        <td className="is-primary">
                          <div className="ad-entity">
                            <Avatar name={business.name} src={business.iconUrl} color={business.primaryColor} />
                            <div className="ad-entity-text">
                              <Link href={href} className="ad-entity-title" onClick={(event) => event.stopPropagation()}>
                                {business.name}
                              </Link>
                              <span className="ad-entity-sub" dir="ltr">
                                {business.clientName || "ללא אפליקציה"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td data-label="טלפון" className="is-nowrap" dir="ltr">
                          {business.phone || "—"}
                        </td>
                        <td data-label="יתרת SMS">
                          <SmsCell business={business} balance={balances[business.id]} />
                        </td>
                        <td data-label="מנוי">
                          <SubscriptionBadge business={business} />
                        </td>
                        <td data-label="לקוחות" className="is-num">
                          {formatNumber(business.clientCount)}
                        </td>
                        <td data-label="הצטרפות" className="is-nowrap ad-muted">
                          {formatDate(business.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="ad-table-foot">
              מוצגים {visible.length} מתוך {businesses.length} עסקים
            </div>
          </>
        )}
      </section>
    </>
  );
}

export default function BusinessesPage() {
  return (
    <Suspense fallback={<SkeletonRows rows={6} />}>
      <BusinessesList />
    </Suspense>
  );
}
