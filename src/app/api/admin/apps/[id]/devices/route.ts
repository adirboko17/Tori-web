import { disconnectAllUserDevices, listBusinessDevices, revokeUserDevice } from "@/lib/admin/user-devices";
import { fail, guardAdmin, ok, UUID_RE } from "@/lib/superadmin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return fail("מזהה עסק לא תקין");

  try {
    const devices = await listBusinessDevices(id);
    return ok({ devices });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "טעינת המכשירים נכשלה", 500);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return fail("מזהה עסק לא תקין");

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const deviceId = str(body.deviceId);
  const userId = str(body.userId);
  if (deviceId && userId) return fail("יש לבחור פעולה אחת");
  if (!deviceId && !userId) return fail("חסר מזהה");

  try {
    if (deviceId) {
      if (!UUID_RE.test(deviceId)) return fail("מזהה מכשיר לא תקין");
      const revoked = await revokeUserDevice(id, deviceId);
      if (!revoked) return fail("המכשיר לא נמצא", 404);
      return ok({ revoked: true });
    }

    if (!UUID_RE.test(userId)) return fail("מזהה משתמש לא תקין");
    const disconnected = await disconnectAllUserDevices(id, userId);
    if (!disconnected) return fail("המשתמש לא נמצא", 404);
    return ok({ disconnected: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "הניתוק נכשל", 500);
  }
}
