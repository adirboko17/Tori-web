"use client";

import Link from "next/link";
import type { AdminCustomerDetail } from "@/lib/admin/customers";
import type { BusinessDetails } from "@/lib/superadmin/types";
import { formatDate, formatIls, formatNumber } from "../../../../_ui/format";
import { Icon } from "../../../../_ui/icon";
import { Avatar, Badge, StatCard } from "../../../../_ui/parts";

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function OverviewTab({
  businessId,
  details,
  customer,
}: {
  businessId: string;
  details: BusinessDetails;
  customer: AdminCustomerDetail | null;
}) {
  const profile = details.profile ?? {};
  const clients = details.users.filter((user) => user.user_type === "client");
  const admins = details.users.filter((user) => user.user_type === "admin");
  const activeServices = details.services.filter((service) => service.is_active).length;
  const color = text(profile.primary_color);
  const subscription = customer?.payplusSubscription;
  const base = `/admin/businesses/${businessId}`;

  return (
    <div className="ad-stack">
      <section className="ad-stats" aria-label="נתוני העסק">
        <StatCard icon="users" label="לקוחות" value={formatNumber(clients.length)} hint="רשומים באפליקציה" href={`${base}?tab=people`} />
        <StatCard
          icon="message-square"
          label="יתרת SMS"
          loading={!customer}
          value={formatNumber(customer?.smsRemaining)}
          hint="לפי פולסים"
          href={`${base}?tab=sms`}
        />
        <StatCard
          icon="scissors"
          label="שירותים"
          value={formatNumber(details.services.length)}
          hint={`${activeServices} פעילים`}
          href={`${base}?tab=people`}
        />
        <StatCard
          icon="receipt"
          label="רכישות הודעות"
          loading={!customer}
          value={formatIls(customer?.purchaseTotalIls)}
          hint={customer ? `${customer.purchaseCount} רכישות` : undefined}
          href={`${base}?tab=billing`}
        />
      </section>

      <div className="ad-grid-2">
        <section className="ad-card">
          <div className="ad-card-head">
            <h2>
              <Icon name="store" />
              פרטי העסק
            </h2>
          </div>
          <div className="ad-card-body">
            <dl className="ad-kv">
              <dt>טלפון</dt>
              <dd dir="ltr" style={{ textAlign: "right" }}>
                {text(profile.phone) ?? "—"}
              </dd>
              <dt>כתובת</dt>
              <dd>{text(profile.address) ?? "—"}</dd>
              <dt>שם האפליקציה</dt>
              <dd className="ad-ltr" style={{ textAlign: "right" }}>
                {details.brandingFolder ?? text(profile.branding_client_name) ?? "—"}
              </dd>
              <dt>צבע ראשי</dt>
              <dd>
                {color ? (
                  <span className="ad-row">
                    <span
                      aria-hidden
                      style={{ width: 18, height: 18, borderRadius: 6, background: color, border: "1px solid var(--line-subtle)" }}
                    />
                    <span className="ad-ltr">{color}</span>
                  </span>
                ) : (
                  "—"
                )}
              </dd>
              <dt>הצטרפות</dt>
              <dd>{formatDate(text(profile.created_at))}</dd>
            </dl>
          </div>
        </section>

        <div className="ad-stack">
          <section className="ad-card">
            <div className="ad-card-head">
              <h2>
                <Icon name="repeat" />
                מנוי
              </h2>
              <Link href={`${base}?tab=billing`} className="ad-btn is-ghost is-sm">
                ניהול
                <Icon name="chevron-left" size={16} />
              </Link>
            </div>
            <div className="ad-card-body">
              {!customer ? (
                <span className="ad-skel" style={{ height: 16, width: "60%" }} />
              ) : subscription?.status === "active" ? (
                <dl className="ad-kv">
                  <dt>סטטוס</dt>
                  <dd>
                    {customer.openCancellation ? (
                      <Badge tone="warning" dot>
                        ביקשו לבטל
                      </Badge>
                    ) : (
                      <Badge tone="success" dot>
                        פעיל
                      </Badge>
                    )}
                  </dd>
                  <dt>חיוב הבא</dt>
                  <dd>{formatDate(subscription.nextChargeAt)}</dd>
                  <dt>סכום</dt>
                  <dd>{formatIls(subscription.amountIls)}</dd>
                </dl>
              ) : (
                <p className="ad-small ad-muted">
                  {subscription?.status === "cancelled" ? "הוראת הקבע בוטלה." : "לא מחוברת הוראת קבע מ-PayPlus."}
                </p>
              )}
            </div>
          </section>

          <section className="ad-card">
            <div className="ad-card-head">
              <h2>
                <Icon name="user-round-check" />
                מנהלי העסק
              </h2>
            </div>
            {admins.length ? (
              <div className="ad-list">
                {admins.map((admin) => (
                  <div key={admin.id} className="ad-list-item">
                    <Avatar name={admin.name} src={admin.image_url} size="sm" round />
                    <span className="ad-list-main">
                      <span className="ad-list-title">{admin.name || "מנהל"}</span>
                      <span className="ad-list-sub" dir="ltr" style={{ textAlign: "right" }}>
                        {admin.phone || "—"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ad-card-body ad-small ad-muted">אין מנהל רשום לעסק.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
