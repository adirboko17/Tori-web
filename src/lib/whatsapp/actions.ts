import { canSendFirstMessage, firstLeadTemplateOptions, getFirstLeadMessage, getOpeningMessage } from "@/lib/whatsapp/copy";
import {
  bulkInsertLeads,
  createLead,
  getExistingLeadPhones,
  getLeadById,
  getMessages,
  markConversationProactive,
  saveMessage,
  setConversationStatus,
  updateLead,
  upsertConversation,
  type LeadInsert,
} from "@/lib/whatsapp/db";
import { parseExcelBuffer } from "@/lib/whatsapp/excel";
import { sendMessage, sendProactiveMessage } from "@/lib/whatsapp/graph";
import { extractMessageName } from "@/lib/whatsapp/message-name";
import { normalizePhone } from "@/lib/whatsapp/phone";

const recentAgentSends = new Map<string, number>();
const AGENT_SEND_DEDUPE_MS = 10_000;
const recentOpeningSends = new Map<string, number>();
const OPENING_DEDUPE_MS = 60_000;

function isDuplicateAgentSend(phone: string, message: string) {
  const key = `${phone}:${message.trim()}`;
  const now = Date.now();
  const lastSentAt = recentAgentSends.get(key);
  for (const [storedKey, sentAt] of recentAgentSends.entries()) {
    if (now - sentAt > AGENT_SEND_DEDUPE_MS) recentAgentSends.delete(storedKey);
  }
  if (lastSentAt && now - lastSentAt < AGENT_SEND_DEDUPE_MS) return true;
  recentAgentSends.set(key, now);
  return false;
}

function shouldSendOpening(phone: string) {
  const now = Date.now();
  for (const [stored, sentAt] of recentOpeningSends.entries()) {
    if (now - sentAt > OPENING_DEDUPE_MS) recentOpeningSends.delete(stored);
  }
  const last = recentOpeningSends.get(phone);
  if (last && now - last < OPENING_DEDUPE_MS) return false;
  recentOpeningSends.set(phone, now);
  return true;
}

export async function handoff(phone: string) {
  await setConversationStatus(phone, "human");
}

export async function handback(phone: string) {
  await setConversationStatus(phone, "bot");
}

export async function sendAsAgent(phone: string, message: string) {
  const text = message.trim();
  if (!phone || !text) throw new Error("חסר phone או message");
  if (isDuplicateAgentSend(phone, text)) return { success: true, duplicate: true };
  await setConversationStatus(phone, "human");
  await sendMessage(phone, text);
  await saveMessage(phone, "human_agent", text);
  return { success: true, duplicate: false };
}

export async function sendFirstLeadMessage(id: string) {
  const lead = await getLeadById(id);
  if (!lead) throw new Error("ליד לא נמצא");
  if (!canSendFirstMessage(lead.source)) {
    throw new Error("שליחת הודעה ראשונה זמינה רק ללידים ממקור ידני או ייבוא Excel");
  }
  const messageName = String(lead.message_name || "").trim();
  if (!messageName) throw new Error("חסר שם לשליחת הודעה");
  const phone = normalizePhone(lead.phone);
  if (!phone) throw new Error("מספר טלפון לא תקין");
  const text = getFirstLeadMessage(messageName);
  await upsertConversation(phone, messageName);
  await markConversationProactive(phone);
  await sendProactiveMessage(phone, messageName, firstLeadTemplateOptions());
  await saveMessage(phone, "bot", text);
  await updateLead(id, { status: "message_sent" });
  return { success: true, phone, message: text };
}

async function sendOpening(phone: string, name: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) throw new Error("מספר טלפון לא תקין");
  if (!shouldSendOpening(normalized)) return { skipped: true };
  const existing = await getMessages(normalized);
  if (existing.length > 0) return { skipped: true };
  const opening = getOpeningMessage(name || "");
  await upsertConversation(normalized, name || "");
  await markConversationProactive(normalized);
  await sendProactiveMessage(normalized, name || "");
  await saveMessage(normalized, "bot", opening);
  return { skipped: false };
}

export async function addManualLead(input: {
  business?: string;
  phone?: string;
  business_type?: string;
  name?: string;
  notes?: string;
}) {
  const businessName = String(input.business || "").trim();
  const phoneNorm = normalizePhone(input.phone);
  if (!businessName) throw new Error("חסר שם עסק");
  if (!phoneNorm) throw new Error("מספר טלפון לא תקין");
  const existing = await getExistingLeadPhones();
  if (existing.has(phoneNorm)) throw new Error("מספר טלפון כבר קיים בטבלה");
  return createLead({
    name: String(input.name || businessName).trim(),
    business: businessName,
    phone: phoneNorm,
    business_type: String(input.business_type || "סלון ציפורניים").trim(),
    notes: input.notes ? String(input.notes).trim() : null,
    source: "manual",
    message_name: extractMessageName(businessName),
  });
}

export async function importLeadFile(buffer: Buffer, businessType: string, sendOpeningFlag: boolean) {
  const { leads, errors } = parseExcelBuffer(buffer, { businessType });
  const existing = await getExistingLeadPhones();
  const toInsert: LeadInsert[] = [];
  let skipped = 0;
  for (const lead of leads) {
    if (existing.has(lead.phone)) {
      skipped += 1;
      continue;
    }
    existing.add(lead.phone);
    toInsert.push(lead);
  }
  const inserted = await bulkInsertLeads(toInsert);
  let openingsSent = 0;
  if (sendOpeningFlag) {
    for (const lead of inserted) {
      try {
        const result = await sendOpening(lead.phone, lead.message_name || lead.name || "");
        if (!result.skipped) openingsSent += 1;
      } catch {
        // keep importing the rest; the summary still reports how many openings went out
      }
    }
  }
  return {
    parsed: leads.length,
    inserted: inserted.length,
    skipped,
    openingsSent,
    parseErrors: errors,
  };
}
