import { getServiceRoleKey, getSupabaseUrl } from "@/lib/sms/env";

function trim(value: string | undefined) {
  return (value ?? "").replace(/^\uFEFF/, "").trim();
}

export function supabaseUrl(): string {
  const url = getSupabaseUrl().replace(/\/$/, "");
  if (!url) {
    throw new Error("חסר NEXT_PUBLIC_SUPABASE_URL או SUPABASE_URL");
  }
  return url;
}

/** Legacy anon JWT used inside white-label `.env` files. Publishable key is the fallback. */
export function supabaseAnonKey(): string {
  return (
    trim(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    trim(process.env.SUPABASE_ANON_KEY) ||
    trim(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );
}

export function supabaseServiceRoleKey(): string {
  const key = getServiceRoleKey();
  if (!key) throw new Error("חסר SUPABASE_SERVICE_ROLE_KEY");
  return key;
}
