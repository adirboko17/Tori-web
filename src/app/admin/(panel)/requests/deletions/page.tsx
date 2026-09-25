"use client";

import { useMemo, useState } from "react";
import type { AccountDeletionRequest } from "@/lib/account-deletions";
import { formatDateTime, formatRelative } from "../../../_ui/format";
import { Icon } from "../../../_ui/icon";
import { EmptyState, ErrorState, SearchField, SkeletonRows } from "../../../_ui/parts";
import { useAdminData } from "../../../_ui/use-admin-data";

export default function DeletionsPage() {
  const [query, setQuery] = useState("");
  const { data, error, loading, reload } = useAdminData<{ requests: AccountDeletionRequest[] }>(
    "/api/admin/account-deletions",
  );

  const visible = useMemo(() => {
    const requests = data?.requests ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return requests;
    return requests.filter((request) =>
      `${request.fullName} ${request.phone} ${request.appName}`.toLowerCase().includes(needle),
    );
  }, [data, query]);

  return (
    <>
      <div className="ad-alert is-info">
        <Icon name="shield" />
        <div className="ad-alert-body">
          <div className="ad-alert-title">לפני מחיקה, אמתו את הפרטים</div>
          <p>הבקשות מגיעות מהעמוד הציבורי למחיקת חשבון. ודאו שהטלפון שייך למשתמש באפליקציה שצוינה לפני שמוחקים.</p>
        </div>
      </div>

      <section className="ad-card">
        <div className="ad-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="חיפוש לפי שם, טלפון או אפליקציה" />
        </div>
        {error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <SkeletonRows rows={4} avatar={false} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="trash-2"
            title={data?.requests.length ? "לא נמצאו בקשות" : "אין בקשות מחיקה"}
            body={data?.requests.length ? "נסו חיפוש אחר." : "בקשות מחיקת חשבון מהעמוד הציבורי יופיעו כאן."}
          />
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table is-responsive">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>טלפון</th>
                  <th>אפליקציה</th>
                  <th>הערה</th>
                  <th>נשלחה</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((request) => (
                  <tr key={request.id}>
                    <td className="is-primary">
                      <strong>{request.fullName || "—"}</strong>
                    </td>
                    <td data-label="טלפון" dir="ltr" className="is-nowrap">
                      {request.phone || "—"}
                    </td>
                    <td data-label="אפליקציה">{request.appName || "—"}</td>
                    <td data-label="הערה" className="is-wrap ad-small">
                      {request.note || <span className="ad-faint">—</span>}
                    </td>
                    <td data-label="נשלחה" className="is-nowrap ad-muted" title={formatDateTime(request.createdAt)}>
                      {formatRelative(request.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
