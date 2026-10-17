import { BizTabs, Frame, I, OWNER, PHOTO, Status } from "./parts";

/* The business owner's side of the app, rebuilt from the real screenshots
   in the business's own gold theme. The owner's name and phone are made up. */

const TILES = [
  { label: "לקוחות", icon: "users" },
  { label: "הודעת שידור", icon: "chat" },
  { label: "התראות", icon: "bell" },
];

function Card({ icon, title, action, children }) {
  return (
    <div className="bx-card">
      <div className="bx-card-head">
        <span className="bx-ico is-sm">
          <I n={icon} s={14} />
        </span>
        <b>{title}</b>
        {action}
      </div>
      <div className="bx-card-body">{children}</div>
    </div>
  );
}

function HomeContent() {
  return (
    <>
      <div className="bx-photo" />
      <Status time="18:35" />
      <div className="bx-home">
        <span className="rx-handle" />
        <div className="bx-date">
          <span>
            <small>יום חמישי</small>
            <b>15 באוק׳</b>
          </span>
          <span className="bx-date-count">
            <b>3</b>
            <small>תורים</small>
          </span>
        </div>
        <Card
          icon="clock"
          title="התור הבא"
          action={
            <span className="bx-round">
              <I n="refresh" s={14} />
            </span>
          }
        >
          <span className="bx-next">
            <img src={PHOTO + "2.webp"} alt="" />
            <span>
              <b>מיכל לוי</b>
              <small>לק ג׳ל · 16:00</small>
            </span>
          </span>
        </Card>
        <div className="bx-tiles">
          {TILES.map(({ label, icon }) => (
            <span key={label} className="bx-tile">
              <span className="bx-ico">
                <I n={icon} s={22} w={1.8} />
              </span>
              {label}
            </span>
          ))}
        </div>
        <Card icon="hourglass" title="רשימת המתנה" action={<I n="left" s={14} />}>
          <span className="bx-empty">
            <I n="hourglass" s={14} />2 ממתינים ליום שישי
          </span>
        </Card>
        <div className="bx-card bx-sms">
          <div className="bx-sms-top">
            <span className="bx-ico">
              <I n="message" s={20} w={1.8} />
            </span>
            <span className="bx-sms-text">
              <b>יתרת הודעות SMS</b>
              <small>סה״כ הודעות זמינות</small>
            </span>
            <span className="bx-sms-count">
              <b>993</b>
              <small>הודעות</small>
            </span>
          </div>
          <span className="bx-gold-btn">
            <I n="plus" s={15} w={2.6} />
            הוספת הודעות
          </span>
          <span className="bx-more">
            הצג פרטים
            <I n="down" s={12} />
          </span>
        </div>
      </div>
      <BizTabs active="home" />
    </>
  );
}

export function BizHomeScreen() {
  return (
    <Frame className="bx bx-home-screen">
      <HomeContent />
    </Frame>
  );
}

export function BroadcastScreen() {
  return (
    <Frame className="bx bx-home-screen">
      <HomeContent />
      <div className="rx-dim is-grey" />
      <div className="rx-sheet bx-broadcast">
        <span className="rx-handle" />
        <span className="bx-ico is-lg">
          <I n="megaphone" s={22} w={1.8} />
        </span>
        <b>הודעות שידור</b>
        <small>כאן יוצרים הודעה ללקוחות. אפשר לשלוח עכשיו או לתזמן.</small>
        <span className="bx-gold-btn is-wide">
          <I n="plus" s={16} w={2.4} />
          הודעת שידור חדשה
        </span>
        <span className="bx-link">הודעות מתוזמנות</span>
        <span className="bx-cancel">ביטול</span>
      </div>
    </Frame>
  );
}

const WEEK = [
  ["א", 11],
  ["ב", 12],
  ["ג", 13],
  ["ד", 14],
  ["ה", 15],
  ["ו", 16],
  ["ש", 17],
];
const HOURS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"];

export function DayScreen() {
  return (
    <Frame className="bx bx-day">
      <Status time="18:36" />
      <div className="bx-day-top">
        <div className="bx-day-bar">
          <b>
            <I n="left" s={16} w={2.6} />
            אוקטובר 2026
          </b>
          <span>
            <I n="calendar" s={20} w={1.8} />
            <I n="search" s={20} w={1.8} />
            <I n="plus" s={22} w={1.8} />
          </span>
        </div>
        <div className="bx-week">
          {WEEK.map(([d, n]) => (
            <span key={d} className={n === 15 ? "is-on" : undefined}>
              <small>{d}</small>
              <b>{n}</b>
            </span>
          ))}
        </div>
      </div>
      <div className="bx-hours">
        {HOURS.map((h) => (
          <span key={h}>{h}</span>
        ))}
        <span className="bx-event" style={{ top: 166 }}>
          <b>מיכל לוי</b>
          <small>
            לק ג׳ל · <bdi dir="ltr">10:00–11:00</bdi>
          </small>
        </span>
        <span className="bx-event is-soft" style={{ top: 400 }}>
          <b>דנה כהן</b>
          <small>
            מניקור · <bdi dir="ltr">11:30–12:00</bdi>
          </small>
        </span>
      </div>
      <BizTabs active="calendar" />
    </Frame>
  );
}

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"];

