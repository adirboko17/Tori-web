import { normalizeIsraeliMobile } from "../sms/phone.ts";

export function purchaseCandidateIds(input: {
  checkoutId?: string;
  accounts: { id: string; businessId: string | null }[];
}) {
  const ids = [input.checkoutId ?? ""];
  for (const account of input.accounts) {
    ids.push(account.businessId ?? "", account.id);
  }
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

export function recurringMatchesPhone(recurringPhone: string, phone: string) {
  const left = normalizeIsraeliMobile(recurringPhone);
  const right = normalizeIsraeliMobile(phone);
  return Boolean(left && right && left === right);
}
