import { clearAccountSession } from "@/lib/account/session";
import { jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";

export async function POST() {
  await clearAccountSession();
  return jsonOk({ ok: true });
}
