"use client";

import { useEffect, useState, type ChangeEvent } from "react";

type Pack = {
  id: string;
  package_key: string;
  sms_credits: number;
  amount_ils: number;
  label: string;
  featured: boolean;
  sort_order: number;
  is_active: boolean;
};

type Draft = {
  label: string;
  smsCredits: string;
  amountIls: string;
  featured: boolean;
  isActive: boolean;
};

const emptyDraft: Draft = {
  label: "",
  smsCredits: "",
  amountIls: "",
  featured: false,
  isActive: true,
};

async function api(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    packages?: Pack[];
  };
  if (!response.ok) throw new Error(data.error || "הבקשה נכשלה.");
  return data;
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Pack[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const data = await api("/api/admin/packages");
    setPackages(data.packages ?? []);
  }

  useEffect(() => {
    refresh().catch(() => setError("טעינת החבילות נכשלה."));
  }, []);

  async function createPack() {
    setError("");
    setLoading(true);
    try {
      await api("/api/admin/packages", {
        method: "POST",
        body: JSON.stringify({
          label: draft.label,
          smsCredits: Number(draft.smsCredits),
          amountIls: Number(draft.amountIls),
          featured: draft.featured,
          isActive: draft.isActive,
        }),
      });
      setDraft(emptyDraft);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "יצירת החבילה נכשלה.");
    } finally {
      setLoading(false);
    }
  }

  async function savePack(pack: Pack) {
    setError("");
    try {
      await api(`/api/admin/packages/${pack.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          label: pack.label,
          smsCredits: Number(pack.sms_credits),
          amountIls: Number(pack.amount_ils),
          featured: pack.featured,
          isActive: pack.is_active,
          sortOrder: Number(pack.sort_order),
        }),
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "עדכון החבילה נכשל.");
    }
  }

  async function removePack(id: string) {
    if (!window.confirm("למחוק את החבילה?")) return;
    setError("");
    try {
      await api(`/api/admin/packages/${id}`, { method: "DELETE" });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "מחיקת החבילה נכשלה.");
    }
  }

  return (
    <>
      <div>
        <p className="admin-kicker">קטלוג</p>
        <h1 className="admin-title">חבילות הודעות</h1>
        <p className="admin-lead">
          הכמות והמחיר כאן הם מה שנמכר בחנות ה-SMS באתר.
        </p>
      </div>
      <section className="admin-card">
        <h2 className="admin-title">חבילה חדשה</h2>
        <div className="admin-grid-form">
          <label className="admin-field">
            שם
            <input
              value={draft.label}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setDraft({ ...draft, label: event.target.value })
              }
            />
          </label>
          <label className="admin-field">
            כמות הודעות
            <input
              type="number"
              dir="ltr"
              value={draft.smsCredits}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setDraft({ ...draft, smsCredits: event.target.value })
              }
            />
          </label>
          <label className="admin-field">
            מחיר ₪
            <input
              type="number"
              dir="ltr"
              value={draft.amountIls}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setDraft({ ...draft, amountIls: event.target.value })
              }
            />
          </label>
        </div>
        <label>
          <input
            type="checkbox"
            checked={draft.featured}
            onChange={(event) =>
              setDraft({ ...draft, featured: event.target.checked })
            }
          />{" "}
          הכי משתלם
        </label>
        {error ? <p className="admin-error">{error}</p> : null}
        <button
          type="button"
          className="admin-btn"
          disabled={loading}
          onClick={() => void createPack()}
        >
          הוספת חבילה
        </button>
      </section>
      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>שם</th>
                <th>הודעות</th>
                <th>מחיר</th>
                <th>מומלץ</th>
                <th>פעיל</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pack) => (
                <tr key={pack.id}>
                  <td>
                    <input
                      className="admin-inline-input"
                      value={pack.label}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setPackages((rows) =>
                          rows.map((row) =>
                            row.id === pack.id
                              ? { ...row, label: event.target.value }
                              : row,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="admin-inline-input"
                      type="number"
                      dir="ltr"
                      value={String(pack.sms_credits)}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setPackages((rows) =>
                          rows.map((row) =>
                            row.id === pack.id
                              ? { ...row, sms_credits: Number(event.target.value) }
                              : row,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="admin-inline-input"
                      type="number"
                      dir="ltr"
                      value={String(pack.amount_ils)}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setPackages((rows) =>
                          rows.map((row) =>
                            row.id === pack.id
                              ? { ...row, amount_ils: Number(event.target.value) }
                              : row,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={pack.featured}
                      onChange={(event) =>
                        setPackages((rows) =>
                          rows.map((row) =>
                            row.id === pack.id
                              ? { ...row, featured: event.target.checked }
                              : row,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={pack.is_active}
                      onChange={(event) =>
                        setPackages((rows) =>
                          rows.map((row) =>
                            row.id === pack.id
                              ? { ...row, is_active: event.target.checked }
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
                        onClick={() => void savePack(pack)}
                      >
                        שמירה
                      </button>
                      <button
                        type="button"
                        className="admin-btn-ghost"
                        onClick={() => void removePack(pack.id)}
                      >
                        מחיקה
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
