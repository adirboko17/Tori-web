"use client";

import { useMemo, useState } from "react";
import { adminJson } from "@/lib/superadmin/browser";
import { Drawer } from "../../../_ui/drawer";
import { useConfirm, useToast } from "../../../_ui/feedback";
import { Icon } from "../../../_ui/icon";
import { EmptyState, ErrorState, Field, SearchField, SkeletonRows } from "../../../_ui/parts";
import { useAdminData } from "../../../_ui/use-admin-data";

type PrivacyApp = { id: string; name: string; bundle_id: string };

const BUNDLE_RE = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/;

function AppDrawer({ app, onClose, onSaved }: { app: PrivacyApp | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [name, setName] = useState(app?.name ?? "");
  const [bundleId, setBundleId] = useState(app?.bundle_id ?? "");
  const [pending, setPending] = useState(false);
  const bundleError = bundleId.trim() && !BUNDLE_RE.test(bundleId.trim()) ? "מבנה כמו com.tori.salon" : "";
  const valid = name.trim() && bundleId.trim() && !bundleError;

  async function save() {
    if (!valid) return;
    setPending(true);
    try {
      const body = JSON.stringify({ name: name.trim(), bundleId: bundleId.trim() });
      if (app) await adminJson(`/api/admin/privacy-apps/${app.id}`, { method: "PATCH", body });
      else await adminJson("/api/admin/privacy-apps", { method: "POST", body });
      toast.success(app ? "האפליקציה עודכנה" : "האפליקציה נוספה למדיניות");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "השמירה נכשלה");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!app) return;
    const ok = await confirm({
      title: `להסיר את "${app.name}"?`,
      body: "האפליקציה לא תופיע יותר בעמוד מדיניות הפרטיות.",
      confirmLabel: "הסרה",
      tone: "danger",
    });
    if (!ok) return;
    setPending(true);
    try {
      await adminJson(`/api/admin/privacy-apps/${app.id}`, { method: "DELETE" });
      toast.success("האפליקציה הוסרה");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ההסרה נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={app ? "עריכת אפליקציה" : "אפליקציה חדשה"}
      description="השם ומזהה החבילה מופיעים בעמוד מדיניות הפרטיות הציבורי."
      onSubmit={() => void save()}
      footer={
        <>
          <button type="submit" className="ad-btn is-primary" disabled={!valid || pending}>
            {pending ? "שומר…" : app ? "שמירה" : "הוספה"}
          </button>
          <button type="button" className="ad-btn is-secondary" onClick={onClose}>
            ביטול
          </button>
          {app ? (
            <>
              <span className="ad-spacer" />
              <button type="button" className="ad-btn is-danger-ghost" disabled={pending} onClick={() => void remove()}>
                <Icon name="trash-2" size={16} />
                הסרה
              </button>
            </>
          ) : null}
        </>
      }
    >
      <Field label="שם האפליקציה">
        <input className="ad-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="למשל: מספרת דנה" />
      </Field>
      <Field label="מזהה חבילה (Bundle ID)" error={bundleError} hint="כמו שמופיע ב-App Store וב-Google Play">
        <input
          className="ad-input"
          dir="ltr"
          value={bundleId}
          onChange={(event) => setBundleId(event.target.value)}
          placeholder="com.tori.salon"
        />
      </Field>
    </Drawer>
  );
}

export default function PrivacyAppsPage() {
  const { data, error, loading, reload } = useAdminData<{ apps: PrivacyApp[] }>("/api/admin/privacy-apps");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<PrivacyApp | "new" | null>(null);
  const apps = useMemo(() => data?.apps ?? [], [data]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return apps;
    return apps.filter((app) => `${app.name} ${app.bundle_id}`.toLowerCase().includes(needle));
  }, [apps, query]);

  return (
    <section className="ad-card">
      <div className="ad-toolbar">
        <SearchField value={query} onChange={setQuery} placeholder="חיפוש לפי שם או מזהה" />
        <a className="ad-btn is-ghost is-sm" href="/app-privacy" target="_blank" rel="noreferrer">
          <Icon name="external-link" size={16} />
          לעמוד הציבורי
        </a>
        <span className="ad-spacer" />
        <button type="button" className="ad-btn is-primary is-sm" onClick={() => setEditing("new")}>
          <Icon name="plus" size={16} />
          אפליקציה חדשה
        </button>
      </div>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonRows rows={4} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon="shield"
          title={apps.length ? "לא נמצאו אפליקציות" : "אין אפליקציות ברשימה"}
          body={apps.length ? "נסו חיפוש אחר." : "כל אפליקציה שמתפרסמת בחנויות צריכה להופיע במדיניות הפרטיות."}
        />
      ) : (
        <>
          <div className="ad-table-wrap">
            <table className="ad-table is-responsive">
              <thead>
                <tr>
                  <th>אפליקציה</th>
                  <th>מזהה חבילה</th>
                  <th className="is-actions" aria-label="פעולות" />
                </tr>
              </thead>
              <tbody>
                {visible.map((app) => (
                  <tr key={app.id} className="is-clickable" onClick={() => setEditing(app)}>
                    <td className="is-primary" data-label="אפליקציה">
                      <strong>{app.name}</strong>
                    </td>
                    <td data-label="מזהה חבילה">
                      <span className="ad-ltr ad-muted">{app.bundle_id}</span>
                    </td>
                    <td className="is-actions">
                      <button
                        type="button"
                        className="ad-icon-btn"
                        aria-label={`עריכת ${app.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditing(app);
                        }}
                      >
                        <Icon name="pencil" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ad-table-foot">{apps.length} אפליקציות במדיניות</div>
        </>
      )}

      {editing ? (
        <AppDrawer
          key={editing === "new" ? "new" : editing.id}
          app={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      ) : null}
    </section>
  );
}
