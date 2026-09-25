"use client";

import { useMemo, useState } from "react";
import { adminJson } from "@/lib/superadmin/browser";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
  canSendFirstMessage,
  getFirstLeadMessage,
  isLeadStatus,
  type LeadStatus,
} from "@/lib/whatsapp/copy";
import type { LeadRow } from "@/lib/whatsapp/db";
import { Drawer } from "../../../_ui/drawer";
import { useConfirm, useToast } from "../../../_ui/feedback";
import { formatDate, formatDateTime, type Tone } from "../../../_ui/format";
import { Icon } from "../../../_ui/icon";
import { Badge, EmptyState, ErrorState, Field, FilterChips, SearchField, SkeletonRows, Switch } from "../../../_ui/parts";
import { useAdminData } from "../../../_ui/use-admin-data";

const DEFAULT_BUSINESS_TYPE = "סלון ציפורניים";

const STATUS_TONES: Record<LeadStatus, Tone> = {
  no_contact: "neutral",
  message_sent: "info",
  active_conversation: "warning",
  relevant: "success",
  not_relevant: "danger",
};

function statusOf(lead: LeadRow): LeadStatus {
  return isLeadStatus(lead.status) ? lead.status : "no_contact";
}

function sourceLabel(source: string | null) {
  if (source === "manual") return "הוספה ידנית";
  if (source === "excel-import") return "ייבוא מאקסל";
  return source || "—";
}

