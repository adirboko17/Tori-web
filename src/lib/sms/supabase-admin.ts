import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  CONFIG_ERRORS,
  getServiceRoleKey,
  getSupabaseUrl,
  smsBackendConfigured,
} from "./env";

let cached: SupabaseClient | null = null;

export function getServiceSupabase() {
  if (!smsBackendConfigured()) {
    throw new Error(CONFIG_ERRORS.backend);
  }
  if (cached) return cached;
  cached = createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export async function invokeEdgeFunction<T = Record<string, unknown>>(
  name: string,
  body: unknown,
): Promise<{ ok: boolean; status: number; data: T }> {
  const url = `${getSupabaseUrl()}/functions/v1/${name}`;
  const key = getServiceRoleKey();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T;
  return { ok: response.ok, status: response.status, data };
}
