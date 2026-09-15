"use client";
import React from "react";
import { useAppStore } from "./app-store";
import { dateKey, formatDate, phoneSchema } from "@/lib/booking";
import {
  Button,
  IconButton,
  Card,
  Badge,
  Tag,
  Icon,
  Avatar,
  Input,
  Select,
  Switch,
  SegmentedControl,
  TopBar,
  Tabs,
  Sheet,
  EmptyState,
  Tooltip,
} from "../ui";
import {
  ActionTile,
  SectionLabel,
  AppointmentRow,
  StatusPill,
  PhotoHeader,
  HomeSheet,
  DateCard,
  PanelCard,
  QuietRow,
  WORK,
} from "./app-shell";

/* ---------- business home — the shipped home screen ---------- */
function BizHomeScreen({ tenant, onBroadcast, onClients, onDay }) {
  const store = useAppStore();
  const today = dateKey(new Date());
  const upcoming = store.appointments.filter(
    (a) => a.date >= today && a.status !== "cancelled",
  );
  const [refreshing, setRefreshing] = React.useState(false);
  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };
  return (
    <div style={{ minHeight: "100%", background: "var(--surface-page)" }}>
      <PhotoHeader name={tenant.name} />
      <HomeSheet>
        <DateCard
          weekday={new Date().toLocaleDateString("he-IL", { weekday: "long" })}
          date={formatDate(today)}
          count={upcoming.length}
        />

        <PanelCard
          icon="clock"
          title="התור הבא שלך"
          action={
            <IconButton
              icon="rotate-ccw"
              label="רענון"
              size="sm"
              onClick={refresh}
              style={refreshing ? { transform: "rotate(180deg)" } : undefined}
            />
          }
        >
          <QuietRow icon="calendar-days">
            {upcoming[0]
              ? `${upcoming[0].name} · ${formatDate(upcoming[0].date)} · ${upcoming[0].time}`
              : "אין תורים קרובים היום"}
          </QuietRow>
        </PanelCard>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 10,
          }}
        >
          <ActionTile icon="bell" label="התראות" onClick={onDay} />
          <ActionTile
            icon="message-circle"
            label="הודעת שידור"
            onClick={onBroadcast}
          />
          <ActionTile
            icon="users"
            label="לקוחות"
            count={store.clients.length}
            onClick={onClients}
          />
        </div>

        <PanelCard icon="hourglass" title="רשימת המתנה">
          <QuietRow icon="hourglass">אין ממתינים כרגע</QuietRow>
        </PanelCard>

        <div>
          <SectionLabel
            action={
              <button
                type="button"
                onClick={onDay}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  font: "var(--type-label)",
                  color: "var(--text-link)",
                }}
              >
                ליומן
              </button>
            }
          >
            הגלריה שלך
          </SectionLabel>
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              minWidth: 0,
              paddingBottom: 4,
            }}
          >
            {WORK.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                style={{
                  flex: "0 0 auto",
                  width: 92,
                  height: 112,
                  objectFit: "cover",
                  borderRadius: 14,
                  boxShadow: "var(--shadow-sm)",
                }}
              />
            ))}
          </div>
        </div>
      </HomeSheet>
    </div>
  );
}

