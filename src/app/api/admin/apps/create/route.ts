import { CreateBusinessError, createBusiness } from "@/lib/superadmin/create-business";
import { fail, guardAdmin, ok } from "@/lib/superadmin/http";
import { isValidHexColor } from "@/lib/superadmin/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_IMAGE_BASE64_CHARS = 8 * 1024 * 1024;

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asImage(value: unknown, field: string) {
  const text = asString(value).trim();
  if (!text) return undefined;
  if (text.length > MAX_IMAGE_BASE64_CHARS) {
    throw new CreateBusinessError(`הקובץ ${field} גדול מדי (מקסימום ~6MB)`);
  }
  return text;
}

export async function POST(request: Request) {
  const auth = await guardAdmin();
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const primaryColor = asString(body.primaryColor).trim() || "#000000";
    if (!isValidHexColor(primaryColor)) {
      return fail("צבע ראשי לא תקין — נדרש פורמט HEX כמו #1A2B3C");
    }
    const result = await createBusiness({
      businessName: asString(body.businessName),
      clientName: asString(body.clientName),
      adminName: asString(body.adminName),
      adminPhone: asString(body.adminPhone),
      adminPassword: asString(body.adminPassword),
      address: asString(body.address),
      primaryColor,
      logoBase64: asImage(body.logoBase64, "הלוגו"),
      iconBase64: asImage(body.iconBase64, "האייקון"),
      splashBase64: asImage(body.splashBase64, "הספלאש"),
      autoPulseem: body.autoPulseem === true,
      pulseemSubPassword: asString(body.pulseemSubPassword),
      pulseemApiKey: asString(body.pulseemApiKey),
      pulseemFromNumber: asString(body.pulseemFromNumber),
      pulseemWsUserId: asString(body.pulseemWsUserId),
      pulseemWsPassword: asString(body.pulseemWsPassword),
    });
    return ok(result);
  } catch (error) {
    if (error instanceof CreateBusinessError) return fail(error.message);
    const message = error instanceof Error ? error.message : "יצירת האפליקציה נכשלה";
    console.error("[apps/create]", error);
    return fail(message, 500);
  }
}
