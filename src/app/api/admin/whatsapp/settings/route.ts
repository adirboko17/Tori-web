import { fail, guardAdmin, ok } from "@/lib/superadmin/http";
import { dbErrorMessage } from "@/lib/whatsapp/client";
import { getAppSetting, israelSlotKey, setAppSetting } from "@/lib/whatsapp/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  try {
    const enabled = await getAppSetting("hourly_no_contact_enabled", false);
    return ok({ enabled: Boolean(enabled) });
  } catch (err) {
    return fail(dbErrorMessage(err), 500);
  }
}

export async function PATCH(request: Request) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => ({}))) as { enabled?: unknown };
  if (typeof body.enabled !== "boolean") return fail("חסר enabled (boolean)");
  try {
    await setAppSetting("hourly_no_contact_enabled", body.enabled);
    await setAppSetting(
      "hourly_no_contact_last_slot",
      body.enabled ? israelSlotKey() : null,
    );
    return ok({ enabled: body.enabled });
  } catch (err) {
    return fail(dbErrorMessage(err), 500);
  }
}
