import test from "node:test";
import assert from "node:assert/strict";
import { hashManagerPassword } from "../src/lib/account/password.ts";
import {
  checkoutIdOf,
  entryForAccounts,
  paidAccounts,
  payableAccounts,
  validateAccountProfile,
} from "../src/lib/account/profile.ts";
import {
  purchaseCandidateIds,
  recurringMatchesPhone,
} from "../src/lib/account/resume-paid-match.ts";

const base = {
  fullName: "דנה לוי",
  businessName: "Studio Noa",
  email: "noa@studio.co.il",
  appNameEn: "Studio Noa",
  address: "הרצל 12",
  idNumber: "123456789",
  receiptName: "",
  receiptVat: "",
  language: "he",
  brandColor: "#d4a574",
  password: "",
  services: [{ name: "תספורת", price: 120, durationMinutes: 45 }],
  design: { fromNumber: "StudioNoa" },
};

test("profile keeps the fields that move out of the short signup form", () => {
  const result = validateAccountProfile(base);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.appNameEn, "StudioNoa");
  assert.equal(result.value.email, "noa@studio.co.il");
  assert.equal(result.value.idNumber, "123456789");
  assert.equal(result.value.services[0]?.durationMinutes, 45);
});

test("profile rejects a short identity and a bad id number", () => {
  assert.equal(validateAccountProfile({ ...base, fullName: "ד" }).ok, false);
  assert.equal(validateAccountProfile({ ...base, idNumber: "123" }).ok, false);
  assert.equal(validateAccountProfile({ ...base, language: "fr" }).ok, false);
});

test("profile requires the app name saved as display_name to be English", () => {
  const hebrew = validateAccountProfile({ ...base, businessName: "סטודיו נועה" });
  assert.equal(hebrew.ok, false);
  const english = validateAccountProfile({ ...base, businessName: "Studio Noa" });
  assert.equal(english.ok, true);
  if (english.ok) assert.equal(english.value.businessName, "Studio Noa");
});

test("manager password matches the app hash", () => {
  assert.equal(hashManagerPassword("654321"), "hash_654321");
  assert.equal(hashManagerPassword("123456"), "default_hash");
});

test("only a paid account linked to a user can sign in", () => {
  const account = {
    id: "1",
    phone: "0500000000",
    fullName: "דנה לוי",
    businessName: "סטודיו נועה",
    paidAt: null,
    businessId: "biz",
    userId: "user",
    email: "",
    appNameEn: "",
    address: "",
    idNumber: "",
    receiptName: "",
    receiptVat: "",
    language: "he",
    brandColor: "",
  };
  assert.equal(paidAccounts([account]).length, 0);
  assert.equal(paidAccounts([{ ...account, paidAt: "2026-10-02T00:00:00Z" }]).length, 1);
  assert.equal(
    paidAccounts([{ ...account, paidAt: "2026-10-02T00:00:00Z", userId: null }]).length,
    0,
  );
});

test("a new phone signs up, an unpaid user pays, and a paid user enters", () => {
  const row = {
    id: "signup-1",
    fullName: "דנה לוי",
    paidAt: null,
    businessId: null,
    userId: null,
  };
  assert.equal(entryForAccounts([]), "signup");
  assert.equal(entryForAccounts([{ ...row, fullName: "" }]), "signup");
  assert.equal(
    entryForAccounts([{ ...row, businessId: "biz", userId: "user" }]),
    "pay",
  );
  assert.equal(
    entryForAccounts([
      { ...row, paidAt: "2026-10-02T00:00:00Z", businessId: "biz", userId: "user" },
    ]),
    "login",
  );
});

test("a signup that filled in details but left before paying continues to payment", () => {
  const pending = {
    id: "signup-1",
    fullName: "דנה לוי",
    paidAt: null,
    businessId: null,
    userId: null,
  };
  assert.equal(entryForAccounts([pending]), "pay");
  assert.deepEqual(payableAccounts([pending]), [pending]);
  // PayPlus stored the signup row id on the charge; it becomes the business id once paid.
  assert.equal(checkoutIdOf(pending), "signup-1");
  assert.equal(checkoutIdOf({ ...pending, businessId: "biz" }), "biz");
  // An older signup whose business exists but has no admin user cannot be charged yet.
  assert.equal(entryForAccounts([{ ...pending, businessId: "biz" }]), "signup");
});

test("a returning purchase is matched by the signup id and the same mobile", () => {
  assert.deepEqual(
    purchaseCandidateIds({
      checkoutId: "signup-1",
      accounts: [
        { id: "signup-1", businessId: null },
        { id: "other", businessId: "biz-2" },
      ],
    }),
    ["signup-1", "biz-2", "other"],
  );
  assert.equal(recurringMatchesPhone("+972501234567", "0501234567"), true);
  assert.equal(recurringMatchesPhone("0509999999", "0501234567"), false);
});
