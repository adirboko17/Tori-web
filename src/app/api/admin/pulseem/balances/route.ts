import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import { hasPulseemCredentials } from "@/lib/superadmin/format";
import { fail, guardAdmin, ok, UUID_RE } from "@/lib/superadmin/http";
import { fetchDirectSmsBalance } from "@/lib/superadmin/pulseem-edge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

const MAX_IDS = 50;

export async function POST(request: Request) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json().catch(() => ({}))) as { businessIds?: unknown };
    const requested = Array.isArray(body.businessIds)
      ? body.businessIds.filter((id): id is string => typeof id === "string" && UUID_RE.test(id))
      : [];
    if (requested.length === 0) return ok({ balances: {} });

    const unique = [...new Set(requested)].slice(0, MAX_IDS);
    const db = getServiceSupabase();
    const { data, error } = await db
      .from("business_profile")
      .select("id, display_name, pulseem_user_id, pulseem_has_password, pulseem_has_api_key")
      .in("id", unique);
    if (error) return fail("טעינת העסקים נכשלה", 500);

    const byId = new Map(
      (
        (data ?? []) as Array<{
          id: string;
          display_name: string | null;
          pulseem_user_id: string | null;
          pulseem_has_password: boolean | null;
          pulseem_has_api_key: boolean | null;
        }>
      ).map((row) => [row.id, row]),
    );

    const entries = await Promise.all(
      unique.map(async (id) => {
        const row = byId.get(id);
        if (!row) return [id, { credits: null, message: "העסק לא נמצא" }] as const;
        if (
          !hasPulseemCredentials({
            pulseemHasApiKey: !!row.pulseem_has_api_key,
            pulseem_user_id: row.pulseem_user_id,
            pulseemHasPassword: !!row.pulseem_has_password,
          })
        ) {
          return [id, { credits: null, message: "אין חשבון פולסים" }] as const;
        }
        const result = await fetchDirectSmsBalance(id, row.display_name?.trim() || undefined);
        return result.ok
          ? ([id, { credits: result.directSmsCredits }] as const)
          : ([id, { credits: null, message: result.message }] as const);
      }),
    );

    return ok({ balances: Object.fromEntries(entries) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "טעינת היתרות נכשלה";
    console.error("[pulseem/balances]", error);
    return fail(message, 500);
  }
}
