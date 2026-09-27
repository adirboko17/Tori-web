import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;
let cachedUrl = "";
let cachedKey = "";

export function getWhatsappSupabase() {
  const url = (process.env.WHATSAPP_SUPABASE_URL || process.env.SUPABASE_URL)?.trim();
  const key = (process.env.WHATSAPP_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !key) {
    throw new Error("חסר חיבור למסד של וואטסאפ.");
  }
  if (!cached || cachedUrl !== url || cachedKey !== key) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    cachedUrl = url;
    cachedKey = key;
  }
  return cached;
}

export function dbErrorMessage(err: unknown) {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "הפעולה נכשלה";
}
