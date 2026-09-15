"use client";
import React from "react";
import { useAppStore } from "./app-store";
import {
  bookingDays,
  dateKey,
  formatDate,
  slotAvailable,
  phoneSchema,
} from "@/lib/booking";
import {
  Button,
  IconButton,
  Card,
  Badge,
  Tag,
  Icon,
  Logo,
  Avatar,
  Input,
  Select,
  Switch,
  SegmentedControl,
  TopBar,
  Tabs,
  Sheet,
  Dialog,
  Toast,
  EmptyState,
  Checkbox,
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
  IMG,
} from "./app-shell";

const TENANT = { name: "ליאת ציפורניים", tagline: "לק ג׳ל · מניקור · באר שבע" };
const SERVICES = [
  { id: "s1", name: "לק ג׳ל", mins: 60, price: 180, icon: "sparkles" },
  { id: "s2", name: "מניקור", mins: 45, price: 120, icon: "palette" },
  { id: "s3", name: "בניית ציפורניים", mins: 90, price: 260, icon: "crown" },
  { id: "s4", name: "פדיקור", mins: 50, price: 150, icon: "heart" },
];
const DAYS = [
  { d: "ה׳", n: 10, free: 6 },
  { d: "ו׳", n: 11, free: 2 },
  { d: "א׳", n: 13, free: 8 },
  { d: "ב׳", n: 14, free: 5 },
  { d: "ג׳", n: 15, free: 0 },
  { d: "ד׳", n: 16, free: 7 },
];
const SLOTS = [
  "09:00",
  "09:45",
  "10:30",
  "11:30",
  "12:15",
  "13:00",
  "15:00",
  "16:00",
  "17:30",
];
const TAKEN = ["10:30", "13:00"];

