import test from "node:test";
import assert from "node:assert/strict";
import {
  mapBusinessFields,
  mapServices,
  toAppNameEn,
  toEnglishName,
} from "../src/lib/business-onboarding-map.ts";
import {
  canFinishWithoutCards,
  isPaymentRequired,
  missingPaymentFields,
} from "../src/lib/onboarding-payment.ts";

test("app_name_en keeps English letters and numbers and starts with a letter", () => {
  assert.equal(toAppNameEn("Studio Noa"), "StudioNoa");
  assert.equal(toAppNameEn("99nails"), "b99nails");
  assert.equal(toAppNameEn(""), "business");
});

test("Hebrew business names get a latin app_name_en", () => {
  const app = toAppNameEn("סטודיו נועה");
  const english = toEnglishName("סטודיו נועה");
  assert.match(app, /^[A-Za-z][A-Za-z0-9]*$/);
  assert.ok(app.length > 3);
  assert.ok(/[A-Za-z]/.test(english));
});

test("missing required fields fall back without inventing a new form", () => {
  const mapped = mapBusinessFields({
    managerName: "דנה לוי",
    phone: "050-000-0000",
    businessNameHe: "סטודיו נועה",
  });
  assert.equal(mapped.address, "לא צוין");
  assert.equal(mapped.manager_password, "pending-setup");
  assert.equal(mapped.brand_color, "#D4A574");
  assert.equal(mapped.manager_name, "דנה לוי");
  assert.equal(mapped.business_name_he, "סטודיו נועה");
  assert.equal(mapped.plan, null);
  assert.equal(mapped.business_type, null);
  assert.equal(mapped.note, null);
  assert.match(mapped.app_name_en, /^[A-Za-z][A-Za-z0-9]*$/);
});

test("demo save can finish without credit card details", () => {
  assert.equal(isPaymentRequired(), false);
  assert.deepEqual(missingPaymentFields({}), []);
  assert.equal(
    canFinishWithoutCards({
      cardName: "",
      cardNumber: "",
      cardExp: "",
      cardCvv: "",
    }),
    true,
  );
});

test("services skip empty rows and keep numeric price and duration", () => {
  const services = mapServices([
    { name: "  ", price: "80", duration: "30" },
    { name: "תספורת", price: "120", duration: "45" },
  ]);
  assert.deepEqual(services, [
    { name: "תספורת", price: 120, duration_minutes: 45, sort_order: 0 },
  ]);
});
