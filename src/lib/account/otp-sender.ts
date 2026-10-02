import { getServiceSupabase } from "@/lib/sms/supabase-admin";

export async function loadSignupSenderBusinessId() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_admin_phones")
    .select("otp_business_id")
    .not("otp_business_id", "is", null)
    .limit(1);
  const businessId = String(data?.[0]?.otp_business_id ?? "").trim();
  if (error || !businessId) {
    throw new Error("שליחת קוד למספר חדש עדיין לא זמינה.");
  }
  return businessId;
}
