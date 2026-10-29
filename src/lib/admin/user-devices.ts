import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import {
  DEVICE_LIST_SELECT,
  nextSessionVersion,
  toAdminDevice,
  type AdminDevice,
  type DeviceRow,
} from "./user-device-view.ts";

export { DEVICE_LIST_SELECT, nextSessionVersion, toAdminDevice };
export type { AdminDevice, DeviceRow };

export async function listBusinessDevices(businessId: string): Promise<AdminDevice[]> {
  const { data, error } = await getServiceSupabase()
    .from("user_devices")
    .select(DEVICE_LIST_SELECT)
    .eq("business_id", businessId)
    .order("last_seen_at", { ascending: false });
  if (error) {
    console.error("[user-devices] list", error.message);
    throw new Error("טעינת המכשירים נכשלה");
  }
  return ((data ?? []) as DeviceRow[]).map(toAdminDevice);
}

export async function revokeUserDevice(businessId: string, deviceId: string): Promise<boolean> {
  const { data, error } = await getServiceSupabase()
    .from("user_devices")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", deviceId)
    .eq("business_id", businessId)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("[user-devices] revoke", error.message);
    throw new Error("ניתוק המכשיר נכשל");
  }
  return Boolean(data);
}

const BUMP_ATTEMPTS = 4;

/**
 * Invalidates every app session for one user in one business.
 * Compares the current version before writing, so a concurrent password change
 * cannot be overwritten with an older number.
 */
export async function disconnectAllUserDevices(businessId: string, userId: string): Promise<boolean> {
  const db = getServiceSupabase();
  for (let attempt = 0; attempt < BUMP_ATTEMPTS; attempt += 1) {
    const { data, error } = await db
      .from("users")
      .select("session_version")
      .eq("id", userId)
      .eq("business_id", businessId)
      .maybeSingle();
    if (error) {
      console.error("[user-devices] session read", error.message);
      throw new Error("ניתוק המכשירים נכשל");
    }
    if (!data) return false;

    const current = Number(data.session_version);
    const next = nextSessionVersion(current);
    const { data: updated, error: updateError } = await db
      .from("users")
      .update({ session_version: next })
      .eq("id", userId)
      .eq("business_id", businessId)
      .eq("session_version", current)
      .select("session_version")
      .maybeSingle();
    if (updateError) {
      console.error("[user-devices] session bump", updateError.message);
      throw new Error("ניתוק המכשירים נכשל");
    }
    if (updated && Number(updated.session_version) >= next) return true;
  }
  throw new Error("ניתוק המכשירים נכשל");
}
