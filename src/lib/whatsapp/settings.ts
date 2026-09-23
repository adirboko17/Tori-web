import fs from "node:fs";
import path from "node:path";
import { getWhatsappSupabase } from "@/lib/whatsapp/client";

const SETTINGS_PATH = path.join(process.cwd(), "data", "whatsapp-app-settings.json");

function missingTable(err: { code?: string; message?: string } | null) {
  const code = String(err?.code || "");
  const msg = String(err?.message || "");
  return (
    code === "PGRST205" ||
    (msg.includes("wa_app_settings") &&
      (msg.includes("does not exist") ||
        msg.includes("schema cache") ||
        msg.includes("Could not find the table")))
  );
}

function readFileSettings(): Record<string, unknown> {
  try {
    const parsed = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8")) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function writeFileSettings(all: Record<string, unknown>) {
  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(all, null, 2), "utf8");
}

export async function getAppSetting(key: string, defaultValue: unknown = null) {
  try {
    const db = getWhatsappSupabase();
    const { data, error } = await db.from("wa_app_settings").select("value").eq("key", key).maybeSingle();
    if (error) throw error;
    if (data) return data.value;
  } catch (err) {
    if (!missingTable(err as { code?: string; message?: string })) {
      const file = readFileSettings();
      if (Object.prototype.hasOwnProperty.call(file, key)) return file[key];
      throw err;
    }
  }
  const file = readFileSettings();
  if (Object.prototype.hasOwnProperty.call(file, key)) return file[key];
  return defaultValue;
}

export async function setAppSetting(key: string, value: unknown) {
  const file = readFileSettings();
  file[key] = value;
  writeFileSettings(file);
  try {
    const db = getWhatsappSupabase();
    const { error } = await db.from("wa_app_settings").upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    if (error) throw error;
  } catch (err) {
    if (missingTable(err as { code?: string; message?: string })) return;
    throw err;
  }
}

export function israelSlotKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const hour = pick("hour").padStart(2, "0");
  return `${pick("year")}-${pick("month")}-${pick("day")}T${hour}`;
}