/* ---------- day board ---------- */
function BizDayScreen({ onBroadcast }) {
  const store = useAppStore();
  const [range, setRange] = React.useState("היום");
  const [adding, setAdding] = React.useState(false);
  const [client, setClient] = React.useState("");
  const [date, setDate] = React.useState(dateKey(new Date()));
  const [time, setTime] = React.useState("09:00");
  const [serviceId, setServiceId] = React.useState(
    store.business.services[0].id,
  );
  const [error, setError] = React.useState("");
  const today = dateKey(new Date());
  const end = new Date();
  end.setDate(
    end.getDate() + (range === "השבוע" ? 7 : range === "החודש" ? 31 : 0),
  );
  const rows = store.appointments.filter(
    (a) => a.date >= today && a.date <= dateKey(end),
  );
  const income = rows
    .filter((a) => a.status !== "cancelled")
    .reduce((sum, a) => sum + a.price, 0);
  function add() {
    const svc = store.business.services.find((s) => s.id === serviceId);
    if (!client.trim() || !date || date < today || !time) {
      setError("מלאו שם לקוח, תאריך ושעה תקינים.");
      return;
    }
    try {
      store.book({
        id: crypto.randomUUID(),
        date,
        time,
        name: client.trim(),
        service: svc.name,
        mins: svc.mins,
        price: svc.price,
        status: "confirmed",
        note: "",
      });
      setAdding(false);
      setClient("");
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%" }}>
      <TopBar
        title="לוח התורים"
        subtitle={formatDate(today)}
        tone="ink"
        sticky={false}
        actions={
          <IconButton
            icon="calendar-plus"
            label="תור חדש"
            onClick={() => setAdding(true)}
          />
        }
      />
      <div
        style={{
          padding: "16px 20px 110px",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr)",
          gap: 16,
        }}
      >
        <SegmentedControl
          options={["היום", "השבוע", "החודש"]}
          value={range}
          onChange={setRange}
          block
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 10,
          }}
        >
          {[
            [String(rows.length), "תורים", "calendar-days"],
            [`${income.toLocaleString("he-IL")} ₪`, "הכנסה צפויה", "banknote"],
            [
              String(rows.filter((a) => a.status === "cancelled").length),
              "ביטולים",
              "calendar-x",
            ],
          ].map(([v, l, ic]) => (
            <Card
              key={l}
              elevation="flat"
              style={{ display: "grid", gap: 6, padding: 14 }}
            >
              <Icon
                name={ic}
                size={18}
                style={{ color: "var(--icon-brand)" }}
                glow
              />
              <span
                style={{
                  font: "var(--type-heading)",
                  color: "var(--text-strong)",
                }}
              >
                {v}
              </span>
              <span
                style={{
                  font: "var(--type-caption)",
                  color: "var(--text-muted)",
                }}
              >
                {l}
              </span>
            </Card>
          ))}
        </div>
        <div>
          <SectionLabel>לוח {range}</SectionLabel>
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((a) => (
              <AppointmentRow
                key={a.id}
                time={a.time}
                name={a.name}
                service={`${a.service} · ${formatDate(a.date)}`}
                status={a.status}
                price={`${a.price} ₪`}
              />
            ))}
            {!rows.length && (
              <EmptyState
                title="היומן פנוי"
                description="אפשר להוסיף תור חדש או לעבור לתצוגת השבוע."
              />
            )}
            <button
              onClick={() => setAdding(true)}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                border: "1px dashed var(--line-strong)",
                borderRadius: "var(--radius-card)",
                padding: 16,
                color: "var(--text-muted)",
              }}
            >
              <Icon name="plus" size={18} />
              הוספת תור
            </button>
          </div>
        </div>
        <Card
          elevation="raised"
          style={{ display: "flex", gap: 12, alignItems: "center" }}
        >
          <Icon
            name="send"
            size={20}
            style={{ color: "var(--icon-brand)" }}
            glow
          />
          <span style={{ flex: 1, font: "var(--type-body-strong)" }}>
            הודעה לכל הלקוחות
          </span>
          <Button variant="secondary" size="sm" onClick={onBroadcast}>
            שליחה
          </Button>
        </Card>
      </div>
      {adding && (
        <Sheet
          title="תור חדש"
          onClose={() => setAdding(false)}
          actions={
            <Button block onClick={add}>
              שמירת תור
            </Button>
          }
        >
          <div style={{ display: "grid", gap: 12 }}>
            <Input
              label="שם הלקוח"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            />
            <Select
              label="שירות"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              options={store.business.services.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />
            <Input
              label="תאריך"
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="שעה"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            {error && (
              <p role="alert" style={{ color: "var(--text-danger)" }}>
                {error}
              </p>
            )}
          </div>
        </Sheet>
      )}
    </div>
  );
}

