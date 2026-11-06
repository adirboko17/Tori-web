/** Pure helpers for moving a new standing order from the joining price to the monthly price. */

export function jerusalemTodayIso(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function toIsoDate(raw: string) {
  const value = String(raw ?? "").trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(value);
  if (!dmy) return "";
  return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
}

function addMonthsIso(iso: string, months: number) {
  const [yearText, monthText, dayText] = iso.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const target = month - 1 + months;
  const nextYear = year + Math.floor(target / 12);
  const nextMonth = ((target % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(nextYear, nextMonth + 1, 0)).getUTCDate();
  const nextDay = Math.min(day, lastDay);
  return `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(nextDay).padStart(2, "0")}`;
}

/** Keeps a future billing date. A date that is today or earlier moves one month ahead. */
export function nextRecurringStartDate(existing: string, now = new Date()) {
  const today = jerusalemTodayIso(now);
  const current = toIsoDate(existing);
  if (current && current > today) return current;
  return addMonthsIso(current || today, 1);
}

/** Raise only an intro charge. A standing order already at or above the monthly price stays. */
export function shouldRaiseRecurringAmount(current: number, target: number) {
  if (!Number.isFinite(current) || current <= 0) return false;
  if (!Number.isFinite(target) || target <= 0) return false;
  if (current > target + 0.05) return false;
  return Math.abs(current - target) > 0.05;
}

/** PayPlus vat_type 1 means the price is before VAT. Every other type is the amount charged. */
export function renewalItemPrice(vatType: number, beforeVat: number, withVat: number) {
  return Number(vatType) === 1 ? beforeVat : withVat;
}

export function recurringRenewalUpdate(input: {
  terminalUid: string;
  customerUid: string;
  cardToken: string;
  cashierUid: string;
  currencyCode: string;
  recurringType: number;
  recurringRange: number;
  numberOfCharges: number;
  startDate: string;
  productUid: string;
  price: number;
  successfulInvoice: boolean;
  customerFailureEmail: boolean;
  sendCustomerSuccessEmail: boolean;
  extraInfo: string;
}) {
  return {
    terminal_uid: input.terminalUid,
    customer_uid: input.customerUid,
    card_token: input.cardToken,
    cashier_uid: input.cashierUid,
    currency_code: input.currencyCode || "ILS",
    instant_first_payment: false,
    recurring_type: input.recurringType,
    recurring_range: input.recurringRange,
    number_of_charges: input.numberOfCharges,
    start_date: input.startDate,
    items: [
      {
        product_uid: input.productUid,
        quantity: 1,
        price: input.price,
      },
    ],
    successful_invoice: input.successfulInvoice,
    customer_failure_email: input.customerFailureEmail,
    send_customer_success_email: input.sendCustomerSuccessEmail,
    extra_info: input.extraInfo,
  };
}
