"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

type Customer = {
  id: string;
  name: string;
  phone: string;
};

type Audience = "staff" | "everyone";

type OperationalMessage = {
  id: string;
  title: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
  audience: Audience;
  active: boolean;
  createdAt: string;
  businessIds: string[];
  dismissalCount: number;
};

type Draft = {
  title: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
  audience: Audience;
};

const emptyDraft: Draft = {
  title: "",
  body: "",
  actionLabel: "",
  actionUrl: "",
  audience: "staff",
};

function audienceLabel(audience: Audience) {
  return audience === "everyone" ? "גם לקוחות" : "רק מנהל ועובדים";
}

async function api<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "הבקשה נכשלה.");
  return data;
}

export default function OperationalMessagesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [messages, setMessages] = useState<OperationalMessage[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.phone].join(" ").toLowerCase().includes(value),
    );
  }, [customers, query]);

  const names = useMemo(() => {
    const map = new Map<string, string>();
    for (const customer of customers) map.set(customer.id, customer.name);
    return map;
  }, [customers]);

  async function refresh() {
    const [customerResult, messageResult] = await Promise.allSettled([
      api<{ customers?: Customer[] }>("/api/admin/customers"),
      api<{ messages?: OperationalMessage[] }>("/api/admin/operational-messages"),
    ]);
    const problems: string[] = [];
    if (customerResult.status === "fulfilled") {
      setCustomers(customerResult.value.customers ?? []);
    } else {
      problems.push(
        customerResult.reason instanceof Error
          ? customerResult.reason.message
          : "טעינת הלקוחות נכשלה.",
      );
    }
    if (messageResult.status === "fulfilled") {
      setMessages(messageResult.value.messages ?? []);
    } else {
      problems.push(
        messageResult.reason instanceof Error
          ? messageResult.reason.message
          : "טעינת ההודעות התפעוליות נכשלה.",
      );
    }
    setError(problems.join(" "));
  }

  useEffect(() => {
    refresh().catch(() => setError("טעינת המסך נכשלה."));
  }, []);

  function toggleCustomer(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleVisible() {
    const visibleIds = filtered.map((customer) => customer.id);
    const allVisibleSelected = visibleIds.every((id) => selected.includes(id));
    setSelected((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return [...new Set([...current, ...visibleIds])];
    });
  }

  function startEdit(message: OperationalMessage) {
    setEditingId(message.id);
    setDraft({
      title: message.title,
      body: message.body,
      actionLabel: message.actionLabel,
      actionUrl: message.actionUrl,
      audience: message.audience === "everyone" ? "everyone" : "staff",
    });
    setSelected(message.businessIds);
    setError("");
  }

  function cancelEdit() {
    setEditingId("");
    setDraft(emptyDraft);
    setSelected([]);
  }

  async function publish() {
    setError("");
    setLoading(true);
    try {
      const payload = { ...draft, businessIds: selected };
      if (editingId) {
        await api(`/api/admin/operational-messages/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/admin/operational-messages", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      cancelEdit();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירת ההודעה נכשלה.");
    } finally {
      setLoading(false);
    }
  }

  async function setActive(message: OperationalMessage, active: boolean) {
    setError("");
    setLoading(true);
    try {
      await api(`/api/admin/operational-messages/${message.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "עדכון ההודעה נכשל.");
    } finally {
      setLoading(false);
    }
  }

  const visibleIds = filtered.map((customer) => customer.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  return (
    <>
      <div>
        <p className="admin-kicker">אפליקציה</p>
        <h1 className="admin-title">הודעות תפעוליות</h1>
        <p className="admin-note">
          ההודעה נשמרת ב-Supabase וקופצת פעם אחת. אפשר להציג אותה רק למנהל
          ולעובדים, או גם ללקוחות. היא לא תלויה בגרסת הבילד.
        </p>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <section className="admin-card">
        <h2 className="admin-title">{editingId ? "עריכת הודעה" : "הודעה חדשה"}</h2>
        <div className="admin-form">
          <label className="admin-field">
            כותרת
            <input
              value={draft.title}
              maxLength={120}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>
          <label className="admin-field">
            תוכן
            <textarea
              value={draft.body}
              maxLength={2000}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setDraft((current) => ({ ...current, body: event.target.value }))
              }
            />
          </label>
          <div className="admin-grid-form">
            <label className="admin-field">
              טקסט כפתור (לא חובה)
              <input
                value={draft.actionLabel}
                maxLength={40}
                placeholder="להורדה"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDraft((current) => ({ ...current, actionLabel: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              קישור לכפתור (לא חובה)
              <input
                dir="ltr"
                value={draft.actionUrl}
                placeholder="https://"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDraft((current) => ({ ...current, actionUrl: event.target.value }))
                }
              />
            </label>
          </div>
          <label className="admin-field">
            לקוחות ({selected.length} נבחרו)
            <input
              value={query}
              placeholder="חיפוש לפי שם או טלפון"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setQuery(event.target.value)
              }
            />
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleVisible}
            />
            בחירת כל הלקוחות שמוצגים
          </label>
          <div className="admin-picker">
            {filtered.map((customer) => (
              <label key={customer.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(customer.id)}
                  onChange={() => toggleCustomer(customer.id)}
                />
                <span>{customer.name}</span>
                <span dir="ltr">{customer.phone}</span>
              </label>
            ))}
            {filtered.length === 0 ? <p className="admin-note">אין לקוחות להצגה.</p> : null}
          </div>
          <fieldset className="admin-form">
            <legend className="admin-field">למי להציג</legend>
            <label className="admin-check">
              <input
                type="radio"
                name="audience"
                checked={draft.audience === "staff"}
                onChange={() =>
                  setDraft((current) => ({ ...current, audience: "staff" }))
                }
              />
              רק מנהל ועובדים
            </label>
            <label className="admin-check">
              <input
                type="radio"
                name="audience"
                checked={draft.audience === "everyone"}
                onChange={() =>
                  setDraft((current) => ({ ...current, audience: "everyone" }))
                }
              />
              גם לקוחות
            </label>
          </fieldset>
          <div className="admin-row-actions">
            <button className="admin-btn" type="button" disabled={loading} onClick={() => void publish()}>
              {editingId ? "שמירת שינויים" : "שליחת הודעה"}
            </button>
            {editingId ? (
              <button className="admin-btn-ghost" type="button" disabled={loading} onClick={cancelEdit}>
                ביטול
              </button>
            ) : null}
          </div>
        </div>
      </section>
      <section className="admin-card">
        <h2 className="admin-title">הודעות שנשלחו</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>תאריך</th>
                <th>הודעה</th>
                <th>לקוחות</th>
                <th>קהל</th>
                <th>נסגרו</th>
                <th>סטטוס</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td>
                    {message.createdAt
                      ? new Date(message.createdAt).toLocaleString("he-IL")
                      : "—"}
                  </td>
                  <td className="admin-wrap">
                    <strong>{message.title}</strong>
                    <div>{message.body}</div>
                    {message.actionLabel ? (
                      <div>
                        {message.actionLabel}
                        {message.actionUrl ? ` · ${message.actionUrl}` : ""}
                      </div>
                    ) : null}
                  </td>
                  <td className="admin-wrap">
                    {message.businessIds
                      .map((id) => names.get(id) || "לקוח")
                      .join(", ") || "—"}
                  </td>
                  <td>{audienceLabel(message.audience)}</td>
                  <td>{message.dismissalCount}</td>
                  <td>
                    <span className={`admin-status ${message.active ? "is-paid" : "is-failed"}`}>
                      {message.active ? "פעילה" : "כבויה"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        className="admin-btn-ghost"
                        type="button"
                        disabled={loading}
                        onClick={() => startEdit(message)}
                      >
                        עריכה
                      </button>
                      <button
                        className="admin-btn-ghost"
                        type="button"
                        disabled={loading}
                        onClick={() => void setActive(message, !message.active)}
                      >
                        {message.active ? "כיבוי" : "הפעלה"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={7}>עדיין אין הודעות תפעוליות.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
