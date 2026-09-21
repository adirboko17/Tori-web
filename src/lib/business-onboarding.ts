import { supabase, supabaseConfigured } from "@/integrations/supabase/client";
import {
  mapBusinessFields,
  mapServices,
  safeFileName,
  type OnboardingFormInput,
} from "@/lib/business-onboarding-map";

export {
  mapBusinessFields,
  mapServices,
  toAppNameEn,
  toEnglishName,
} from "@/lib/business-onboarding-map";
export type {
  MappedBusiness,
  MappedService,
  OnboardingFormInput,
  OnboardingServiceInput,
} from "@/lib/business-onboarding-map";

async function uploadPublicFile(file: File, prefix: string) {
  const path = `logos/${Date.now()}_${prefix}_${safeFileName(file.name)}`;
  const { data, error } = await supabase.storage
    .from("onboarding-uploads")
    .upload(path, file, { upsert: true });
  if (error || !data?.path) {
    throw new Error("העלאת הקובץ נכשלה. נסו שוב.");
  }
  return supabase.storage.from("onboarding-uploads").getPublicUrl(data.path)
    .data.publicUrl;
}

export async function submitBusinessOnboarding(
  input: OnboardingFormInput,
  existingId?: string,
) {
  if (!supabaseConfigured()) {
    throw new Error("חסר חיבור ל-Supabase. בדקו את משתני הסביבה.");
  }
  const business = mapBusinessFields(input);
  if (!business.phone) {
    throw new Error("צריך להזין מספר טלפון.");
  }
  if (!business.manager_name) {
    throw new Error("צריך להזין שם.");
  }

  let logoUrl: string | null = null;
  if (!existingId && input.logoFile) {
    logoUrl = await uploadPublicFile(input.logoFile, "main");
  }

  const submissionId = existingId || crypto.randomUUID();
  const services = mapServices(input.services);

  if (!existingId) {
    const row = {
      id: submissionId,
      business_name_he: business.business_name_he,
      business_name_en: business.business_name_en,
      app_name_en: business.app_name_en,
      address: business.address,
      manager_name: business.manager_name,
      phone: business.phone,
      manager_password: business.manager_password,
      status: "pending",
      email: business.email,
      logo_url: logoUrl,
      brand_color: business.brand_color,
      plan: business.plan,
      price: business.price,
      commitment: business.commitment,
    };

    const { error: insertError } = await supabase
      .from("businesses")
      .insert(row)
      .select("id")
      .single();
    if (insertError) {
      console.error("business insert failed", insertError.message);
      throw new Error("לא הצלחנו לשמור את הפרטים. נסו שוב.");
    }

    if (services.length) {
      const { error: servicesError } = await supabase.from("services").insert(
        services.map((service) => ({
          business_id: submissionId,
          name: service.name,
          price: service.price,
          duration_minutes: service.duration_minutes,
          sort_order: service.sort_order,
        })),
      );
      if (servicesError) {
        throw new Error("העסק נשמר, אבל שמירת השירותים נכשלה. נסו שוב.");
      }
    }
  }

  const webhookPayload = {
    business: {
      id: submissionId,
      business_name_he: business.business_name_he,
      business_name_en: business.business_name_en,
      app_name_en: business.app_name_en,
      address: business.address,
      manager_name: business.manager_name,
      phone: business.phone,
      manager_password: business.manager_password,
      logo_url: logoUrl,
      logo_url_plain_background: null,
      logo_url_transparent: null,
      manager_photo_url: null,
      brand_color: business.brand_color,
      plan: business.plan,
      price: business.price,
      commitment: business.commitment,
      email: business.email,
    },
    services: services.map(({ name, price, duration_minutes, sort_order }) => ({
      name,
      price,
      duration_minutes,
      sort_order,
    })),
    business_type: business.business_type,
    note: business.note,
  };

  const { error: webhookError } = await supabase.functions.invoke(
    "send-webhook",
    { body: webhookPayload },
  );
  if (webhookError) {
    console.error("send-webhook failed");
    const error = new Error(
      "הפרטים נשמרו, אבל שליחת ההודעה לצוות נכשלה. נחזור אליכם ידנית.",
    );
    error.cause = { id: submissionId };
    throw error;
  }

  return { id: submissionId, business, services };
}
