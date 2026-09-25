"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { AdminCustomerDetail } from "@/lib/admin/customers";
import { brandingAssetUrl, hasPulseemCredentials } from "@/lib/superadmin/format";
import type { BusinessDetails } from "@/lib/superadmin/types";
import { formatDate } from "../../../_ui/format";
import { Icon, type IconName } from "../../../_ui/icon";
import { Avatar, Badge, ErrorState, SkeletonRows, Tabs } from "../../../_ui/parts";
import { useAdminData } from "../../../_ui/use-admin-data";
import { SubscriptionBadge } from "../_parts";
import { BillingTab } from "./_tabs/billing";
import { BrandingTab } from "./_tabs/branding";
import { OverviewTab } from "./_tabs/overview";
import { PeopleTab } from "./_tabs/people";
import { SettingsTab } from "./_tabs/settings";
import { SmsTab } from "./_tabs/sms";

const TABS = [
  { key: "overview", label: "סקירה", icon: "layout-grid" },
  { key: "billing", label: "מנוי וחיובים", icon: "credit-card" },
  { key: "sms", label: "SMS", icon: "message-square" },
  { key: "people", label: "משתמשים ושירותים", icon: "users" },
  { key: "branding", label: "מיתוג", icon: "palette" },
  { key: "settings", label: "הגדרות", icon: "settings" },
] as const satisfies readonly { key: string; label: string; icon: IconName }[];

type TabKey = (typeof TABS)[number]["key"];

function isTab(value: string | null): value is TabKey {
  return TABS.some((tab) => tab.key === value);
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  const tab: TabKey = isTab(requested) ? requested : "overview";

  const details = useAdminData<BusinessDetails>(`/api/admin/apps/${id}`);
  const customer = useAdminData<{ customer: AdminCustomerDetail }>(`/api/admin/customers/${id}`);

  if (details.error && !details.data) {
    return (
      <>
        <Link href="/admin/businesses" className="ad-back">
          <Icon name="chevron-right" size={16} />
          כל העסקים
        </Link>
        <div className="ad-card">
          <ErrorState message={details.error} onRetry={details.reload} />
        </div>
      </>
    );
  }

  if (!details.data?.profile) {
    return (
      <>
        <div className="ad-hero">
          <div className="ad-hero-identity">
            <span className="ad-skel" style={{ width: 64, height: 64, borderRadius: 20 }} />
            <div style={{ display: "grid", gap: 10 }}>
              <span className="ad-skel" style={{ width: 200, height: 24 }} />
              <span className="ad-skel" style={{ width: 280, height: 14 }} />
            </div>
          </div>
        </div>
        <div className="ad-card">
          <SkeletonRows rows={5} />
        </div>
      </>
    );
  }

  const data = details.data;
  const profile = data.profile ?? {};
  const name = text(profile.display_name) ?? "ללא שם";
  const phone = text(profile.phone);
  const color = text(profile.primary_color);
  const clientName = data.brandingFolder ?? text(profile.branding_client_name);
  const iconFile = data.brandingFiles.find((file) => file.name === "icon.png");
  const iconUrl = iconFile
    ? `${iconFile.publicUrl}?v=${encodeURIComponent(iconFile.updatedAt ?? "")}`
    : brandingAssetUrl(clientName, "icon.png");
  const pulseemUserId = text(profile.pulseem_user_id);
  const pulseemReady = hasPulseemCredentials({
    pulseemHasApiKey: profile.pulseem_has_api_key === true,
    pulseem_user_id: pulseemUserId,
    pulseemHasPassword: profile.pulseem_has_password === true,
  });
  const detail = customer.data?.customer ?? null;
  const base = `/admin/businesses/${id}`;

  return (
    <>
      <div>
        <Link href="/admin/businesses" className="ad-back">
          <Icon name="chevron-right" size={16} />
          כל העסקים
        </Link>
        <div className="ad-hero">
          <div className="ad-hero-identity">
            <Avatar name={name} src={iconUrl} color={color} size="lg" />
            <div style={{ minWidth: 0 }}>
              <h1>{name}</h1>
              <div className="ad-hero-meta">
                {phone ? (
                  <span dir="ltr">
                    <Icon name="phone" size={14} />
                    {phone}
                  </span>
                ) : null}
                {clientName ? (
                  <span dir="ltr">
                    <Icon name="smartphone" size={14} />
                    {clientName}
                  </span>
                ) : null}
                <span>
                  <Icon name="calendar" size={14} />
                  הצטרפו ב-{formatDate(text(profile.created_at))}
                </span>
              </div>
            </div>
          </div>
          <div className="ad-row">
            {detail ? (
              <SubscriptionBadge
                business={{
                  subscription: detail.payplusSubscription?.status ?? "none",
                  openCancellation: detail.openCancellation,
                }}
              />
            ) : null}
            <Badge tone={pulseemReady ? "success" : "warning"} dot>
              {pulseemReady ? "פולסים מחובר" : "פולסים לא מחובר"}
            </Badge>
          </div>
        </div>
      </div>

      {detail?.openCancellation && tab !== "billing" ? (
        <div className="ad-alert is-warning">
          <Icon name="user-x" />
          <div className="ad-alert-body">
            <div className="ad-alert-title">העסק ביקש לבטל את המנוי</div>
            <p>הבקשה נשלחה ב-{formatDate(detail.openCancellation.requestedAt)}.</p>
          </div>
          <Link href={`${base}?tab=billing`} className="ad-btn is-secondary is-sm">
            לטיפול במנוי
          </Link>
        </div>
      ) : null}

      <Tabs
        label="אזורי העסק"
        items={TABS.map((item) => ({
          href: item.key === "overview" ? base : `${base}?tab=${item.key}`,
          label: item.label,
          icon: item.icon,
          current: item.key === tab,
          count: item.key === "billing" && detail?.openCancellation ? 1 : undefined,
          alert: true,
        }))}
      />

      {tab === "overview" ? <OverviewTab businessId={id} details={data} customer={detail} /> : null}
      {tab === "billing" ? (
        <BillingTab customer={detail} error={customer.error} onChange={customer.reload} />
      ) : null}
      {tab === "sms" ? <SmsTab businessId={id} name={name} pulseemReady={pulseemReady} /> : null}
      {tab === "people" ? <PeopleTab businessId={id} details={data} onChange={details.reload} /> : null}
      {tab === "branding" ? <BrandingTab businessId={id} details={data} onChange={details.reload} /> : null}
      {tab === "settings" ? (
        <SettingsTab businessId={id} name={name} brandingFolder={clientName} pulseemUserId={pulseemUserId} />
      ) : null}
    </>
  );
}

export default function BusinessDetailPage() {
  return (
    <Suspense fallback={<SkeletonRows rows={5} />}>
      <BusinessDetail />
    </Suspense>
  );
}
