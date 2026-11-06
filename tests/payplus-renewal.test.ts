import test from "node:test";
import assert from "node:assert/strict";
import {
  nextRecurringStartDate,
  recurringRenewalUpdate,
  renewalItemPrice,
  shouldRaiseRecurringAmount,
} from "../src/lib/sms/payplus-renewal.ts";

const now = new Date("2026-11-06T12:00:00+02:00");

test("a future billing date stays, and today moves one month ahead", () => {
  assert.equal(nextRecurringStartDate("2026-12-06", now), "2026-12-06");
  assert.equal(nextRecurringStartDate("2026-11-06", now), "2026-12-06");
  assert.equal(nextRecurringStartDate("", now), "2026-12-06");
});

test("only an intro standing order is raised to the monthly price", () => {
  assert.equal(shouldRaiseRecurringAmount(116.82, 293.82), true);
  assert.equal(shouldRaiseRecurringAmount(293.82, 293.82), false);
  assert.equal(shouldRaiseRecurringAmount(350, 293.82), false);
  assert.equal(shouldRaiseRecurringAmount(0, 293.82), false);
});

test("the renewal update charges the monthly price later and does not charge again now", () => {
  assert.equal(renewalItemPrice(0, 249, 293.82), 293.82);
  assert.equal(renewalItemPrice(1, 249, 293.82), 249);
  const body = recurringRenewalUpdate({
    terminalUid: "terminal",
    customerUid: "customer",
    cardToken: "card",
    cashierUid: "cashier",
    currencyCode: "ILS",
    recurringType: 2,
    recurringRange: 1,
    numberOfCharges: 0,
    startDate: "2026-12-06",
    productUid: "product",
    price: 293.82,
    successfulInvoice: true,
    customerFailureEmail: true,
    sendCustomerSuccessEmail: true,
    extraInfo: "sub:business",
  });
  assert.equal(body.instant_first_payment, false);
  assert.equal(body.start_date, "2026-12-06");
  assert.equal(body.items[0].price, 293.82);
  assert.equal(body.extra_info, "sub:business");
});
