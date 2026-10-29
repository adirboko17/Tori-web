/** Columns returned to the admin UI. `device_key` is intentionally absent. */
export const DEVICE_LIST_SELECT =
  "id, user_id, platform, app_version, last_seen_at, revoked_at, users!user_devices_user_id_fkey(name, phone, user_type)";

export type DeviceUser = {
  name: string | null;
  phone: string | null;
  user_type: string | null;
};

export type DeviceRow = {
  id: string;
  user_id: string;
  platform: string;
  app_version: string | null;
  last_seen_at: string;
  revoked_at: string | null;
  users: DeviceUser | DeviceUser[] | null;
};

export type AdminDevice = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  userType: string;
  platform: string;
  appVersion: string | null;
  lastSeenAt: string;
  revokedAt: string | null;
};

function oneUser(users: DeviceRow["users"]): DeviceUser | null {
  if (!users) return null;
  return Array.isArray(users) ? (users[0] ?? null) : users;
}

export function toAdminDevice(row: DeviceRow): AdminDevice {
  const user = oneUser(row.users);
  return {
    id: row.id,
    userId: row.user_id,
    name: user?.name?.trim() ?? "",
    phone: user?.phone?.trim() ?? "",
    userType: user?.user_type?.trim() ?? "",
    platform: row.platform,
    appVersion: row.app_version,
    lastSeenAt: row.last_seen_at,
    revokedAt: row.revoked_at,
  };
}

/** Next session generation. Never returns a value lower than the current one. */
export function nextSessionVersion(current: number): number {
  if (!Number.isInteger(current) || current < 0 || current >= Number.MAX_SAFE_INTEGER) {
    throw new Error("גרסת ההתחברות לא תקינה");
  }
  return current + 1;
}
