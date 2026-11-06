import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  facebookSignatureMatches,
  leadgenChanges,
  mapFacebookLead,
  tokensMatch,
} from "../src/lib/facebook/leadgen.ts";

test("webhook verify token matches only the exact value", () => {
  assert.equal(tokensMatch("tori-leads-2026", "tori-leads-2026"), true);
  assert.equal(tokensMatch("tori-leads-2026", "tori-leads-2027"), false);
  assert.equal(tokensMatch("", "tori-leads-2026"), false);
});

test("webhook signature uses the raw body", () => {
  const body = '{"object":"page"}';
  const header = `sha256=${createHmac("sha256", "secret").update(body).digest("hex")}`;
  assert.equal(facebookSignatureMatches("secret", body, header), true);
  assert.equal(facebookSignatureMatches("secret", body + " ", header), false);
  assert.equal(facebookSignatureMatches("secret", body, null), false);
});

test("leadgen notification keeps only lead ids", () => {
  const changes = leadgenChanges({
    entry: [
      {
        changes: [
          { field: "feed", value: { leadgen_id: "nope" } },
          { field: "leadgen", value: { leadgen_id: "123", form_id: "9", ad_id: "8", page_id: "7" } },
        ],
      },
    ],
  });
  assert.deepEqual(changes, [{ leadgenId: "123", formId: "9", adId: "8", pageId: "7" }]);
});

test("a long question that mentions the business is kept in the notes", () => {
  const lead = mapFacebookLead([
    { name: "שם_מלא", values: ["Heli Telias"] },
    { name: "מספר_טלפון", values: ["+972508365359"] },
    { name: "יש_לך_כבר_אפליקציה_לקביעת_תורים_בעסק?", values: ["כן,_יש_לי"] },
  ]);
  assert.equal(lead.name, "Heli Telias");
  assert.equal(lead.business, "");
  assert.match(lead.notes, /יש לך כבר אפליקציה לקביעת תורים בעסק\?: כן, יש לי/);
});

test("facebook form answers become a lead", () => {
  const lead = mapFacebookLead(
    [
      { name: "full_name", values: ["נועה כהן"] },
      { name: "phone_number", values: ["+972 50-123-4567"] },
      { name: "תחום העסק", values: ["ציפורניים"] },
      { name: "email", values: ["noa@example.com"] },
    ],
    { campaignName: "קמפיין אביב", campaignId: "55", adId: "8" },
  );
  assert.equal(lead.name, "נועה כהן");
  assert.equal(lead.phone, "+972 50-123-4567");
  assert.equal(lead.businessType, "ציפורניים");
  assert.match(lead.notes, /קמפיין: קמפיין אביב 55/);
  assert.match(lead.notes, /email: noa@example.com/);
});
