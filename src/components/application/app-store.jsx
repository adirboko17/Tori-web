"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  addAppointment,
  cancelAppointment,
  appointmentSchema,
  bookingDays,
  serviceSchema,
} from "@/lib/booking";

const DEFAULT_SERVICES = [
  { id: "s1", name: "לק ג׳ל", mins: 60, price: 180, icon: "sparkles" },
  { id: "s2", name: "מניקור", mins: 45, price: 120, icon: "palette" },
  { id: "s3", name: "בניית ציפורניים", mins: 90, price: 260, icon: "crown" },
  { id: "s4", name: "פדיקור", mins: 50, price: 150, icon: "heart" },
];
export const DEFAULT_CLIENTS = [
  {
    name: "דנה לוי",
    phone: "",
    visits: 14,
    last: "לפני 3 שבועות",
    tag: "קבועה",
  },
  { name: "יוסי בר־און", phone: "", visits: 9, last: "לפני חודש", tag: "" },
  { name: "מיכל אזולאי", phone: "", visits: 22, last: "לפני שבוע", tag: "VIP" },
  { name: "אלכס פרידמן", phone: "", visits: 3, last: "היום", tag: "" },
  { name: "רון מזרחי", phone: "", visits: 6, last: "היום", tag: "" },
];
const initial = {
  appointments: [],
  clients: DEFAULT_CLIENTS,
  profile: { name: "דנה לוי", phone: "0528419930" },
  settings: {
    dayReminder: true,
    hourReminder: true,
    offers: false,
    waiting: false,
    manual: false,
    hours: ["09:00–20:00", "09:00–14:00", "סגור"],
  },
  business: {
    name: "ליאת ציפורניים",
    tagline: "לק ג׳ל · מניקור · באר שבע",
    color: "#0CFFBE",
    services: DEFAULT_SERVICES,
  },
  broadcasts: [],
};
const Store = createContext(null);

export function AppProvider({ children }) {
  const [data, setData] = useState(initial);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tori-app-v1");
      let loaded = raw ? JSON.parse(raw) : null;
      if (loaded) {
        const parsed = appointmentSchema.array().safeParse(loaded.appointments);
        loaded = {
          ...initial,
          ...loaded,
          appointments: parsed.success ? parsed.data : [],
          settings: { ...initial.settings, ...loaded.settings },
        };
      } else {
        const days = bookingDays();
        loaded = {
          ...initial,
          appointments: [
            {
              id: "seed-1",
              date: days[0].date,
              time: "11:30",
              name: "דנה לוי",
              service: "בניית ציפורניים",
              mins: 90,
              price: 260,
              status: "confirmed",
              note: "",
            },
            {
              id: "seed-2",
              date: days[2].date,
              time: "09:45",
              name: "דנה לוי",
              service: "לק ג׳ל",
              mins: 60,
              price: 180,
              status: "pending",
              note: "",
            },
          ],
        };
      }
      const business = JSON.parse(
        localStorage.getItem("tori-business") || "null",
      );
      if (business) {
        const result = serviceSchema.array().safeParse(business.services);
        loaded.business = {
          ...loaded.business,
          ...business,
          services:
            result.success && result.data.length
              ? result.data
              : DEFAULT_SERVICES,
        };
      }
      setData(loaded);
    } catch {
      setStorageError("לא ניתן לקרוא את השמירה המקומית. מוצגים נתוני ההדגמה.");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("tori-app-v1", JSON.stringify(data));
    } catch {
      setStorageError(
        "השינויים מוצגים, אך לא נשמרו. בדקו שיש מקום פנוי בדפדפן.",
      );
    }
  }, [data, ready]);

  const store = {
    ...data,
    ready,
    storageError,
    book(candidate, replacingId) {
      const base = replacingId ? cancelAppointment(data.appointments, replacingId) : data.appointments;
      const next = addAppointment(base, candidate);
      setData((current) => ({ ...current, appointments: next }));
    },
    cancel(id) {
      setData((current) => ({
        ...current,
        appointments: cancelAppointment(current.appointments, id),
      }));
    },
    updateProfile(patch) {
      setData((current) => ({
        ...current,
        profile: { ...current.profile, ...patch },
      }));
    },
    updateSettings(patch) {
      setData((current) => ({
        ...current,
        settings: { ...current.settings, ...patch },
      }));
    },
    updateBusiness(patch) {
      const next = { ...data.business, ...patch };
      try {
        localStorage.setItem("tori-business", JSON.stringify(next));
      } catch {
        setStorageError("לא ניתן לשמור את המיתוג בדפדפן.");
      }
      setData((current) => ({ ...current, business: next }));
    },
    addClient(client) {
      setData((current) => ({
        ...current,
        clients: [...current.clients, client],
      }));
    },
    saveBroadcast(message) {
      setData((current) => ({
        ...current,
        broadcasts: [
          ...current.broadcasts,
          { ...message, createdAt: new Date().toISOString() },
        ],
      }));
    },
  };
  return <Store.Provider value={store}>{children}</Store.Provider>;
}
export function useAppStore() {
  return useContext(Store);
}
