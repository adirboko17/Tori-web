import { Icon, StatusBar, TORI_THEME, themeStyle } from "./shared";

/** The real tori app date picker (September 2026), animated. */

const WEEK = ["יום א׳", "יום ב׳", "יום ג׳", "יום ד׳", "יום ה׳", "יום ו׳", "שבת"];
const LEAD = 2; /* September 2026 starts on a Tuesday */
const TODAY = 17;
const FULL = [17, 30];
const CLOSED = [19, 26];
const PICKS = ["יום ה׳ · 17.9", "יום ג׳ · 22.9", "יום ה׳ · 24.9", "יום ג׳ · 29.9"];

function dotOf(day) {
  if (day < TODAY) return null;
  if (FULL.includes(day)) return "is-full";
  if (CLOSED.includes(day)) return "is-closed";
  return "is-open";
}

function Month() {
  const cells = [...Array(LEAD).fill(null), ...Array.from({ length: 30 }, (_, i) => i + 1)];
  return (
    <div className="hc-grid">
      <span className="hc-pick">
        <i />
      </span>
      {cells.map((day, n) => {
        if (!day) return <span key={"x" + n} />;
        const dot = dotOf(day);
        return (
          <span
            key={day}
            className={dot ? "hc-day" : "hc-day is-past"}
            style={{ "--n": n }}
          >
            {day}
            {dot && <i className={"hc-dot " + dot} />}
          </span>
        );
      })}
    </div>
  );
}

export default function CalendarScreen({
  theme = TORI_THEME,
  staff = "אליאן כהן",
  service = "מניקור",
  price = "110",
  delay = 0,
}) {
  return (
    <div className="ha-screen hc" style={themeStyle(theme, delay)}>
      <i className="hp-blob" />
      <i className="hp-blob hp-blob-2" />
      <StatusBar dark />
      <span className="hc-back">
        <Icon size={12} width={2.6}>
          <path d="m9 18 6-6-6-6" />
        </Icon>
      </span>
      <div className="hc-title">
        <b>בחירת תאריך</b>
        <small>הנקודות מראות זמינות - לחצו על יום כדי להמשיך</small>
      </div>
      <div className="hc-card">
        <div className="hc-month">
          <Icon size={12} width={2.6}>
            <path d="m9 18 6-6-6-6" />
          </Icon>
          <span>
            <b>ספטמבר</b>
            <small>2026</small>
          </span>
          <Icon size={12} width={2.6}>
            <path d="m15 18-6-6 6-6" />
          </Icon>
        </div>
        <div className="hc-week">
          {WEEK.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <Month />
      </div>
      <div className="hc-legend">
        <span>
          <i className="hc-dot is-open" />
          יש תורים
        </span>
        <span>
          <i className="hc-dot is-full" />
          מלא
        </span>
        <span>
          <i className="hc-dot is-closed" />
          סגור
        </span>
      </div>
      <div className="hc-sheet">
        <span className="hc-toggle">
          <Icon size={11} width={2.6}>
            <path d="m18 15-6-6-6 6" />
          </Icon>
        </span>
        <b className="hc-sum-title">סיכום תור</b>
        <div className="hc-sum">
          <span className="hc-staff">
            <span className="hc-staff-img">{staff[0]}</span>
            {staff}
          </span>
          <span className="hc-price">{"₪" + price}</span>
          <span>{service}</span>
          <span className="hc-chip">
            <Icon size={9}>
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </Icon>
            <span className="hc-chip-labels">
              {PICKS.map((p, k) => (
                <span key={p} style={{ "--k": k }}>
                  {p}
                </span>
              ))}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
