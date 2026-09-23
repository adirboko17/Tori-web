"use client";

import { useEffect, useState } from "react";

type DeletionRequest = {
  id: string;
  fullName: string;
  phone: string;
  appName: string;
  note: string;
  createdAt: string;
};

export default function AccountDeletionsPage() {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/account-deletions")
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
          requests?: DeletionRequest[];
        };
        if (!response.ok) throw new Error(data.error || "טעינת הבקשות נכשלה.");
        setRequests(data.requests ?? []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "טעינת הבקשות נכשלה.");
      });
  }, []);

  return (
    <>
      <div>
        <p className="admin-kicker">אפליקציה</p>
        <h1 className="admin-title">בקשות מחיקת חשבון</h1>
        <p className="admin-note">
          בקשות שנשלחו מהעמוד הציבורי. יש לאמת את הפרטים לפני מחיקת החשבון.
        </p>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>תאריך</th>
                <th>שם</th>
                <th>טלפון</th>
                <th>עסק / אפליקציה</th>
                <th>הערה</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleString("he-IL")
                      : "—"}
                  </td>
                  <td>{request.fullName}</td>
                  <td dir="ltr">{request.phone}</td>
                  <td className="admin-wrap">{request.appName}</td>
                  <td className="admin-wrap">{request.note || "—"}</td>
                </tr>
              ))}
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5}>עדיין אין בקשות מחיקה.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
