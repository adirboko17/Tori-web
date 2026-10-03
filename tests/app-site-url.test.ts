import assert from "node:assert/strict";
import test from "node:test";
import { appSiteUrl } from "../src/lib/admin/app-site-url.ts";

test("lowercases the code name onto the apps site", () => {
  assert.equal(appSiteUrl("Leapolsky"), "https://toriapp.co.il/leapolsky");
});

test("keeps digits and hyphens", () => {
  assert.equal(appSiteUrl("Leap-01"), "https://toriapp.co.il/leap-01");
});

test("trims surrounding spaces before checking the name", () => {
  assert.equal(appSiteUrl("  Leapolsky  "), "https://toriapp.co.il/leapolsky");
});

test("accepts a name of 64 characters", () => {
  const name = "a".repeat(64);
  assert.equal(appSiteUrl(name), `https://toriapp.co.il/${name}`);
});

test("hides the link when the name is empty or not a code name", () => {
  assert.equal(appSiteUrl(null), null);
  assert.equal(appSiteUrl(undefined), null);
  assert.equal(appSiteUrl(""), null);
  assert.equal(appSiteUrl("   "), null);
  assert.equal(appSiteUrl("לאפולי"), null);
  assert.equal(appSiteUrl("leap olsky"), null);
  assert.equal(appSiteUrl("leap_olsky"), null);
  assert.equal(appSiteUrl("leap.olsky"), null);
  assert.equal(appSiteUrl("a".repeat(65)), null);
});
