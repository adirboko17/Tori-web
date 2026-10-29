import test from "node:test";
import assert from "node:assert/strict";
import { formatIsraelDateTime } from "../src/app/admin/_ui/format.ts";
import {
  DEVICE_LIST_SELECT,
  nextSessionVersion,
  toAdminDevice,
  type DeviceRow,
} from "../src/lib/admin/user-device-view.ts";

const row: DeviceRow = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "22222222-2222-4222-8222-222222222222",
  platform: "ios",
  app_version: "2.4.0",
  last_seen_at: "2026-10-29T22:30:00.000Z",
  revoked_at: null,
  users: { name: "  דנה  ", phone: " 0520000000 ", user_type: "admin" },
};

test("device list never selects the installation key", () => {
  assert.equal(DEVICE_LIST_SELECT.includes("device_key"), false);
  assert.equal(DEVICE_LIST_SELECT.includes("password"), false);
  assert.equal(DEVICE_LIST_SELECT.includes("session_version"), false);
});

test("admin device view drops the installation key and trims the user", () => {
  const device = toAdminDevice({
    ...row,
    users: [{ name: "יוסי", phone: "0501111111", user_type: "client" }],
  });
  assert.deepEqual(Object.keys(device).sort(), [
    "appVersion",
    "id",
    "lastSeenAt",
    "name",
    "phone",
    "platform",
    "revokedAt",
    "userId",
    "userType",
  ]);
  assert.equal("device_key" in device, false);
  assert.equal(device.name, "יוסי");
  assert.equal(device.userType, "client");
  assert.equal(toAdminDevice(row).name, "דנה");
  assert.equal(toAdminDevice(row).phone, "0520000000");
});

test("session version only moves up by one", () => {
  assert.equal(nextSessionVersion(1), 2);
  assert.equal(nextSessionVersion(8), 9);
  assert.throws(() => nextSessionVersion(-1));
  assert.throws(() => nextSessionVersion(1.5));
  assert.throws(() => nextSessionVersion(Number.NaN));
});

test("last seen uses the Israel clock", () => {
  const winter = formatIsraelDateTime("2026-01-15T22:30:00.000Z");
  assert.match(winter, /16/);
  assert.match(winter, /00:30/);
  const summer = formatIsraelDateTime("2026-07-15T21:30:00.000Z");
  assert.match(summer, /16/);
  assert.match(summer, /00:30/);
  assert.equal(formatIsraelDateTime(null), "—");
});
