import { after } from "next/server";
import { LOW_SMS_BALANCE } from "@/app/admin/_ui/format";
import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import { hasPulseemCredentials } from "@/lib/superadmin/format";
import { INCLUDED_SMS } from "@/lib/superadmin/pulseem-plans";
import { getWhatsappSupabase } from "@/lib/whatsapp/client";
import {
  fetchDirectSmsBalance,
  fetchMainPulseemBalance,
} from "@/lib/superadmin/pulseem-edge";
import { countOpenCancellations } from "./cancellations";
import {
  adminPushEvents,
  chunk,
  normalizePreferences,
  wantsPush,
  type AdminPushEvent,
  type AdminPushPreferences,
  type PushTokenInput,
} from "./push-shared";

export * from "./push-shared";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_BATCH = 100;

type TokenRow = {
  id: string;
  admin_phone_id: string;
  expo_token: string;
};

type ExpoTicket = {
  status?: "ok" | "error";
  message?: string;
  details?: { error?: string };
};

async function countWaitingChats() {
  const { count, error } = await getWhatsappSupabase()
    .from("wa_conversations")
    .select("phone", { count: "exact", head: true })
    .eq("status", "human");
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function loadBadgeCounts() {
  const [openRequests, waitingChats] = await Promise.all([
    countOpenCancellations().catch(() => 0),
    countWaitingChats().catch(() => 0),
  ]);
  return { openRequests, waitingChats, total: openRequests + waitingChats };
}

export async function savePushToken(adminId: string, input: PushTokenInput) {
  const db = getServiceSupabase();
  await db
    .from("admin_push_tokens")
    .delete()
    .eq("admin_phone_id", adminId)
    .eq("device_id", input.deviceId)
    .neq("expo_token", input.token);
  const { error } = await db.from("admin_push_tokens").upsert(
    {
      admin_phone_id: adminId,
      expo_token: input.token,
      platform: input.platform,
      device_id: input.deviceId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "expo_token" },
  );
  if (error) {
    console.error("[push] save token failed", error);
    throw new Error("שמירת מכשיר ההתראות נכשלה.");
  }
}

export async function deletePushToken(
  adminId: string,
  input: { token?: string; deviceId?: string },
) {
  if (!input.token && !input.deviceId) return;
  let query = getServiceSupabase()
    .from("admin_push_tokens")
    .delete()
    .eq("admin_phone_id", adminId);
  query = input.token
    ? query.eq("expo_token", input.token)
    : query.eq("device_id", String(input.deviceId));
  const { error } = await query;
  if (error) {
    console.error("[push] delete token failed", error);
    throw new Error("הסרת מכשיר ההתראות נכשלה.");
  }
}

export async function loadPushPreferences(adminId: string) {
  const { data, error } = await getServiceSupabase()
    .from("admin_push_preferences")
    .select("enabled, types")
    .eq("admin_phone_id", adminId)
    .maybeSingle();
  if (error) {
    console.error("[push] load preferences failed", error);
    throw new Error("טעינת הגדרות ההתראות נכשלה.");
  }
  return normalizePreferences(data);
}

export async function savePushPreferences(
  adminId: string,
  prefs: AdminPushPreferences,
) {
  const { error } = await getServiceSupabase()
    .from("admin_push_preferences")
    .upsert(
      {
        admin_phone_id: adminId,
        enabled: prefs.enabled,
        types: prefs.types,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "admin_phone_id" },
    );
  if (error) {
    console.error("[push] save preferences failed", error);
    throw new Error("שמירת הגדרות ההתראות נכשלה.");
  }
  return prefs;
}

async function claimEvent(event: AdminPushEvent) {
  const { data, error } = await getServiceSupabase()
    .from("admin_push_events")
    .upsert(
      {
        event_key: event.key,
        type: event.type,
        payload: { title: event.title, body: event.body, url: event.url },
      },
      { onConflict: "event_key", ignoreDuplicates: true },
    )
    .select("event_key");
  if (error) {
    console.error("[push] claim event failed", error);
    return false;
  }
  return (data ?? []).length > 0;
}

async function loadRecipients(event: AdminPushEvent) {
  const db = getServiceSupabase();
  const { data: tokens, error } = await db
    .from("admin_push_tokens")
    .select("id, admin_phone_id, expo_token");
  if (error) {
    console.error("[push] load tokens failed", error);
    return [];
  }
  const rows = (tokens ?? []) as TokenRow[];
  if (rows.length === 0) return [];
  const adminIds = [...new Set(rows.map((row) => row.admin_phone_id))];
  const { data: prefRows } = await db
    .from("admin_push_preferences")
    .select("admin_phone_id, enabled, types")
    .in("admin_phone_id", adminIds);
  const prefs = new Map(
    (prefRows ?? []).map((row) => [
      String(row.admin_phone_id),
      normalizePreferences(row),
    ]),
  );
  return rows.filter((row) =>
    wantsPush(prefs.get(row.admin_phone_id) ?? normalizePreferences(null), event.type),
  );
}

async function sendExpoBatch(messages: Record<string, unknown>[]) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const accessToken = process.env.EXPO_ACCESS_TOKEN?.trim();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(messages),
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await response.json().catch(() => ({}))) as { data?: ExpoTicket[] };
  if (!response.ok) {
    console.error("[push] expo send failed", response.status, json);
    return [];
  }
  return Array.isArray(json.data) ? json.data : [];
}

