import { Icon, StatusBar, TabBar, TORI_THEME, themeStyle } from "./shared";

/** The real tori app profile screen, animated. */

const LANGS = ["עברית", "English", "Русский", "العربية"];

const ROWS = [
  {
    title: "עריכת פרופיל",
    sub: "עדכון פרטים אישיים",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </>
    ),
  },
  {
    title: "שפה",
    langs: true,
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </>
    ),
  },
  {
    title: "תנאי שימוש",
    sub: "צפייה בתנאי השימוש של האפליקציה",
    icon: (
      <>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8M16 13H8M16 17H8" />
      </>
    ),
  },
  {
    title: "מחיקת חשבון",
    sub: "מחיקת החשבון לצמיתות",
    danger: true,
    icon: (
      <>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
  },
  {
    title: "התנתקות",
    sub: "ניתן להתחבר שוב בכל זמן",
    danger: true,
    last: true,
    icon: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
  },
];

function Row({ row, index }) {
  const cls = "hp-row" + (row.danger ? " is-danger" : "");
  return (
    <div className={cls} style={{ "--r": index }}>
      <span className="hp-row-icon">
        <Icon size={15} width={1.8}>
          {row.icon}
        </Icon>
      </span>
      <span className="hp-row-text">
        <b>{row.title}</b>
        {row.langs ? (
          <span className="hp-langs">
            {LANGS.map((l, i) => (
              <small key={l} style={{ "--l": i }}>
                {l}
              </small>
            ))}
          </span>
        ) : (
          <small>{row.sub}</small>
        )}
      </span>
      {!row.last && (
        <span className="hp-chev">
          <Icon size={11} width={2.4}>
            <path d="m15 18-6-6 6-6" />
          </Icon>
        </span>
      )}
    </div>
  );
}

export default function ProfileScreen({
  theme = TORI_THEME,
  user = "איתי בן יאיר",
  phone = "0502307500",
  delay = 0,
}) {
  return (
    <div className="ha-screen hp" style={themeStyle(theme, delay)}>
      <div className="hp-head">
        <i className="hp-blob" />
        <i className="hp-blob hp-blob-2" />
        <StatusBar dark />
        <div className="hp-user">
          <span className="hp-avatar">
            <span className="hp-avatar-ring" />
            <span className="hp-avatar-img">
              <Icon size={20} width={1.8}>
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </Icon>
            </span>
            <span className="hp-cam">
              <Icon size={8} width={2.4}>
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
                <circle cx="12" cy="13" r="3" />
              </Icon>
            </span>
          </span>
          <span className="hp-name">
            <b>{user}</b>
            <small dir="ltr">{phone}</small>
          </span>
        </div>
      </div>
      <div className="hp-list">
        <span className="hp-hl" />
        {ROWS.map((row, i) => (
          <Row key={row.title} row={row} index={i} />
        ))}
      </div>
      <TabBar active={5} />
    </div>
  );
}
