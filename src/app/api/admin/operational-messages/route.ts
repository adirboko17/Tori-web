import { requireAdminSession } from "@/lib/admin/guard";
import {
  createOperationalMessage,
  listOperationalMessages,
  readOperationalMessageInput,
} from "@/lib/admin/operational-messages";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  try {
    const messages = await listOperationalMessages();
    return jsonOk({ messages });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "טעינת ההודעות התפעוליות נכשלה.";
    return jsonError(message, 500);
  }
}

export async function POST(request: Request) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const parsed = readOperationalMessageInput(body);
  if (!parsed.ok) return jsonError(parsed.error);
  try {
    const message = await createOperationalMessage(parsed.value, session.phone);
    return jsonOk({ message });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "שמירת ההודעה נכשלה.";
    return jsonError(message, 500);
  }
}