/**
 * Delivers one event to every registered admin device that wants it.
 * Never throws: a push failure must not fail the business operation behind it.
 */
export async function sendAdminPush(event: AdminPushEvent) {
  try {
    if (!(await claimEvent(event))) return { sent: 0, skipped: true };
    const recipients = await loadRecipients(event);
    if (recipients.length === 0) return { sent: 0, skipped: false };
    const badge = (await loadBadgeCounts()).total;
    const dead: string[] = [];
    let sent = 0;
    for (const group of chunk(recipients, EXPO_BATCH)) {
      const tickets = await sendExpoBatch(
        group.map((row) => ({
          to: row.expo_token,
          title: event.title,
          body: event.body,
          sound: "default",
          badge,
          priority: "high",
          channelId: "default",
          data: { type: event.type, url: event.url },
        })),
      );
      tickets.forEach((ticket, index) => {
        if (ticket.status === "ok") sent += 1;
        if (ticket.details?.error === "DeviceNotRegistered" && group[index]) {
          dead.push(group[index].id);
        }
      });
    }
    const db = getServiceSupabase();
    if (dead.length > 0) {
      await db.from("admin_push_tokens").delete().in("id", dead);
    }
    await db
      .from("admin_push_events")
      .update({ recipients: sent })
      .eq("event_key", event.key);
    return { sent, skipped: false };
  } catch (error) {
    console.error("[push] send failed", event.type, error);
    return { sent: 0, skipped: false };
  }
}

/** Test message to the calling admin's own devices; bypasses preferences and dedupe. */
export async function sendTestPush(adminId: string) {
  const { data, error } = await getServiceSupabase()
    .from("admin_push_tokens")
    .select("id, admin_phone_id, expo_token")
    .eq("admin_phone_id", adminId);
  if (error) throw new Error("טעינת המכשירים נכשלה.");
  const rows = (data ?? []) as TokenRow[];
  if (rows.length === 0) return { devices: 0, sent: 0 };
  const badge = (await loadBadgeCounts()).total;
  const tickets = await sendExpoBatch(
    rows.map((row) => ({
      to: row.expo_token,
      title: "התראת בדיקה",
      body: "ההתראות מחוברות ופועלות.",
      sound: "default",
      badge,
      priority: "high",
      channelId: "default",
      data: { type: "test", url: "/settings/notifications" },
    })),
  );
  return {
    devices: rows.length,
    sent: tickets.filter((ticket) => ticket.status === "ok").length,
  };
}

