import {
  payplusBaseUrl,
  payplusCallbackUrl,
  payplusConfigured,
  publicAppUrl,
} from "./env";
import type { SmsPackage } from "./packages";

export {
  amountsMatch,
  isPayplusUserAgent,
  isSuccessfulPayplusStatus,
  parsePayplusCallback,
  verifyPayplusHash,
} from "./payplus-crypto";

export type PayplusCustomer = {
  customer_name: string;
  phone: string;
};

export type PayplusLinkInput = {
  orderId: string;
  businessId: string;
  pack: SmsPackage;
  customer: PayplusCustomer;
  request?: Request;
};

export async function generatePayplusLink(input: PayplusLinkInput) {
  if (!payplusConfigured()) {
    return { ok: false as const, message: "סליקה עדיין לא הוגדרה." };
  }
  const appUrl = publicAppUrl(input.request);
  const body = {
    payment_page_uid: process.env.PAYPLUS_PAYMENT_PAGE_UID,
    charge_method: 1,
    amount: input.pack.amountIls,
    currency_code: "ILS",
    language_code: "he",
    sendEmailApproval: false,
    sendEmailFailure: false,
    send_failure_callback: true,
    more_info: input.orderId,
    more_info_1: input.businessId,
    more_info_2: String(input.pack.smsCredits),
    more_info_3: input.pack.id,
    refURL_success: `${appUrl}/sms/success`,
    refURL_failure: `${appUrl}/sms/failure`,
    refURL_callback: payplusCallbackUrl(input.request),
    customer: input.customer,
    items: [
      {
        name: input.pack.label,
        quantity: 1,
        price: input.pack.amountIls,
      },
    ],
  };

  const response = await fetch(
    `${payplusBaseUrl()}/PaymentPages/generateLink`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.PAYPLUS_API_KEY ?? "",
        "secret-key": process.env.PAYPLUS_SECRET_KEY ?? "",
      },
      body: JSON.stringify(body),
    },
  );
  const json = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const data = (json.data ?? json) as Record<string, unknown>;
  const link = String(data.payment_page_link ?? data.link ?? data.url ?? "");
  const pageRequestUid = String(data.page_request_uid ?? data.uid ?? "");
  if (!response.ok || !link) {
    return {
      ok: false as const,
      message: "יצירת דף התשלום נכשלה. נסו שוב.",
    };
  }
  return {
    ok: true as const,
    link,
    pageRequestUid,
  };
}
