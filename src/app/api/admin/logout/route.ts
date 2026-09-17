import { clearAdminSession } from "@/lib/admin/session";
import { jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";

export async function POST() {
  await clearAdminSession();
  return jsonOk({ ok: true });
}
