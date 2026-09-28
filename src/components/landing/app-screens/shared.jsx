/** Pieces shared by every tori app screen mockup. */

export const TORI_THEME = {
  a: "#3ff6d2",
  b: "#17e7b5",
  deep: "#0fb18b",
  ink: "#0f2a24",
};

/** CSS variables that paint a screen in one business's colors. */
export function themeStyle(theme, delay = 0) {
  return {
    "--ha-a": theme.a,
    "--ha-b": theme.b,
    "--ha-deep": theme.deep,
    "--ha-ink": theme.ink,
    "--ha-delay": delay + "s",
  };
}

export function Icon({ size = 14, width = 2, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function StatusBar({ dark = false }) {
  return (
    <div className={dark ? "ha-status is-dark" : "ha-status"} dir="ltr">
      <span className="ha-battery">44</span>
      <span>21:10</span>
    </div>
  );
}

const TABS = [
  <>
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </>,
  <>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
  </>,
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </>,
  <>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </>,
  <>
    <rect width="18" height="18" x="3" y="3" rx="5" />
    <path d="m8 8.5 2.5 1.5L8 11.5" />
    <path d="M15.5 10h.01" />
    <path d="M8.5 14.5c2.2 1.4 4.8 1.4 7 0" />
  </>,
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>,
];

/** The app's bottom menu: home, calendar, clock, wallet, tori, settings. */
export function TabBar({ active = 0, travel = false }) {
  return (
    <div className="ha-tabbar" aria-hidden="true">
      <span className="ha-tabs" style={{ "--active": active }}>
        <span className={travel ? "ha-tab-dot is-travel" : "ha-tab-dot"} />
        {TABS.map((paths, i) => (
          <span key={i} className="ha-tab">
            <Icon size={13}>{paths}</Icon>
          </span>
        ))}
      </span>
    </div>
  );
}
