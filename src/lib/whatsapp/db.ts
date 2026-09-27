import { getWhatsappSupabase } from "@/lib/whatsapp/client";
import { extractMessageName } from "@/lib/whatsapp/message-name";
import { isLeadStatus, type LeadStatus } from "@/lib/whatsapp/copy";

export type ConversationRow = {
  phone: string;
  name: string;
  status: string;
  last_message_at: string | null;
  last_message: string;
  last_user_message: string;
  proactive: boolean;
  handoff_reason: string | null;
};

export type ChatMessageRow = {
  id: string;
  phone: string;
  role: string;
  content: string;
  created_at: string;
};

export type LeadRow = {
  id: string;
  name: string;
  business: string;
  phone: string;
  business_type: string | null;
  notes: string | null;
  source: string | null;
  status: string;
  message_name: string;
  created_at: string;
};

export type LeadInsert = {
  name: string;
  business: string;
  phone: string;
  business_type: string;
  notes: string | null;
  source: string;
  message_name: string;
};

const CONVERSATIONS_FULL =
  "phone, name, status, handoff_reason, last_message_at, last_message, last_user_message, proactive";
const CONVERSATIONS_BASIC = "phone, name, status, last_message_at, last_message";
const LEADS_FULL =
  "id, name, business, phone, business_type, notes, source, status, message_name, created_at";
const LEADS_BASIC =
  "id, name, business, phone, business_type, notes, source, status, created_at";

function missingColumn(err: { message?: string } | null, column: string) {
  const msg = String(err?.message || "");
  return msg.includes(column) && msg.includes("does not exist");
}

function withMessageName(row: LeadRow): LeadRow {
  return {
    ...row,
    message_name:
      (row.message_name && String(row.message_name).trim()) ||
      extractMessageName(row.business || ""),
  };
}

export async function getConversations(): Promise<ConversationRow[]> {
  const db = getWhatsappSupabase();
  const full = await db
    .from("conversations")
    .select(CONVERSATIONS_FULL)
    .order("last_message_at", { ascending: false });
  let rows = (full.data ?? []) as ConversationRow[];
  let error = full.error;
  if (
    error &&
    (missingColumn(error, "last_user_message") ||
      missingColumn(error, "proactive") ||
      missingColumn(error, "handoff_reason"))
  ) {
    const basic = await db
      .from("conversations")
      .select(CONVERSATIONS_BASIC)
      .order("last_message_at", { ascending: false });
    rows = (basic.data ?? []) as ConversationRow[];
    error = basic.error;
  }
  if (error) throw new Error(error.message);
  const phones = rows.map((row) => row.phone);
  const latest = new Map<string, string>();
  if (phones.length) {
    const { data: userMsgs } = await db
      .from("messages")
      .select("phone, content, created_at")
      .in("phone", phones)
      .eq("role", "user")
      .order("created_at", { ascending: false });
    for (const msg of userMsgs ?? []) {
      if (!latest.has(msg.phone)) latest.set(msg.phone, msg.content);
    }
  }
  return rows.map((row) => ({
    ...row,
    name: row.name || "",
    status: row.status || "bot",
    last_message: row.last_message || "",
    last_user_message: latest.get(row.phone) || row.last_user_message || "",
    proactive: Boolean(row.proactive),
    handoff_reason: row.handoff_reason || null,
  }));
}

export async function getMessages(phone: string): Promise<ChatMessageRow[]> {
  const db = getWhatsappSupabase();
  const { data, error } = await db
    .from("messages")
    .select("id, phone, role, content, created_at")
    .eq("phone", phone)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ChatMessageRow[];
}

export async function deleteConversation(phone: string) {
  const db = getWhatsappSupabase();
  const messages = await db.from("messages").delete().eq("phone", phone);
  if (messages.error) throw new Error(messages.error.message);
  const conversation = await db.from("conversations").delete().eq("phone", phone);
  if (conversation.error) throw new Error(conversation.error.message);
}

export async function setConversationStatus(phone: string, status: "bot" | "human") {
  const db = getWhatsappSupabase();
  const { data: existing, error: selErr } = await db
    .from("conversations")
    .select("phone")
    .eq("phone", phone)
    .maybeSingle();
  if (selErr) throw new Error(selErr.message);
  const write = async (withReason: boolean) => {
    const payload = withReason ? { status, handoff_reason: null } : { status };
    if (!existing) {
      return db.from("conversations").insert({
        phone,
        name: "",
        last_message_at: new Date().toISOString(),
        last_message: "",
        ...payload,
      });
    }
    return db.from("conversations").update(payload).eq("phone", phone);
  };
  let { error } = await write(true);
  if (error && missingColumn(error, "handoff_reason")) {
    ({ error } = await write(false));
  }
  if (error) throw new Error(error.message);
}

