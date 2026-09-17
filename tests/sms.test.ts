import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { fulfillmentAfterMissedLock } from "../src/lib/sms/fulfillment.ts";
import { OTP_ERROR_MESSAGES, findOtpErrorCode } from "../src/lib/sms/otp-errors.ts";
import {
  getSmsPackage,
  isSmsPackageId,
  listSmsPackages,
} from "../src/lib/sms/packages.ts";
import {
  amountsMatch,
  isPayplusUserAgent,
  isSuccessfulPayplusStatus,
  extractPayplusRecurringRef,
  parsePayplusCallback,
  verifyPayplusHash,
} from "../src/lib/sms/payplus-crypto.ts";
import {
  isPayplusUid,
  nextPayplusChargeDate,
  parsePayplusRecurringList,
} from "../src/lib/sms/payplus-recurring.ts";
import { normalizeIsraeliMobile } from "../src/lib/sms/phone.ts";
import { signSmsSession, verifySmsSession } from "../src/lib/sms/session-token.ts";

test("normalizes Israeli mobile numbers from common formats", () => {
  assert.equal(normalizeIsraeliMobile("0501234567"), "0501234567");
  assert.equal(normalizeIsraeliMobile("050-123-4567"), "0501234567");
  assert.equal(normalizeIsraeliMobile("972501234567"), "0501234567");
  assert.equal(normalizeIsraeliMobile("+972501234567"), "0501234567");
  assert.equal(normalizeIsraeliMobile("501234567"), "0501234567");
  assert.equal(normalizeIsraeliMobile("+972-50-123-4567"), "0501234567");
});

test("rejects non-admin or invalid phone shapes", () => {
  assert.equal(normalizeIsraeliMobile("031234567"), null);
  assert.equal(normalizeIsraeliMobile("05012345"), null);
  assert.equal(normalizeIsraeliMobile("letters"), null);
  assert.equal(normalizeIsraeliMobile(""), null);
});

test("keeps package prices on the server catalog only", () => {
  const packs = listSmsPackages();
  assert.deepEqual(
    packs.map((pack) => [pack.id, pack.smsCredits, pack.amountIls]),
    [
      ["pack_10", 10, 1],
      ["pack_2000", 2000, 60],
      ["pack_5000", 5000, 130],
      ["pack_10000", 10000, 200],
    ],
  );
  assert.equal(packs.find((pack) => pack.id === "pack_5000")?.featured, true);
  assert.equal(isSmsPackageId("pack_5000"), true);
  assert.equal(isSmsPackageId("pack_999"), false);
  assert.equal(getSmsPackage("custom"), null);
});

test("maps OTP error codes to Hebrew", () => {
  assert.equal(findOtpErrorCode({ error: "wrong_code" }), "wrong_code");
  assert.equal(
    findOtpErrorCode({ error: { code: "rate_limit_sends" } }),
    "rate_limit_sends",
  );
  assert.match(OTP_ERROR_MESSAGES.phone_not_registered, /רשום/);
  assert.match(OTP_ERROR_MESSAGES.too_many_attempts, /יותר מדי/);
  assert.equal(findOtpErrorCode({ error: "something_else" }), null);
});

test("signs and expires SMS sessions", () => {
  const secret = "test-session-secret-value";
  const token = signSmsSession(
    {
      userId: "user-1",
      businessId: "biz-1",
      phone: "0501234567",
      name: "רותי",
      businessName: "סטודיו",
      exp: Date.now() + 60_000,
    },
    secret,
  );
  const session = verifySmsSession(token, secret);
  assert.equal(session?.businessId, "biz-1");
  assert.equal(session?.name, "רותי");
  assert.equal(verifySmsSession(token, "other-secret"), null);
  assert.equal(verifySmsSession(`${token}x`, secret), null);
  const expired = signSmsSession(
    {
      userId: "user-1",
      businessId: "biz-1",
      phone: "0501234567",
      name: "רותי",
      businessName: "סטודיו",
      exp: Date.now() - 1,
    },
    secret,
  );
  assert.equal(verifySmsSession(expired, secret), null);
});

