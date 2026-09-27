import test from "node:test";
import assert from "node:assert/strict";
import {
  ACCESS_CODE_LOCK_SECONDS,
  ACCESS_CODE_MAX_FAILURES,
  CODE_REJECTED,
  PHONE_REJECTED,
  accessCodeMatches,
} from "../src/lib/admin/access-code.ts";

test("the shared access code matches only the server value", () => {
  assert.equal(accessCodeMatches("123456"), true);
  assert.equal(accessCodeMatches("12 34 56"), true);
  assert.equal(accessCodeMatches("000000"), false);
  assert.equal(accessCodeMatches("12345"), false);
  assert.equal(accessCodeMatches("1234567"), false);
  assert.equal(accessCodeMatches(""), false);
});

test("login copy does not reveal whether a phone is registered", () => {
  assert.equal(PHONE_REJECTED.includes("לא מזוהה"), false);
  assert.equal(CODE_REJECTED, "הקוד שגוי. נסו שוב.");
  assert.equal(ACCESS_CODE_MAX_FAILURES, 5);
  assert.equal(ACCESS_CODE_LOCK_SECONDS, 15 * 60);
});
