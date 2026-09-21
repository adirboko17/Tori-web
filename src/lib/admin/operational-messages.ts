import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import {
  parseOperationalMessageInput,
  type OperationalMessageInput,
} from "./operational-message-parse";

export type OperationalMessage = {
  id: string;
  title: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
  audience: "staff" | "everyone";
  active: boolean;
  createdAt: string;
  createdByPhone: string;
  businessIds: string[];
  dismissalCount: number;
};

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function toMessage(row: Record<string, unknown>): OperationalMessage {
  const targets = Array.isArray(row.operational_message_targets)
    ? row.operational_message_targets
    : [];
  const dismissals = Array.isArray(row.operational_message_dismissals)
    ? row.operational_message_dismissals
    : [];
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    actionLabel: String(row.action_label ?? ""),
    actionUrl: String(row.action_url ?? ""),
    audience: row.audience === "everyone" ? "everyone" : "staff",
    active: row.active === true,
    createdAt: String(row.created_at ?? ""),
    createdByPhone: String(row.created_by_phone ?? ""),
    businessIds: targets
      .map((target) => String(asRecord(target).business_id ?? ""))
      .filter(Boolean),
    dismissalCount: dismissals.length,
  };
}

export async function listOperationalMessages(): Promise<OperationalMessage[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("operational_messages")
    .select(
      "id, title, body, action_label, action_url, audience, active, created_by_phone, created_at, operational_message_targets(business_id), operational_message_dismissals(user_id)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error("טעינת ההודעות התפעוליות נכשלה.");
  return (data ?? []).map((row) => toMessage(asRecord(row)));
}

export async function createOperationalMessage(
  input: OperationalMessageInput,
  createdByPhone: string,
): Promise<OperationalMessage> {
  const supabase = getServiceSupabase();
  const { data: businesses, error: businessError } = await supabase
    .from("business_profile")
    .select("id")
    .in("id", input.businessIds);
  if (businessError) throw new Error("בדיקת הלקוחות נכשלה.");
  const found = new Set((businesses ?? []).map((row) => String(asRecord(row).id ?? "")));
  if (input.businessIds.some((id) => !found.has(id))) {
    throw new Error("אחד הלקוחות שנבחרו לא נמצא.");
  }

  const { data: created, error } = await supabase
    .from("operational_messages")
    .insert({
      title: input.title,
      body: input.body,
      action_label: input.actionLabel,
      action_url: input.actionUrl,
      audience: input.audience,
      created_by_phone: createdByPhone,
      active: true,
    })
    .select("id")
    .single();
  if (error || !created) throw new Error("שמירת ההודעה נכשלה.");

  const messageId = String(asRecord(created).id ?? "");
  const { error: targetError } = await supabase.from("operational_message_targets").insert(
    input.businessIds.map((businessId) => ({
      message_id: messageId,
      business_id: businessId,
    })),
  );
  if (targetError) {
    await supabase.from("operational_messages").delete().eq("id", messageId);
    throw new Error("שיוך ההודעה ללקוחות נכשל.");
  }

  const messages = await listOperationalMessages();
  const message = messages.find((item) => item.id === messageId);
  if (!message) throw new Error("שמירת ההודעה נכשלה.");
  return message;
}

async function ensureBusinesses(businessIds: string[]) {
  const supabase = getServiceSupabase();
  const { data: businesses, error } = await supabase
    .from("business_profile")
    .select("id")
    .in("id", businessIds);
  if (error) throw new Error("בדיקת הלקוחות נכשלה.");
  const found = new Set((businesses ?? []).map((row) => String(asRecord(row).id ?? "")));
  if (businessIds.some((id) => !found.has(id))) {
    throw new Error("אחד הלקוחות שנבחרו לא נמצא.");
  }
}

async function replaceTargets(messageId: string, businessIds: string[]) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("operational_message_targets")
    .select("business_id")
    .eq("message_id", messageId);
  if (error) throw new Error("שיוך ההודעה ללקוחות נכשל.");
  const current = new Set(
    (data ?? []).map((row) => String(asRecord(row).business_id ?? "")).filter(Boolean),
  );
  const next = new Set(businessIds);
  const remove = [...current].filter((id) => !next.has(id));
  const add = businessIds.filter((id) => !current.has(id));
  if (remove.length > 0) {
    const { error: deleteError } = await supabase
      .from("operational_message_targets")
      .delete()
      .eq("message_id", messageId)
      .in("business_id", remove);
    if (deleteError) throw new Error("שיוך ההודעה ללקוחות נכשל.");
  }
  if (add.length > 0) {
    const { error: insertError } = await supabase.from("operational_message_targets").insert(
      add.map((businessId) => ({ message_id: messageId, business_id: businessId })),
    );
    if (insertError) throw new Error("שיוך ההודעה ללקוחות נכשל.");
  }
}

export async function updateOperationalMessage(id: string, input: OperationalMessageInput) {
  await ensureBusinesses(input.businessIds);
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("operational_messages")
    .update({
      title: input.title,
      body: input.body,
      action_label: input.actionLabel,
      action_url: input.actionUrl,
      audience: input.audience,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error("עדכון ההודעה נכשל.");
  if (!data) return null;
  await replaceTargets(id, input.businessIds);
  const messages = await listOperationalMessages();
  return messages.find((item) => item.id === id) ?? null;
}

export async function setOperationalMessageActive(id: string, active: boolean) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("operational_messages")
    .update({ active })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error("עדכון ההודעה נכשל.");
  if (!data) return null;
  const messages = await listOperationalMessages();
  return messages.find((item) => item.id === id) ?? null;
}

export function readOperationalMessageInput(body: Record<string, unknown>) {
  return parseOperationalMessageInput(body);
}
