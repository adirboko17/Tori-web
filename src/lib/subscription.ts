export const SUBSCRIPTION_MORE_INFO_PREFIX = "sub:";
export const SUBSCRIPTION_PLAN = "monthly";
export const SUBSCRIPTION_ITEM_NAME = "מנוי חודשי tori";
export const DEFAULT_MONTHLY_PRICE_ILS = 249;
/** The joining price of the first month, before VAT. */
export const FIRST_MONTH_PRICE_ILS = 99;

export function subscriptionChargeIls(
  monthlyPriceIls = DEFAULT_MONTHLY_PRICE_ILS,
) {
  return Math.round(monthlyPriceIls * 118) / 100;
}

/** A confirmed subscription charge is either the joining price or the ongoing price. */
export function isSubscriptionPaymentAmount(
  amount: number,
  monthlyPriceIls = DEFAULT_MONTHLY_PRICE_ILS,
) {
  const charged = Number(amount);
  if (!Number.isFinite(charged)) return false;
  const accepted = [
    subscriptionChargeIls(FIRST_MONTH_PRICE_ILS),
    subscriptionChargeIls(monthlyPriceIls),
  ];
  return accepted.some((expected) => Math.abs(charged - expected) <= 0.05);
}

/** The price line shown before paying, with VAT, e.g. "116.82 ₪ בחודש הראשון, ואחר כך 293.82 ₪ לחודש, כולל מע״מ". */
export function subscriptionPriceLabel(monthlyPriceIls = DEFAULT_MONTHLY_PRICE_ILS) {
  const ils = (price: number) => subscriptionChargeIls(price).toLocaleString("he-IL");
  return `${ils(FIRST_MONTH_PRICE_ILS)} ₪ בחודש הראשון, ואחר כך ${ils(monthlyPriceIls)} ₪ לחודש, כולל מע״מ`;
}

export function subscriptionMoreInfo(businessId: string) {
  return `${SUBSCRIPTION_MORE_INFO_PREFIX}${businessId}`;
}

export function parseSubscriptionMoreInfo(moreInfo: string) {
  const value = moreInfo.trim();
  if (!value.startsWith(SUBSCRIPTION_MORE_INFO_PREFIX)) return null;
  const id = value.slice(SUBSCRIPTION_MORE_INFO_PREFIX.length).trim();
  return id || null;
}
