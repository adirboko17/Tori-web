export const SUBSCRIPTION_MORE_INFO_PREFIX = "sub:";
export const SUBSCRIPTION_PLAN = "monthly";
export const SUBSCRIPTION_ITEM_NAME = "מנוי חודשי tori";
export const DEFAULT_MONTHLY_PRICE_ILS = 299;

export function subscriptionChargeIls(
  monthlyPriceIls = DEFAULT_MONTHLY_PRICE_ILS,
) {
  return Math.round(monthlyPriceIls * 118) / 100;
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
