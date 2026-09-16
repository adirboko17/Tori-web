import test from "node:test";
import assert from "node:assert/strict";
import { priceSummary } from "../src/lib/booking.ts";
import { checkoutReturnUrl } from "../src/lib/sms/env.ts";
import {
  parseSubscriptionMoreInfo,
  SUBSCRIPTION_ITEM_NAME,
  SUBSCRIPTION_PLAN,
  subscriptionChargeIls,
  subscriptionMoreInfo,
} from "../src/lib/subscription.ts";

test("monthly subscription charge is 299 plus VAT", () => {
  const summary = priceSummary();
  assert.equal(summary.subtotal, 299);
  assert.equal(summary.vat, 53.82);
  assert.equal(summary.total, 352.82);
  assert.equal(subscriptionChargeIls(), 352.82);
  assert.equal(SUBSCRIPTION_PLAN, "monthly");
  assert.match(SUBSCRIPTION_ITEM_NAME, /מנוי/);
});

test("PayPlus more_info keeps subscription callbacks off the SMS order path", () => {
  const businessId = "2f1c0a2a-4b3d-4e5f-8a91-0b1c2d3e4f50";
  assert.equal(subscriptionMoreInfo(businessId), `sub:${businessId}`);
  assert.equal(parseSubscriptionMoreInfo(`sub:${businessId}`), businessId);
  assert.equal(parseSubscriptionMoreInfo(`  sub:${businessId}  `), businessId);
  assert.equal(parseSubscriptionMoreInfo(businessId), null);
  assert.equal(parseSubscriptionMoreInfo("sub:"), null);
  assert.equal(parseSubscriptionMoreInfo(""), null);
});

test("localhost checkout returns the user to the same origin", () => {
  const local = new Request("http://127.0.0.1:3000/api/subscribe/checkout", {
    headers: { host: "127.0.0.1:3000" },
  });
  assert.equal(checkoutReturnUrl(local), "http://127.0.0.1:3000");
});
