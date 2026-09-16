import { priceSummary } from "@/lib/booking";
import {
  SUBSCRIPTION_ITEM_NAME,
  subscriptionMoreInfo,
} from "@/lib/subscription";
import {
  payplusBaseUrl,
  payplusCallbackUrl,
  payplusConfigured,
  payplusSubscriptionConfigured,
  payplusSubscriptionPageUid,
  checkoutReturnUrl,
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
import {
  amountsMatch,
  isSuccessfulPayplusStatus,
} from "./payplus-crypto";

export type PayplusCustomer = {
  customer_name: string;
  phone: string;
  email?: string;
  vat_number?: string;
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

export type PayplusSubscriptionInput = {
  businessId: string;
  customer: PayplusCustomer;
  request?: Request;
};

export async function generatePayplusSubscriptionLink(
  input: PayplusSubscriptionInput,
) {
  if (!payplusSubscriptionConfigured()) {
    return { ok: false as const, message: "סליקת המנוי החודשי עדיין לא הוגדרה." };
  }
  const appUrl = checkoutReturnUrl(input.request);
  const amount = priceSummary().total;
  const customer: Record<string, string> = {
    customer_name: input.customer.customer_name,
    phone: input.customer.phone,
  };
  if (input.customer.email) customer.email = input.customer.email;
  if (input.customer.vat_number) {
    customer.vat_number = input.customer.vat_number;
  }
  const body = {
    payment_page_uid: payplusSubscriptionPageUid(),
    charge_method: 3,
    amount,
    currency_code: "ILS",
    language_code: "he",
    paying_vat: true,
    sendEmailApproval: true,
    sendEmailFailure: true,
    send_failure_callback: true,
    more_info: subscriptionMoreInfo(input.businessId),
    more_info_1: input.businessId,
    more_info_2: "subscription",
    more_info_3: "monthly",
    refURL_success: `${appUrl}/subscribe/success`,
    refURL_failure: `${appUrl}/subscribe/failure`,
    refURL_callback: payplusCallbackUrl(input.request),
    customer,
    items: [
      {
        name: SUBSCRIPTION_ITEM_NAME,
        quantity: 1,
        price: amount,
        vat_type: 0,
      },
    ],
    recurring_settings: {
      instant_first_payment: true,
      recurring_type: 2,
      recurring_range: 1,
      number_of_charges: 0,
      start_date_on_payment_date: true,
      start_date: 1,
      jump_payments: 0,
      successful_invoice: true,
      customer_failure_email: true,
      send_customer_success_email: true,
    },
  };

  const response = await fetch(
    `${payplusBaseUrl()}/PaymentPages/generateLink`,
    {
      method: "POST",
      headers: payplusAuthHeaders(),
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
    console.error("payplus subscription link failed", {
      status: response.status,
      results: json.results ?? json.message ?? json.error,
    });
    return {
      ok: false as const,
      message: "יצירת דף הוראת הקבע נכשלה. נסו שוב.",
    };
  }
  return {
    ok: true as const,
    link,
    pageRequestUid,
  };
}

function payplusAuthHeaders() {
  return {
    "Content-Type": "application/json",
    "api-key": process.env.PAYPLUS_API_KEY ?? "",
    "secret-key": process.env.PAYPLUS_SECRET_KEY ?? "",
  };
}

function pickDeep(
  value: unknown,
  keys: string[],
): unknown {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    if (record[key] != null && record[key] !== "") return record[key];
  }
  for (const nested of Object.values(record)) {
    if (nested && typeof nested === "object") {
      const found = pickDeep(nested, keys);
      if (found != null && found !== "") return found;
    }
  }
  return undefined;
}

export type PayplusIpnPayment = {
  uid: string;
  statusCode: string;
  amount: number;
  moreInfo: string;
};

export async function lookupPayplusPayment(input: {
  paymentRequestUid?: string;
  transactionUid?: string;
  moreInfo?: string;
}): Promise<PayplusIpnPayment | null> {
  if (
    !input.paymentRequestUid &&
    !input.transactionUid &&
    !input.moreInfo
  ) {
    return null;
  }
  const response = await fetch(`${payplusBaseUrl()}/PaymentPages/ipn-full`, {
    method: "POST",
    headers: payplusAuthHeaders(),
    body: JSON.stringify({
      payment_request_uid: input.paymentRequestUid || undefined,
      transaction_uid: input.transactionUid || undefined,
      more_info: input.moreInfo || undefined,
    }),
    signal: AbortSignal.timeout(8000),
  });
  const json = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const data = (json.data ?? json) as Record<string, unknown>;
  const statusCode = String(
    data.status_code ?? pickDeep(json, ["status_code", "statusCode"]) ?? "",
  );
  const amount = Number(data.amount ?? pickDeep(data, ["amount"]));
  const uid = String(
    data.transaction_uid ??
      data.uid ??
      pickDeep(json, ["transaction_uid", "uid"]) ??
      "",
  );
  const moreInfo = String(
    data.more_info ?? pickDeep(json, ["more_info", "moreInfo"]) ?? "",
  );
  if (!uid && !statusCode) return null;
  return { uid, statusCode, amount, moreInfo };
}

export function isConfirmedPayplusPayment(
  payment: PayplusIpnPayment,
  expectedAmount: number,
) {
  return (
    isSuccessfulPayplusStatus(payment.statusCode) &&
    Number.isFinite(payment.amount) &&
    amountsMatch(payment.amount, expectedAmount)
  );
}