export async function upsertConversation(phone: string, name: string) {
  const db = getWhatsappSupabase();
  const { error } = await db.from("conversations").upsert(
    { phone, name: name ?? "", last_message_at: new Date().toISOString() },
    { onConflict: "phone" },
  );
  if (error) throw new Error(error.message);
}

export async function markConversationProactive(phone: string) {
  const db = getWhatsappSupabase();
  const { error } = await db.from("conversations").update({ proactive: true }).eq("phone", phone);
  if (error && !missingColumn(error, "proactive")) throw new Error(error.message);
}

export async function saveMessage(phone: string, role: string, content: string) {
  const db = getWhatsappSupabase();
  const text = String(content);
  const { error: insErr } = await db.from("messages").insert({ phone, role, content: text });
  if (insErr) throw new Error(insErr.message);
  const convUpdate: Record<string, string> = {
    last_message_at: new Date().toISOString(),
    last_message: text.slice(0, 2000),
  };
  if (role === "user") convUpdate.last_user_message = text.slice(0, 2000);
  let { error: updErr } = await db.from("conversations").update(convUpdate).eq("phone", phone);
  if (updErr && role === "user" && missingColumn(updErr, "last_user_message")) {
    ({ error: updErr } = await db
      .from("conversations")
      .update({
        last_message_at: convUpdate.last_message_at,
        last_message: convUpdate.last_message,
      })
      .eq("phone", phone));
  }
  if (updErr) throw new Error(updErr.message);
}

async function fetchLeadRows() {
  const db = getWhatsappSupabase();
  const full = await db.from("leads").select(LEADS_FULL).order("created_at", { ascending: false });
  let rows = (full.data ?? []) as LeadRow[];
  let error = full.error;
  if (error && missingColumn(error, "message_name")) {
    const basic = await db.from("leads").select(LEADS_BASIC).order("created_at", { ascending: false });
    rows = (basic.data ?? []) as LeadRow[];
    error = basic.error;
  }
  if (error) throw new Error(error.message);
  return rows;
}

export async function getLeads() {
  const rows = await fetchLeadRows();
  const pending = rows.filter((row) => !String(row.message_name || "").trim() && extractMessageName(row.business || ""));
  if (pending.length) {
    const db = getWhatsappSupabase();
    await Promise.allSettled(
      pending.map((row) =>
        db.from("leads").update({ message_name: extractMessageName(row.business || "") }).eq("id", row.id),
      ),
    );
  }
  return rows.map(withMessageName);
}

export async function getLeadById(id: string) {
  const db = getWhatsappSupabase();
  const full = await db.from("leads").select(LEADS_FULL).eq("id", id).maybeSingle();
  let data = full.data as LeadRow | null;
  let error = full.error;
  if (error && missingColumn(error, "message_name")) {
    const basic = await db.from("leads").select(LEADS_BASIC).eq("id", id).maybeSingle();
    data = basic.data as LeadRow | null;
    error = basic.error;
  }
  if (error) throw new Error(error.message);
  if (!data) return null;
  return withMessageName(data as LeadRow);
}

export async function getExistingLeadPhones() {
  const db = getWhatsappSupabase();
  const { data, error } = await db.from("leads").select("phone");
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => String(row.phone)));
}

export async function createLead(lead: LeadInsert) {
  const db = getWhatsappSupabase();
  const { data, error } = await db.from("leads").insert(lead).select().single();
  if (error) throw new Error(error.message);
  return withMessageName(data as LeadRow);
}

export async function updateLead(
  id: string,
  fields: { status?: string; message_name?: string; business_type?: string },
) {
  const patch: { status?: LeadStatus; message_name?: string; business_type?: string } = {};
  if (fields.status !== undefined) {
    if (!isLeadStatus(fields.status)) throw new Error("סטטוס לא תקין");
    patch.status = fields.status;
  }
  if (fields.message_name !== undefined) {
    patch.message_name = String(fields.message_name).trim().slice(0, 80);
  }
  if (fields.business_type !== undefined) {
    const businessType = String(fields.business_type).trim().slice(0, 80);
    if (!businessType) throw new Error("חסר סוג עסק");
    patch.business_type = businessType;
  }
  if (!Object.keys(patch).length) throw new Error("אין שדות לעדכן");
  const db = getWhatsappSupabase();
  const { data, error } = await db
    .from("leads")
    .update(patch)
    .eq("id", id)
    .select("id, status, message_name")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("ליד לא נמצא");
  return data;
}

export async function deleteLead(id: string) {
  const db = getWhatsappSupabase();
  const { error } = await db.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function bulkInsertLeads(leads: LeadInsert[]) {
  if (!leads.length) return [] as LeadRow[];
  const db = getWhatsappSupabase();
  const inserted: LeadRow[] = [];
  for (let i = 0; i < leads.length; i += 50) {
    const chunk = leads.slice(i, i + 50);
    const { data, error } = await db.from("leads").insert(chunk).select();
    if (error) throw new Error(error.message);
    inserted.push(...((data ?? []) as LeadRow[]));
  }
  return inserted;
}
