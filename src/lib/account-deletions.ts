import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import type { AccountDeletionInput } from "./account-deletion-parse";

export type AccountDeletionRequest = {
  id: string;
  fullName: string;
  phone: string;
  appName: string;
  note: string;
  createdAt: string;
};

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function toRequest(row: Record<string, unknown>): AccountDeletionRequest {
  return {
    id: String(row.id ?? ""),
    fullName: String(row.full_name ?? ""),
    phone: String(row.phone ?? ""),
    appName: String(row.app_name ?? ""),
    note: String(row.note ?? ""),
    createdAt: String(row.created_at ?? ""),
  };
}

export async function createAccountDeletionRequest(input: AccountDeletionInput) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("account_deletion_requests")
    .insert({
      full_name: input.fullName,
      phone: input.phone,
      app_name: input.appName,
      note: input.note,
    })
    .select("id")
    .single();
  if (error) throw new Error("שמירת בקשת המחיקה נכשלה.");
  return { id: String(data?.id ?? "") };
}

export async function listAccountDeletionRequests(): Promise<AccountDeletionRequest[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("account_deletion_requests")
    .select("id, full_name, phone, app_name, note, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error("טעינת בקשות המחיקה נכשלה.");
  return (data ?? []).map((row) => toRequest(asRecord(row)));
}

export async function countRecentAccountDeletionRequests(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await getServiceSupabase()
    .from("account_deletion_requests")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  if (error) throw new Error("טעינת בקשות המחיקה נכשלה.");
  return count ?? 0;
}