function BizClientsScreen() {
  const store = useAppStore();
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState("הכל");
  const [adding, setAdding] = React.useState(false);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState("");
  const [selected, setSelected] = React.useState(null);
  const list = store.clients.filter(
    (c) =>
      (c.name.includes(q) || (c.phone || "").includes(q)) &&
      (filter === "הכל" ||
        (filter === "קבועים" && c.visits >= 10) ||
        (filter === "VIP" && c.tag === "VIP") ||
        (filter === "לא חזרו 3 חודשים" && c.inactive)),
  );
  function add() {
    if (!name.trim() || !phoneSchema.safeParse(phone).success) {
      setError("מלאו שם ומספר נייד תקין.");
      return;
    }
    if (store.clients.some((c) => c.phone === phone.replace(/[ -]/g, ""))) {
      setError("כבר קיים לקוח עם המספר הזה.");
      return;
    }
    store.addClient({
      name: name.trim(),
      phone: phone.replace(/[ -]/g, ""),
      visits: 0,
      last: "חדש/ה",
      tag: "",
    });
    setAdding(false);
    setName("");
    setPhone("");
    setError("");
  }
  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%" }}>
      <TopBar
        title="לקוחות"
        subtitle={`${store.clients.length} לקוחות רשומים`}
        sticky={false}
        actions={
          <IconButton
            icon="user-plus"
            label="לקוח חדש"
            variant="outline"
            onClick={() => setAdding(true)}
          />
        }
      />
      <div
        style={{
          padding: "4px 20px 110px",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr)",
          gap: 14,
        }}
      >
        <Input
          icon="search"
          aria-label="חיפוש לקוחות"
          placeholder="חיפוש לפי שם או טלפון"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["הכל", "קבועים", "VIP", "לא חזרו 3 חודשים"].map((f) => (
            <Tag key={f} selected={filter === f} onSelect={() => setFilter(f)}>
              {f}
            </Tag>
          ))}
        </div>
        {!list.length ? (
          <EmptyState
            title="לא נמצאו לקוחות"
            description="נסו שם אחר או מספר טלפון."
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQ("");
                  setFilter("הכל");
                }}
              >
                נקה חיפוש
              </Button>
            }
          />
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {list.map((c, i) => (
              <Card
                key={c.name + i}
                elevation="flat"
                style={{ display: "flex", gap: 12, alignItems: "center" }}
              >
                <Avatar name={c.name} />
                <button
                  onClick={() => setSelected(c)}
                  style={{
                    display: "grid",
                    gap: 3,
                    flex: 1,
                    minWidth: 0,
                    textAlign: "start",
                  }}
                >
                  <span
                    style={{ display: "flex", gap: 7, alignItems: "center" }}
                  >
                    <span
                      style={{
                        font: "var(--type-body-strong)",
                        color: "var(--text-strong)",
                      }}
                    >
                      {c.name}
                    </span>
                    {c.tag && (
                      <Badge tone={c.tag === "VIP" ? "gradient" : "brand"}>
                        {c.tag}
                      </Badge>
                    )}
                  </span>
                  <span
                    style={{
                      font: "var(--type-caption)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {c.visits} ביקורים · {c.last}
                  </span>
                </button>
                <IconButton
                  icon="phone"
                  label={`פרטי קשר: ${c.name}`}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(c)}
                />
              </Card>
            ))}
          </div>
        )}
      </div>
      {adding && (
        <Sheet
          title="לקוח חדש"
          onClose={() => setAdding(false)}
          actions={
            <Button block onClick={add}>
              שמירת לקוח
            </Button>
          }
        >
          <div style={{ display: "grid", gap: 12 }}>
            <Input
              label="שם מלא"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
            <Input
              label="טלפון"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {error && (
              <p role="alert" style={{ color: "var(--text-danger)" }}>
                {error}
              </p>
            )}
          </div>
        </Sheet>
      )}
      {selected && (
        <Sheet title={selected.name} onClose={() => setSelected(null)}>
          <p>
            {selected.visits} ביקורים · {selected.last}
          </p>
          {selected.phone ? (
            <a href={`tel:${selected.phone}`}>{selected.phone}</a>
          ) : (
            <p>ללקוח לדוגמה אין מספר טלפון שמור.</p>
          )}
        </Sheet>
      )}
    </div>
  );
}

