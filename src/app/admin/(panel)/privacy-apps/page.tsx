"use client";

import { useEffect, useState, type ChangeEvent } from "react";

type PrivacyApp = {
  id: string;
  name: string;
  bundle_id: string;
};

const emptyDraft = { name: "", bundleId: "" };

async function api(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    apps?: PrivacyApp[];
  };
  if (!response.ok) throw new Error(data.error || "הבקשה נכשלה.");
  return data;
}

export default function AdminPrivacyAppsPage() {
  const [apps, setApps] = useState<PrivacyApp[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const data = await api("/api/admin/privacy-apps");
    setApps(data.apps ?? []);
  }

  useEffect(() => {
    refresh().catch(() => setError("טעינת האפליקציות נכשלה."));
  }, []);

  async function createApp() {
    setError("");
    setLoading(true);
    try {
      await api("/api/admin/privacy-apps", {
        method: "POST",
        body: JSON.stringify(draft),
      });
      setDraft(emptyDraft);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "הוספת האפליקציה נכשלה.");
    } finally {
      setLoading(false);
    }
  }

  async function saveApp(app: PrivacyApp) {
    setError("");
    try {
      await api(`/api/admin/privacy-apps/${app.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: app.name, bundleId: app.bundle_id }),
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "עדכון האפליקציה נכשל.");
    }
  }

  async function removeApp(id: string) {
    if (!window.confirm("להסיר את האפליקציה ממדיניות הפרטיות?")) return;
    setError("");
    try {
      await api(`/api/admin/privacy-apps/${id}`, { method: "DELETE" });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "מחיקת האפליקציה נכשלה.");
    }
  }

  return (
    <>
      <div>
        <p className="admin-kicker">מדיניות פרטיות</p>
        <h1 className="admin-title">אפליקציות במדיניות</h1>
        <p className="admin-lead">
          שם ובאנדל שמוסיפים כאן מופיעים אוטומטית בעמוד{" "}
          <a href="/app-privacy">מדיניות הפרטיות</a>.
        </p>
      </div>
      <section className="admin-card">
        <h2 className="admin-title">אפליקציה חדשה</h2>
        <div className="admin-grid-form">
          <label className="admin-field">
            שם האפליקציה
            <input
              value={draft.name}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setDraft({ ...draft, name: event.target.value })
              }
              placeholder="למשל Amit senior | עמית סניור"
            />
          </label>
          <label className="admin-field">
            באנדל
            <input
              dir="ltr"
              value={draft.bundleId}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setDraft({ ...draft, bundleId: event.target.value })
              }
              placeholder="com.example.app"
            />
          </label>
        </div>
        {error ? <p className="admin-error">{error}</p> : null}
        <button
          type="button"
          className="admin-btn"
          disabled={loading}
          onClick={() => void createApp()}
        >
          הוספה למדיניות
        </button>
      </section>
      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>שם</th>
                <th>באנדל</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id}>
                  <td>
                    <input
                      className="admin-inline-input"
                      value={app.name}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setApps((rows) =>
                          rows.map((row) =>
                            row.id === app.id
                              ? { ...row, name: event.target.value }
                              : row,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="admin-inline-input"
                      dir="ltr"
                      value={app.bundle_id}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setApps((rows) =>
                          rows.map((row) =>
                            row.id === app.id
                              ? { ...row, bundle_id: event.target.value }
                              : row,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => void saveApp(app)}
                      >
                        שמירה
                      </button>
                      <button
                        type="button"
                        className="admin-btn-ghost"
                        onClick={() => void removeApp(app.id)}
                      >
                        מחיקה
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {apps.length === 0 ? (
                <tr>
                  <td colSpan={3}>עדיין אין אפליקציות ברשימה.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
