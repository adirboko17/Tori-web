import { addCampaignLead } from "@/lib/whatsapp/actions";
import {
  facebookSignatureMatches,
  leadgenChanges,
  mapFacebookLead,
  tokensMatch,
  type FacebookLeadChange,
  type FacebookLeadContext,
} from "@/lib/facebook/leadgen";

export const runtime = "nodejs";

function env(name: string) {
  return process.env[name]?.trim() || "";
}

/** Meta calls this once, when the webhook is saved, and expects the challenge back. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token") || "";
  const challenge = url.searchParams.get("hub.challenge") || "";
  const expected = env("FACEBOOK_WEBHOOK_VERIFY_TOKEN");
  if (mode === "subscribe" && challenge && tokensMatch(expected, token)) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new Response("Forbidden", { status: 403 });
}

async function fetchLead(leadgenId: string, token: string) {
  const url = new URL(`https://graph.facebook.com/v21.0/${encodeURIComponent(leadgenId)}`);
  url.searchParams.set("access_token", token);
  url.searchParams.set("fields", "field_data,ad_id,ad_name,form_id,campaign_id,campaign_name");
  const response = await fetch(url);
  const data = (await response.json().catch(() => ({}))) as {
    error?: { message?: string };
    field_data?: unknown;
    ad_id?: string;
    ad_name?: string;
    form_id?: string;
    campaign_id?: string;
    campaign_name?: string;
  };
  if (!response.ok) {
    throw new Error(data.error?.message || "קריאת הליד מפייסבוק נכשלה");
  }
  return data;
}

async function saveChange(change: FacebookLeadChange, token: string) {
  const lead = await fetchLead(change.leadgenId, token);
  const context: FacebookLeadContext = {
    adId: lead.ad_id || change.adId,
    adName: lead.ad_name,
    formId: lead.form_id || change.formId,
    campaignId: lead.campaign_id,
    campaignName: lead.campaign_name,
  };
  const mapped = mapFacebookLead(lead.field_data, context);
  if (!mapped.phone) {
    console.error("facebook lead has no phone", change.leadgenId);
    return;
  }
  await addCampaignLead({
    name: mapped.name,
    phone: mapped.phone,
    business: mapped.business,
    business_type: mapped.businessType,
    notes: mapped.notes,
    source: "facebook",
  });
}

/** A new Facebook Lead Ad. The body only carries an id; the answers are read from Graph. */
export async function POST(request: Request) {
  const appSecret = env("FACEBOOK_APP_SECRET");
  if (!appSecret) {
    console.error("facebook lead webhook missing FACEBOOK_APP_SECRET");
    return new Response("Missing app secret", { status: 503 });
  }
  const raw = await request.text();
  if (!facebookSignatureMatches(appSecret, raw, request.headers.get("x-hub-signature-256"))) {
    return new Response("Invalid signature", { status: 403 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const changes = leadgenChanges(body);
  if (!changes.length) return new Response("ok");
  const pageToken = env("FACEBOOK_PAGE_ACCESS_TOKEN");
  if (!pageToken) {
    console.error("facebook lead webhook missing FACEBOOK_PAGE_ACCESS_TOKEN");
    return new Response("Missing page token", { status: 503 });
  }
  try {
    for (const change of changes) await saveChange(change, pageToken);
  } catch (error) {
    console.error("facebook lead webhook failed", error);
    return new Response("Failed", { status: 500 });
  }
  return new Response("ok");
}