function BizSettingsScreen({ tenant, onSwitchRole }) {
  const store = useAppStore();
  const [editing, setEditing] = React.useState(false);
  const [hours, setHours] = React.useState(store.settings.hours);
  const colors = [
    { value: "#0CFFBE", label: "ירוק tori (ברירת מחדל)" },
    { value: "#7C3AED", label: "סגול" },
    { value: "#FF2E93", label: "ורוד" },
    { value: "#F59E0B", label: "כתום" },
    { value: "#0EA5E9", label: "תכלת" },
  ];
  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%" }}>
      <TopBar title="הגדרות העסק" tone="brand" sticky={false} />
      <div
        style={{
          padding: "4px 20px 110px",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr)",
          gap: 14,
        }}
      >
        <Card elevation="flat" style={{ display: "grid", gap: 14 }}>
          <span
            style={{ font: "var(--type-label)", color: "var(--text-muted)" }}
          >
            שעות פעילות
          </span>
          {["א׳–ה׳", "ו׳", "שבת"].map((d, i) => (
            <div
              key={d}
              style={{
                display: "flex",
                justifyContent: "space-between",
                font: "var(--type-body)",
              }}
            >
              <span>{d}</span>
              <span dir="ltr">{store.settings.hours[i]}</span>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            icon="pencil"
            onClick={() => setEditing(true)}
          >
            עריכת שעות
          </Button>
        </Card>
        <Card elevation="flat" style={{ display: "grid", gap: 16 }}>
          <span
            style={{ font: "var(--type-label)", color: "var(--text-muted)" }}
          >
            אוטומציות
          </span>
          {[
            ["dayReminder", "תזכורת יום לפני"],
            ["hourReminder", "תזכורת שעתיים לפני"],
            ["waiting", "רשימת המתנה"],
            ["manual", "אישור ידני לתורים חדשים"],
          ].map(([key, label]) => (
            <Switch
              key={key}
              label={label}
              checked={store.settings[key]}
              onChange={(e) =>
                store.updateSettings({ [key]: e.target.checked })
              }
            />
          ))}
        </Card>
        <Card elevation="flat" style={{ display: "grid", gap: 12 }}>
          <span
            style={{ font: "var(--type-label)", color: "var(--text-muted)" }}
          >
            מיתוג האפליקציה
          </span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "var(--gradient-brand)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Icon name="sparkles" size={22} />
            </span>
            <span style={{ display: "grid", gap: 2, flex: 1, minWidth: 0 }}>
              <span style={{ font: "var(--type-body-strong)" }}>
                {tenant.name}
              </span>
              <span
                style={{
                  font: "var(--type-caption)",
                  color: "var(--text-muted)",
                }}
              >
                אייקון וצבעים · תצוגה מקדימה
              </span>
            </span>
            <Badge tone="brand" dot>
              הדגמה
            </Badge>
          </div>
          <Select
            label="ערכת צבע"
            options={
              colors.some((c) => c.value === tenant.color)
                ? colors
                : [...colors, { value: tenant.color, label: "צבע אישי" }]
            }
            value={tenant.color}
            onChange={(e) => store.updateBusiness({ color: e.target.value })}
          />
          <Input
            label="שם העסק"
            value={tenant.name}
            onChange={(e) => store.updateBusiness({ name: e.target.value })}
            maxLength={100}
          />
        </Card>
        <Button variant="ghost" block icon="user-round" onClick={onSwitchRole}>
          חזרה לתצוגת לקוח
        </Button>
      </div>
      {editing && (
        <Sheet
          title="שעות פעילות"
          onClose={() => setEditing(false)}
          actions={
            <Button
              block
              disabled={hours.some((h) => !h.trim())}
              onClick={() => {
                store.updateSettings({ hours });
                setEditing(false);
              }}
            >
              שמירת שעות
            </Button>
          }
        >
          <div style={{ display: "grid", gap: 12 }}>
            {["א׳–ה׳", "ו׳", "שבת"].map((label, i) => (
              <Input
                key={label}
                label={label}
                value={hours[i]}
                onChange={(e) =>
                  setHours((values) =>
                    values.map((v, j) => (i === j ? e.target.value : v)),
                  )
                }
              />
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}

export { BizHomeScreen, BizDayScreen, BizClientsScreen, BizSettingsScreen };
