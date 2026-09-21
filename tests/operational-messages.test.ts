import test from "node:test";
import assert from "node:assert/strict";
import {
  parseOperationalMessageActive,
  parseOperationalMessageInput,
} from "../src/lib/admin/operational-message-parse.ts";

const BUSINESS_ID = "11111111-1111-4111-8111-111111111111";

test("accepts a message for selected businesses", () => {
  const parsed = parseOperationalMessageInput({
    title: "  גרסה חדשה  ",
    body: "יש עדכון בחנות האפליקציות.",
    actionLabel: "להורדה",
    actionUrl: "https://apps.apple.com/app/id1",
    businessIds: [BUSINESS_ID, BUSINESS_ID],
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.value.title, "גרסה חדשה");
  assert.equal(parsed.value.audience, "staff");
  assert.deepEqual(parsed.value.businessIds, [BUSINESS_ID]);
});

test("stores everyone only when that audience is chosen", () => {
  const everyone = parseOperationalMessageInput({
    title: "עדכון",
    body: "תוכן",
    audience: "everyone",
    businessIds: [BUSINESS_ID],
  });
  assert.equal(everyone.ok, true);
  if (!everyone.ok) return;
  assert.equal(everyone.value.audience, "everyone");
  assert.equal(
    parseOperationalMessageInput({
      title: "עדכון",
      body: "תוכן",
      audience: "clients",
      businessIds: [BUSINESS_ID],
    }).ok,
    false,
  );
});

test("rejects a message without customers or with a non-https link", () => {
  assert.equal(
    parseOperationalMessageInput({
      title: "עדכון",
      body: "תוכן",
      businessIds: [],
    }).ok,
    false,
  );
  const link = parseOperationalMessageInput({
    title: "עדכון",
    body: "תוכן",
    actionUrl: "http://example.com",
    businessIds: [BUSINESS_ID],
  });
  assert.equal(link.ok, false);
});

test("requires an explicit active flag", () => {
  assert.equal(parseOperationalMessageActive({}).ok, false);
  const parsed = parseOperationalMessageActive({ active: false });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.active, false);
});
