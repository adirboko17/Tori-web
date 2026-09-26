import test from "node:test";
import assert from "node:assert/strict";
import {
  readBearerToken,
  signAdminSession,
  verifyAdminSession,
} from "../src/lib/admin/session-token.ts";
import {
  adminPushEvents,
  chunk,
  israelDateKey,
  normalizePreferences,
  parsePreferencesInput,
  parsePushTokenInput,
  wantsPush,
} from "../src/lib/admin/push-shared.ts";
import { redactBusinessDetails } from "../src/lib/superadmin/redact-details.ts";

const SECRET = "test-secret-with-enough-length-1234567890";

test("readBearerToken accepts only a well-formed Bearer header", () => {
  assert.equal(readBearerToken("Bearer abc.def"), "abc.def");
  assert.equal(readBearerToken("bearer   abc.def  "), "abc.def");
  assert.equal(readBearerToken("Basic abc"), null);
  assert.equal(readBearerToken("Bearer"), null);
  assert.equal(readBearerToken("Bearer a b"), null);
  assert.equal(readBearerToken(null), null);
  assert.equal(readBearerToken(undefined), null);
});

test("a Bearer token is the same signed session as the cookie", async () => {
  const token = await signAdminSession(
    { userId: "u1", phone: "0501234567", name: "מנהל", exp: Date.now() + 60_000 },
    SECRET,
  );
  const fromHeader = readBearerToken(`Bearer ${token}`);
  const session = await verifyAdminSession(String(fromHeader), SECRET);
  assert.equal(session?.userId, "u1");
  assert.equal(await verifyAdminSession(`${token}x`, SECRET), null);
  assert.equal(await verifyAdminSession(token, `${SECRET}-other`), null);
});

test("push preferences default to on and ignore unknown stored keys", () => {
  const prefs = normalizePreferences({ enabled: true, types: { new_client: false, junk: false } });
  assert.equal(prefs.types.new_client, false);
  assert.equal(prefs.types.new_business, true);
  assert.equal(wantsPush(prefs, "new_client"), false);
  assert.equal(wantsPush(prefs, "whatsapp_human"), true);
  assert.equal(normalizePreferences(null).enabled, true);
  assert.equal(wantsPush({ ...prefs, enabled: false }, "new_business"), false);
});

test("parsePreferencesInput validates keys and values", () => {
  assert.equal(parsePreferencesInput({ types: {} }).ok, false);
  assert.equal(parsePreferencesInput({ enabled: true, types: { nope: true } }).ok, false);
  assert.equal(parsePreferencesInput({ enabled: true, types: { new_client: "no" } }).ok, false);
  const parsed = parsePreferencesInput({ enabled: false, types: { new_client: false } });
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.value.enabled, false);
    assert.equal(parsed.value.types.new_client, false);
    assert.equal(parsed.value.types.account_deletion, true);
  }
});

test("parsePushTokenInput accepts Expo tokens only", () => {
  const good = {
    token: "ExponentPushToken[abcdefghijklmnop]",
    platform: "ios",
    deviceId: "2f1c7a0e-3b1d-4c55-9a0b-0b8f0f6a1c22",
  };
  assert.equal(parsePushTokenInput(good).ok, true);
  assert.equal(parsePushTokenInput({ ...good, token: "fcm-raw-token" }).ok, false);
  assert.equal(parsePushTokenInput({ ...good, platform: "web" }).ok, false);
  assert.equal(parsePushTokenInput({ ...good, deviceId: "x" }).ok, false);
});

test("daily event keys use the Israel calendar day", () => {
  assert.equal(israelDateKey(new Date("2026-03-10T21:30:00Z")), "2026-03-10");
  assert.equal(israelDateKey(new Date("2026-03-10T22:30:00Z")), "2026-03-11");
  const a = adminPushEvents.smsLow({ businessId: "b1", businessName: "x", credits: 5, day: "2026-03-11" });
  const b = adminPushEvents.smsLow({ businessId: "b1", businessName: "x", credits: 1, day: "2026-03-11" });
  assert.equal(a.key, b.key);
  assert.equal(a.url, "/business/b1?tab=sms");
  assert.equal(adminPushEvents.mainLow({ credits: 1, required: 2, day: "2026-03-11" }).key, "pulseem_main_low:2026-03-11");
});

test("event routes match the mobile app screens", () => {
  assert.equal(adminPushEvents.newBusiness({ businessId: "b", businessName: "n" }).url, "/business/b");
  assert.equal(
    adminPushEvents.newClient({ userId: "u", clientName: "", businessId: "b", businessName: "n" }).url,
    "/business/b?tab=people",
  );
  assert.equal(
    adminPushEvents.purchaseFailed({ orderId: "o", businessId: "b", businessName: "n", reason: "" }).url,
    "/business/b?tab=billing",
  );
  assert.equal(adminPushEvents.accountDeletion({ requestId: "r", fullName: "a", appName: "b" }).url, "/requests?view=deletions");
  assert.equal(adminPushEvents.whatsappHuman({ phone: "972501234567", name: "", at: "t" }).body, "972501234567");
});

test("chunk splits into Expo-sized batches", () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(chunk([], 100), []);
});

test("redactBusinessDetails drops secrets and text branding files", () => {
  const redacted = redactBusinessDetails({
    profile: {
      id: "b",
      display_name: "Salon",
      pulseem_password: "cipher",
      pulseem_api_key: "cipher",
      pulseem_user_id: "login",
      pulseem_has_password: true,
    },
    users: [],
    services: [],
    brandingFiles: [
      { name: ".env", path: "p", publicUrl: "u", size: 1, updatedAt: null, content: "SECRET=1" },
      { name: "theme.json", path: "p", publicUrl: "u", size: 1, updatedAt: null, content: "{}" },
      { name: "icon.png", path: "p", publicUrl: "u", size: 1, updatedAt: null, content: null },
    ],
    brandingFolder: "salon",
  });
  assert.equal(redacted.profile?.pulseem_password, undefined);
  assert.equal(redacted.profile?.pulseem_api_key, undefined);
  assert.equal(redacted.profile?.pulseem_user_id, undefined);
  assert.equal(redacted.profile?.pulseem_has_user_id, true);
  assert.equal(redacted.profile?.display_name, "Salon");
  assert.deepEqual(redacted.brandingFiles.map((file) => file.name), ["icon.png"]);
});
