import { purchaseBuyerLabel, purchaseSmsText, newAppSmsText } from "./purchase-sms-text";
import { isSuccessfulPayplusStatus } from "./payplus-crypto";
import { getServiceSupabase, invokeEdgeFunction } from "./supabase-admin";

export { purchaseBuyerLabel, purchaseSmsText, newAppSmsText } from "./purchase-sms-text";

async function sendOwnerSms(text: string) {
  const result = await invokeEdgeFunction("sms-purchase-notify", { text });
  if (!result.ok) {
    console.error("owner sms failed", result.status);
  }
}

export async function notifySmsPurchase(input: {
  businessId: string;
  adminUserId: string;
  credits: number;
  payplusStatusCode: string;
}) {
  if (!isSuccessfulPayplusStatus(input.payplusStatusCode)) return;
  try {
    const supabase = getServiceSupabase();
    const [{ data: business }, { data: admin }] = await Promise.all([
      supabase
        .from("business_profile")
        .select("display_name, phone")
        .eq("id", input.businessId)
        .maybeSingle(),
      supabase
        .from("users")
        .select("name, phone")
        .eq("id", input.adminUserId)
        .maybeSingle(),
    ]);
    const text = purchaseSmsText({
      buyer: purchaseBuyerLabel({
        businessName: business?.display_name,
        adminName: admin?.name,
        phone: admin?.phone || business?.phone,
      }),
      credits: input.credits,
    });
    await sendOwnerSms(text);
  } catch (error) {
    console.error("sms purchase notify failed", error);
  }
}

export async function notifyNewAppPayment(input: {
  businessId: string;
  payplusStatusCode: string;
}) {
  if (!isSuccessfulPayplusStatus(input.payplusStatusCode)) return;
  try {
    const supabase = getServiceSupabase();
    const [{ data: business }, { data: admin }] = await Promise.all([
      supabase
        .from("business_profile")
        .select("display_name, phone")
        .eq("id", input.businessId)
        .maybeSingle(),
      supabase
        .from("users")
        .select("name, phone")
        .eq("business_id", input.businessId)
        .eq("user_type", "admin")
        .limit(1)
        .maybeSingle(),
    ]);
    await sendOwnerSms(
      newAppSmsText({
        buyer: purchaseBuyerLabel({
          businessName: business?.display_name,
          adminName: admin?.name,
          phone: admin?.phone || business?.phone,
        }),
      }),
    );
  } catch (error) {
    console.error("new app sms failed", error);
  }
}
