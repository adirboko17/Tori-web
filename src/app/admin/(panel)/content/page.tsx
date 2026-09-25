"use client";

import { useMemo, useState } from "react";
import type { AdminBusiness } from "@/lib/admin/businesses";
import type { OperationalMessage } from "@/lib/admin/operational-messages";
import { adminJson } from "@/lib/superadmin/browser";
import { Drawer } from "../../_ui/drawer";
import { useToast } from "../../_ui/feedback";
import { formatRelative } from "../../_ui/format";
import { Icon } from "../../_ui/icon";
import {
  Badge,
  EmptyState,
  ErrorState,
  Field,
  FilterChips,
  SearchField,
  SkeletonRows,
  Switch,
} from "../../_ui/parts";
import { useAdminData } from "../../_ui/use-admin-data";

type Audience = OperationalMessage["audience"];
type Draft = { title: string; body: string; actionLabel: string; actionUrl: string; audience: Audience; businessIds: string[] };
type Filter = "active" | "inactive" | "all";

const EMPTY: Draft = { title: "", body: "", actionLabel: "", actionUrl: "", audience: "staff", businessIds: [] };

function validate(draft: Draft) {
  if (!draft.title.trim()) return "צריך כותרת";
  if (!draft.body.trim()) return "צריך תוכן להודעה";
  if (draft.actionUrl.trim() && !/^https:\/\/\S+$/i.test(draft.actionUrl.trim())) return "הקישור צריך להתחיל ב-https://";
  if (draft.actionUrl.trim() && !draft.actionLabel.trim()) return "צריך טקסט לכפתור כשיש קישור";
  if (draft.businessIds.length === 0) return "צריך לבחור לפחות עסק אחד";
  return "";
}

