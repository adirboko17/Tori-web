import { useState } from "react";
import AppFlow from "../app-screens/AppFlow";
import {
  BookedScreen,
  ConfirmScreen,
  CustomerHome,
  MineScreen,
  ServiceScreen,
  TimeScreen,
} from "../app-screens/real/Customer";
import {
  BizHomeScreen,
  BroadcastScreen,
  DayScreen,
  HoursScreen,
  ServicesScreen,
  SettingsScreen,
} from "../app-screens/real/Business";

/* One app, two sides: a switch flips the phone between what the customer
   sees and what the business sees, and the four features beside it follow. */

const SIDES = {
  customer: {
    label: "ללקוח",
    screens: [CustomerHome, ServiceScreen, TimeScreen, ConfirmScreen, BookedScreen, MineScreen],
    features: [
      {
        title: "קביעת תור 24/7",
        text: "בלי טלפונים, בלי הודעות שמחכות לתשובה.",
        icon: (
          <>
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
            <path d="m9 16 2 2 4-4" />
          </>
        ),
      },
      {
        title: "תזכורות אוטומטיות",
        text: "יום לפני ושעתיים לפני - פחות הברזות.",
        icon: (
          <>
            <path d="M10.268 21a2 2 0 0 0 3.464 0" />
            <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
          </>
        ),
      },
      {
        title: "גלריית עבודות",
        text: "הלקוח רואה מה את/ה עושה, ומזמין יותר.",
        icon: (
          <>
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </>
        ),
      },
      {
        title: "היסטוריית תורים",
        text: "לקוח חוזר יודע בדיוק מה עשה ומתי.",
        icon: (
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </>
        ),
      },
    ],
  },
  business: {
    label: "לעסק",
    screens: [BizHomeScreen, BroadcastScreen, DayScreen, HoursScreen, ServicesScreen, SettingsScreen],
    features: [
      {
        title: "ניהול לקוחות",
        text: "היסטוריה מלאה, מי קבוע ומי לא חזר.",
        icon: (
          <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </>
        ),
      },
      {
        title: "הודעת תפוצה",
        text: "מבצע לכל הלקוחות בלחיצה אחת.",
        icon: (
          <>
            <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
            <path d="m21.854 2.147-10.94 10.939" />
          </>
        ),
      },
      {
        title: "סטטיסטיקות",
        text: "מה נמכר, מי הלקוחות הכי פעילים.",
        icon: (
          <>
            <path d="M3 3v16a2 2 0 0 0 2 2h16" />
            <path d="M18 17V9M13 17V5M8 17v-3" />
          </>
        ),
      },
      {
        title: "ניהול עובדים",
        text: "יומן ושעות נפרדים לכל עובד, בלי הגבלה.",
        icon: (
          <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6M22 11h-6" />
          </>
        ),
      },
    ],
  },
};

function Feature({ title, text, icon }) {
  return (
    <li className="tori-sides-feat">
      <span className="tori-sides-ico" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </span>
      <b>{title}</b>
      <span>{text}</span>
    </li>
  );
}

export default function SidesSwitch() {
  const [side, setSide] = useState("customer");
  const { screens, features } = SIDES[side];
  return (
    <div className="tori-sides" data-side={side}>
      <div className="tori-sides-switch" role="tablist" aria-label="איזה צד באפליקציה">
        <span className="tori-sides-pill" aria-hidden="true" />
        {Object.entries(SIDES).map(([key, { label }]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={side === key}
            aria-controls="tori-sides-panel"
            onClick={() => setSide(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="tori-sides-stage" id="tori-sides-panel" role="tabpanel">
        <div className="tori-sides-phone" aria-hidden="true">
          <div className="tori-device tori-brand-device" style={{ "--tilt": "0deg" }}>
            <AppFlow key={side} screens={screens} />
          </div>
        </div>
        <ul className="tori-sides-feats" key={"feats-" + side}>
          {features.map((f) => (
            <Feature key={f.title} {...f} />
          ))}
        </ul>
      </div>
    </div>
  );
}
