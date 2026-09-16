import { jsonOk } from "@/lib/sms/http";
import { clearSmsSession } from "@/lib/sms/session";

export const runtime = "nodejs";

export async function POST() {
  await clearSmsSession();
  return jsonOk({ ok: true });
}
