import test from "node:test";
import assert from "node:assert/strict";
import { expectedMonthlyRevenue } from "../src/lib/admin/mrr.ts";

test("sums each standing-order amount instead of the catalog price", () => {
  const mrr = expectedMonthlyRevenue([180, 240.5], 299);
  assert.equal(mrr.totalIls, 420.5);
  assert.equal(mrr.source, "recurring");
  assert.equal(mrr.uniformIls, null);
  assert.deepEqual(mrr.amountsIls, [180, 240.5]);
});

test("keeps a single multiplier when every standing order charges the same amount", () => {
  const mrr = expectedMonthlyRevenue([150, 150], 299);
  assert.equal(mrr.totalIls, 300);
  assert.equal(mrr.source, "recurring");
  assert.equal(mrr.uniformIls, 150);
});

test("fills only the missing standing orders from the catalog price", () => {
  const mrr = expectedMonthlyRevenue([180, null], 299);
  assert.equal(mrr.totalIls, 479);
  assert.equal(mrr.source, "mixed");
  assert.equal(mrr.uniformIls, null);
});

test("uses the catalog price when no standing-order amount is available", () => {
  const mrr = expectedMonthlyRevenue([null, undefined], 299);
  assert.equal(mrr.totalIls, 598);
  assert.equal(mrr.source, "catalog");
  assert.equal(mrr.uniformIls, null);
});
