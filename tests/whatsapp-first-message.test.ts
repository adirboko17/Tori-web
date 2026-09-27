import test from "node:test";
import assert from "node:assert/strict";
import { getFirstLeadMessage, isDefaultNailLeadMessage, leadRoleClause } from "../src/lib/whatsapp/copy.ts";

test("first lead message follows the trade", () => {
  assert.match(getFirstLeadMessage("אדיר", "ספר"), /היי אדיר מה שלומך \?\nהבנתי שאתה ספר , זה נכון \?/);
  assert.match(getFirstLeadMessage("דנה", "ספרית"), /הבנתי שאת ספרית/);
  assert.match(getFirstLeadMessage("נועה", "עיצוב גבות"), /הבנתי שאת מעצבת גבות/);
  assert.match(getFirstLeadMessage("מאיה", "סלון ציפורניים"), /הבנתי שאת בונת ציפורניים/);
});

test("unknown trades stay in the message without assuming nails", () => {
  assert.equal(leadRoleClause("קוסמטיקה"), "התחום שלך הוא קוסמטיקה");
  assert.equal(leadRoleClause(""), "את בונת ציפורניים");
});

test("only the original nail wording counts as the fixed template", () => {
  assert.equal(isDefaultNailLeadMessage(getFirstLeadMessage("דנה", "סלון ציפורניים"), "דנה"), true);
  assert.equal(isDefaultNailLeadMessage(getFirstLeadMessage("אדיר", "ספר"), "אדיר"), false);
});
