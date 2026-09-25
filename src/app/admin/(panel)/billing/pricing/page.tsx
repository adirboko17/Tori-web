"use client";

import { useState } from "react";
import type { SiteSmsPackageRow } from "@/lib/admin/catalog";
import { adminJson } from "@/lib/superadmin/browser";
import { Drawer } from "../../../_ui/drawer";
import { useConfirm, useToast } from "../../../_ui/feedback";
import { formatIls, formatNumber } from "../../../_ui/format";
import { Icon } from "../../../_ui/icon";
import { Badge, EmptyState, ErrorState, Field, SkeletonRows, Switch } from "../../../_ui/parts";
import { useAdminData } from "../../../_ui/use-admin-data";

type Pricing = { monthlyPriceIls: number; subtotal: number; vat: number; total: number };
type Draft = { label: string; smsCredits: string; amountIls: string; featured: boolean; isActive: boolean };

const EMPTY: Draft = { label: "", smsCredits: "", amountIls: "", featured: false, isActive: true };

function perMessage(pack: SiteSmsPackageRow) {
  if (!pack.sms_credits) return "—";
  const agorot = (Number(pack.amount_ils) / Number(pack.sms_credits)) * 100;
  return `${agorot.toLocaleString("he-IL", { maximumFractionDigits: 1 })} אג׳`;
}