test("verifies PayPlus callback hash against the raw body", () => {
  const secret = "payplus-secret";
  const raw = JSON.stringify({
    transaction: {
      uid: "tx-1",
      status_code: "000",
      amount: 130,
      more_info: "order-1",
    },
  });
  const hash = createHmac("sha256", secret).update(raw).digest("base64");
  assert.equal(verifyPayplusHash(raw, hash, secret), true);
  assert.equal(verifyPayplusHash(`${raw} `, hash, secret), false);
  assert.equal(verifyPayplusHash(raw, "nope", secret), false);
  assert.equal(verifyPayplusHash(raw, null, secret), false);
  const parsed = parsePayplusCallback(raw);
  assert.equal(parsed.uid, "tx-1");
  assert.equal(parsed.recurringUid, "");
  assert.equal(isSuccessfulPayplusStatus(parsed.statusCode), true);
  assert.equal(isSuccessfulPayplusStatus("001"), false);
  assert.equal(isPayplusUserAgent("PayPlus"), true);
  assert.equal(isPayplusUserAgent("PayPlus/1.0"), true);
  assert.equal(isPayplusUserAgent(null), true);
  assert.equal(isPayplusUserAgent("Mozilla"), false);
});

test("parses PayPlus recurring list rows for admin linking", () => {
  assert.equal(isPayplusUid("67323068-d8fc-417e-8cce-89761d72effd"), true);
  assert.equal(isPayplusUid("not-a-uid"), false);
  const rows = parsePayplusRecurringList({
    data: [
      {
        uid: "67323068-d8fc-417e-8cce-89761d72effd",
        customer_name: "מורית שפירא",
        customer_phone: "0501234567",
        each_payment_amount: 366,
        start_date: "09/09/2026",
        valid: true,
      },
    ],
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.customerName, "מורית שפירא");
  assert.equal(rows[0]?.amount, 366);
  assert.ok(rows[0]?.nextChargeAt);
});

test("computes the next monthly PayPlus charge from the last charge date", () => {
  const next = nextPayplusChargeDate({
    lastChargeDate: "10/09/2026",
    recurringType: "monthly",
    recurringRange: 1,
    now: new Date(2026, 8, 18),
  });
  assert.ok(next);
  assert.equal(new Date(next ?? "").toLocaleDateString("he-IL"), "10.10.2026");
});

test("extracts PayPlus recurring ids from nested callback payloads", () => {
  const parsed = parsePayplusCallback(
    JSON.stringify({
      transaction: {
        uid: "tx-2",
        status_code: "000",
        amount: 352.82,
        more_info: "sub:2f1c0a2a-4b3d-4e5f-8a91-0b1c2d3e4f50",
      },
      recurring_payment: {
        recurring_payment_uid: "rec-99",
        terminal_uid: "term-1",
        customer_uid: "cus-1",
      },
    }),
  );
  assert.equal(parsed.recurringUid, "rec-99");
  assert.equal(parsed.terminalUid, "term-1");
  assert.equal(parsed.customerUid, "cus-1");
  assert.deepEqual(
    extractPayplusRecurringRef({
      recurring_uid: "rec-88",
      terminalUid: "term-2",
    }),
    { recurringUid: "rec-88", terminalUid: "term-2", customerUid: "" },
  );
});

test("allows a 5 agorot amount tolerance and locks fulfillment once", () => {
  assert.equal(amountsMatch(130, 130), true);
  assert.equal(amountsMatch(130.04, 130), true);
  assert.equal(amountsMatch(130.06, 130), false);
  assert.equal(fulfillmentAfterMissedLock("fulfilled"), "idempotent");
  assert.equal(fulfillmentAfterMissedLock("processing"), "idempotent");
  assert.equal(fulfillmentAfterMissedLock("failed"), "retry");
  assert.equal(fulfillmentAfterMissedLock("pending"), "claim");
  assert.equal(fulfillmentAfterMissedLock(null), "reject");
});
