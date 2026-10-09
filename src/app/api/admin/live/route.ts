import { requireAdminSession } from "@/lib/admin/guard";
import { loadLiveSnapshot } from "@/lib/live/store";
import { jsonError, jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  try {
    return jsonOk(await loadLiveSnapshot());
  } catch (error) {
    console.error("live snapshot failed", error);
    return jsonError("לא ניתן לטעון את נתוני הלייב.", 503);
  }
}