/* ---------- 1. login ---------- */
function LoginScreen({ onDone }) {
  const store = useAppStore();
  const [step, setStep] = React.useState("phone");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState(["", "", "", ""]);
  const [error, setError] = React.useState("");
  const digits = React.useRef([]);
  function sendCode() {
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      setError("צריך להזין מספר נייד ישראלי תקין.");
      return;
    }
    setError("");
    setStep("code");
  }
  function signIn() {
    if (code.join("") !== "1234") {
      setError("קוד ההדגמה הוא 1234.");
      return;
    }
    store.updateProfile({ phone });
    onDone();
  }
  return (
    <div
      style={{
        minHeight: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        background: "var(--surface-card)",
      }}
    >
      <div style={{ position: "relative", height: 260 }}>
        <img
          src={`${IMG}work-mosaic.jpg`}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg,rgba(20,18,18,.45) 0%,rgba(20,18,18,.1) 45%,rgba(20,18,18,.55) 100%)",
          }}
        />
        <span
          style={{
            position: "absolute",
            insetInline: 0,
            top: 72,
            display: "grid",
            placeItems: "center",
          }}
        >
          <span
            style={{
              display: "grid",
              justifyItems: "center",
              gap: 6,
              background: "rgba(23,22,22,.6)",
              backdropFilter: "blur(10px)",
              borderRadius: 22,
              padding: "12px 22px 14px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 34,
                lineHeight: 1.12,
                color: "var(--white)",
              }}
            >
              {store.business.name}
            </span>
            <span style={{ font: "var(--type-body)", color: "var(--white)" }}>
              {store.business.tagline}
            </span>
          </span>
        </span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step === "phone") sendCode(); else signIn();
        }}
        style={{
          padding: "24px 20px",
          display: "grid",
          gap: 18,
          alignContent: "start",
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <span
            style={{ font: "var(--type-title)", color: "var(--text-strong)" }}
          >
            {step === "phone" ? "נעים להכיר" : "הזן/י את הקוד"}
          </span>
          <span
            style={{ font: "var(--type-body)", color: "var(--text-muted)" }}
          >
            {step === "phone"
              ? "כניסה להדגמה. קוד הכניסה הוא 1234; לא נשלח SMS."
              : `קוד ההדגמה עבור ${phone}: 1234`}
          </span>
        </div>
        {step === "phone" ? (
          <>
            <Input
              label="מספר טלפון"
              icon="phone"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="050-000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Checkbox label="שלחו לי תזכורת יום לפני התור" defaultChecked />
            <Button type="submit" block iconEnd="arrow-left">
              שליחת קוד
            </Button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, direction: "ltr" }}>
              {code.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    digits.current[i] = el;
                  }}
                  aria-label={`ספרה ${i + 1}`}
                  value={v}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(-1);
                    setCode((c) => c.map((x, j) => (i === j ? value : x)));
                    if (value) digits.current[i + 1]?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !v)
                      digits.current[i - 1]?.focus();
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  style={{
                    minWidth: 0,
                    width: "100%",
                    flex: 1,
                    height: 64,
                    textAlign: "center",
                    font: "var(--type-title)",
                    fontSize: 26,
                    color: "var(--text-strong)",
                    background: "var(--surface-sunken)",
                    border: `1.5px solid ${v ? "var(--line-focus)" : "transparent"}`,
                    borderRadius: "var(--radius-control)",
                  }}
                />
              ))}
            </div>
            <Button type="submit" block>
              כניסה
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setStep("phone");
                setError("");
              }}
            >
              שינוי מספר
            </Button>
          </>
        )}
        {error && (
          <p
            role="alert"
            style={{ font: "var(--type-caption)", color: "var(--text-danger)" }}
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

/* ---------- 2. home ---------- */
function HomeScreen({ onBook, onOpenAppt, onReschedule }) {
  const { business, appointments } = useAppStore();
  const [messageOpen, setMessageOpen] = React.useState(false);
  const next = appointments.find(
    (a) => (a.status === "confirmed" || a.status === "pending") && a.date >= dateKey(new Date()),
  );
  const SERVICES = business.services;
  const TENANT = business;
  return (
    <div style={{ minHeight: "100%", background: "var(--surface-page)" }}>
      <PhotoHeader name={TENANT.name} />
      <HomeSheet>
        <DateCard
          weekday="התור הקרוב שלך"
          date={
            next ? `${formatDate(next.date)} · ${next.time}` : "היומן שלך פנוי"
          }
          count={
            appointments.filter(
              (a) => a.status === "confirmed" || a.status === "pending",
            ).length
          }
        />

        <PanelCard
          icon="calendar-check"
          title={next?.service || "קביעת תור ראשון"}
          action={<StatusPill status="confirmed" />}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 14px",
            }}
          >
            <span
              style={{
                font: "var(--type-caption)",
                color: "var(--text-muted)",
                flex: 1,
              }}
            >
              {next ? `${next.mins} דק׳ · ${next.price} ₪` : "בחרו שירות וקבעו תור"}
            </span>
            <Button
              variant="outline"
              size="sm"
              icon="calendar-clock"
              onClick={() => next ? onReschedule(next) : onBook()}
            >
              שינוי מועד
            </Button>
            <Button variant="ghost" size="sm" onClick={onOpenAppt} disabled={!next}>
              ביטול
            </Button>
          </div>
        </PanelCard>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 10,
          }}
        >
          <ActionTile icon="calendar-plus" label="תור חדש" onClick={onBook} />
          <ActionTile icon="clock" label="התורים שלי" onClick={onOpenAppt} />
          <ActionTile icon="message-circle" label="הודעה" onClick={() => setMessageOpen(true)} />
        </div>

        <div>
          <SectionLabel
            action={
              <button
                type="button"
                onClick={onBook}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  font: "var(--type-label)",
                  color: "var(--text-link)",
                }}
              >
                הכל
              </button>
            }
          >
            שירותים
          </SectionLabel>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {SERVICES.map((s) => (
              <Card
                key={s.id}
                elevation="flat"
                as="button"
                interactive
                onClick={() => onBook(s.id)}
                style={{ display: "grid", gap: 8, padding: 14, textAlign: "start" }}
              >
                <Icon
                  name={s.icon}
                  size={22}
                  style={{ color: "var(--icon-brand)" }}
                  glow
                />
                <span
                  style={{
                    font: "var(--type-body-strong)",
                    color: "var(--text-strong)",
                  }}
                >
                  {s.name}
                </span>
                <span
                  style={{
                    font: "var(--type-caption)",
                    color: "var(--text-muted)",
                    fontFeatureSettings: "var(--numeric-tabular)",
                  }}
                >
                  {s.mins} דק׳ · ‎{s.price} ₪
                </span>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>גלריית עבודות</SectionLabel>
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
                  width: 104,
                  height: 126,
                  objectFit: "cover",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-sm)",
                }}
              />
            ))}
          </div>
        </div>

        <Card
          elevation="flat"
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            background: "var(--surface-ink)",
            border: "none",
          }}
        >
          <Icon
            name="sparkles"
            size={22}
            style={{ color: "var(--icon-on-ink)" }}
            glow
          />
          <span style={{ display: "grid", gap: 2, flex: 1, minWidth: 0 }}>
            <span
              style={{
                font: "var(--type-body-strong)",
                color: "var(--text-on-ink)",
              }}
            >
              מבצע חודש ספטמבר
            </span>
            <span
              style={{
                font: "var(--type-caption)",
                color: "rgba(255,255,255,.62)",
              }}
            >
              לק ג׳ל ב־‎150 ₪ בימי א׳
            </span>
          </span>
          <Icon
            name="chevron-left"
            size={20}
            style={{ color: "rgba(255,255,255,.5)" }}
          />
        </Card>
      </HomeSheet>
      {messageOpen && <Dialog title="יצירת קשר" description="אפשר ליצור קשר עם צוות תורי דרך hello@tori.co.il." onClose={() => setMessageOpen(false)} />}
    </div>
  );
}

