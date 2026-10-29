"use client";

import { useMemo, useState } from "react";
import { adminJson } from "@/lib/superadmin/browser";
import { useAdminData } from "../../../../_ui/use-admin-data";
import { useConfirm, useToast } from "../../../../_ui/feedback";
import { formatIsraelDateTime } from "../../../../_ui/format";
import { Icon } from "../../../../_ui/icon";
import { Badge, EmptyState, ErrorState, SearchField, SkeletonRows } from "../../../../_ui/parts";

type AdminDevice = {
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


function platformLabel(platform: string) {
  if (platform === "ios") return "אייפון";
  if (platform === "android") return "אנדרואיד";
  if (platform === "web") return "אתר";
  return platform || "—";
}

function roleLabel(userType: string) {
  if (userType === "admin") return "מנהל";
  if (userType === "client") return "לקוח";
  return userType || "—";
}

export function DevicesTab({ businessId }: { businessId: string }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState("");
  const devices = useAdminData<{ devices: AdminDevice[] }>(`/api/admin/apps/${businessId}/devices`);

  const rows = useMemo(() => {
    const list = devices.data?.devices ?? [];
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? list.filter((device) =>
          `${device.name} ${device.phone} ${platformLabel(device.platform)} ${device.appVersion ?? ""}`
            .toLowerCase()
            .includes(needle),
        )
      : list;
    return filtered.toSorted((a, b) => {
      const byName = a.name.localeCompare(b.name, "he");
      if (byName !== 0) return byName;
      return b.lastSeenAt.localeCompare(a.lastSeenAt);
    });
  }, [devices.data, query]);

  const userActionRow = useMemo(() => {
    const first = new Map<string, string>();
    for (const device of rows) {
      if (!first.has(device.userId)) first.set(device.userId, device.id);
    }
    return first;
  }, [rows]);

  async function revokeDevice(device: AdminDevice) {
    if (pending || device.revokedAt) return;
    const name = device.name || device.phone || "המשתמש";
    const ok = await confirm({
      title: `לנתק את המכשיר של ${name}?`,
      body: "הטלפון יחזור למסך הכניסה. אם ייכנסו שוב עם הקוד הנוכחי, המכשיר הזה יתחבר מחדש.",
      confirmLabel: "נתק מכשיר",
      tone: "danger",
    });
    if (!ok) return;
    setPending(`device:${device.id}`);
    try {
      await adminJson(`/api/admin/apps/${businessId}/devices`, {
        method: "POST",
        body: JSON.stringify({ deviceId: device.id }),
      });
      toast.success(`המכשיר של ${name} נותק`);
      devices.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ניתוק המכשיר נכשל");
    } finally {
      setPending("");
    }
  }

  async function revokeUser(device: AdminDevice) {
    if (pending) return;
    const name = device.name || device.phone || "המשתמש";
    const ok = await confirm({
      title: `לנתק את כל המכשירים של ${name}?`,
      body: "כל הטלפונים של החשבון יחזרו למסך הכניסה. כניסה מחדש אפשרית עם הקוד הנוכחי.",
      confirmLabel: "נתק את כל המכשירים",
      tone: "danger",
    });
    if (!ok) return;
    setPending(`user:${device.userId}`);
    try {
      await adminJson(`/api/admin/apps/${businessId}/devices`, {
        method: "POST",
        body: JSON.stringify({ userId: device.userId }),
      });
      toast.success(`כל המכשירים של ${name} נותקו`);
      devices.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ניתוק המכשירים נכשל");
    } finally {
      setPending("");
    }
  }

  const list = devices.data?.devices ?? [];
  const connected = list.filter((device) => !device.revokedAt).length;

  return (
    <section className="ad-card">
      <div className="ad-card-head">
        <div>
          <h2>
            <Icon name="smartphone" />
            מכשירים
          </h2>
          <p>רק טלפונים עם הגרסה החדשה של האפליקציה מופיעים כאן.</p>
        </div>
        {list.length > 0 ? (
          <span className="ad-small ad-muted">
            {connected} מחוברים מתוך {list.length}
          </span>
        ) : null}
      </div>

      {devices.loading ? <SkeletonRows rows={4} /> : null}

      {devices.error && !devices.data ? (
        <ErrorState message={devices.error} onRetry={devices.reload} />
      ) : null}

      {devices.data && list.length === 0 ? (
        <EmptyState
          icon="smartphone"
          title="עדיין אין מכשירים"
          body="הם יופיעו אחרי שמשתמשים יעדכנו לגרסה החדשה ויפתחו את האפליקציה."
        />
      ) : null}

      {devices.data && list.length > 0 ? (
        <>
          <div className="ad-toolbar">
            <SearchField value={query} onChange={setQuery} placeholder="חיפוש לפי שם, טלפון או גרסה" />
          </div>
          {rows.length === 0 ? (
            <EmptyState icon="search" title="לא נמצאו מכשירים" body="נסו חיפוש אחר." />
          ) : (
            <div className="ad-table-wrap">
              <table className="ad-table is-responsive">
                <thead>
                  <tr>
                    <th>שם</th>
                    <th>טלפון</th>
                    <th>סוג</th>
                    <th>מכשיר</th>
                    <th>גרסה</th>
                    <th>נראה לאחרונה</th>
                    <th>סטטוס</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((device) => {
                    const name = device.name || "—";
                    const disconnected = Boolean(device.revokedAt);
                    const busy = pending !== "";
                    return (
                      <tr key={device.id}>
                        <td className="is-primary" data-label="שם">
                          {name}
                        </td>
                        <td data-label="טלפון" dir="ltr" className="is-nowrap">
                          {device.phone || "—"}
                        </td>
                        <td data-label="סוג">
                          <Badge tone={device.userType === "admin" ? "brand" : "neutral"}>
                            {roleLabel(device.userType)}
                          </Badge>
                        </td>
                        <td data-label="מכשיר">{platformLabel(device.platform)}</td>
                        <td data-label="גרסה" dir="ltr" className="is-nowrap">
                          {device.appVersion || "—"}
                        </td>
                        <td data-label="נראה לאחרונה" className="is-nowrap">
                          <time dateTime={device.lastSeenAt}>{formatIsraelDateTime(device.lastSeenAt)}</time>
                        </td>
                        <td data-label="סטטוס">
                          <Badge tone={disconnected ? "neutral" : "success"} dot>
                            {disconnected ? "מנותק" : "מחובר"}
                          </Badge>
                        </td>
                        <td className="is-actions">
                          <div className="ad-row">
                            <button
                              type="button"
                              className="ad-btn is-danger-ghost is-sm"
                              disabled={busy || disconnected}
                              onClick={() => void revokeDevice(device)}
                            >
                              {pending === `device:${device.id}` ? "מנתק…" : "נתק מכשיר"}
                            </button>
                            {userActionRow.get(device.userId) === device.id ? (
                              <button
                                type="button"
                                className="ad-btn is-danger-ghost is-sm"
                                disabled={busy}
                                onClick={() => void revokeUser(device)}
                              >
                                {pending === `user:${device.userId}` ? "מנתק…" : "נתק את כל המכשירים"}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
