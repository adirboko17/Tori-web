import { createHash, timingSafeEqual } from "node:crypto";
import { after } from "next/server";
import {
  adminPushEvents,
  runBalanceSweep,
  sendAdminPush,
} from "@/lib/admin/push";
import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const PHONE_RE = /^\d{8,15}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function secretMatches(provided: string | null) {
  const expected = process.env.ADMIN_PUSH_WEBHOOK_SECRET?.trim();
  if (!expected || expected.length < 24 || !provided) return false;
  return timingSafeEqual(digest(provided.trim()), digest(expected));
}

function record(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

async function handleNewClient(row: Record<string, unknown>) {
  const userId = String(row.id ?? "");
  const businessId = String(row.business_id ?? "");
  if (!UUID_RE.test(userId) || !UUID_RE.test(businessId)) return;
  const { data } = await getServiceSupabase()
    .from("business_profile")
    .select("display_name")
    .eq("id", businessId)
    .maybeSingle();
  await sendAdminPush(
    adminPushEvents.newClient({
      userId,
      clientName: String(row.name ?? "").trim(),
      businessId,
      businessName: String(data?.display_name ?? "").trim() || "עסק",
    }),
  );
}

async function handleWhatsappHuman(row: Record<string, unknown>, at: unknown) {
  const phone = String(row.phone ?? "");
  if (!PHONE_RE.test(phone)) return;
  await sendAdminPush(
    adminPushEvents.whatsappHuman({
      phone,
      name: String(row.name ?? "").trim(),
      at: String(at ?? new Date().toISOString()),
    }),
  );
}

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get("x-tori-webhook-secret"))) {
    return jsonError("unauthorized", 401);
  }
  const body = await readJsonBody(request);
  if (!body) return jsonError("invalid body");
  const type = body.type;
  const row = record(body.record);

  const task =
    type === "new_client"
      ? () => handleNewClient(row)
      : type === "whatsapp_human"
        ? () => handleWhatsappHuman(row, body.at)
        : type === "balance_check"
          ? () => runBalanceSweep()
          : null;
  if (!task) return jsonError("unknown event");

  after(async () => {
    try {
      await task();
    } catch (error) {
      console.error("[push/db-event]", type, error);
    }
  });
  return jsonOk({ ok: true });
}
