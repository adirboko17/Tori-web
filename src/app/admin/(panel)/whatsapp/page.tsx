"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { adminJson } from "@/lib/superadmin/browser";
import type { ChatMessageRow, ConversationRow } from "@/lib/whatsapp/db";
import { useConfirm, useToast } from "../../_ui/feedback";
import { formatDateTime, formatRelative } from "../../_ui/format";
import { Icon } from "../../_ui/icon";
import { Avatar, Badge, EmptyState, ErrorState, FilterChips, SearchField, SkeletonRows } from "../../_ui/parts";
import { useAdminData } from "../../_ui/use-admin-data";

const POLL_MS = 8000;

function roleLabel(role: string) {
  if (role === "user") return "לקוח";
  if (role === "human_agent") return "נציג";
  return "בוט";
}

function usePolling(reload: () => void) {
  useEffect(() => {
    const timer = window.setInterval(reload, POLL_MS);
    return () => window.clearInterval(timer);
  }, [reload]);
}

function Thread({
  phone,
  conversation,
  onBack,
  onChanged,
}: {
  phone: string;
  conversation: ConversationRow | undefined;
  onBack: () => void;
  onChanged: () => void;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const path = `/api/admin/whatsapp/conversations/${encodeURIComponent(phone)}`;
  const { data, error, loading, reload } = useAdminData<{ messages: ChatMessageRow[] }>(path);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const bubblesRef = useRef<HTMLDivElement>(null);
  const messages = useMemo(() => data?.messages ?? [], [data]);
  const withAgent = conversation?.status === "human";
  const name = conversation?.name || phone;
  usePolling(reload);

  useEffect(() => {
    const node = bubblesRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  async function act(suffix: string, init: RequestInit, success: string) {
    setBusy(true);
    try {
      await adminJson(`${path}${suffix}`, init);
      toast.success(success);
      reload();
      onChanged();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "הפעולה נכשלה");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: `למחוק את השיחה עם ${name}?`,
      body: "כל ההודעות בשיחה יימחקו. אי אפשר לשחזר.",
      confirmLabel: "מחיקת השיחה",
      tone: "danger",
    });
    if (!ok) return;
    if (await act("", { method: "DELETE" }, "השיחה נמחקה")) onBack();
  }

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    const sent = await act("/send", { method: "POST", body: JSON.stringify({ message: text }) }, "ההודעה נשלחה בוואטסאפ");
    if (!sent) setDraft(text);
  }

  return (
    <div className="wa-thread">
      <div className="wa-thread-head">
        <button type="button" className="ad-icon-btn wa-back" aria-label="חזרה לרשימת השיחות" onClick={onBack}>
          <Icon name="arrow-right" size={18} />
        </button>
        <span className="ad-entity">
          <Avatar name={name} size="sm" round />
          <span className="ad-entity-text">
            <span className="ad-entity-title">{name}</span>
            <span className="ad-entity-sub">
              <span className="ad-ltr">{phone}</span>
            </span>
          </span>
        </span>
        <Badge tone={withAgent ? "warning" : "neutral"} dot>
          {withAgent ? "ממתין לנציג" : "אצל הבוט"}
        </Badge>
        <span className="ad-spacer" />
        {withAgent ? (
          <button
            type="button"
            className="ad-btn is-secondary is-sm"
            disabled={busy}
            onClick={() => void act("/handback", { method: "POST" }, "השיחה חזרה לבוט")}
          >
            <Icon name="bot" size={16} />
            החזרה לבוט
          </button>
        ) : (
          <button
            type="button"
            className="ad-btn is-secondary is-sm"
            disabled={busy}
            onClick={() => void act("/handoff", { method: "POST" }, "השיחה הועברה אליכם")}
          >
            <Icon name="headset" size={16} />
            העברה לנציג
          </button>
        )}
        <button type="button" className="ad-icon-btn" aria-label="מחיקת השיחה" disabled={busy} onClick={() => void remove()}>
          <Icon name="trash-2" size={17} />
        </button>
      </div>

      <div className="wa-bubbles" ref={bubblesRef}>
        {error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <SkeletonRows rows={3} />
        ) : messages.length === 0 ? (
          <p className="ad-small ad-muted">אין הודעות בשיחה.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`wa-bubble${message.role === "user" ? "" : " out"}`}>
              {message.content}
              <small>
                {roleLabel(message.role)} · {formatDateTime(message.created_at)}
              </small>
            </div>
          ))
        )}
      </div>

      <form
        className="wa-composer"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <textarea
          className="ad-textarea"
          rows={1}
          value={draft}
          placeholder={withAgent ? "תשובה כנציג" : "הודעה כנציג (הבוט ממשיך לענות)"}
          aria-label="הודעה"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              void send();
            }
          }}
        />
        <button type="submit" className="ad-btn is-primary" disabled={busy || !draft.trim()} aria-label="שליחה">
          <Icon name="send" size={16} />
        </button>
      </form>
    </div>
  );
}

function ChatsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const { data, error, loading, reload } = useAdminData<{ conversations: ConversationRow[] }>(
    "/api/admin/whatsapp/conversations",
  );
  const [filter, setFilter] = useState<"all" | "human">("all");
  const [query, setQuery] = useState("");
  usePolling(reload);

  const conversations = useMemo(() => data?.conversations ?? [], [data]);
  const waiting = conversations.filter((item) => item.status === "human").length;
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return conversations.filter((item) => {
      if (filter === "human" && item.status !== "human") return false;
      if (!needle) return true;
      return `${item.name} ${item.phone} ${item.last_user_message}`.toLowerCase().includes(needle);
    });
  }, [conversations, filter, query]);

  function select(next: string) {
    router.replace(next ? `${pathname}?phone=${encodeURIComponent(next)}` : pathname, { scroll: false });
  }

  function changed() {
    reload();
    router.refresh();
  }

  return (
    <section className="ad-card">
      <div className={`wa-layout ${phone ? "has-thread" : ""}`}>
        <div className="wa-list">
          <div className="ad-stack" style={{ padding: 12, gap: 10, borderBottom: "1px solid var(--line-subtle)" }}>
            <SearchField value={query} onChange={setQuery} placeholder="חיפוש שם או טלפון" />
            <FilterChips
              label="סינון שיחות"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "הכול", count: loading ? undefined : conversations.length },
                { value: "human", label: "ממתינים לנציג", count: loading ? undefined : waiting },
              ]}
            />
          </div>
          {error && !data ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading ? (
            <SkeletonRows rows={5} avatar />
          ) : visible.length === 0 ? (
            <EmptyState
              icon="message-circle"
              title={conversations.length ? "אין שיחות בסינון הזה" : "אין שיחות עדיין"}
              body={filter === "human" ? "אף לקוח לא מחכה לנציג כרגע." : undefined}
            />
          ) : (
            visible.map((item) => (
              <button
                key={item.phone}
                type="button"
                className="wa-item"
                aria-pressed={item.phone === phone}
                onClick={() => select(item.phone)}
              >
                <span className="wa-item-top">
                  <strong>{item.name || item.phone}</strong>
                  <span className="wa-item-time">{formatRelative(item.last_message_at)}</span>
                </span>
                <span className="wa-item-text">{item.last_user_message || item.last_message || "אין הודעות"}</span>
                {item.status === "human" ? (
                  <span>
                    <Badge tone="warning" dot>
                      ממתין לנציג
                    </Badge>
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>

        {phone ? (
          <Thread
            key={phone}
            phone={phone}
            conversation={conversations.find((item) => item.phone === phone)}
            onBack={() => select("")}
            onChanged={changed}
          />
        ) : (
          <div className="wa-thread">
            <EmptyState icon="message-circle" title="בחרו שיחה" body="השיחות מתעדכנות אוטומטית כל כמה שניות." />
          </div>
        )}
      </div>
    </section>
  );
}

export default function WhatsappChatsPage() {
  return (
    <Suspense fallback={<section className="ad-card"><SkeletonRows rows={5} avatar /></section>}>
      <ChatsContent />
    </Suspense>
  );
}
