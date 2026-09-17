import { requireAdminSession } from "@/lib/admin/guard";
import { jsonError } from "@/lib/sms/http";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, _context: RouteContext) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  return jsonError(
    "פולסים מאפשר רק טעינה מהחשבון הראשי ללקוח. החזרה או העברה בין לקוחות מושבתת כי היא מוחקת הודעות אצל הלקוח בלי לזכות את החשבון הראשי.",
  );
}