export function HoursScreen() {
  return (
    <Frame className="bx bx-grey">
      <Status time="18:36" />
      <div className="bx-tabs-row">
        <b className="is-on">שעות עבודה</b>
        <span>הפסקות קבועות</span>
      </div>
      <div className="bx-list bx-week-hours">
        <div className="bx-row is-head">
          <span>
            <b>פתוח 6 ימים</b>
            <small dir="ltr">09:00 – 17:00</small>
          </span>
        </div>
        {DAYS.map((d) => (
          <div key={d} className="bx-row">
            <span>
              <b>{d}</b>
              <strong dir="ltr">17:00 – 09:00</strong>
            </span>
            <i className="bx-toggle is-on" />
          </div>
        ))}
        <div className="bx-row is-off">
          <span>
            <b>שבת</b>
            <small>סגור</small>
          </span>
          <i className="bx-toggle" />
        </div>
      </div>
      <BizTabs active="clock" />
    </Frame>
  );
}

const PROFILE_TABS = ["כללי", "תורים", "שירותים", "סניפים", "עובדים", "פרטי העסק"];

function Profile({ tab }) {
  return (
    <>
      <div className="bx-profile">
        <Status time="18:36" />
        <img src={OWNER.photo} alt="" />
        <span className="bx-profile-text">
          <small>{OWNER.latin}</small>
          <b>{OWNER.name}</b>
          <small dir="ltr">{OWNER.phone}</small>
        </span>
        <span className="bx-round is-glass">
          <I n="pencil" s={15} />
        </span>
      </div>
      <div className="bx-ptabs">
        {PROFILE_TABS.map((t) => (
          <span key={t} className={t === tab ? "is-on" : undefined}>
            {t}
          </span>
        ))}
      </div>
    </>
  );
}

const SERVICES = [
  { name: "הרמת ריסים", min: 60, price: 180 },
  { name: "לק ג׳ל", min: 120, price: 200 },
  { name: "מניקור", min: 45, price: 80 },
];

export function ServicesScreen() {
  return (
    <Frame className="bx bx-grey">
      <Profile tab="שירותים" />
      <div className="bx-svc-head">
        <span>
          <b>עריכת שירותים</b>
          <small>עדכון מחירים וזמני ביצוע</small>
        </span>
        <span className="bx-round is-gold">
          <I n="plus" s={18} w={2.4} />
        </span>
      </div>
      {SERVICES.map(({ name, min, price }) => (
        <div key={name} className="bx-svc">
          <span className="bx-trash">
            <I n="trash" s={15} />
          </span>
          <span className="bx-svc-text">
            <b>{name}</b>
            <span>
              <i>
                <I n="clock" s={11} />
                {`${min} דק׳`}
              </i>
              <i>{`₪${price}`}</i>
            </span>
          </span>
          <I n="down" s={16} />
        </div>
      ))}
      <BizTabs active="settings" />
    </Frame>
  );
}

const SETTINGS = [
  { icon: "user", title: "אישור לקוחות חדשים", sub: "כשמופעל - נרשמים חדשים ממתינים לאישור", end: "toggle" },
  { icon: "megaphone", title: "הודעה קבועה בדף הבית", sub: "כבוי", end: "chevron" },
  { icon: "gauge", title: "מד זמינות תורים", sub: "רשומים / מאושרים", end: "eye" },
  { icon: "zap", title: "תורים זריזים", sub: "כבוי", end: "eye" },
  { icon: "clipboard", title: "הצהרת בריאות", sub: "טפסים ושיוך לשירותים", end: "pill" },
  { icon: "globe", title: "שפה", sub: "עברית", end: "chevron" },
  { icon: "trash", title: "מחיקת חשבון", sub: "מחיקת החשבון לצמיתות", end: "chevron" },
];

function SettingEnd({ end }) {
  if (end === "toggle") return <i className="bx-toggle is-on" />;
  if (end === "pill") return <em className="bx-pill">זמין באפליקציה בלבד</em>;
  return (
    <span className="bx-end">
      {end === "eye" && (
        <span className="bx-round">
          <I n="eye" s={13} />
        </span>
      )}
      <I n="left" s={15} />
    </span>
  );
}

export function SettingsScreen() {
  return (
    <Frame className="bx bx-grey">
      <Profile tab="כללי" />
      <div className="bx-list bx-settings">
        {SETTINGS.map(({ icon, title, sub, end }) => (
          <div key={title} className="bx-row">
            <span className="bx-ico is-grey">
              <I n={icon} s={16} w={1.8} />
            </span>
            <span>
              <b>{title}</b>
              <small>{sub}</small>
            </span>
            <SettingEnd end={end} />
          </div>
        ))}
        <div className="bx-row is-danger">
          <span className="bx-ico is-grey">
            <I n="ban" s={16} w={1.8} />
          </span>
          <span>
            <b>ביטול האפליקציה</b>
          </span>
        </div>
      </div>
      <BizTabs active="settings" />
    </Frame>
  );
}
