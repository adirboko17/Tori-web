import { loadMonthlyPriceIls, saveMonthlyPriceIls } from "@/lib/admin/catalog";
import { requireAdminSession } from "@/lib/admin/guard";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";
import { priceSummary } from "@/lib/booking";

export const runtime = "nodejs";

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const monthlyPriceIls = await loadMonthlyPriceIls();
  return jsonOk({ monthlyPriceIls, ...priceSummary(monthlyPriceIls) });
}

export async function PUT(request: Request) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const monthlyPriceIls = Number(body.monthlyPriceIls);
  if (!Number.isFinite(monthlyPriceIls) || monthlyPriceIls <= 0) {
    return jsonError("צריך להזין מחיר חודשי חיובי.");
  }
  try {
    await saveMonthlyPriceIls(monthlyPriceIls);
    return jsonOk({ monthlyPriceIls, ...priceSummary(monthlyPriceIls) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "שמירת המחיר נכשלה.";
    return jsonError(message, 500);
  }
}
