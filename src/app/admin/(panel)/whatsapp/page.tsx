"use client";

import { useCallback, useEffect, useState } from "react";
import { adminJson } from "@/lib/superadmin/browser";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
  canSendFirstMessage,
  getFirstLeadMessage,
  type LeadStatus,
} from "@/lib/whatsapp/copy";
import type { ChatMessageRow, ConversationRow, LeadRow } from "@/lib/whatsapp/db";

function when(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" });
}

function roleLabel(role: string) {
  if (role === "user") return "לקוחה";
  if (role === "human_agent") return "נציג";
  return "בוט";
}

export default function WhatsappPage() {
  const [tab, setTab] = useState<"chats" | "leads">("chats");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  return (
    <>
      <div>
        <p className="admin-kicker">סופר אדמין</p>
        <h1 className="admin-title">הודעות וואטסאפ</h1>
        <p className="admin-note">ניהול השיחות והלידים של צ׳אט הבוט.</p>
      </div>
      <div className="admin-tabs">
        <button type="button" className="admin-btn" aria-pressed={tab === "chats"} onClick={() => setTab("chats")}>
          שיחות
        </button>
        <button type="button" className="admin-btn" aria-pressed={tab === "leads"} onClick={() => setTab("leads")}>
          לידים
        </button>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      {notice ? <p className="admin-note">{notice}</p> : null}
      {tab === "chats" ? (
        <ChatsPanel
          onError={setError}
          onNotice={setNotice}
        />
      ) : (
        <LeadsPanel onError={setError} onNotice={setNotice} />
      )}
    </>
  );
}