function PriceDrawer({
  open,
  current,
  onClose,
  onSaved,
}: {
  open: boolean;
  current: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [value, setValue] = useState(String(current));
  const [pending, setPending] = useState(false);
  const price = Number(value);
  const valid = Number.isFinite(price) && price > 0;

  async function save() {
    if (!valid) return;
    setPending(true);
    try {
      await adminJson("/api/admin/pricing", { method: "PUT", body: JSON.stringify({ monthlyPriceIls: price }) });
      toast.success(`המחיר החודשי עודכן ל-${formatIls(price)}`);
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "שמירת המחיר נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="מחיר חודשי"
      description="המחיר שמוצג באתר ונגבה בהוראת הקבע של עסקים חדשים."
      onSubmit={() => void save()}
      footer={
        <>
          <button type="submit" className="ad-btn is-primary" disabled={!valid || pending}>
            {pending ? "שומר…" : "שמירה"}
          </button>
          <button type="button" className="ad-btn is-secondary" onClick={onClose}>
            ביטול
          </button>
        </>
      }
    >
      <Field label="מחיר לפני מע״מ" hint={valid ? `כולל מע״מ: ${formatIls(Math.round(price * 118) / 100)}` : undefined}>
        <div className="ad-input-group">
          <input
            className="ad-input"
            dir="ltr"
            type="number"
            inputMode="decimal"
            min={1}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <span className="ad-input-affix">₪</span>
        </div>
      </Field>
      <div className="ad-alert is-info">
        <Icon name="info" />
        <div className="ad-alert-body">
          <p>הוראות קבע קיימות ב-PayPlus לא משתנות אוטומטית.</p>
        </div>
      </div>
    </Drawer>
  );
}

function PackageDrawer({
  pack,
  open,
  onClose,
  onSaved,
}: {
  pack: SiteSmsPackageRow | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const [draft, setDraft] = useState<Draft>(
    pack
      ? {
          label: pack.label,
          smsCredits: String(pack.sms_credits),
          amountIls: String(pack.amount_ils),
          featured: pack.featured,
          isActive: pack.is_active,
        }
      : EMPTY,
  );
  const [pending, setPending] = useState(false);
  const credits = Number(draft.smsCredits);
  const amount = Number(draft.amountIls);
  const valid =
    draft.label.trim().length > 0 &&
    Number.isInteger(credits) &&
    credits > 0 &&
    draft.amountIls !== "" &&
    Number.isFinite(amount) &&
    amount >= 0;

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (!valid) return;
    setPending(true);
    try {
      const body = JSON.stringify({
        label: draft.label.trim(),
        smsCredits: credits,
        amountIls: amount,
        featured: draft.featured,
        isActive: draft.isActive,
      });
      if (pack) await adminJson(`/api/admin/packages/${pack.id}`, { method: "PATCH", body });
      else await adminJson("/api/admin/packages", { method: "POST", body });
      toast.success(pack ? "החבילה עודכנה" : "החבילה נוספה");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "שמירת החבילה נכשלה");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!pack) return;
    const ok = await confirm({
      title: `למחוק את "${pack.label}"?`,
      body: "החבילה תוסר מהחנות באתר. רכישות קודמות לא יושפעו. אם רוצים רק להסתיר אותה, אפשר לכבות אותה במקום.",
      confirmLabel: "מחיקה",
      tone: "danger",
    });
    if (!ok) return;
    setPending(true);
    try {
      await adminJson(`/api/admin/packages/${pack.id}`, { method: "DELETE" });
      toast.success("החבילה נמחקה");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "מחיקת החבילה נכשלה");
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={pack ? "עריכת חבילה" : "חבילה חדשה"}
      description="הכמות והמחיר הם מה שנמכר בחנות ה-SMS באתר."
      onSubmit={() => void save()}
      footer={
        <>
          <button type="submit" className="ad-btn is-primary" disabled={!valid || pending}>
            {pending ? "שומר…" : pack ? "שמירה" : "הוספת החבילה"}
          </button>
          <button type="button" className="ad-btn is-secondary" onClick={onClose}>
            ביטול
          </button>
          {pack ? (
            <>
              <span className="ad-spacer" />
              <button type="button" className="ad-btn is-danger-ghost" disabled={pending} onClick={() => void remove()}>
                <Icon name="trash-2" size={16} />
                מחיקה
              </button>
            </>
          ) : null}
        </>
      }
    >
      <Field label="שם החבילה">
        <input
          className="ad-input"
          value={draft.label}
          onChange={(event) => update("label", event.target.value)}
          placeholder="למשל: 500 הודעות"
        />
      </Field>
      <div className="ad-form-grid">
        <Field label="כמות הודעות">
          <input
            className="ad-input"
            dir="ltr"
            type="number"
            inputMode="numeric"
            min={1}
            value={draft.smsCredits}
            onChange={(event) => update("smsCredits", event.target.value)}
          />
        </Field>
        <Field label="מחיר">
          <div className="ad-input-group">
            <input
              className="ad-input"
              dir="ltr"
              type="number"
              inputMode="decimal"
              min={0}
              value={draft.amountIls}
              onChange={(event) => update("amountIls", event.target.value)}
            />
            <span className="ad-input-affix">₪</span>
          </div>
        </Field>
      </div>
      <Switch checked={draft.featured} onChange={(value) => update("featured", value)} label="סימון כ״הכי משתלם״" />
      <Switch checked={draft.isActive} onChange={(value) => update("isActive", value)} label="מוצגת בחנות" />
    </Drawer>
  );
}

export default function PricingPage() {
  const toast = useToast();
  const pricing = useAdminData<Pricing>("/api/admin/pricing");
  const packages = useAdminData<{ packages: SiteSmsPackageRow[] }>("/api/admin/packages");
  const [priceOpen, setPriceOpen] = useState(false);
  const [editing, setEditing] = useState<SiteSmsPackageRow | "new" | null>(null);
  const [busyId, setBusyId] = useState("");
  const rows = packages.data?.packages ?? [];

  async function patch(id: string, body: Record<string, unknown>) {
    await adminJson(`/api/admin/packages/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  }

  async function toggle(pack: SiteSmsPackageRow, isActive: boolean) {
    setBusyId(pack.id);
    packages.mutate((current) => ({
      packages: current.packages.map((row) => (row.id === pack.id ? { ...row, is_active: isActive } : row)),
    }));
    try {
      await patch(pack.id, { isActive });
      toast.success(isActive ? `"${pack.label}" מוצגת בחנות` : `"${pack.label}" הוסתרה מהחנות`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "העדכון נכשל");
      packages.reload();
    } finally {
      setBusyId("");
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const ordered = [...rows];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    const next = ordered.map((row, position) => ({ ...row, sort_order: (position + 1) * 10 }));
    const previous = new Map(rows.map((row) => [row.id, row.sort_order]));
    const changed = next.filter((row) => previous.get(row.id) !== row.sort_order);
    setBusyId(rows[index].id);
    packages.mutate(() => ({ packages: next }));
    try {
      await Promise.all(changed.map((row) => patch(row.id, { sortOrder: row.sort_order })));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "שינוי הסדר נכשל");
    } finally {
      packages.reload();
      setBusyId("");
    }
  }

  return (
    <div className="ad-grid-2">
      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h2>
              <Icon name="package" />
              חבילות הודעות
            </h2>
            <p>מה שנמכר בחנות ה-SMS באתר, לפי סדר ההצגה.</p>
          </div>
          <button type="button" className="ad-btn is-secondary is-sm" onClick={() => setEditing("new")}>
            <Icon name="plus" size={16} />
            חבילה חדשה
          </button>
        </div>
        {packages.error && !packages.data ? (
          <ErrorState message={packages.error} onRetry={packages.reload} />
        ) : packages.loading ? (
          <SkeletonRows rows={4} avatar={false} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon="package"
            title="אין חבילות"
            body="כל עוד אין חבילות, החנות מציגה את חבילות ברירת המחדל."
          />
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table is-responsive">
              <thead>
                <tr>
                  <th>חבילה</th>
                  <th>הודעות</th>
                  <th>מחיר</th>
                  <th>להודעה</th>
                  <th>בחנות</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((pack, index) => (
                  <tr key={pack.id}>
                    <td className="is-primary">
                      <span className="ad-row">
                        <strong>{pack.label}</strong>
                        {pack.featured ? <Badge tone="brand">הכי משתלם</Badge> : null}
                      </span>
                    </td>
                    <td data-label="הודעות" className="is-num">
                      {formatNumber(Number(pack.sms_credits))}
                    </td>
                    <td data-label="מחיר" className="is-num">
                      {formatIls(Number(pack.amount_ils))}
                    </td>
                    <td data-label="להודעה" className="is-num ad-muted">
                      {perMessage(pack)}
                    </td>
                    <td data-label="בחנות">
                      <Switch
                        checked={pack.is_active}
                        disabled={busyId === pack.id}
                        onChange={(value) => void toggle(pack, value)}
                        label={<span className="ad-small ad-muted">{pack.is_active ? "מוצגת" : "מוסתרת"}</span>}
                      />
                    </td>
                    <td className="is-actions">
                      <span className="ad-row" style={{ gap: 2 }}>
                        <button
                          type="button"
                          className="ad-icon-btn"
                          aria-label="הזזה למעלה"
                          disabled={index === 0 || busyId !== ""}
                          onClick={() => void move(index, -1)}
                        >
                          <Icon name="chevron-up" size={17} />
                        </button>
                        <button
                          type="button"
                          className="ad-icon-btn"
                          aria-label="הזזה למטה"
                          disabled={index === rows.length - 1 || busyId !== ""}
                          onClick={() => void move(index, 1)}
                        >
                          <Icon name="chevron-down" size={17} />
                        </button>
                        <button type="button" className="ad-btn is-ghost is-sm" onClick={() => setEditing(pack)}>
                          <Icon name="pencil" size={15} />
                          עריכה
                        </button>
                      </span>
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
            <Icon name="repeat" />
            מחיר חודשי
          </h2>
          <button
            type="button"
            className="ad-btn is-ghost is-sm"
            disabled={!pricing.data}
            onClick={() => setPriceOpen(true)}
          >
            <Icon name="pencil" size={15} />
            עריכה
          </button>
        </div>
        <div className="ad-card-body">
          {pricing.error && !pricing.data ? (
            <ErrorState message={pricing.error} onRetry={pricing.reload} />
          ) : !pricing.data ? (
            <span className="ad-skel" style={{ width: 140, height: 40 }} />
          ) : (
            <>
              <div>
                <span className="ad-stat-value" style={{ fontSize: 40 }}>
                  {formatIls(pricing.data.monthlyPriceIls)}
                </span>
                <span className="ad-muted"> לחודש, לפני מע״מ</span>
              </div>
              <dl className="ad-kv">
                <dt>מע״מ 18%</dt>
                <dd>{formatIls(pricing.data.vat)}</dd>
                <dt>סה״כ לתשלום</dt>
                <dd>{formatIls(pricing.data.total)}</dd>
              </dl>
            </>
          )}
        </div>
      </section>

      {pricing.data && priceOpen ? (
        <PriceDrawer
          open
          current={pricing.data.monthlyPriceIls}
          onClose={() => setPriceOpen(false)}
          onSaved={pricing.reload}
        />
      ) : null}
      {editing ? (
        <PackageDrawer
          key={editing === "new" ? "new" : editing.id}
          open
          pack={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={packages.reload}
        />
      ) : null}
    </div>
  );
}
