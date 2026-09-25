import {
  createPrivacyPolicyApp,
  listPrivacyPolicyApps,
} from "@/lib/admin/privacy-apps";
import { requireAdminSession } from "@/lib/admin/guard";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  try {
    const apps = await listPrivacyPolicyApps();
    return jsonOk({ apps });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "טעינת האפליקציות נכשלה.";
    return jsonError(message, 500);
  }
}

export async function POST(request: Request) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  try {
    const app = await createPrivacyPolicyApp(
      String(body.name ?? ""),
      String(body.bundleId ?? body.bundle_id ?? ""),
    );
    return jsonOk({ app });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "הוספת האפליקציה נכשלה.";
    const status = message.includes("כבר מופיע")
      ? 409
      : message.startsWith("צריך להזין")
        ? 400
        : 500;
    return jsonError(message, status);
  }
}
