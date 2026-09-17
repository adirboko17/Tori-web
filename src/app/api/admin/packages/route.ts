import {
  createSmsPackage,
  loadSmsPackageRows,
} from "@/lib/admin/catalog";
import { requireAdminSession } from "@/lib/admin/guard";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";

function packageKeyFromCredits(credits: number) {
  return `pack_${credits}`;
}

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const packages = await loadSmsPackageRows();
  return jsonOk({ packages });
}

export async function POST(request: Request) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  const smsCredits = Number(body.smsCredits);
  const amountIls = Number(body.amountIls);
  const label = String(body.label ?? "").trim();
  if (!Number.isInteger(smsCredits) || smsCredits <= 0) {
    return jsonError("צריך להזין כמות הודעות חיובית.");
  }
  if (!Number.isFinite(amountIls) || amountIls < 0) {
    return jsonError("צריך להזין מחיר תקין.");
  }
  if (!label) return jsonError("צריך להזין שם לחבילה.");
  try {
    const pack = await createSmsPackage({
      packageKey:
        String(body.packageKey ?? "").trim() || packageKeyFromCredits(smsCredits),
      smsCredits,
      amountIls,
      label,
      featured: Boolean(body.featured),
      sortOrder: Number(body.sortOrder) || undefined,
      isActive: body.isActive !== false,
    });
    return jsonOk({ package: pack });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "יצירת החבילה נכשלה.";
    return jsonError(message, 500);
  }
}
