import * as XLSX from "xlsx";
import { extractMessageName } from "@/lib/whatsapp/message-name";
import { normalizePhone } from "@/lib/whatsapp/phone";
import type { LeadInsert } from "@/lib/whatsapp/db";

function pickField(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const val = row[key];
    if (val != null && String(val).trim() !== "") return String(val).trim();
  }
  return "";
}

function buildNotes(row: Record<string, unknown>) {
  const parts: string[] = [];
  const city = pickField(row, ["City", "city", "עיר"]);
  const address = pickField(row, ["Address", "address", "כתובת"]);
  const rating = pickField(row, ["Rating", "rating", "דירוג"]);
  const reviews = pickField(row, ["Reviews", "reviews", "ביקורות"]);
  const instagram = pickField(row, ["Instagram", "instagram", "אינסטגרם"]);
  if (city) parts.push(`עיר: ${city}`);
  if (address) parts.push(`כתובת: ${address}`);
  if (rating) parts.push(`דירוג: ${rating}`);
  if (reviews) parts.push(`ביקורות: ${reviews}`);
  if (instagram && instagram !== "—" && instagram !== "-") parts.push(`אינסטגרם: ${instagram}`);
  return parts.join(" | ");
}

export function parseExcelBuffer(buffer: Buffer, options: { businessType?: string; source?: string } = {}) {
  const businessType = options.businessType || "סלון ציפורניים";
  const source = options.source || "excel-import";
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const leads: LeadInsert[] = [];
  const errors: { sheet: string; row: number; error: string }[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const rowNum = i + 2;
      const business = pickField(row, ["Name", "name", "שם", "Business", "business", "שם העסק"]);
      const phoneRaw = pickField(row, ["Phone", "phone", "טלפון", "Mobile", "mobile"]);
      const phone = normalizePhone(phoneRaw);
      if (!business && !phoneRaw) continue;
      if (!business) {
        errors.push({ sheet: sheetName, row: rowNum, error: "חסר שם עסק" });
        continue;
      }
      if (!phone) {
        errors.push({
          sheet: sheetName,
          row: rowNum,
          error: `מספר טלפון לא תקין: ${phoneRaw || "(ריק)"}`,
        });
        continue;
      }
      leads.push({
        name: business,
        business,
        phone,
        business_type: businessType,
        notes: buildNotes(row) || null,
        source,
        message_name: extractMessageName(business),
      });
    }
  }

  return { leads, errors };
}
