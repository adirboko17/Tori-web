"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CancellationStatus = "requested" | "seen" | "done" | "dismissed";

type CancellationRequest = {
  id: string;
  businessId: string;
  businessName: string;
  requestedByName: string;
  requestedByPhone: string;
  status: CancellationStatus;
  note: string;
  requestedAt: string;
  effectiveAt: string | null;
  reviewedAt: string | null;
  payplusSubscription: { status: string } | null;
};

const LABELS: Record<CancellationStatus, string> = {
  requested: "ממתין לטיפול",
  seen: "נצפה",
  done: "טופל",
  dismissed: "לא רלוונטי",
};

function statusClass(status: CancellationStatus) {
  if (status === "done") return "is-paid";
  if (status === "dismissed") return "is-failed";
  return "is-pending";
}

async function api(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    requests?: CancellationRequest[];
    openCount?: number;
  };
  if (!response.ok) throw new Error(data.error || "הבקשה נכשלה.");
  return data;
}

export default function AdminCancellationsPage() {
  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState("");

  async function refresh() {
    const data = await api("/api/admin/cancellations");
    setRequests(data.requests ?? []);
    setOpenCount(data.openCount ?? 0);
  }

  useEffect(() => {
    refresh().catch(() => setError("טעינת בקשות הביטול נכשלה."));
  }, []);

  async function cancelRecurring(businessId: string, requestId: string) {
    if (
      !window.confirm(
        "לבטל את הוראת הקבע ב-PayPlus? החיוב הבא לא ירוץ. המחזור שכבר שולם נשאר.",
      )
    ) {
      return;
    }
    setError("");
    setLoadingId(requestId);
    try {
      await api(`/api/admin/customers/${businessId}/cancel-recurring`, {
        method: "POST",
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ביטול הוראת הקבע נכשל.");
    } finally {
      setLoadingId("");
    }
  }

  async function setStatus(id: string, status: CancellationStatus) {
    setError("");
    setLoadingId(id);
    try {
      await api(`/api/admin/cancellations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "עדכון הבקשה נכשל.");
    } finally {
      setLoadingId("");
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <p className="admin-kicker">לקוחות</p>
          <h1 className="admin-title">בקשות ביטול</h1>
          <p className="admin-note">
            כשלקוח מאשר ביטול באפליקציה, הבקשה מגיעה לכאן. אם נשמר מזהה
            הוראת קבע, אפשר לבטל אותה ישירות ב-PayPlus. אחרת בטלו ידנית
            שם ואז סמנו כטופל.
          </p>
        </div>
        <p className="admin-kicker">{openCount} ממתינות לטיפול</p>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>עסק</th>
                <th>מי ביקש</th>
                <th>סטטוס</th>
                <th>תאריך בקשה</th>
                <th>סיום חיוב</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6}>אין בקשות ביטול עדיין.</td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <Link href={`/admin/customers/${request.businessId}`}>
                        {request.businessName}
                      </Link>
                    </td>
                    <td>
                      {request.requestedByName}
                      <div dir="ltr">{request.requestedByPhone || "—"}</div>
                    </td>
                    <td>
                      <span className={`admin-status ${statusClass(request.status)}`}>
                        {LABELS[request.status]}
                      </span>
                    </td>
                    <td>
                      {request.requestedAt
                        ? new Date(request.requestedAt).toLocaleString("he-IL")
                        : "—"}
                    </td>
                    <td>
                      {request.effectiveAt
                        ? new Date(request.effectiveAt).toLocaleDateString("he-IL")
                        : "סוף המחזור הנוכחי"}
                    </td>
                    <td>
                      {request.status === "requested" || request.status === "seen" ? (
                        <div className="admin-row-actions">
                          {request.status === "requested" ? (
                            <button
                              type="button"
                              className="admin-btn-ghost"
                              disabled={loadingId === request.id}
                              onClick={() => void setStatus(request.id, "seen")}
                            >
                              נצפה
                            </button>
                          ) : null}
                          {request.payplusSubscription?.status === "active" ? (
                            <button
                              type="button"
                              className="admin-btn"
                              disabled={loadingId === request.id}
                              onClick={() =>
                                void cancelRecurring(request.businessId, request.id)
                              }
                            >
                              בטל הוראת קבע
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="admin-btn"
                              disabled={loadingId === request.id}
                              onClick={() => void setStatus(request.id, "done")}
                            >
                              טיפלתי בביטול
                            </button>
                          )}
                          <button
                            type="button"
                            className="admin-btn-ghost"
                            disabled={loadingId === request.id}
                            onClick={() => void setStatus(request.id, "dismissed")}
                          >
                            לא רלוונטי
                          </button>
                        </div>
                      ) : (
                        <span className="admin-note">
                          {request.reviewedAt
                            ? new Date(request.reviewedAt).toLocaleString("he-IL")
                            : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
