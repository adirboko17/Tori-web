import { createHmac, timingSafeEqual } from "node:crypto";

export type FacebookLeadContext = {
  adId?: string;
  adName?: string;
  formId?: string;
  campaignId?: string;
  campaignName?: string;
};

export type FacebookLeadChange = {
  leadgenId: string;
  formId: string;
  adId: string;
  pageId: string;
};

export type MappedFacebookLead = {
  name: string;
  phone: string;
  business: string;
  businessType: string;
  notes: string;
};

const NAME_KEYS = ["full_name", "name", "שם", "שם_מלא", "שםמלא"];
const FIRST_NAME_KEYS = ["first_name", "שם_פרטי"];
const LAST_NAME_KEYS = ["last_name", "שם_משפחה"];
const PHONE_KEYS = ["phone_number", "phone", "mobile_phone", "טלפון", "מספר_טלפון", "נייד"];
const BUSINESS_KEYS = ["company_name", "business_name", "שם_העסק", "שם_עסק", "עסק"];
const TYPE_KEYS = ["business_type", "תחום", "תחום_העסק", "סוג_עסק"];

function text(value: unknown, max: number) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/ {2,}/g, " ")
    .trim()
    .slice(0, max);
}

export function tokensMatch(expected: string, received: string) {
  const left = Buffer.from(expected);
  const right = Buffer.from(received);
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function facebookSignatureMatches(appSecret: string, rawBody: string, header: string | null) {
  const received = String(header ?? "").trim();
  if (!appSecret || !received) return false;
  const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  return tokensMatch(expected, received);
}

function fieldKey(name: unknown) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function fieldMap(fieldData: unknown) {
  const map = new Map<string, string>();
  if (!Array.isArray(fieldData)) return map;
  for (const field of fieldData) {
    if (!field || typeof field !== "object") continue;
    const key = fieldKey((field as { name?: unknown }).name);
    const values = (field as { values?: unknown }).values;
    const value = (Array.isArray(values) ? values : [])
      .map((item) => String(item ?? "").trim())
      .filter(Boolean)
      .join(", ");
    if (key && value) map.set(key, value);
  }
  return map;
}

function take(map: Map<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = map.get(key);
    if (value) {
      map.delete(key);
      return value;
    }
  }
  return "";
}

function takeIncludes(map: Map<string, string>, parts: string[]) {
  for (const [key, value] of map) {
    // A full question can mention the word without being the business name.
    if (key.length > 24) continue;
    if (parts.some((part) => key.includes(part))) {
      map.delete(key);
      return value;
    }
  }
  return "";
}

function labeled(label: string, name?: string, id?: string) {
  const value = [name, id].map((item) => text(item, 80)).filter(Boolean).join(" ");
  return value ? `${label}: ${value}` : "";
}

export function leadgenChanges(body: unknown): FacebookLeadChange[] {
  if (!body || typeof body !== "object") return [];
  const entries = (body as { entry?: unknown }).entry;
  if (!Array.isArray(entries)) return [];
  const found: FacebookLeadChange[] = [];
  for (const entry of entries) {
    const changes = entry && typeof entry === "object" ? (entry as { changes?: unknown }).changes : null;
    if (!Array.isArray(changes)) continue;
    for (const change of changes) {
      if (!change || typeof change !== "object") continue;
      const row = change as { field?: unknown; value?: { leadgen_id?: unknown; form_id?: unknown; ad_id?: unknown; page_id?: unknown } };
      if (row.field !== "leadgen") continue;
      const leadgenId = text(row.value?.leadgen_id, 40);
      if (!leadgenId) continue;
      found.push({
        leadgenId,
        formId: text(row.value?.form_id, 40),
        adId: text(row.value?.ad_id, 40),
        pageId: text(row.value?.page_id, 40),
      });
    }
  }
  return found;
}

/** Turns a Facebook instant-form answer list into the fields stored on a lead. */
export function mapFacebookLead(fieldData: unknown, context: FacebookLeadContext = {}): MappedFacebookLead {
  const map = fieldMap(fieldData);
  const phone = take(map, PHONE_KEYS) || takeIncludes(map, ["phone", "טלפון", "נייד"]);
  const businessType = take(map, TYPE_KEYS) || takeIncludes(map, ["תחום"]) || "אחר";
  const business = take(map, BUSINESS_KEYS) || takeIncludes(map, ["company", "business", "עסק"]);
  const explicitName = take(map, NAME_KEYS);
  const first = take(map, FIRST_NAME_KEYS);
  const last = take(map, LAST_NAME_KEYS);
  const name = explicitName || [first, last].filter(Boolean).join(" ") || takeIncludes(map, ["שם", "name"]) || "ליד מפייסבוק";
  const lines = [
    "פייסבוק",
    labeled("קמפיין", context.campaignName, context.campaignId),
    labeled("מודעה", context.adName, context.adId),
    labeled("טופס", "", context.formId),
    ...[...map].map(([key, value]) => `${text(key, 160)}: ${text(value, 200)}`),
  ].filter(Boolean);
  return {
    name: text(name, 80),
    phone: text(phone, 30),
    business: text(business, 80),
    businessType: text(businessType, 40),
    notes: lines.join("\n").slice(0, 800),
  };
}
