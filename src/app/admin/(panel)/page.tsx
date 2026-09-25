"use client";

import Link from "next/link";
import type { AdminSummary, ActivityItem } from "@/lib/admin/summary";
import { formatIls, formatNumber, formatRelative, LOW_SMS_BALANCE } from "../_ui/format";
import { Icon, type IconName } from "../_ui/icon";
import { EmptyState, ErrorState, PageHeader, SkeletonRows, StatCard } from "../_ui/parts";
import { useAdminData } from "../_ui/use-admin-data";
import { useSmsBalances } from "../_ui/use-sms-balances";

type Attention = {
  id: string;
  icon: IconName;
  tone: "warning" | "danger" | "info";
  title: string;
  detail: string;
  at?: string | null;
  href: string;
};

const ACTIVITY_ICON: Record<ActivityItem["kind"], { icon: IconName; tone: string }> = {
  business: { icon: "store", tone: "is-success" },
  purchase: { icon: "banknote", tone: "is-info" },
  cancellation: { icon: "user-x", tone: "is-warning" },
  deletion: { icon: "trash-2", tone: "is-danger" },
};

const todayFormat = new Intl.DateTimeFormat("he-IL", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function buildAttention(
  summary: AdminSummary,
  balances: ReturnType<typeof useSmsBalances>,
): Attention[] {
  const items: Attention[] = [];
  for (const request of summary.openCancellations) {
    items.push({
      id: `c-${request.id}`,
      icon: "user-x",
      tone: "warning",
      title: `${request.businessName} ביקשו לבטל את המנוי`,
      detail: `${request.requestedByName}${request.status === "seen" ? " · נצפה" : " · בקשה חדשה"}`,
      at: request.requestedAt,
      href: "/admin/requests",
    });
  }
  for (const request of summary.recentDeletions) {
    items.push({
      id: `d-${request.id}`,
      icon: "trash-2",
      tone: "danger",
      title: `בקשת מחיקת חשבון: ${request.fullName || "משתמש"}`,
      detail: request.appName || "אפליקציה לא ידועה",
      at: request.createdAt,
      href: "/admin/requests/deletions",
    });
  }
  for (const purchase of summary.failedPurchases) {
    items.push({
      id: `p-${purchase.id}`,
      icon: "circle-x",
      tone: "danger",
      title: `רכישה נכשלה: ${purchase.businessName}`,
      detail: `${formatNumber(purchase.smsCredits)} הודעות · ${formatIls(purchase.amountIls)}${
        purchase.errorMessage ? ` · ${purchase.errorMessage}` : ""
      }`,
      at: purchase.createdAt,
      href: `/admin/businesses/${purchase.businessId}?tab=billing`,
    });
  }
  for (const chat of summary.waitingChats ?? []) {
    items.push({
      id: `w-${chat.phone}`,
      icon: "headset",
      tone: "info",
      title: `${chat.name || chat.phone} מחכים לנציג בוואטסאפ`,
      detail: "השיחה הועברה מהבוט",
      at: chat.lastMessageAt,
      href: `/admin/whatsapp?phone=${encodeURIComponent(chat.phone)}`,
    });
  }
  for (const business of summary.smsBusinesses) {
    const credits = balances[business.id]?.credits;
    if (credits == null || credits >= LOW_SMS_BALANCE) continue;
    items.push({
      id: `s-${business.id}`,
      icon: "message-square",
      tone: "warning",
      title: `יתרת SMS נמוכה: ${business.name}`,
      detail: `נשארו ${formatNumber(credits)} הודעות`,
      href: `/admin/businesses/${business.id}?tab=sms`,
    });
  }
  return items;
}

export default function DashboardPage() {
  const { data, error, loading, reload } = useAdminData<{ summary: AdminSummary }>("/api/admin/summary");
  const summary = data?.summary ?? null;
  const smsIds = summary?.smsBusinesses.map((business) => business.id) ?? [];
  const balances = useSmsBalances(smsIds);
  const balancesPending = smsIds.some((id) => !balances[id]);
  const attention = summary ? buildAttention(summary, balances) : [];

  return (
    <>
      <PageHeader
        title="לוח בקרה"
        description={<span suppressHydrationWarning>{todayFormat.format(new Date())}</span>}
        actions={
          <Link href="/admin/businesses/new" className="ad-btn is-brand">
            <Icon name="plus" />
            עסק חדש
          </Link>
        }
      />

      {error && !summary ? (
        <div className="ad-card">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : null}

      {summary?.errors.length ? (
        <div className="ad-alert is-warning" role="status">
          <Icon name="triangle-alert" />
          <div className="ad-alert-body">
            <div className="ad-alert-title">חלק מהנתונים לא נטענו</div>
            <p>{summary.errors.join(", ")}. המספרים למטה עשויים להיות חלקיים.</p>
          </div>
        </div>
      ) : null}

      {!error || summary ? (
        <section className="ad-stats" aria-label="מדדים">
          <StatCard
            highlight
            loading={loading}
            icon="trending-up"
            label="הכנסה חודשית צפויה"
            value={formatIls(summary?.expectedMrrIls)}
            hint={
              summary
                ? `${formatNumber(summary.activeSubscriptions)} מנויים × ${formatIls(summary.monthlyPriceIls)}`
                : undefined
            }
          />
          <StatCard
            loading={loading}
            icon="store"
            label="עסקים"
            value={formatNumber(summary?.businesses)}
            hint={summary ? `${summary.newBusinessesThisMonth} חדשים החודש` : undefined}
            href="/admin/businesses"
          />
          <StatCard
            loading={loading}
            icon="repeat"
            label="מנויים פעילים"
            value={formatNumber(summary?.activeSubscriptions)}
            hint="הוראות קבע פעילות ב-PayPlus"
            href="/admin/businesses?filter=active"
          />
          <StatCard
            loading={loading}
            icon="banknote"
            label="הכנסות SMS החודש"
            value={formatIls(summary?.smsRevenueThisMonthIls)}
            hint={summary ? `${summary.smsPurchasesThisMonth} רכישות` : undefined}
            href="/admin/billing"
          />
          <StatCard
            loading={loading}
            icon="users"
            label="לקוחות באפליקציות"
            value={formatNumber(summary?.clients)}
            hint="בכל העסקים"
          />
        </section>
      ) : null}

      {!error || summary ? (
        <div className="ad-grid-2">
          <section className="ad-card" aria-labelledby="attention-title">
            <div className="ad-card-head">
              <h2 id="attention-title">
                <Icon name="bell" />
                דורש טיפול
              </h2>
              {attention.length ? <span className="ad-badge is-warning">{attention.length}</span> : null}
            </div>
            {loading ? (
              <SkeletonRows rows={3} />
            ) : attention.length ? (
              <div className="ad-list">
                {attention.map((item) => (
                  <Link key={item.id} href={item.href} className="ad-list-item">
                    <span className={`ad-list-icon is-${item.tone}`}>
                      <Icon name={item.icon} />
                    </span>
                    <span className="ad-list-main">
                      <span className="ad-list-title">{item.title}</span>
                      <span className="ad-list-sub">{item.detail}</span>
                    </span>
                    {item.at ? <span className="ad-list-meta">{formatRelative(item.at)}</span> : null}
                    <Icon name="chevron-left" size={16} />
                  </Link>
                ))}
              </div>
            ) : balancesPending ? null : (
              <EmptyState icon="circle-check" title="הכול מטופל" body="אין בקשות פתוחות, רכישות שנכשלו או יתרות נמוכות." />
            )}
            {!loading && balancesPending ? (
              <div className="ad-card-foot ad-small ad-muted">
                <Icon name="refresh-cw" size={14} className="ad-spin" />
                בודקים יתרות SMS בפולסים…
              </div>
            ) : null}
          </section>

          <section className="ad-card" aria-labelledby="activity-title">
            <div className="ad-card-head">
              <h2 id="activity-title">
                <Icon name="activity" />
                פעילות אחרונה
              </h2>
            </div>
            {loading ? (
              <SkeletonRows rows={5} />
            ) : summary?.activity.length ? (
              <div className="ad-list">
                {summary.activity.map((item) => (
                  <Link key={item.id} href={item.href} className="ad-list-item">
                    <span className={`ad-list-icon ${ACTIVITY_ICON[item.kind].tone}`}>
                      <Icon name={ACTIVITY_ICON[item.kind].icon} size={17} />
                    </span>
                    <span className="ad-list-main">
                      <span className="ad-list-title">{item.title}</span>
                      <span className="ad-list-sub">{item.detail}</span>
                    </span>
                    <span className="ad-list-meta">{formatRelative(item.at)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon="activity" title="אין פעילות עדיין" />
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
