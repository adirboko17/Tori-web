import { loadMonthlyPriceIls } from "@/lib/admin/catalog";
import { loadPayplusSubscription } from "@/lib/admin/payplus-subscriptions";
import {
  purchaseCandidateIds,
  recurringMatchesPhone,
} from "@/lib/account/resume-paid-match";
import type { CustomerAccount } from "@/lib/account/store";
import {
  listAccountsByPhone,
  loadAccountByBusinessId,
  markAccountPaid,
} from "@/lib/account/store";
import {
  isConfirmedPayplusPayment,
  listPayplusRecurrings,
  lookupPayplusPayment,
} from "@/lib/sms/payplus";
import { normalizeIsraeliMobile, phoneLastNine } from "@/lib/sms/phone";
import {
  parseSubscriptionMoreInfo,
  subscriptionChargeIls,
  subscriptionMoreInfo,
} from "@/lib/subscription";
import { fulfillPaidSubscription, loadBusinessForSubscription } from "@/lib/subscription-orders";

export type ResumePaidResult =
  | { status: "ready"; account: CustomerAccount }
  | { status: "unpaid" }
  | { status: "failed"; error: string };

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isReady(
  account: CustomerAccount | null,
): account is CustomerAccount & { userId: string; businessId: string } {
  return Boolean(account?.paidAt && account.userId && account.businessId);
}

async function loadReadyAccount(businessId: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await markAccountPaid(businessId);
    const account = await loadAccountByBusinessId(businessId);
    if (isReady(account)) return account;
    if (attempt < 2) await wait(350);
  }
  return null;
}

async function locallyPaid(phone: string) {
  const found = await listAccountsByPhone(phone);
  if (!found.ok) return null;
  for (const account of found.accounts) {
    const businessId = account.businessId;
    if (!businessId) continue;
    if (account.paidAt) {
      const ready = await loadReadyAccount(businessId);
      if (ready) return ready;
      continue;
    }
    let knownPaid = false;
    try {
      knownPaid = Boolean(await loadPayplusSubscription(businessId));
    } catch (error) {
      console.error("saved subscription lookup failed", error);
    }
    if (!knownPaid) {
      try {
        const business = await loadBusinessForSubscription(businessId);
        knownPaid = business?.commitment === "paid";
      } catch (error) {
        console.error("paid business lookup failed", error);
      }
    }
    if (!knownPaid) continue;
    const ready = await loadReadyAccount(businessId);
    if (ready) return ready;
  }
  return null;
}

async function finishConfirmed(input: {
  businessId: string;
  amount: number;
  recurringUid?: string | null;
  terminalUid?: string | null;
  customerUid?: string | null;
  transactionUid?: string | null;
}): Promise<ResumePaidResult> {
  const result = await fulfillPaidSubscription({
    businessId: input.businessId,
    amount: input.amount,
    recurringUid: input.recurringUid,
    terminalUid: input.terminalUid,
    customerUid: input.customerUid,
    transactionUid: input.transactionUid,
  });
  if (!result.ok) {
    return { status: "failed", error: result.message };
  }
  const account = await loadReadyAccount(input.businessId);
  if (!account) {
    return {
      status: "failed",
      error: "התשלום נקלט, אבל פתיחת האזור האישי נכשלה. נסו שוב.",
    };
  }
  return { status: "ready", account };
}

async function confirmedByMoreInfo(businessId: string, expected: number) {
  try {
    const payment = await lookupPayplusPayment({
      moreInfo: subscriptionMoreInfo(businessId),
    });
    if (!payment || !isConfirmedPayplusPayment(payment, expected)) return null;
    const paidFor = parseSubscriptionMoreInfo(payment.moreInfo);
    if (paidFor && paidFor !== businessId) return null;
    return payment;
  } catch (error) {
    console.error("payplus purchase lookup failed", error);
    return null;
  }
}

async function confirmedByPhone(phone: string, expected: number) {
  const search = phoneLastNine(phone);
  try {
    const listed = await listPayplusRecurrings(search);
    if (!listed.ok) return null;
    const match = listed.recurrings.find(
      (row) => row.valid && recurringMatchesPhone(row.customerPhone, phone),
    );
    if (!match) return null;
    const businessId = parseSubscriptionMoreInfo(match.extraInfo);
    if (!businessId) return null;
    const payment = await lookupPayplusPayment({
      moreInfo: subscriptionMoreInfo(businessId),
    });
    if (!payment || !isConfirmedPayplusPayment(payment, expected)) return null;
    return { businessId, payment };
  } catch (error) {
    console.error("payplus phone purchase lookup failed", error);
    return null;
  }
}

/**
 * A phone that already paid should enter the details form, not a second checkout.
 * The signup id from the first purchase is what PayPlus stored on the charge.
 */
export async function resumePaidSignup(input: {
  phone: string;
  checkoutId?: string;
  returning?: boolean;
}): Promise<ResumePaidResult> {
  const phone = normalizeIsraeliMobile(input.phone);
  if (!phone) return { status: "unpaid" };

  const local = await locallyPaid(phone);
  if (local) return { status: "ready", account: local };
  if (input.returning === false) return { status: "unpaid" };

  const found = await listAccountsByPhone(phone);
  if (!found.ok) return { status: "unpaid" };
  const candidates = purchaseCandidateIds({
    checkoutId: input.checkoutId,
    accounts: found.accounts,
  });
  const expected = subscriptionChargeIls(await loadMonthlyPriceIls());

  for (const businessId of candidates) {
    const payment = await confirmedByMoreInfo(businessId, expected);
    if (!payment) continue;
    return finishConfirmed({
      businessId,
      amount: payment.amount,
      recurringUid: payment.recurringUid,
      terminalUid: payment.terminalUid,
      customerUid: payment.customerUid,
      transactionUid: payment.uid,
    });
  }

  const byPhone = await confirmedByPhone(phone, expected);
  if (!byPhone) return { status: "unpaid" };
  return finishConfirmed({
    businessId: byPhone.businessId,
    amount: byPhone.payment.amount,
    recurringUid: byPhone.payment.recurringUid,
    terminalUid: byPhone.payment.terminalUid,
    customerUid: byPhone.payment.customerUid,
    transactionUid: byPhone.payment.uid,
  });
}
