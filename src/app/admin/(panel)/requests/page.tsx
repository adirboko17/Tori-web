"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { CancellationRequest, CancellationStatus } from "@/lib/admin/cancellations";
import type { PayplusSubscription } from "@/lib/admin/payplus-subscriptions";
import { adminJson } from "@/lib/superadmin/browser";
import { useConfirm, useToast } from "../../_ui/feedback";
import { formatDate, formatDateTime, formatRelative, type Tone } from "../../_ui/format";
import { Icon } from "../../_ui/icon";
import { Badge, EmptyState, ErrorState, FilterChips, SearchField, SkeletonRows } from "../../_ui/parts";
import { useAdminData } from "../../_ui/use-admin-data";

type Row = CancellationRequest & { payplusSubscription: PayplusSubscription | null };
type Filter = "open" | "closed" | "all";

const STATUS: Record<CancellationStatus, { label: string; tone: Tone }> = {
  requested: { label: "חדש", tone: "warning" },
  seen: { label: "בטיפול", tone: "info" },
  done: { label: "טופל", tone: "success" },
  dismissed: { label: "לא רלוונטי", tone: "neutral" },
};

function isOpen(status: CancellationStatus) {
  return status === "requested" || status === "seen";
}

export default function CancellationsPage() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [filter, setFilter] = useState<Filter>("open");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState("");
  const { data, error, loading, reload } = useAdminData<{ requests: Row[]; openCount: number }>(
    "/api/admin/cancellations",
  );
  const requests = useMemo(() => data?.requests ?? [], [data]);

  const counts = useMemo(
    () => ({
      open: requests.filter((request) => isOpen(request.status)).length,
      closed: requests.filter((request) => !isOpen(request.status)).length,
      all: requests.length,
    }),
    [requests],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return requests.filter((request) => {
      if (filter === "open" && !isOpen(request.status)) return false;
      if (filter === "closed" && isOpen(request.status)) return false;
      if (!needle) return true;
      return `${request.businessName} ${request.requestedByName} ${request.requestedByPhone}`
        .toLowerCase()
        .includes(needle);
    });
  }, [requests, filter, query]);

  async function act(id: string, task: () => Promise<string>) {
    setBusyId(id);
    try {
      toast.success(await task());
      reload();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "הפעולה נכשלה");
    } finally {
      setBusyId("");
    }
  }

  function setStatus(request: Row, status: CancellationStatus) {
    void act(request.id, async () => {
      await adminJson(`/api/admin/cancellations/${request.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return `הבקשה של ${request.businessName} סומנה כ"${STATUS[status].label}"`;
    });
  }

  async function cancelRecurring(request: Row) {
    const ok = await confirm({
      title: `לבטל את הוראת הקבע של ${request.businessName}?`,
      body: "החיוב הבא ב-PayPlus לא ירוץ. המחזור שכבר שולם נשאר, והבקשה תסומן כטופלה.",
      confirmLabel: "ביטול הוראת הקבע",
      cancelLabel: "חזרה",
      tone: "danger",
    });
    if (!ok) return;
    void act(request.id, async () => {
      await adminJson(`/api/admin/customers/${request.businessId}/cancel-recurring`, { method: "POST" });
      return `הוראת הקבע של ${request.businessName} בוטלה`;
    });
  }

  return (
    <section className="ad-card">
      <div className="ad-toolbar">
        <SearchField value={query} onChange={setQuery} placeholder="חיפוש לפי עסק, שם או טלפון" />
        <FilterChips
          label="סינון בקשות"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "open", label: "פתוחות", count: loading ? undefined : counts.open },
            { value: "closed", label: "סגורות", count: loading ? undefined : counts.closed },
            { value: "all", label: "הכול", count: loading ? undefined : counts.all },
          ]}
        />
      </div>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonRows rows={4} avatar={false} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={filter === "open" ? "circle-check" : "inbox"}
          title={filter === "open" ? "אין בקשות ביטול פתוחות" : "אין בקשות להצגה"}
          body="כשמנהל עסק מאשר ביטול באפליקציה, הבקשה מגיעה לכאן."
        />
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table is-responsive">
            <thead>
              <tr>
                <th>עסק</th>
                <th>סטטוס</th>
                <th>נשלחה</th>
                <th>סיום חיוב</th>
                <th>הוראת קבע</th>
                <th>הערה</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((request) => {
                const status = STATUS[request.status];
                const subscriptionActive = request.payplusSubscription?.status === "active";
                const busy = busyId === request.id;
                return (
                  <tr key={request.id}>
                    <td className="is-primary">
                      <Link href={`/admin/businesses/${request.businessId}?tab=billing`} className="ad-entity-title">
                        {request.businessName}
                      </Link>
                      <span className="ad-entity-sub">
                        {request.requestedByName}
                        {request.requestedByPhone ? (
                          <>
                            {" · "}
                            <span dir="ltr">{request.requestedByPhone}</span>
                          </>
                        ) : null}
                      </span>
                    </td>
                    <td data-label="סטטוס">
                      <Badge tone={status.tone} dot>
                        {status.label}
                      </Badge>
                    </td>
                    <td data-label="נשלחה" className="is-nowrap" title={formatDateTime(request.requestedAt)}>
                      {formatRelative(request.requestedAt)}
                    </td>
                    <td data-label="סיום חיוב" className="is-nowrap">
                      {request.effectiveAt ? formatDate(request.effectiveAt) : "סוף המחזור"}
                    </td>
                    <td data-label="הוראת קבע">
                      <Badge tone={subscriptionActive ? "success" : "neutral"}>
                        {subscriptionActive ? "פעילה" : request.payplusSubscription ? "בוטלה" : "לא מחוברת"}
                      </Badge>
                    </td>
                    <td data-label="הערה" className="is-wrap ad-small">
                      {request.note || <span className="ad-faint">—</span>}
                    </td>
                    <td className="is-actions">
                      {isOpen(request.status) ? (
                        <span className="ad-row">
                          {subscriptionActive ? (
                            <button
                              type="button"
                              className="ad-btn is-danger is-sm"
                              disabled={busy}
                              onClick={() => void cancelRecurring(request)}
                            >
                              ביטול הוראת קבע
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="ad-btn is-primary is-sm"
                              disabled={busy}
                              onClick={() => setStatus(request, "done")}
                              title="אחרי שביטלתם ידנית ב-PayPlus"
                            >
                              <Icon name="check" size={15} />
                              טופל
                            </button>
                          )}
                          {request.status === "requested" ? (
                            <button
                              type="button"
                              className="ad-btn is-secondary is-sm"
                              disabled={busy}
                              onClick={() => setStatus(request, "seen")}
                            >
                              בטיפול
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="ad-btn is-ghost is-sm"
                            disabled={busy}
                            onClick={() => setStatus(request, "dismissed")}
                          >
                            לא רלוונטי
                          </button>
                        </span>
                      ) : (
                        <span className="ad-row">
                          <span className="ad-small ad-faint">{formatDate(request.reviewedAt)}</span>
                          <button
                            type="button"
                            className="ad-btn is-ghost is-sm"
                            disabled={busy}
                            onClick={() => setStatus(request, "requested")}
                          >
                            <Icon name="undo-2" size={15} />
                            פתיחה מחדש
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