function MessageDrawer({
  message,
  businesses,
  onClose,
  onSaved,
}: {
  message: OperationalMessage | null;
  businesses: AdminBusiness[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [draft, setDraft] = useState<Draft>(
    message
      ? {
          title: message.title,
          body: message.body,
          actionLabel: message.actionLabel,
          actionUrl: message.actionUrl,
          audience: message.audience,
          businessIds: message.businessIds,
        }
      : EMPTY,
  );
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [touched, setTouched] = useState(false);
  const problem = validate(draft);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return businesses;
    return businesses.filter((business) => `${business.name} ${business.phone}`.toLowerCase().includes(needle));
  }, [businesses, query]);

  const allVisibleSelected = visible.length > 0 && visible.every((business) => draft.businessIds.includes(business.id));

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleBusiness(id: string) {
    update(
      "businessIds",
      draft.businessIds.includes(id) ? draft.businessIds.filter((item) => item !== id) : [...draft.businessIds, id],
    );
  }

  function toggleVisible() {
    const ids = visible.map((business) => business.id);
    update(
      "businessIds",
      allVisibleSelected
        ? draft.businessIds.filter((id) => !ids.includes(id))
        : [...new Set([...draft.businessIds, ...ids])],
    );
  }

  async function save() {
    setTouched(true);
    if (problem) return;
    setPending(true);
    try {
      const body = JSON.stringify(draft);
      if (message) await adminJson(`/api/admin/operational-messages/${message.id}`, { method: "PATCH", body });
      else await adminJson("/api/admin/operational-messages", { method: "POST", body });
      toast.success(message ? "ההודעה עודכנה" : "ההודעה פורסמה");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "שמירת ההודעה נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer
      open
      wide
      onClose={onClose}
      title={message ? "עריכת הודעה" : "הודעה חדשה"}
      description="ההודעה קופצת פעם אחת בכניסה לאפליקציה, בלי תלות בגרסת הבילד."
      onSubmit={() => void save()}
      footer={
        <>
          <button type="submit" className="ad-btn is-primary" disabled={pending}>
            {pending ? "שומר…" : message ? "שמירת השינויים" : "פרסום ההודעה"}
          </button>
          <button type="button" className="ad-btn is-secondary" onClick={onClose}>
            ביטול
          </button>
          {touched && problem ? <span className="ad-field-error">{problem}</span> : null}
        </>
      }
    >
      <Field label="כותרת" hint={`${draft.title.length}/120`}>
        <input className="ad-input" maxLength={120} value={draft.title} onChange={(event) => update("title", event.target.value)} />
      </Field>
      <Field label="תוכן" hint={`${draft.body.length}/2000`}>
        <textarea className="ad-textarea" maxLength={2000} value={draft.body} onChange={(event) => update("body", event.target.value)} />
      </Field>
      <div className="ad-form-grid">
        <Field label="טקסט לכפתור" hint="לא חובה">
          <input
            className="ad-input"
            maxLength={40}
            value={draft.actionLabel}
            onChange={(event) => update("actionLabel", event.target.value)}
            placeholder="למשל: לעדכון"
          />
        </Field>
        <Field label="קישור לכפתור" hint="לא חובה">
          <input
            className="ad-input"
            dir="ltr"
            value={draft.actionUrl}
            onChange={(event) => update("actionUrl", event.target.value)}
            placeholder="https://"
          />
        </Field>
      </div>

      <div className="ad-field">
        <span className="ad-field-label">למי להציג</span>
        <div className="ad-radio-cards" role="radiogroup">
          <label className="ad-radio-card">
            <input type="radio" name="audience" checked={draft.audience === "staff"} onChange={() => update("audience", "staff")} />
            <span>
              <strong>מנהל ועובדים</strong>
              <span>רק הצוות של העסק</span>
            </span>
          </label>
          <label className="ad-radio-card">
            <input type="radio" name="audience" checked={draft.audience === "everyone"} onChange={() => update("audience", "everyone")} />
            <span>
              <strong>כולם</strong>
              <span>גם הלקוחות של העסק</span>
            </span>
          </label>
        </div>
      </div>

      <div className="ad-field">
        <span className="ad-field-label">עסקים ({draft.businessIds.length} נבחרו)</span>
        <div className="ad-card">
          <div className="ad-toolbar" style={{ padding: 10 }}>
            <SearchField value={query} onChange={setQuery} placeholder="חיפוש עסק" />
            <label className="ad-check">
              <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} />
              בחירת כל המוצגים
            </label>
          </div>
          <div style={{ maxHeight: 260, overflowY: "auto", padding: "4px 12px" }}>
            {visible.map((business) => (
              <label key={business.id} className="ad-check" style={{ display: "flex", minHeight: 40 }}>
                <input
                  type="checkbox"
                  checked={draft.businessIds.includes(business.id)}
                  onChange={() => toggleBusiness(business.id)}
                />
                <span style={{ flex: 1 }}>{business.name}</span>
                <span className="ad-faint ad-small" dir="ltr">
                  {business.phone}
                </span>
              </label>
            ))}
            {visible.length === 0 ? <p className="ad-small ad-muted" style={{ padding: 8 }}>לא נמצאו עסקים.</p> : null}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default function OperationalMessagesPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("active");
  const [editing, setEditing] = useState<OperationalMessage | "new" | null>(null);
  const [busyId, setBusyId] = useState("");
  const messages = useAdminData<{ messages: OperationalMessage[] }>("/api/admin/operational-messages");
  const businesses = useAdminData<{ businesses: AdminBusiness[] }>("/api/admin/businesses");
  const rows = useMemo(() => messages.data?.messages ?? [], [messages.data]);
  const names = useMemo(
    () => new Map((businesses.data?.businesses ?? []).map((business) => [business.id, business.name])),
    [businesses.data],
  );

  const visible = rows.filter((message) =>
    filter === "all" ? true : filter === "active" ? message.active : !message.active,
  );

  async function setActive(message: OperationalMessage, active: boolean) {
    setBusyId(message.id);
    messages.mutate((current) => ({
      messages: current.messages.map((row) => (row.id === message.id ? { ...row, active } : row)),
    }));
    try {
      await adminJson(`/api/admin/operational-messages/${message.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      toast.success(active ? "ההודעה הופעלה" : "ההודעה כובתה");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "העדכון נכשל");
      messages.reload();
    } finally {
      setBusyId("");
    }
  }

  function targets(message: OperationalMessage) {
    const list = message.businessIds.map((id) => names.get(id)).filter(Boolean) as string[];
    if (list.length === 0) return `${message.businessIds.length} עסקים`;
    if (list.length <= 2) return list.join(", ");
    return `${list.slice(0, 2).join(", ")} ועוד ${list.length - 2}`;
  }

  return (
    <section className="ad-card">
      <div className="ad-toolbar">
        <FilterChips
          label="סינון הודעות"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "active", label: "פעילות", count: messages.loading ? undefined : rows.filter((row) => row.active).length },
            { value: "inactive", label: "כבויות", count: messages.loading ? undefined : rows.filter((row) => !row.active).length },
            { value: "all", label: "הכול", count: messages.loading ? undefined : rows.length },
          ]}
        />
        <span className="ad-spacer" />
        <button type="button" className="ad-btn is-primary is-sm" onClick={() => setEditing("new")} disabled={!businesses.data}>
          <Icon name="plus" size={16} />
          הודעה חדשה
        </button>
      </div>

      {messages.error && !messages.data ? (
        <ErrorState message={messages.error} onRetry={messages.reload} />
      ) : messages.loading ? (
        <SkeletonRows rows={3} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon="megaphone"
          title={rows.length ? "אין הודעות בסינון הזה" : "עדיין אין הודעות"}
          body="הודעה תפעולית קופצת פעם אחת לעסקים שבחרתם, למשל על עדכון גרסה או תקלה."
          action={
            rows.length ? null : (
              <button type="button" className="ad-btn is-primary is-sm" onClick={() => setEditing("new")} disabled={!businesses.data}>
                הודעה ראשונה
              </button>
            )
          }
        />
      ) : (
        <div className="ad-list">
          {visible.map((message) => (
            <div key={message.id} className="ad-list-item" style={{ alignItems: "flex-start" }}>
              <span className={`ad-list-icon ${message.active ? "is-success" : ""}`}>
                <Icon name="megaphone" size={17} />
              </span>
              <span className="ad-list-main">
                <span className="ad-list-title">{message.title}</span>
                <span className="ad-list-sub" style={{ whiteSpace: "normal" }}>
                  {message.body.length > 160 ? `${message.body.slice(0, 160)}…` : message.body}
                </span>
                <span className="ad-row ad-small ad-muted" style={{ marginTop: 8 }}>
                  <Badge tone={message.audience === "everyone" ? "info" : "neutral"}>
                    {message.audience === "everyone" ? "כולם" : "מנהל ועובדים"}
                  </Badge>
                  <span>{targets(message)}</span>
                  <span>· נסגרה אצל {message.dismissalCount} משתמשים</span>
                  <span>· {formatRelative(message.createdAt)}</span>
                </span>
              </span>
              <span className="ad-list-actions">
                <Switch
                  checked={message.active}
                  disabled={busyId === message.id}
                  onChange={(value) => void setActive(message, value)}
                  ariaLabel={`הצגת ${message.title}`}
                  label={<span className="ad-small ad-muted ad-hide-mobile">{message.active ? "פעילה" : "כבויה"}</span>}
                />
                <button
                  type="button"
                  className="ad-icon-btn"
                  aria-label={`עריכת ${message.title}`}
                  onClick={() => setEditing(message)}
                  disabled={!businesses.data}
                >
                  <Icon name="pencil" size={16} />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {editing ? (
        <MessageDrawer
          key={editing === "new" ? "new" : editing.id}
          message={editing === "new" ? null : editing}
          businesses={businesses.data?.businesses ?? []}
          onClose={() => setEditing(null)}
          onSaved={messages.reload}
        />
      ) : null}
    </section>
  );
}
