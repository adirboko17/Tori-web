"use client";

import { useMemo, useState } from "react";
import { adminJson } from "@/lib/superadmin/browser";
import type { BusinessDetails } from "@/lib/superadmin/types";
import { Drawer } from "../../../../_ui/drawer";
import { useToast } from "../../../../_ui/feedback";
import { formatDate, formatIls } from "../../../../_ui/format";
import { Icon } from "../../../../_ui/icon";
import { Avatar, Badge, EmptyState, Field, FilterChips, SearchField } from "../../../../_ui/parts";

type UserFilter = "all" | "admin" | "client";

function ServiceDrawer({
  businessId,
  open,
  onClose,
  onAdded,
}: {
  businessId: string;
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [pending, setPending] = useState(false);

  const priceNumber = Number(price);
  const durationNumber = Number(duration);
  const valid =
    name.trim().length > 0 &&
    price !== "" &&
    Number.isFinite(priceNumber) &&
    priceNumber >= 0 &&
    Number.isInteger(durationNumber) &&
    durationNumber >= 5;

  async function submit() {
    if (!valid || pending) return;
    setPending(true);
    try {
      await adminJson(`/api/admin/apps/${businessId}/services`, {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), price: priceNumber, durationMinutes: durationNumber }),
      });
      toast.success(`השירות "${name.trim()}" נוסף`);
      setName("");
      setPrice("");
      setDuration("60");
      onAdded();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "הוספת השירות נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="שירות חדש"
      description="השירות יופיע מיד באפליקציה של העסק."
      onSubmit={() => void submit()}
      footer={
        <>
          <button type="submit" className="ad-btn is-primary" disabled={!valid || pending}>
            {pending ? "מוסיף…" : "הוספת השירות"}
          </button>
          <button type="button" className="ad-btn is-secondary" onClick={onClose}>
            ביטול
          </button>
        </>
      }
    >
      <Field label="שם השירות">
        <input
          className="ad-input"
          value={name}
          maxLength={255}
          onChange={(event) => setName(event.target.value)}
          placeholder="למשל: הרמת גבות"
        />
      </Field>
      <div className="ad-form-grid">
        <Field label="מחיר">
          <div className="ad-input-group">
            <input
              className="ad-input"
              dir="ltr"
              type="number"
              inputMode="decimal"
              min={0}
              max={100000}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0"
            />
            <span className="ad-input-affix">₪</span>
          </div>
        </Field>
        <Field label="משך">
          <div className="ad-input-group">
            <input
              className="ad-input"
              dir="ltr"
              type="number"
              inputMode="numeric"
              min={5}
              max={1440}
              step={5}
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
            <span className="ad-input-affix">דק׳</span>
          </div>
        </Field>
      </div>
    </Drawer>
  );
}

export function PeopleTab({
  businessId,
  details,
  onChange,
}: {
  businessId: string;
  details: BusinessDetails;
  onChange: () => void;
}) {
  const [filter, setFilter] = useState<UserFilter>("all");
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const admins = details.users.filter((user) => user.user_type === "admin").length;
  const clients = details.users.filter((user) => user.user_type === "client").length;

  const users = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return details.users.filter((user) => {
      if (filter !== "all" && user.user_type !== filter) return false;
      if (!needle) return true;
      return `${user.name ?? ""} ${user.phone ?? ""}`.toLowerCase().includes(needle);
    });
  }, [details.users, filter, query]);

  return (
    <div className="ad-grid-2">
      <section className="ad-card">
        <div className="ad-card-head">
          <h2>
            <Icon name="users" />
            משתמשים
          </h2>
          <span className="ad-small ad-muted">{details.users.length} רשומים</span>
        </div>
        <div className="ad-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="חיפוש לפי שם או טלפון" />
          <FilterChips
            label="סוג משתמש"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "הכול", count: details.users.length },
              { value: "admin", label: "מנהלים", count: admins },
              { value: "client", label: "לקוחות", count: clients },
            ]}
          />
        </div>
        {users.length === 0 ? (
          <EmptyState
            icon="users"
            title={details.users.length ? "לא נמצאו משתמשים" : "אין משתמשים עדיין"}
            body={details.users.length ? "נסו חיפוש אחר." : "לקוחות שיירשמו באפליקציה יופיעו כאן."}
          />
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table is-responsive">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>טלפון</th>
                  <th>סוג</th>
                  <th>נרשם</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="is-primary">
                      <div className="ad-entity">
                        <Avatar name={user.name} src={user.image_url} size="sm" round />
                        <span className="ad-entity-title">{user.name || "—"}</span>
                      </div>
                    </td>
                    <td data-label="טלפון" dir="ltr" className="is-nowrap">
                      {user.phone || "—"}
                    </td>
                    <td data-label="סוג">
                      <Badge tone={user.user_type === "admin" ? "brand" : "neutral"}>
                        {user.user_type === "admin" ? "מנהל" : user.user_type === "client" ? "לקוח" : user.user_type || "—"}
                      </Badge>
                    </td>
                    <td data-label="נרשם" className="is-nowrap ad-muted">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="ad-card">
        <div className="ad-card-head">
          <h2>
            <Icon name="scissors" />
            שירותים
          </h2>
          <button type="button" className="ad-btn is-secondary is-sm" onClick={() => setDrawerOpen(true)}>
            <Icon name="plus" size={16} />
            שירות חדש
          </button>
        </div>
        {details.services.length === 0 ? (
          <EmptyState icon="scissors" title="אין שירותים עדיין" />
        ) : (
          <div className="ad-list">
            {details.services.map((service) => (
              <div key={service.id} className="ad-list-item">
                <span className="ad-list-main">
                  <span className="ad-list-title">{service.name || "—"}</span>
                  <span className="ad-list-sub">
                    {service.duration_minutes != null ? `${service.duration_minutes} דק׳` : "—"}
                    {" · "}
                    {service.price != null ? formatIls(service.price) : "ללא מחיר"}
                  </span>
                </span>
                {service.is_active ? null : <Badge>לא פעיל</Badge>}
              </div>
            ))}
          </div>
        )}
      </section>

      <ServiceDrawer
        businessId={businessId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdded={onChange}
      />
    </div>
  );
}
