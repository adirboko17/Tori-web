import { randomUUID } from "node:crypto";
import { DESIGN_BUCKET, uploadSpec } from "@/lib/account/design";
import { clearAccountSession, readAccountSession } from "@/lib/account/session";
import { loadPortal } from "@/lib/account/store";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";
import { getServiceSupabase } from "@/lib/sms/supabase-admin";
import { supabaseAnonKey } from "@/lib/superadmin/env";

export const runtime = "nodejs";

/**
 * Hands the browser a one-time upload URL, so logos, photos and videos go
 * straight to Storage instead of through this server's request size limit.
 */
export async function POST(request: Request) {
  const session = await readAccountSession();
  if (!session) return jsonError("צריך להתחבר מחדש.", 401);

  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const spec = uploadSpec(body.kind, body.contentType, body.size);
  if (!spec.ok) return jsonError(spec.error);

  try {
    const portal = await loadPortal(session.accountId, session.userId);
    if (!portal || portal.businessId !== session.businessId) {
      await clearAccountSession();
      return jsonError("צריך להתחבר מחדש.", 401);
    }

    const path = `${spec.folder}/${Date.now()}_${randomUUID().replace(/-/g, "").slice(0, 16)}.${spec.ext}`;
    const bucket = getServiceSupabase().storage.from(DESIGN_BUCKET);
    const { data, error } = await bucket.createSignedUploadUrl(path);
    if (error || !data) {
      console.error("design upload url failed", error?.message);
      return jsonError("לא הצלחנו להכין את ההעלאה. נסו שוב.", 500);
    }
    const publicUrl = bucket.getPublicUrl(path).data.publicUrl;
    return jsonOk({ uploadUrl: data.signedUrl, publicUrl, apikey: supabaseAnonKey() || undefined });
  } catch (error) {
    console.error("design upload url failed", error);
    return jsonError("לא הצלחנו להכין את ההעלאה. נסו שוב.", 500);
  }
}
