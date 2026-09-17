import test from "node:test";
import assert from "node:assert/strict";
import {
  signAdminOtpPending,
  signAdminSession,
  verifyAdminOtpPending,
  verifyAdminSession,
} from "../src/lib/admin/session-token.ts";
import { priceSummary } from "../src/lib/booking.ts";
import { subscriptionChargeIls } from "../src/lib/subscription.ts";
import {
  isUnreliablePulseemSender,
  rankOtpBusinesses,
} from "../src/lib/admin/otp-business.ts";
import { resolveSmsRemaining } from "../src/lib/admin/sms-remaining.ts";
import { parseSmsTransferInput } from "../src/lib/admin/sms-transfer.ts";
import {
  cancellationStatusLabel,
  isOpenCancellationStatus,
  parseCancellationInput,
} from "../src/lib/admin/cancellation-parse.ts";

test("signs and expires admin sessions", async () => {
  const secret = "test-admin-session-secret";
  const token = await signAdminSession(
    {
      userId: "admin-1",
      phone: "0527488779",
      name: "מנהל אתר",
      exp: Date.now() + 60_000,
    },
    secret,
  );
  const session = await verifyAdminSession(token, secret);
  assert.equal(session?.phone, "0527488779");
  assert.equal(await verifyAdminSession(token, "other-secret"), null);
  const expired = await signAdminSession(
    {
      userId: "admin-1",
      phone: "0527488779",
      name: "מנהל אתר",
      exp: Date.now() - 1,
    },
    secret,
  );
  assert.equal(await verifyAdminSession(expired, secret), null);
});

test("expires pending admin OTP cookies", async () => {
  const secret = "test-admin-otp-secret";
  const token = await signAdminOtpPending(
    {
      phone: "0527488779",
      businessId: "biz-1",
      exp: Date.now() + 60_000,
    },
    secret,
  );
  assert.equal((await verifyAdminOtpPending(token, secret))?.businessId, "biz-1");
  const expired = await signAdminOtpPending(
    {
      phone: "0527488779",
      businessId: "biz-1",
      exp: Date.now() - 1,
    },
    secret,
  );
  assert.equal(await verifyAdminOtpPending(expired, secret), null);
});

test("skips dummy Pulseem senders and prefers businesses with SMS credits", () => {
  assert.equal(isUnreliablePulseemSender("sds", "0527488779"), true);
  assert.equal(isUnreliablePulseemSender("0527488779", "0527488779"), true);
  assert.equal(isUnreliablePulseemSender("EliyaMoshe", "0527488779"), false);

  const ranked = rankOtpBusinesses(
    [{ businessId: "dummy" }, { businessId: "real" }],
    new Map([
      ["dummy", { fromNumber: "sds", credits: 0 }],
      ["real", { fromNumber: "EliyaMoshe", credits: 60 }],
    ]),
    "0527488779",
  );
  assert.deepEqual(
    ranked.map((row) => row.businessId),
    ["real"],
  );
});

test("customer SMS remaining prefers the live Pulseem balance", () => {
  assert.equal(resolveSmsRemaining(40, 60), 40);
  assert.equal(resolveSmsRemaining(0, 60), 0);
  assert.equal(resolveSmsRemaining(null, 60), 60);
  assert.equal(resolveSmsRemaining(null, 0), null);
});

test("validates SMS transfers to another customer or the main Pulseem account", () => {
  assert.deepEqual(
    parseSmsTransferInput({
      amount: 20,
      destination: "main",
      fromBusinessId: "a",
      maxRemaining: 40,
    }),
    { ok: true, amount: 20, destination: "main", toBusinessId: null },
  );
  assert.equal(
    parseSmsTransferInput({
      amount: 50,
      destination: "main",
      fromBusinessId: "a",
      maxRemaining: 40,
    }).ok,
    false,
  );
  assert.equal(
    parseSmsTransferInput({
      amount: 10,
      destination: "a",
      fromBusinessId: "a",
      maxRemaining: 40,
    }).ok,
    false,
  );
});

test("accepts a business-admin cancellation request payload", () => {
  const parsed = parseCancellationInput({
    businessId: "464cb35b-0fbb-413f-91fe-1ad49addcb77",
    userId: "32b53b60-9bef-43b7-a68c-30f7c71e9544",
    phone: "050-230-7500",
    name: "איתי בן יאיר",
  });
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.phone, "0502307500");
    assert.equal(parsed.businessId, "464cb35b-0fbb-413f-91fe-1ad49addcb77");
  }
  assert.equal(isOpenCancellationStatus("requested"), true);
  assert.equal(isOpenCancellationStatus("done"), false);
  assert.equal(cancellationStatusLabel("requested"), "ממתין לטיפול");
  assert.equal(parseCancellationInput({ phone: "0502307500" }).ok, false);
});

test("monthly price helper keeps VAT math for custom amounts", () => {
  assert.deepEqual(priceSummary(199), {
    sms: 0,
    subtotal: 199,
    vat: 35.82,
    total: 234.82,
  });
  assert.equal(subscriptionChargeIls(199), 234.82);
});
