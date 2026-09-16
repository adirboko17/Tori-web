import { jsonError, jsonOk } from "@/lib/sms/http";
import { readSmsSession } from "@/lib/sms/session";
import { shopPayload } from "@/lib/sms/shop";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSmsSession();
  if (!session) {
    return jsonOk({ user: null });
  }
  try {
    return jsonOk(await shopPayload(session));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "טעינת היתרה נכשלה.";
    return jsonError(message, 500);
  }
}