function NewLeadDrawer({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [business, setBusiness] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState(DEFAULT_BUSINESS_TYPE);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const valid = business.trim() && phone.trim();

  async function save() {
    if (!valid) return;
    setPending(true);
    try {
      await adminJson("/api/admin/whatsapp/leads", {
        method: "POST",
        body: JSON.stringify({ business, name, phone, business_type: businessType, notes }),
      });
      toast.success("הליד נוסף");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "הוספת הליד נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title="ליד חדש"
      onSubmit={() => void save()}
      footer={
        <>
          <button type="submit" className="ad-btn is-primary" disabled={!valid || pending}>
            {pending ? "מוסיף…" : "הוספת הליד"}
          </button>
          <button type="button" className="ad-btn is-secondary" onClick={onClose}>
            ביטול
          </button>
        </>
      }
    >
      <Field label="שם העסק">
        <input className="ad-input" value={business} onChange={(event) => setBusiness(event.target.value)} />
      </Field>
      <div className="ad-form-grid">
        <Field label="טלפון">
          <input
            className="ad-input"
            dir="ltr"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="05X-XXXXXXX"
          />
        </Field>
        <Field label="איש קשר" hint="ברירת מחדל: שם העסק">
          <input className="ad-input" value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
      </div>
      <Field label="סוג העסק">
        <input className="ad-input" value={businessType} onChange={(event) => setBusinessType(event.target.value)} />
      </Field>
      <Field label="הערות" hint="לא חובה">
        <textarea className="ad-textarea" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
      </Field>
    </Drawer>
  );
}

function ImportDrawer({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [businessType, setBusinessType] = useState(DEFAULT_BUSINESS_TYPE);
  const [sendOpening, setSendOpening] = useState(false);
  const [pending, setPending] = useState(false);

  async function upload() {
    if (!file) return;
    setPending(true);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("businessType", businessType.trim() || DEFAULT_BUSINESS_TYPE);
      body.set("sendOpening", sendOpening ? "true" : "false");
      const result = await adminJson<{ inserted: number; skipped: number; openingsSent: number }>(
        "/api/admin/whatsapp/leads/import",
        { method: "POST", body },
      );
      const parts = [`יובאו ${result.inserted} לידים`];
      if (result.skipped) parts.push(`${result.skipped} כבר היו ברשימה`);
      if (sendOpening) parts.push(`${result.openingsSent} הודעות פתיחה נשלחו`);
      toast.success(parts.join(" · "));
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "הייבוא נכשל");
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title="ייבוא לידים מאקסל"
      description="טלפונים שכבר קיימים ברשימה מדולגים אוטומטית."
      onSubmit={() => void upload()}
      footer={
        <>
          <button type="submit" className="ad-btn is-primary" disabled={!file || pending}>
            {pending ? "מייבא…" : "ייבוא"}
          </button>
          <button type="button" className="ad-btn is-secondary" onClick={onClose} disabled={pending}>
            ביטול
          </button>
        </>
      }
    >
      <label className="ad-upload">
        <input
          key={file ? "selected" : "empty"}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <span className="ad-upload-thumb">
          <Icon name="file-spreadsheet" size={20} />
        </span>
        <span>
          <strong>קובץ Excel או CSV</strong>
          <span>{file ? file.name : "לחצו לבחירת קובץ"}</span>
        </span>
      </label>
      <Field label="סוג העסק" hint="יישמר לכל הלידים בקובץ">
        <input className="ad-input" value={businessType} onChange={(event) => setBusinessType(event.target.value)} />
      </Field>
      <label className="ad-check">
        <input type="checkbox" checked={sendOpening} onChange={(event) => setSendOpening(event.target.checked)} />
        לשלוח הודעת פתיחה לכל ליד חדש מיד אחרי הייבוא
      </label>
    </Drawer>
  );
}

function LeadDrawer({ lead, onClose, onSaved }: { lead: LeadRow; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [messageName, setMessageName] = useState(lead.message_name ?? "");
  const [status, setStatus] = useState<LeadStatus>(statusOf(lead));
  const [pending, setPending] = useState(false);
  const dirty = messageName.trim() !== (lead.message_name ?? "").trim() || status !== statusOf(lead);
  const canSend = canSendFirstMessage(lead.source);

  async function save() {
    if (!dirty) return onClose();
    setPending(true);
    try {
      await adminJson(`/api/admin/whatsapp/leads/${encodeURIComponent(lead.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ message_name: messageName.trim(), status }),
      });
      toast.success("הליד עודכן");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "העדכון נכשל");
    } finally {
      setPending(false);
    }
  }

  async function sendFirst() {
    const ok = await confirm({
      title: `לשלוח הודעה ראשונה ל${lead.message_name}?`,
      body: getFirstLeadMessage(lead.message_name),
      confirmLabel: "שליחה",
    });
    if (!ok) return;
    setPending(true);
    try {
      await adminJson(`/api/admin/whatsapp/leads/${encodeURIComponent(lead.id)}/send`, { method: "POST" });
      toast.success("ההודעה הראשונה נשלחה");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "השליחה נכשלה");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: `למחוק את ${lead.message_name || lead.business || lead.phone}?`,
      body: "הליד יוסר מהרשימה.",
      confirmLabel: "מחיקה",
      tone: "danger",
    });
    if (!ok) return;
    setPending(true);
    try {
      await adminJson(`/api/admin/whatsapp/leads/${encodeURIComponent(lead.id)}`, { method: "DELETE" });
      toast.success("הליד נמחק");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "המחיקה נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={lead.business || lead.phone}
      description={`נוסף ${formatDateTime(lead.created_at)} · ${sourceLabel(lead.source)}`}
      onSubmit={() => void save()}
      footer={
        <>
          <button type="submit" className="ad-btn is-primary" disabled={pending || !dirty}>
            שמירה
          </button>
          <button type="button" className="ad-btn is-secondary" onClick={onClose}>
            סגירה
          </button>
          <span className="ad-spacer" />
          <button type="button" className="ad-btn is-danger-ghost" disabled={pending} onClick={() => void remove()}>
            <Icon name="trash-2" size={16} />
            מחיקה
          </button>
        </>
      }
    >
      <dl className="ad-kv">
        <dt>איש קשר</dt>
        <dd>{lead.name || "—"}</dd>
        <dt>טלפון</dt>
        <dd>
          <a className="ad-link ad-ltr" href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
            {lead.phone}
          </a>
        </dd>
        <dt>סוג העסק</dt>
        <dd>{lead.business_type || "—"}</dd>
        {lead.notes ? (
          <>
            <dt>הערות</dt>
            <dd style={{ whiteSpace: "pre-wrap" }}>{lead.notes}</dd>
          </>
        ) : null}
      </dl>

      <Field label="סטטוס">
        <select className="ad-select" value={status} onChange={(event) => setStatus(event.target.value as LeadStatus)}>
          {LEAD_STATUSES.map((item) => (
            <option key={item} value={item}>
              {LEAD_STATUS_LABELS[item]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="שם בהודעה" hint="הפנייה בהודעה הראשונה, למשל ״היי דנה״">
        <input className="ad-input" value={messageName} onChange={(event) => setMessageName(event.target.value)} />
      </Field>

      {canSend ? (
        <div className="ad-form-section">
          <span className="ad-field-label">הודעה ראשונה</span>
          <div className="wa-bubble out" style={{ maxWidth: "100%" }}>
            {getFirstLeadMessage(messageName)}
          </div>
          <div className="ad-row">
            <button
              type="button"
              className="ad-btn is-brand is-sm"
              disabled={pending || dirty || !lead.message_name.trim()}
              onClick={() => void sendFirst()}
            >
              <Icon name="send" size={15} />
              שליחת ההודעה
            </button>
            {dirty ? <span className="ad-small ad-muted">שמרו קודם את השינויים</span> : null}
            {!dirty && !lead.message_name.trim() ? <span className="ad-small ad-muted">צריך שם בהודעה</span> : null}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

type Filter = "all" | LeadStatus;
type Editing = { kind: "new" } | { kind: "import" } | { kind: "lead"; lead: LeadRow } | null;

export default function LeadsPage() {
  const toast = useToast();
  const leads = useAdminData<{ leads: LeadRow[] }>("/api/admin/whatsapp/leads");
  const settings = useAdminData<{ enabled: boolean }>("/api/admin/whatsapp/settings");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Editing>(null);
  const [savingSetting, setSavingSetting] = useState(false);
  const rows = useMemo(() => leads.data?.leads ?? [], [leads.data]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((lead) => {
      if (filter !== "all" && statusOf(lead) !== filter) return false;
      if (!needle) return true;
      return `${lead.business} ${lead.name} ${lead.phone} ${lead.message_name}`.toLowerCase().includes(needle);
    });
  }, [rows, filter, query]);

  async function toggleHourly(enabled: boolean) {
    setSavingSetting(true);
    settings.mutate(() => ({ enabled }));
    try {
      await adminJson("/api/admin/whatsapp/settings", { method: "PATCH", body: JSON.stringify({ enabled }) });
      toast.success(enabled ? "השליחה השעתית הופעלה" : "השליחה השעתית כובתה");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "העדכון נכשל");
      settings.reload();
    } finally {
      setSavingSetting(false);
    }
  }

  return (
    <>
      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h2>
              <Icon name="clock" />
              שליחה אוטומטית
            </h2>
            <p>כל שעה נשלחת הודעת פתיחה ללידים בסטטוס ״{LEAD_STATUS_LABELS.no_contact}״.</p>
          </div>
          <Switch
            checked={settings.data?.enabled ?? false}
            disabled={!settings.data || savingSetting}
            onChange={(value) => void toggleHourly(value)}
            ariaLabel="שליחה שעתית אוטומטית"
            label={<span className="ad-small ad-muted">{settings.data?.enabled ? "פעיל" : "כבוי"}</span>}
          />
        </div>
      </section>

      <section className="ad-card">
        <div className="ad-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="חיפוש עסק, שם או טלפון" />
          <span className="ad-spacer" />
          <button type="button" className="ad-btn is-secondary is-sm" onClick={() => setEditing({ kind: "import" })}>
            <Icon name="file-spreadsheet" size={16} />
            ייבוא מאקסל
          </button>
          <button type="button" className="ad-btn is-primary is-sm" onClick={() => setEditing({ kind: "new" })}>
            <Icon name="plus" size={16} />
            ליד חדש
          </button>
        </div>
        <div className="ad-toolbar" style={{ paddingTop: 0 }}>
          <FilterChips
            label="סינון לפי סטטוס"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "הכול", count: leads.loading ? undefined : rows.length },
              ...LEAD_STATUSES.map((status) => ({
                value: status,
                label: LEAD_STATUS_LABELS[status],
                count: leads.loading ? undefined : rows.filter((lead) => statusOf(lead) === status).length,
              })),
            ]}
          />
        </div>

        {leads.error && !leads.data ? (
          <ErrorState message={leads.error} onRetry={leads.reload} />
        ) : leads.loading ? (
          <SkeletonRows rows={6} avatar={false} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="users"
            title={rows.length ? "לא נמצאו לידים" : "אין לידים עדיין"}
            body={rows.length ? "נסו סינון או חיפוש אחר." : "הוסיפו ליד ידנית או ייבאו רשימה מאקסל."}
          />
        ) : (
          <>
            <div className="ad-table-wrap">
              <table className="ad-table is-responsive">
                <thead>
                  <tr>
                    <th>עסק</th>
                    <th>טלפון</th>
                    <th>סוג</th>
                    <th>מקור</th>
                    <th>סטטוס</th>
                    <th>נוסף</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((lead) => {
                    const status = statusOf(lead);
                    return (
                      <tr key={lead.id} className="is-clickable" onClick={() => setEditing({ kind: "lead", lead })}>
                        <td className="is-primary" data-label="עסק">
                          <button
                            type="button"
                            className="ad-entity"
                            style={{ textAlign: "start" }}
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditing({ kind: "lead", lead });
                            }}
                          >
                            <span className="ad-entity-text">
                              <span className="ad-entity-title">{lead.business || lead.name || "—"}</span>
                              {lead.message_name ? <span className="ad-entity-sub">בהודעה: {lead.message_name}</span> : null}
                            </span>
                          </button>
                        </td>
                        <td data-label="טלפון">
                          <span className="ad-ltr">{lead.phone}</span>
                        </td>
                        <td data-label="סוג" className="is-hide-mobile">
                          {lead.business_type || "—"}
                        </td>
                        <td data-label="מקור" className="is-hide-mobile">
                          {sourceLabel(lead.source)}
                        </td>
                        <td data-label="סטטוס">
                          <Badge tone={STATUS_TONES[status]} dot>
                            {LEAD_STATUS_LABELS[status]}
                          </Badge>
                        </td>
                        <td data-label="נוסף" className="is-nowrap ad-muted">
                          {formatDate(lead.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="ad-table-foot">
              {visible.length === rows.length ? `${rows.length} לידים` : `${visible.length} מתוך ${rows.length} לידים`}
            </div>
          </>
        )}
      </section>

      {editing?.kind === "new" ? <NewLeadDrawer onClose={() => setEditing(null)} onSaved={leads.reload} /> : null}
      {editing?.kind === "import" ? <ImportDrawer onClose={() => setEditing(null)} onSaved={leads.reload} /> : null}
      {editing?.kind === "lead" ? (
        <LeadDrawer key={editing.lead.id} lead={editing.lead} onClose={() => setEditing(null)} onSaved={leads.reload} />
      ) : null}
    </>
  );
}
