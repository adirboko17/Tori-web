import { requireAdminSession } from "@/lib/admin/guard";
import { writeAdminSession } from "@/lib/admin/session";
import { jsonOk } from "@/lib/sms/http";

export const runtime = "nodejs";

/** Issues a fresh admin credential from one that is still valid. */
export async function POST() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const { session: renewed, token } = await writeAdminSession({
    userId: session.userId,
    phone: session.phone,
    name: session.name,
  });
  return jsonOk({
    ok: true,
    token,
    expiresAt: new Date(renewed.exp).toISOString(),
  });
}
