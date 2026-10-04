import test from "node:test";
import assert from "node:assert/strict";
import { priceSummary } from "../src/lib/booking.ts";
import { checkoutReturnUrl } from "../src/lib/sms/env.ts";
import {
  payplusReturnDecision,
  readPayplusReturnFields,
  SUBSCRIPTION_RETURN_PATH,
} from "../src/lib/payplus-return.ts";
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

test("PayPlus success return keeps the transaction id and ignores a failed status", () => {
  const transactionUid = "e6228e7d-e770-4371-9a5b-335e5a51dd27";
  const pageRequestUid = "7712bc5a-37dc-4ecb-b63a-3974637e493c";
  const fields = readPayplusReturnFields({
    transaction_uid: transactionUid,
    page_request_uid: pageRequestUid,
    status_code: "000",
    more_info: "sub:2f1c0a2a-4b3d-4e5f-8a91-0b1c2d3e4f50",
  });
  assert.equal(fields.transactionUid, transactionUid);
  assert.equal(fields.pageRequestUid, pageRequestUid);
  assert.equal(payplusReturnDecision(fields), "lookup");
  assert.equal(
    payplusReturnDecision(readPayplusReturnFields({ uid: transactionUid, status_code: "004" })),
    "declined",
  );
  assert.equal(payplusReturnDecision(readPayplusReturnFields({ more_info: "sub:x" })), "missing");
  assert.equal(SUBSCRIPTION_RETURN_PATH, "/api/subscribe/return");
});

test("localhost checkout returns the user to the same origin", () => {
  const local = new Request("http://127.0.0.1:3000/api/subscribe/checkout", {
    headers: { host: "127.0.0.1:3000" },
  });
  assert.equal(checkoutReturnUrl(local), "http://127.0.0.1:3000");
});
