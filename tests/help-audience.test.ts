import test from "node:test";
import assert from "node:assert/strict";
import { HELP_AUDIENCES, readHelpVideoAudience } from "../src/lib/superadmin/help-shared.ts";

test("help audiences are the three app roles, in Hebrew", () => {
  assert.deepEqual(
    HELP_AUDIENCES.map((item) => [item.value, item.label]),
    [
      ["admin", "מנהל"],
      ["client", "לקוח"],
      ["all", "כולם"],
    ],
  );
});

test("a blank video audience inherits the category", () => {
  assert.equal(readHelpVideoAudience(undefined), null);
  assert.equal(readHelpVideoAudience(null), null);
  assert.equal(readHelpVideoAudience(""), null);
  assert.equal(readHelpVideoAudience("inherit"), null);
});

test("a video audience stores only admin, client, or all", () => {
  assert.equal(readHelpVideoAudience("admin"), "admin");
  assert.equal(readHelpVideoAudience("client"), "client");
  assert.equal(readHelpVideoAudience("all"), "all");
  assert.equal(readHelpVideoAudience("managers"), "invalid");
  assert.equal(readHelpVideoAudience("everyone"), "invalid");
});
