import {
  mapBusinessFields,
  mapServices,
  webhookAddress,
  type OnboardingFormInput,
} from "@/lib/business-onboarding-map";

export {
  mapBusinessFields,
  mapServices,
  toAppNameEn,
  toEnglishName,
  webhookAddress,
} from "@/lib/business-onboarding-map";
export type {
  MappedBusiness,
  MappedService,
  OnboardingFormInput,
  OnboardingServiceInput,
} from "@/lib/business-onboarding-map";

async function fileToDataUrl(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  const type = file.type || "image/png";
  return `data:${type};base64,${btoa(binary)}`;
}

export async function submitBusinessOnboarding(
  input: OnboardingFormInput,
  existingId?: string,
) {
  const business = mapBusinessFields(input);
  if (!business.phone) {
    throw new Error("צריך להזין מספר טלפון.");
  }
  if (!business.manager_name) {
    throw new Error("צריך להזין שם.");
  }

  let logoBase64 = "";
  if (input.logoFile) {
    if (input.logoFile.size > 3_000_000) {
      throw new Error("הלוגו גדול מדי. בחרו קובץ של עד 3MB.");
    }
    logoBase64 = await fileToDataUrl(input.logoFile);
  }

  const submissionId = existingId || crypto.randomUUID();
  const services = mapServices(input.services);
  const response = await fetch("/api/onboarding/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      business: {
        id: submissionId,
        business_name_he: business.business_name_he,
        business_name_en: business.business_name_en,
        app_name_en: business.app_name_en,
        address: webhookAddress(business),
        manager_name: business.manager_name,
        phone: business.phone,
        manager_password: business.manager_password,
        logo_url: null,
        logo_url_transparent: null,
        manager_photo_url: null,
        brand_color: business.brand_color,
        plan: business.plan,
        price: business.price,
        commitment: business.commitment,
        email: business.email,
        ...(logoBase64 ? { logoBase64 } : {}),
      },
      services: services.map(({ name, price, duration_minutes, sort_order }) => ({
        name,
        price,
        duration_minutes,
        sort_order,
      })),
    }),
  });

  const data = (await response.json().catch(() => null)) as {
    id?: string;
    error?: string;
  } | null;
  if (!response.ok || !data?.id) {
    const error = new Error(
      data?.error || "השליחה נכשלה. נסו שוב בעוד רגע.",
    );
    error.cause = { id: submissionId };
    throw error;
  }

  return { id: data.id, business, services };
}
