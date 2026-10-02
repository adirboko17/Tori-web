import test from "node:test";
import assert from "node:assert/strict";
import { hashManagerPassword } from "../src/lib/account/password.ts";
import {
  entryForAccounts,
  paidAccounts,
  validateAccountProfile,
} from "../src/lib/account/profile.ts";

const base = {
  fullName: "דנה לוי",
  businessName: "סטודיו נועה",
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
  const fresh = {
    paidAt: null,
    businessId: null,
    userId: null,
  };
  assert.equal(entryForAccounts([fresh]), "signup");
  assert.equal(
    entryForAccounts([{ paidAt: null, businessId: "biz", userId: "user" }]),
    "pay",
  );
  assert.equal(
    entryForAccounts([{ paidAt: "2026-10-02T00:00:00Z", businessId: "biz", userId: "user" }]),
    "login",
  );
});
