import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import { ACCESS_CODE_LOCK_SECONDS, ACCESS_CODE_MAX_FAILURES } from "./access-code";

function asBoolean(value: unknown) {
  return value === true;
}

export async function isAccessCodeLocked(phone: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.rpc("site_admin_login_lock_status", {
    p_phone: phone,
  });
  if (error) throw new Error("access-code lock check failed");
  return asBoolean(data);
}

/** Returns true when this phone is now inside the temporary lock. */
export async function noteAccessCodeFailure(phone: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.rpc("site_admin_note_login_failure", {
    p_phone: phone,
    p_max_failures: ACCESS_CODE_MAX_FAILURES,
    p_lock_seconds: ACCESS_CODE_LOCK_SECONDS,
  });
  if (error) throw new Error("access-code failure record failed");
  return asBoolean(data);
}

export async function clearAccessCodeFailures(phone: string) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.rpc("site_admin_clear_login_failures", {
    p_phone: phone,
  });
  if (error) throw new Error("access-code failure reset failed");
}