/** Runs the push after the response is sent, so callers never wait on Expo. */
export function queueAdminPush(event: AdminPushEvent | null | undefined) {
  if (!event) return;
  runAfterResponse(event.type, () => sendAdminPush(event));
}

function runAfterResponse(label: string, task: () => Promise<unknown>) {
  const run = async () => {
    try {
      await task();
    } catch (error) {
      console.error(`[push] ${label} failed`, error);
    }
  };
  try {
    after(run);
  } catch {
    void run();
  }
}

async function loadBusinessName(businessId: string) {
  const { data } = await getServiceSupabase()
    .from("business_profile")
    .select("display_name")
    .eq("id", businessId)
    .maybeSingle();
  return String(data?.display_name ?? "").trim() || "עסק";
}

export function queueOrderPush(
  orderId: string,
  outcome: "paid" | "failed",
  reason?: string,
) {
  runAfterResponse(`order ${outcome}`, async () => {
    const { data: order } = await getServiceSupabase()
      .from("sms_topup_orders")
      .select("id, business_id, sms_credits, amount_ils, error_message")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) return;
    const businessId = String(order.business_id);
    const businessName = await loadBusinessName(businessId);
    await sendAdminPush(
      outcome === "paid"
        ? adminPushEvents.purchasePaid({
            orderId,
            businessId,
            businessName,
            smsCredits: Number(order.sms_credits) || 0,
            amountIls: Number(order.amount_ils) || 0,
          })
        : adminPushEvents.purchaseFailed({
            orderId,
            businessId,
            businessName,
            reason: reason || String(order.error_message ?? ""),
          }),
    );
  });
}

export function queueLowBusinessBalances(
  entries: { businessId: string; businessName: string; credits: unknown }[],
) {
  for (const entry of entries) {
    const credits = Number(entry.credits);
    if (entry.credits == null || !Number.isFinite(credits)) continue;
    if (credits >= LOW_SMS_BALANCE) continue;
    queueAdminPush(
      adminPushEvents.smsLow({
        businessId: entry.businessId,
        businessName: entry.businessName,
        credits,
      }),
    );
  }
}

async function loadPulseemBusinesses() {
  const { data, error } = await getServiceSupabase()
    .from("business_profile")
    .select("id, display_name, pulseem_user_id, pulseem_has_password, pulseem_has_api_key");
  if (error) throw new Error(error.message);
  return (data ?? []).filter((row) =>
    hasPulseemCredentials({
      pulseemHasApiKey: !!row.pulseem_has_api_key,
      pulseem_user_id: row.pulseem_user_id,
      pulseemHasPassword: !!row.pulseem_has_password,
    }),
  ) as { id: string; display_name: string | null }[];
}

export function queueMainBalanceCheck(mainCredits: number, pulseemBusinesses?: number) {
  runAfterResponse("main balance", async () => {
    const businesses = pulseemBusinesses ?? (await loadPulseemBusinesses()).length;
    const required = businesses * INCLUDED_SMS;
    if (mainCredits >= required) return;
    await sendAdminPush(adminPushEvents.mainLow({ credits: mainCredits, required }));
  });
}

/** Full sweep used by the scheduled DB job: main account plus every connected business. */
export async function runBalanceSweep() {
  const businesses = await loadPulseemBusinesses();
  const main = await fetchMainPulseemBalance();
  if (main.ok) queueMainBalanceCheck(main.smsCredits, businesses.length);
  const results: { businessId: string; businessName: string; credits: unknown }[] = [];
  for (const group of chunk(businesses, 5)) {
    const balances = await Promise.all(
      group.map(async (row) => {
        const name = row.display_name?.trim() || undefined;
        const result = await fetchDirectSmsBalance(row.id, name);
        return {
          businessId: row.id,
          businessName: name || "עסק",
          credits: result.ok ? result.directSmsCredits : null,
        };
      }),
    );
    results.push(...balances);
  }
  queueLowBusinessBalances(results);
  return { businesses: businesses.length, main: main.ok ? main.smsCredits : null };
}