function ChatsPanel({
  onError,
  onNotice,
}: {
  onError: (message: string) => void;
  onNotice: (message: string) => void;
}) {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [phone, setPhone] = useState("");
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const loadList = useCallback(async () => {
    const data = await adminJson<{ conversations: ConversationRow[] }>("/api/admin/whatsapp/conversations");
    setConversations(data.conversations);
    setPhone((current) => current || data.conversations[0]?.phone || "");
  }, []);

  const loadMessages = useCallback(async (selected: string) => {
    if (!selected) {
      setMessages([]);
      return;
    }
    const data = await adminJson<{ messages: ChatMessageRow[] }>(
      `/api/admin/whatsapp/conversations/${encodeURIComponent(selected)}`,
    );
    setMessages(data.messages);
  }, []);

  useEffect(() => {
    loadList().catch((err: unknown) => onError(err instanceof Error ? err.message : "טעינת השיחות נכשלה"));
  }, [loadList, onError]);

  useEffect(() => {
    if (!phone) return;
    loadMessages(phone).catch((err: unknown) => onError(err instanceof Error ? err.message : "טעינת ההודעות נכשלה"));
    const timer = window.setInterval(() => {
      loadList().catch(() => undefined);
      loadMessages(phone).catch(() => undefined);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [phone, loadList, loadMessages, onError]);

  const selected = conversations.find((item) => item.phone === phone);

  async function act(path: string, init?: RequestInit) {
    setBusy(true);
    onError("");
    try {
      await adminJson(path, init);
      await loadList();
      if (phone) await loadMessages(phone);
    } catch (err) {
      onError(err instanceof Error ? err.message : "הפעולה נכשלה");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wa-layout">
      <div className="wa-list">
        {conversations.length === 0 ? <p className="admin-note">אין שיחות עדיין.</p> : null}
        {conversations.map((item) => (
          <button
            key={item.phone}
            type="button"
            className="wa-item"
            aria-pressed={item.phone === phone}
            onClick={() => setPhone(item.phone)}
          >
            <strong>{item.name || item.phone}</strong>
            <span>{item.last_user_message || item.last_message || "אין הודעות"}</span>
            <span>
              {item.status === "human" ? "אצל נציג" : "אצל הבוט"} · {when(item.last_message_at)}
            </span>
          </button>
        ))}
      </div>
      <div className="wa-thread">
        <div className="wa-thread-head">
          <strong>{selected ? selected.name || selected.phone : "בחרו שיחה"}</strong>
          {selected ? <span className="admin-note">{selected.phone}</span> : null}
          <div className="admin-actions">
            <button
              type="button"
              className="admin-btn"
              disabled={!phone || busy || selected?.status === "human"}
              onClick={() => act(`/api/admin/whatsapp/conversations/${encodeURIComponent(phone)}/handoff`, { method: "POST" })}
            >
              העברה לנציג
            </button>
            <button
              type="button"
              className="admin-btn-ghost"
              disabled={!phone || busy || selected?.status !== "human"}
              onClick={() => act(`/api/admin/whatsapp/conversations/${encodeURIComponent(phone)}/handback`, { method: "POST" })}
            >
              החזרה לבוט
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              disabled={!phone || busy}
              onClick={() => {
                if (!window.confirm(`למחוק את השיחה עם ${selected?.name || phone}?`)) return;
                act(`/api/admin/whatsapp/conversations/${encodeURIComponent(phone)}`, { method: "DELETE" }).then(() => {
                  setPhone("");
                  setMessages([]);
                  onNotice("השיחה נמחקה");
                });
              }}
            >
              מחיקת שיחה
            </button>
          </div>
        </div>
        <div className="wa-bubbles">
          {messages.map((message) => (
            <div key={message.id} className={`wa-bubble${message.role === "user" ? "" : " out"}`}>
              {message.content}
              <small>
                {roleLabel(message.role)} · {when(message.created_at)}
              </small>
            </div>
          ))}
        </div>
        <form
          className="wa-composer"
          onSubmit={(event) => {
            event.preventDefault();
            const text = draft.trim();
            if (!phone || !text) return;
            setDraft("");
            act(`/api/admin/whatsapp/conversations/${encodeURIComponent(phone)}/send`, {
              method: "POST",
              body: JSON.stringify({ message: text }),
            }).then(() => onNotice("ההודעה נשלחה כוואטסאפ"));
          }}
        >
          <textarea
            className="admin-inline-input"
            rows={2}
            value={draft}
            placeholder="הודעה כנציג"
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" className="admin-btn" disabled={!phone || busy || !draft.trim()}>
            שליחה
          </button>
        </form>
      </div>
    </div>
  );
}

function LeadsPanel({
  onError,
  onNotice,
}: {
  onError: (message: string) => void;
  onNotice: (message: string) => void;
}) {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [hourly, setHourly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("סלון ציפורניים");
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [sendOpening, setSendOpening] = useState(false);

  const load = useCallback(async () => {
    const [leadData, setting] = await Promise.all([
      adminJson<{ leads: LeadRow[] }>("/api/admin/whatsapp/leads"),
      adminJson<{ enabled: boolean }>("/api/admin/whatsapp/settings"),
    ]);
    setLeads(leadData.leads);
    setHourly(setting.enabled);
  }, []);

  useEffect(() => {
    load().catch((err: unknown) => onError(err instanceof Error ? err.message : "טעינת הלידים נכשלה"));
  }, [load, onError]);

  async function run(task: () => Promise<void>) {
    setBusy(true);
    onError("");
    try {
      await task();
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "הפעולה נכשלה");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wa-stack">
      <label className="wa-check">
        <input
          type="checkbox"
          checked={hourly}
          disabled={busy}
          onChange={(event) => {
            const enabled = event.target.checked;
            setHourly(enabled);
            run(async () => {
              await adminJson("/api/admin/whatsapp/settings", {
                method: "PATCH",
                body: JSON.stringify({ enabled }),
              });
              onNotice(enabled ? "שליחה שעתית ללידים ללא קשר הופעלה" : "שליחה שעתית כובתה");
            });
          }}
        />
        שליחה שעתית ללידים בסטטוס ״לא נוצר קשר״
      </label>

      <form
        className="admin-actions"
        onSubmit={(event) => {
          event.preventDefault();
          run(async () => {
            await adminJson("/api/admin/whatsapp/leads", {
              method: "POST",
              body: JSON.stringify({
                business,
                phone,
                business_type: businessType,
                notes,
              }),
            });
            setBusiness("");
            setPhone("");
            setNotes("");
            onNotice("הליד נוסף");
          });
        }}
      >
        <input className="admin-inline-input" placeholder="שם העסק" value={business} onChange={(event) => setBusiness(event.target.value)} />
        <input className="admin-inline-input" placeholder="טלפון" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <input className="admin-inline-input" placeholder="סוג עסק" value={businessType} onChange={(event) => setBusinessType(event.target.value)} />
        <input className="admin-inline-input" placeholder="הערות" value={notes} onChange={(event) => setNotes(event.target.value)} />
        <button type="submit" className="admin-btn" disabled={busy}>
          הוספת ליד
        </button>
      </form>

      <form
        className="admin-actions"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const fileInput = form.elements.namedItem("file");
          const file = fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : undefined;
          if (!file) {
            onError("בחרו קובץ Excel");
            return;
          }
          const body = new FormData();
          body.set("file", file);
          body.set("businessType", businessType || "סלון ציפורניים");
          body.set("sendOpening", sendOpening ? "true" : "false");
          run(async () => {
            const result = await adminJson<{
              inserted: number;
              skipped: number;
              openingsSent: number;
            }>("/api/admin/whatsapp/leads/import", { method: "POST", body });
            form.reset();
            setSendOpening(false);
            onNotice(`יובאו ${result.inserted} לידים, ${result.skipped} דולגו, ${result.openingsSent} הודעות פתיחה נשלחו`);
          });
        }}
      >
        <input className="admin-inline-input" type="file" name="file" accept=".xlsx,.xls,.csv" />
        <label className="wa-check">
          <input type="checkbox" checked={sendOpening} onChange={(event) => setSendOpening(event.target.checked)} />
          שלח הודעת פתיחה
        </label>
        <button type="submit" className="admin-btn-ghost" disabled={busy}>
          ייבוא Excel
        </button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>שליחה</th>
              <th>שם</th>
              <th>עסק</th>
              <th>שם להודעה</th>
              <th>סוג</th>
              <th>טלפון</th>
              <th>מקור</th>
              <th>סטטוס</th>
              <th>נוצר</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  {canSendFirstMessage(lead.source) ? (
                    <button
                      type="button"
                      className="admin-btn"
                      disabled={busy || !lead.message_name.trim()}
                      onClick={() => {
                        const preview = getFirstLeadMessage(lead.message_name);
                        if (!window.confirm(`לשלוח הודעה ראשונה ל-${lead.message_name}?\n\n${preview}`)) return;
                        run(async () => {
                          await adminJson(`/api/admin/whatsapp/leads/${encodeURIComponent(lead.id)}/send`, {
                            method: "POST",
                          });
                          onNotice("ההודעה הראשונה נשלחה");
                        });
                      }}
                    >
                      שליחה
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{lead.name}</td>
                <td>{lead.business}</td>
                <td>
                  {editing === lead.id ? (
                    <span className="admin-actions">
                      <input className="admin-inline-input" value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} />
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() =>
                          run(async () => {
                            await adminJson(`/api/admin/whatsapp/leads/${encodeURIComponent(lead.id)}`, {
                              method: "PATCH",
                              body: JSON.stringify({ message_name: nameDraft }),
                            });
                            setEditing("");
                          })
                        }
                      >
                        שמירה
                      </button>
                    </span>
                  ) : (
                    <span className="admin-actions">
                      <span>{lead.message_name || "—"}</span>
                      <button
                        type="button"
                        className="admin-btn-ghost"
                        onClick={() => {
                          setEditing(lead.id);
                          setNameDraft(lead.message_name || "");
                        }}
                      >
                        עריכה
                      </button>
                    </span>
                  )}
                </td>
                <td>{lead.business_type || "—"}</td>
                <td>{lead.phone}</td>
                <td>{lead.source || "—"}</td>
                <td>
                  <select
                    className="admin-inline-input"
                    value={lead.status}
                    disabled={busy}
                    onChange={(event) => {
                      const status = event.target.value;
                      run(async () => {
                        await adminJson(`/api/admin/whatsapp/leads/${encodeURIComponent(lead.id)}`, {
                          method: "PATCH",
                          body: JSON.stringify({ status }),
                        });
                      });
                    }}
                  >
                    {LEAD_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {LEAD_STATUS_LABELS[status as LeadStatus]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{when(lead.created_at)}</td>
                <td>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    disabled={busy}
                    onClick={() => {
                      if (!window.confirm(`למחוק את ${lead.message_name || lead.name || lead.phone}?`)) return;
                      run(async () => {
                        await adminJson(`/api/admin/whatsapp/leads/${encodeURIComponent(lead.id)}`, {
                          method: "DELETE",
                        });
                        onNotice("הליד נמחק");
                      });
                    }}
                  >
                    מחיקה
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 ? <p className="admin-note">אין לידים עדיין.</p> : null}
      </div>
    </div>
  );
}
