import { loadMonthlyPriceIls } from "@/lib/admin/catalog";
import { loadAccountByBusinessId } from "@/lib/account/store";
import type { CustomerAccount } from "@/lib/account/store";
import {
  payplusReturnDecision,
  type PayplusReturnFields,
} from "@/lib/payplus-return";
import { isSuccessfulPayplusStatus } from "@/lib/sms/payplus-crypto";
import {
  isConfirmedPayplusPayment,
  lookupPayplusPayment,
} from "@/lib/sms/payplus";
import {
  parseSubscriptionMoreInfo,
  subscriptionChargeIls,
} from "@/lib/subscription";
import { fulfillPaidSubscription } from "@/lib/subscription-orders";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function lookupReturnPayment(fields: PayplusReturnFields) {
  const query = {
    transactionUid: fields.transactionUid || undefined,
    paymentRequestUid: fields.pageRequestUid || undefined,
  };
  try {
    const found = await lookupPayplusPayment(query);
    if (found) return found;
  } catch (error) {
    console.error("payplus return lookup failed", error);
  }
  await wait(700);
  try {
    return await lookupPayplusPayment(query);
  } catch (error) {
    console.error("payplus return lookup failed", error);
    return null;
  }
}

async function loadReadyAccount(businessId: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const account = await loadAccountByBusinessId(businessId);
    if (account?.paidAt && account.userId && account.businessId) return account;
    if (attempt < 2) await wait(350);
  }
  return null;
}

/**
 * Confirms the PayPlus success redirect against PayPlus itself, opens the
 * business if the callback has not yet, and returns the account to sign in.
 */
export async function claimPaidSubscriptionReturn(fields: PayplusReturnFields) {
  if (payplusReturnDecision(fields) !== "lookup") {
    return { ok: false as const, reason: "declined" as const };
  }

  const payment = await lookupReturnPayment(fields);
  const fromPayment = payment ? parseSubscriptionMoreInfo(payment.moreInfo) : null;
  const hinted = parseSubscriptionMoreInfo(fields.moreInfo);
  if (fromPayment && hinted && fromPayment !== hinted) {
    return { ok: false as const, reason: "declined" as const };
  }
  const businessId = fromPayment || hinted;
  if (!payment || !businessId) {
    return { ok: false as const, reason: "pending" as const };
  }

  if (!isSuccessfulPayplusStatus(payment.statusCode)) {
    return { ok: false as const, reason: "declined" as const };
  }

  const expected = subscriptionChargeIls(await loadMonthlyPriceIls());
  if (!isConfirmedPayplusPayment(payment, expected)) {
    return { ok: false as const, reason: "declined" as const };
  }

  const result = await fulfillPaidSubscription({
    businessId,
    amount: payment.amount,
    recurringUid: payment.recurringUid,
    terminalUid: payment.terminalUid,
    customerUid: payment.customerUid,
    transactionUid: payment.uid || fields.transactionUid,
  });
  if (!result.ok) return { ok: false as const, reason: "pending" as const };

  const account = await loadReadyAccount(businessId);
  if (!account) return { ok: false as const, reason: "pending" as const };
  return { ok: true as const, account: account satisfies CustomerAccount };
}
