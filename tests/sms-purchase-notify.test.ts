import test from "node:test";
import assert from "node:assert/strict";
import {
  newAppSmsText,
  purchaseBuyerLabel,
  purchaseSmsText,
} from "../src/lib/sms/purchase-sms-text.ts";

test("purchase SMS names the business, the manager, and the amount", () => {
  const buyer = purchaseBuyerLabel({
    businessName: "סטודיו נועה",
    adminName: "דנה לוי",
    phone: "050-123-4567",
  });
  assert.equal(
    purchaseSmsText({ buyer, credits: 1000 }),
    "סטודיו נועה — דנה לוי, 050-123-4567 קנה 1000 הודעות",
  );
});

test("new app SMS names who bought it", () => {
  const buyer = purchaseBuyerLabel({
    businessName: "סטודיו נועה",
    adminName: "דנה לוי",
    phone: "050-123-4567",
  });
  assert.equal(
    newAppSmsText({ buyer }),
    "אפליקציה חדשה: סטודיו נועה — דנה לוי, 050-123-4567 נרכשה בהצלחה",
  );
});

test("purchase SMS falls back to the business name when there is no manager", () => {
  assert.equal(
    purchaseSmsText({
      buyer: purchaseBuyerLabel({ businessName: "סטודיו נועה", phone: "" }),
      credits: 500.8,
    }),
    "סטודיו נועה קנה 500 הודעות",
  );
});
