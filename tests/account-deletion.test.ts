import test from "node:test";
import assert from "node:assert/strict";
import { parseAccountDeletionInput } from "../src/lib/account-deletion-parse.ts";

test("accepts a confirmed Israeli mobile deletion request", () => {
  const parsed = parseAccountDeletionInput({
    fullName: "  ישראל ישראלי ",
    phone: "050-1234567",
    appName: "עמית סניור",
    note: "  ",
    confirm: true,
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.value.fullName, "ישראל ישראלי");
  assert.equal(parsed.value.phone, "0501234567");
  assert.equal(parsed.value.note, "");
});

test("rejects a deletion request without confirmation or a valid phone", () => {
  assert.equal(
    parseAccountDeletionInput({
      fullName: "ישראל ישראלי",
      phone: "0501234567",
      appName: "עמית סניור",
      confirm: false,
    }).ok,
    false,
  );
  assert.equal(
    parseAccountDeletionInput({
      fullName: "ישראל ישראלי",
      phone: "123",
      appName: "עמית סניור",
      confirm: true,
    }).ok,
    false,
  );
});