/* ---------- 3. booking ---------- */
function BookScreen({ onBack, onConfirmed, renderBar, editingAppointment, requestedService }) {
  const store = useAppStore();
  const SERVICES = store.business.services;
  const DAYS = React.useMemo(() => bookingDays(), []);
  const [error, setError] = React.useState("");
  const [note, setNote] = React.useState("");
  const [service, setService] = React.useState(requestedService || SERVICES.find((s) => s.name === editingAppointment?.service)?.id || SERVICES[0].id);
  const [day, setDay] = React.useState(DAYS[0].date);
  const [slot, setSlot] = React.useState("09:00");
  const [sheet, setSheet] = React.useState(false);
  const svc = SERVICES.find((s) => s.id === service);
  const booked = React.useMemo(() => store.appointments.filter((a) => a.id !== editingAppointment?.id), [store.appointments, editingAppointment]);
  // the confirm bar is pinned by PhoneFrame's footer slot, above the floating nav
  React.useEffect(() => {
    if (!renderBar) return;
    renderBar(
      <div
        style={{
          background: "var(--surface-glass)",
          backdropFilter: "var(--blur-glass)",
          borderTop: "1px solid var(--line-subtle)",
          padding: "12px 20px",
        }}
      >
        <Button
          variant="primary"
          block
          size="lg"
          iconEnd="arrow-left"
          disabled={
            !slot || !slotAvailable(booked, day, slot, svc.mins)
          }
          onClick={() => setSheet(true)}
        >
          אישור התור · {slot}
        </Button>
      </div>,
    );
    return () => renderBar(null);
  }, [slot, renderBar, day, svc.mins, booked]);
  return (
    <div
      style={{
        background: "var(--surface-page)",
        minHeight: "100%",
        position: "relative",
      }}
    >
      <TopBar title="קביעת תור" onBack={onBack} sticky={false} />
      <div
        style={{
          padding: "4px 20px 180px",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr)",
          gap: 22,
        }}
      >
        <div>
          <SectionLabel>1 · בחירת שירות</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SERVICES.map((s) => (
              <Tag
                key={s.id}
                icon={s.icon}
                selected={service === s.id}
                onSelect={() => {
                  setService(s.id);
                  setSlot("");
                }}
              >
                {s.name}
              </Tag>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>2 · תאריך</SectionLabel>
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              minWidth: 0,
              paddingBottom: 4,
            }}
          >
            {DAYS.map((d) => {
              const on = day === d.date,
                full = d.free === 0;
              return (
                <button
                  key={d.n}
                  type="button"
                  disabled={full}
                  onClick={() => {
                    setDay(d.date);
                    setSlot("");
                    setError("");
                  }}
                  style={{
                    all: "unset",
                    cursor: full ? "not-allowed" : "pointer",
                    flex: "0 0 auto",
                    width: 56,
                    padding: "12px 0",
                    textAlign: "center",
                    display: "grid",
                    gap: 4,
                    borderRadius: "var(--radius-control)",
                    background: on
                      ? "var(--gradient-brand)"
                      : "var(--surface-card)",
                    boxShadow: on ? "var(--shadow-brand)" : "var(--shadow-sm)",
                    opacity: full ? 0.45 : 1,
                    transition: "var(--transition-control)",
                  }}
                >
                  <span
                    style={{
                      font: "var(--type-caption)",
                      color: on ? "var(--ink-900)" : "var(--text-muted)",
                    }}
                  >
                    {d.d}
                  </span>
                  <span
                    style={{
                      font: "var(--type-heading)",
                      color: on ? "var(--ink-900)" : "var(--text-strong)",
                      fontFeatureSettings: "var(--numeric-tabular)",
                    }}
                  >
                    {d.n}
                  </span>
                  <span
                    style={{
                      font: "var(--type-caption)",
                      fontSize: 10,
                      color: on ? "var(--green-900)" : "var(--text-faint)",
                    }}
                  >
                    {full ? "מלא" : `${d.free} פנוי`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <SectionLabel>3 · שעה</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 8,
            }}
          >
            {SLOTS.map((t) => {
              const taken = !slotAvailable(
                  booked,
                  day,
                  t,
                  svc.mins,
                ),
                on = slot === t;
              return (
                <button
                  key={t}
                  type="button"
                  dir="ltr"
                  disabled={taken}
                  onClick={() => setSlot(t)}
                  style={{
                    all: "unset",
                    cursor: taken ? "not-allowed" : "pointer",
                    textAlign: "center",
                    padding: "13px 0",
                    borderRadius: "var(--radius-control)",
                    font: "var(--type-body-strong)",
                    fontFeatureSettings: "var(--numeric-tabular)",
                    background: on
                      ? "var(--gradient-brand)"
                      : taken
                        ? "var(--surface-sunken)"
                        : "var(--surface-card)",
                    color: taken ? "var(--text-faint)" : "var(--text-strong)",
                    textDecoration: taken ? "line-through" : "none",
                    boxShadow: on
                      ? "var(--shadow-brand)"
                      : taken
                        ? "none"
                        : "var(--shadow-sm)",
                    transition: "var(--transition-control)",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        <Card
          elevation="flat"
          style={{
            display: "grid",
            gap: 10,
            background: "var(--surface-brand-tint)",
            border: "1px solid var(--green-200)",
          }}
        >
          <span
            style={{ font: "var(--type-label)", color: "var(--green-900)" }}
          >
            סיכום
          </span>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              font: "var(--type-body)",
              color: "var(--green-900)",
            }}
          >
            <span>{svc.name}</span>
            <span style={{ fontFeatureSettings: "var(--numeric-tabular)" }}>
              ‎{svc.price} ₪
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              font: "var(--type-body)",
              color: "var(--green-900)",
            }}
          >
            <span>{formatDate(day)}</span>
            <span
              dir="ltr"
              style={{ fontFeatureSettings: "var(--numeric-tabular)" }}
            >
              {slot} · {svc.mins} דק׳
            </span>
          </div>
        </Card>
      </div>
      {sheet && (
        <Sheet
          title="אישור התור"
          onClose={() => setSheet(false)}
          actions={
            <>
              <Button
                variant="primary"
                block
                onClick={() => {
                  try {
                    store.book({
                      id: crypto.randomUUID(),
                      date: day,
                      time: slot,
                      service: svc.name,
                      mins: svc.mins,
                      price: svc.price,
                      name: store.profile.name,
                      status: "confirmed",
                      note,
                    }, editingAppointment?.id);
                    setSheet(false);
                    onConfirmed(slot);
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              >
                קבע/י את התור
              </Button>
              <Button variant="ghost" block onClick={() => setSheet(false)}>
                חזרה
              </Button>
            </>
          }
        >
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "var(--surface-brand-tint)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon
                  name={svc.icon}
                  size={22}
                  style={{ color: "var(--icon-brand)" }}
                  glow
                />
              </span>
              <span style={{ display: "grid", gap: 2 }}>
                <span
                  style={{
                    font: "var(--type-body-strong)",
                    color: "var(--text-strong)",
                  }}
                >
                  {svc.name}
                </span>
                <span
                  style={{
                    font: "var(--type-caption)",
                    color: "var(--text-muted)",
                    fontFeatureSettings: "var(--numeric-tabular)",
                  }}
                >
                  {formatDate(day)} · {slot} · {svc.mins} דק׳
                </span>
              </span>
            </div>
            <Switch label="תזכורת שעתיים לפני" defaultChecked />
            {error && (
              <p role="alert" style={{ color: "var(--text-danger)" }}>
                {error}
              </p>
            )}
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              label="הערה לסטודיו (אופציונלי)"
              placeholder="כמו פעם קודמת"
            />
          </div>
        </Sheet>
      )}
    </div>
  );
}

/* ---------- 4. my appointments ---------- */
function ApptScreen({ onBook }) {
  const { appointments, cancel: cancelAppointment } = useAppStore();
  const [tab, setTab] = React.useState("next");
  const [cancel, setCancel] = React.useState(null);
  const today = dateKey(new Date());
  const upcoming = appointments.filter(
    (a) => ["confirmed", "pending"].includes(a.status) && a.date >= today,
  );
  const history = appointments.filter((a) => !upcoming.includes(a));
  const rows = tab === "next" ? upcoming : history;
  return (
    <div
      style={{
        background: "var(--surface-page)",
        minHeight: "100%",
        position: "relative",
      }}
    >
      <TopBar
        title="התורים שלי"
        sticky={false}
        actions={
          <IconButton
            icon="plus"
            label="תור חדש"
            variant="brand"
            onClick={onBook}
          />
        }
      />
      <div style={{ padding: "0 20px" }}>
        <Tabs
          items={[
            { value: "next", label: "קרובים", count: upcoming.length },
            { value: "past", label: "היסטוריה" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      <div
        style={{
          padding: "14px 20px 110px",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr)",
          gap: 10,
        }}
      >
        {rows.map((a) => (
          <AppointmentRow
            key={a.id}
            time={a.time}
            name={formatDate(a.date)}
            service={`${a.service} · ${a.mins} דק׳`}
            status={a.status}
            price={`${a.price} ₪`}
            onClick={tab === "next" ? () => setCancel(a) : undefined}
          />
        ))}
        {!rows.length && (
          <EmptyState
            title={
              tab === "next" ? "אין תורים קרובים" : "אין עדיין היסטוריית תורים"
            }
            description="כל התורים שלך יופיעו כאן."
            action={<Button onClick={onBook}>קביעת תור</Button>}
          />
        )}
        {tab === "next" && rows.length > 0 && (
          <Card
            elevation="flat"
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              background: "var(--status-info-bg)",
              border: "none",
            }}
          >
            <Icon
              name="bell-ring"
              size={20}
              style={{ color: "var(--status-info-fg)" }}
            />
            <span
              style={{
                font: "var(--type-caption)",
                color: "var(--status-info-fg)",
                lineHeight: 1.5,
              }}
            >
              התורים נשמרים בדפדפן הזה. שליחת תזכורות זמינה לאחר חיבור SMS.
            </span>
          </Card>
        )}
      </div>
      {cancel && (
        <Dialog
          title="לבטל את התור?"
          description={`התור ב־${cancel.time} יתפנה למישהי אחרת.`}
          onClose={() => setCancel(null)}
          actions={
            <>
              <Button
                variant="danger"
                block
                onClick={() => {
                  cancelAppointment(cancel.id);
                  setCancel(null);
                }}
              >
                כן, בטל
              </Button>
              <Button variant="ghost" block onClick={() => setCancel(null)}>
                לא, השאר
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}

/* ---------- 5. profile ---------- */
function ProfileScreen({ onSwitchRole, onAppointments }) {
  const store = useAppStore();
  const [edit, setEdit] = React.useState(false);
  const [name, setName] = React.useState(store.profile.name);
  const [info, setInfo] = React.useState("");
  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%" }}>
      <TopBar title="הפרופיל" sticky={false} />
      <div
        style={{
          padding: "4px 20px 110px",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr)",
          gap: 14,
        }}
      >
        <Card
          elevation="raised"
          style={{ display: "flex", gap: 14, alignItems: "center" }}
        >
          <Avatar name={store.profile.name} size="lg" ring />
          <span style={{ display: "grid", gap: 3, flex: 1, minWidth: 0 }}>
            <span
              style={{
                font: "var(--type-heading)",
                color: "var(--text-strong)",
              }}
            >
              {store.profile.name}
            </span>
            <span
              dir="ltr"
              style={{
                font: "var(--type-caption)",
                color: "var(--text-muted)",
              }}
            >
              {store.profile.phone}
            </span>
          </span>
          <IconButton
            icon="pencil"
            label="עריכה"
            variant="outline"
            size="sm"
            onClick={() => setEdit(true)}
          />
        </Card>
        <Card elevation="flat" style={{ display: "grid", gap: 16 }}>
          <span
            style={{ font: "var(--type-label)", color: "var(--text-muted)" }}
          >
            התראות
          </span>
          {[
            ["dayReminder", "תזכורת יום לפני"],
            ["hourReminder", "תזכורת שעתיים לפני"],
            ["offers", "מבצעים ועדכונים"],
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
        <Card
          elevation="flat"
          style={{ display: "grid", gap: 0, padding: 0, overflow: "hidden" }}
        >
          {[
            ["calendar-days", "התורים שלי"],
            ["credit-card", "אמצעי תשלום"],
            ["shield-check", "פרטיות ותנאים"],
            ["message-circle", "צריך עזרה?"],
          ].map(([ic, label], i) => (
            <button
              type="button"
              key={label}
              onClick={() =>
                i === 0
                  ? onAppointments()
                  : setInfo(
                      i === 1
                        ? "אמצעי תשלום יופעלו לאחר חיבור לספק סליקה. לא נשמרים פרטי כרטיס בהדגמה."
                        : i === 2
                          ? "נתוני ההדגמה נשמרים בדפדפן הזה בלבד. אפשר למחוק אותם בהגדרות הדפדפן."
                          : "לתמיכה: hello@tori.co.il",
                    )
              }
              style={{
                textAlign: "start",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderTop: i ? "1px solid var(--line-subtle)" : "none",
              }}
            >
              <Icon name={ic} size={20} />
              <span style={{ font: "var(--type-body)", flex: 1 }}>{label}</span>
              <Icon
                name="chevron-left"
                size={18}
                style={{ color: "var(--icon-muted)" }}
              />
            </button>
          ))}
        </Card>
        <Button variant="outline" block icon="briefcase" onClick={onSwitchRole}>
          מעבר לתצוגת בעל העסק
        </Button>
      </div>
      {edit && (
        <Dialog
          title="עריכת הפרופיל"
          onClose={() => setEdit(false)}
          actions={
            <Button
              disabled={!name.trim()}
              block
              onClick={() => {
                store.updateProfile({ name: name.trim() });
                setEdit(false);
              }}
            >
              שמירה
            </Button>
          }
        >
          <Input
            label="שם מלא"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
        </Dialog>
      )}
      {info && (
        <Dialog
          title="פרטים נוספים"
          description={info}
          onClose={() => setInfo("")}
        />
      )}
    </div>
  );
}

export {
  LoginScreen,
  HomeScreen,
  BookScreen,
  ApptScreen,
  ProfileScreen,
  TENANT,
  SERVICES,
};
