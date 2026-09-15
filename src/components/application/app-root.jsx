"use client";
import React from "react";
import { AppProvider, useAppStore } from "./app-store";
import { Button, TabBar, Toast, Sheet, Input, Icon } from "../ui";
import { PhoneFrame } from "./app-shell";
import {
  LoginScreen,
  HomeScreen,
  BookScreen,
  ApptScreen,
  ProfileScreen,
  TENANT,
} from "./app-customer";
import {
  BizHomeScreen,
  BizDayScreen,
  BizClientsScreen,
  BizSettingsScreen,
} from "./app-business";

const CUSTOMER_TABS = [
  { value: "home", label: "בית", icon: "house" },
  { value: "appts", label: "התורים", icon: "calendar-days", count: 2 },
  { value: "book", label: "קביעת תור", icon: "calendar-plus" },
  { value: "me", label: "הפרופיל", icon: "user-round" },
];
const BIZ_TABS = [
  { value: "home", label: "בית", icon: "house" },
  { value: "day", label: "יומן", icon: "calendar-days", count: 6 },
  { value: "clients", label: "לקוחות", icon: "users" },
  { value: "settings", label: "הגדרות", icon: "settings" },
];

function ToriApp({ initialRole = "customer" }) {
  const store = useAppStore();
  const [signedIn, setSignedIn] = React.useState(initialRole === "business");
  const [role, setRole] = React.useState(initialRole);
  const [tab, setTab] = React.useState("home");
  const [bizTab, setBizTab] = React.useState("home");
  const [editingAppointment, setEditingAppointment] = React.useState(null);
  const [requestedService, setRequestedService] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [broadcast, setBroadcast] = React.useState(false);
  const [bar, setBar] = React.useState(null);
  const [broadcastTitle, setBroadcastTitle] =
    React.useState("מבצע חודש ספטמבר");
  const [broadcastText, setBroadcastText] = React.useState(
    "לק ג׳ל ב־150 ₪ בימי א׳. מוזמנות לקבוע תור באפליקציה.",
  );
  const renderBar = React.useCallback((node) => setBar(node), []);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const switchRole = () => {
    setRole((r) => (r === "customer" ? "business" : "customer"));
    setTab("home");
    setBizTab("home");
  };

  let screen,
    tabs,
    value,
    onChange,
    onPhoto = false;
  if (!signedIn) {
    screen = <LoginScreen onDone={() => setSignedIn(true)} />;
    onPhoto = true;
  } else if (role === "customer") {
    tabs = CUSTOMER_TABS.map((item) =>
      item.value === "appts"
        ? {
            ...item,
            count: store.appointments.filter(
              (a) => a.status === "confirmed" || a.status === "pending",
            ).length,
          }
        : item,
    );
    value = tab;
    onChange = (value) => { setEditingAppointment(null); setRequestedService(null); setTab(value); };
    onPhoto = tab === "home";
    screen =
      tab === "home" ? (
        <HomeScreen
          onBook={(service) => { setEditingAppointment(null); setRequestedService(typeof service === "string" ? service : null); setTab("book"); }}
          onReschedule={(appointment) => { setEditingAppointment(appointment); setTab("book"); }}
          onOpenAppt={() => setTab("appts")}
        />
      ) : tab === "book" ? (
        <BookScreen
          editingAppointment={editingAppointment}
          requestedService={requestedService}
          renderBar={renderBar}
          onBack={() => setTab("home")}
          onConfirmed={(time) => {
            setEditingAppointment(null);
            setTab("appts");
            setToast({ message: `התור נקבע ל־${time}` });
          }}
        />
      ) : tab === "appts" ? (
        <ApptScreen onBook={() => { setEditingAppointment(null); setRequestedService(null); setTab("book"); }} />
      ) : (
        <ProfileScreen
          onSwitchRole={switchRole}
          onAppointments={() => setTab("appts")}
        />
      );
  } else {
    tabs = BIZ_TABS.map((item) =>
      item.value === "day"
        ? {
            ...item,
            count: store.appointments.filter((a) => a.status !== "cancelled")
              .length,
          }
        : item,
    );
    value = bizTab;
    onChange = setBizTab;
    onPhoto = bizTab === "home";
    screen =
      bizTab === "home" ? (
        <BizHomeScreen
          tenant={store.business}
          onBroadcast={() => setBroadcast(true)}
          onClients={() => setBizTab("clients")}
          onDay={() => setBizTab("day")}
        />
      ) : bizTab === "day" ? (
        <BizDayScreen onBroadcast={() => setBroadcast(true)} />
      ) : bizTab === "clients" ? (
        <BizClientsScreen />
      ) : (
        <BizSettingsScreen tenant={store.business} onSwitchRole={switchRole} />
      );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 18,
        justifyItems: "center",
        ...(store.business.color !== "#0CFFBE"
          ? {
              "--gradient-brand": `linear-gradient(135deg, color-mix(in srgb, ${store.business.color} 55%, white), ${store.business.color})`,
              "--brand-primary": store.business.color,
            }
          : {}),
      }}
    >
      <div style={{ position: "relative", display: "grid" }}>
        <PhoneFrame
          onPhoto={onPhoto}
          bar={tab === "book" && role === "customer" && signedIn ? bar : null}
          footer={
            tabs ? (
              <TabBar
                items={tabs}
                value={value}
                onChange={onChange}
                variant="floating"
                safeArea
              />
            ) : null
          }
        >
          {screen}
        </PhoneFrame>
        {toast ? (
          <div
            style={{
              position: "absolute",
              bottom: 108,
              insetInline: 26,
              display: "grid",
              justifyItems: "center",
              pointerEvents: "none",
              zIndex: 6,
            }}
          >
            <Toast message={toast.message} />
          </div>
        ) : null}
        {broadcast ? (
          <div
            style={{
              position: "absolute",
              inset: 11,
              borderRadius: 36,
              overflow: "hidden",
              zIndex: 7,
            }}
          >
            <Sheet
              title="הודעה לכל הלקוחות"
              onClose={() => setBroadcast(false)}
              actions={
                <>
                  <Button
                    variant="primary"
                    block
                    disabled={!broadcastTitle.trim() || !broadcastText.trim()}
                    onClick={() => {
                      store.saveBroadcast({
                        title: broadcastTitle,
                        text: broadcastText,
                      });
                      setBroadcast(false);
                      setToast({
                        message: "ההודעה נשמרה כטיוטה. שליחה דורשת חיבור SMS.",
                      });
                    }}
                  >
                    שמירת הודעה כטיוטה
                  </Button>
                  <Button
                    variant="ghost"
                    block
                    onClick={() => setBroadcast(false)}
                  >
                    ביטול
                  </Button>
                </>
              }
            >
              <div style={{ display: "grid", gap: 12 }}>
                <Input
                  label="כותרת"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                />
                <label style={{ display: "grid", gap: 6 }}>
                  <span
                    style={{
                      font: "var(--type-label)",
                      color: "var(--text-muted)",
                    }}
                  >
                    תוכן ההודעה
                  </span>
                  <textarea
                    className="tori-textarea"
                    rows={3}
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                  />
                </label>
              </div>
            </Sheet>
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {signedIn ? (
          <>
            <Button
              variant="outline"
              size="sm"
              icon={role === "customer" ? "briefcase" : "user-round"}
              onClick={switchRole}
            >
              {role === "customer" ? "תצוגת בעל העסק" : "תצוגת לקוח"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon="log-out"
              onClick={() => {
                setSignedIn(false);
                setRole("customer");
                setTab("home");
              }}
            >
              התחלה מחדש
            </Button>
          </>
        ) : (
          <span
            style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}
          >
            הזן/י טלפון → קוד → כניסה לאפליקציה
          </span>
        )}
      </div>
      <p className="demo-notice">
        הדגמה אינטראקטיבית · הנתונים נשמרים בדפדפן הזה בלבד.{" "}
        <a href="/">חזרה לאתר</a>
      </p>
      {store.storageError && (
        <p role="alert" className="demo-notice">
          {store.storageError}
        </p>
      )}
    </div>
  );
}

export default function ToriApplication(props) {
  return (
    <AppProvider>
      <ToriApp {...props} />
    </AppProvider>
  );
}
