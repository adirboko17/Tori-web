import { addCampaignLead } from "@/lib/whatsapp/actions";
import { jsonError, jsonOk, readJsonBody } from "@/lib/sms/http";

export const runtime = "nodejs";

const PHONE_RE = /^0\d{8,9}$/;

function text(value: unknown, max = 120) {
  return String(value ?? "").trim().slice(0, max);
}

/** Saves a lead from the campaign landing page into the admin leads table. */
export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return jsonError("בקשה לא תקינה.");
  // the hidden "website" field is filled only by bots
  if (text(body.website)) return jsonOk({ ok: true });

  const name = text(body.name, 80);
  const phone = text(body.phone, 30).replace(/[\s-]/g, "");
  const businessType = text(body.businessType, 40);
  if (!name) return jsonError("צריך למלא שם.");
  if (!PHONE_RE.test(phone)) return jsonError("מספר הטלפון לא נראה תקין.");
  if (!businessType) return jsonError("צריך לבחור תחום.");

  const utm = text(body.utm, 300);
  try {
    await addCampaignLead({
      name,
      phone,
      business: text(body.business, 80),
      business_type: businessType,
      notes: utm ? `קמפיין: ${utm}` : null,
    });
  } catch (error) {
    console.error("campaign lead failed", error);
    return jsonError("השליחה נכשלה. נסו שוב בעוד רגע.", 502);
  }
  return jsonOk({ ok: true });
}
