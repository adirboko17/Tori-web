import { getServiceSupabase } from "@/lib/sms/supabase-admin";

export type PrivacyPolicyApp = {
  id: string;
  name: string;
  bundle_id: string;
  created_at: string;
};

const BUNDLE_PATTERN = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/;

export const DEVELOPER_ACCOUNT_NAME = "itay ben yair";

export const FALLBACK_PRIVACY_APPS = [
  { id: "amitsenior", name: "Amit senior | עמית סניור", bundle_id: "com.amitsenior.app" },
  { id: "linbitton", name: "Lin Bitton | לין ביטון", bundle_id: "com.linbitton.tori" },
  { id: "shirlvay", name: "Shir Lvay | שיר לביא", bundle_id: "com.shirlvay.app" },
];

export function parsePrivacyAppInput(name: unknown, bundleId: unknown) {
  const cleanName = String(name ?? "")
    .trim()
    .replace(/\s+/g, " ");
  const cleanBundle = String(bundleId ?? "").trim();
  if (!cleanName || cleanName.length > 200) {
    throw new Error("צריך להזין שם לאפליקציה.");
  }
  if (!BUNDLE_PATTERN.test(cleanBundle) || cleanBundle.length > 200) {
    throw new Error("צריך להזין באנדל תקין, למשל com.example.app.");
  }
  return { name: cleanName, bundleId: cleanBundle };
}

function throwIfDbError(
  error: { code?: string; message?: string } | null,
  fallback: string,
) {
  if (!error) return;
  if (error.code === "23505") {
    throw new Error("הבאנדל הזה כבר מופיע במדיניות.");
  }
  throw new Error(fallback);
}

export async function listPrivacyPolicyApps(): Promise<PrivacyPolicyApp[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("privacy_policy_apps")
    .select("id, name, bundle_id, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error("טעינת האפליקציות נכשלה.");
  return (data ?? []) as PrivacyPolicyApp[];
}

export async function createPrivacyPolicyApp(name: string, bundleId: string) {
  const input = parsePrivacyAppInput(name, bundleId);
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("privacy_policy_apps")
    .insert({ name: input.name, bundle_id: input.bundleId })
    .select("id, name, bundle_id, created_at")
    .single();
  throwIfDbError(error, "הוספת האפליקציה נכשלה.");
  return data as PrivacyPolicyApp;
}

export async function updatePrivacyPolicyApp(
  id: string,
  name: string,
  bundleId: string,
) {
  const input = parsePrivacyAppInput(name, bundleId);
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("privacy_policy_apps")
    .update({ name: input.name, bundle_id: input.bundleId })
    .eq("id", id)
    .select("id, name, bundle_id, created_at")
    .maybeSingle();
  throwIfDbError(error, "עדכון האפליקציה נכשל.");
  if (!data) throw new Error("האפליקציה לא נמצאה.");
  return data as PrivacyPolicyApp;
}

export async function deletePrivacyPolicyApp(id: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("privacy_policy_apps")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error("מחיקת האפליקציה נכשלה.");
  if (!data) throw new Error("האפליקציה לא נמצאה.");
}
