import HomeScreen from "../HomeScreen";
import { Frame, I, PHOTO, Status, STAFF } from "./parts";

/* The customer's booking flow, rebuilt from the real app screenshots. */

const SERVICES = [
  { name: "לק גל", min: 60, price: 120, on: true },
  { name: "מניקור", min: 60, price: 35 },
  { name: "בניית ציפורניים", min: 90, price: 180 },
];
const MORNING = ["09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45"];
const NOON = ["12:00", "12:15", "12:30", "12:45", "13:00"];

function Back() {
  return (
    <span className="rx-back">
      <I n="back" s={20} w={2.6} />
    </span>
  );
}

function Head({ title, sub }) {
  return (
    <div className="rx-head">
      <b>{title}</b>
      <small>{sub}</small>
    </div>
  );
}

/** The collapsed "סיכום תור" sheet at the bottom of every booking step. */
function Summary({ date }) {
  return (
    <div className="rx-sum">
      <span className="rx-sum-toggle">
        <I n="up" s={16} w={2.6} />
      </span>
      <b>סיכום תור</b>
      <div className="rx-sum-row">
        <span className="rx-sum-staff">
          <img src={STAFF.photo} alt="" />
          {STAFF.name}
        </span>
        <span className="rx-sum-price">₪120</span>
        <span>לק גל</span>
        {date ? (
          <span className="rx-sum-date">
            <I n="calendar" s={13} />
            {date}
          </span>
        ) : (
          <span className="rx-sum-chip">
            <I n="calendar" s={13} />
            בחר/י תאריך
          </span>
        )}
      </div>
    </div>
  );
}

function Times({ picked }) {
  return (
    <div className="rx-times">
      <span className="rx-part">☀️ בוקר</span>
      <div className="rx-grid">
        {MORNING.map((t) => (
          <span key={t} className={t === picked ? "is-on" : undefined}>
            {t}
          </span>
        ))}
      </div>
      <span className="rx-part is-line">🌤️ צהריים</span>
      <div className="rx-grid">
        {NOON.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}

export function ServiceScreen() {
  return (
    <Frame className="rx-green">
      <Status />
      <Back />
      <div className="rx-service">
        <Head title="בחר/י שירות" sub="ניתן לבחור שירות אחד או יותר" />
        <div className="rx-svc-card">
          {SERVICES.map(({ name, min, price, on }) => (
            <div key={name} className={on ? "rx-svc is-on" : "rx-svc"}>
              <span className="rx-svc-ico">
                <I n={on ? "check" : "clock"} s={17} w={2.2} />
              </span>
              <span className="rx-svc-text">
                <b>{name}</b>
                <small>{`${min} דק'`}</small>
              </span>
              <span className="rx-svc-price">{`₪${price}`}</span>
            </div>
          ))}
        </div>
        <span className="rx-next">
          המשך
          <I n="left" s={15} w={2.6} />
        </span>
      </div>
      <Summary />
    </Frame>
  );
}

export function TimeScreen() {
  return (
    <Frame className="rx-green">
      <Status />
      <Back />
      <Head title="בחר שעה" sub="סמן את השעה הרצויה למטה" />
      <Times />
      <div className="rx-wait">
        <small>לא מצאת שעה מתאימה?</small>
        <span>
          <I n="clock" s={15} />
          הצטרף/פי לרשימת המתנה
        </span>
      </div>
      <Summary date="16.10.26" />
    </Frame>
  );
}

const STEPS = [
  { label: "איש צוות", value: STAFF.name, photo: true },
  { label: "שירות", value: "לק גל", sub: "₪120 · 60 דק'", icon: "check" },
  { label: "תאריך", value: "יום שישי · 16.10.26", icon: "calendar" },
  { label: "שעה", value: "10:45 · בוקר", icon: "clock" },
];

export function ConfirmScreen() {
  return (
    <Frame className="rx-green">
      <Status />
      <Back />
      <Head title="בחר שעה" sub="סמן את השעה הרצויה למטה" />
      <Times picked="10:45" />
      <div className="rx-dim" />
      <div className="rx-sheet rx-confirm">
        <span className="rx-sum-toggle">
          <I n="down" s={16} w={2.6} />
        </span>
        <b className="rx-sheet-title">סיכום תור</b>
        {STEPS.map(({ label, value, sub, icon, photo }) => (
          <div key={label} className="rx-step">
            <span className="rx-step-ico">{photo ? <img src={STAFF.photo} alt="" /> : <I n={icon} s={17} w={2.2} />}</span>
            <span className="rx-step-text">
              <small>{label}</small>
              <b>{value}</b>
              {sub && <small>{sub}</small>}
            </span>
            <span className="rx-step-back">
              <I n="left" s={13} />
              <i>חזור לשלב</i>
            </span>
          </div>
        ))}
        <span className="rx-cta">קבע תור</span>
      </div>
    </Frame>
  );
}

export function BookedScreen() {
  return (
    <Frame className="rx-green">
      <Status />
      <Back />
      <Head title="בחר שעה" sub="סמן את השעה הרצויה למטה" />
      <Times />
      <div className="rx-dim" />
      <div className="rx-sheet rx-booked">
        <span className="rx-sum-toggle">
          <I n="down" s={16} w={2.6} />
        </span>
        <span className="rx-done">
          <i>
            <I n="check" s={34} w={3} />
          </i>
        </span>
        <b className="rx-booked-title">התור נקבע בהצלחה</b>
        <span className="rx-pill">
          <I n="calendar" s={14} />
          יום שישי, 16 באוקטובר 2026
        </span>
        <span className="rx-pill" dir="ltr">
          <I n="clock" s={14} />
          11:30 – 12:30
        </span>
        <div className="rx-booked-box">
          <small>שירות</small>
          <b>לק גל</b>
          <hr />
          <small>על ידי</small>
          <b>{STAFF.name}</b>
        </div>
        <div className="rx-booked-btns">
          <span className="rx-cta">הבנתי</span>
          <span className="rx-cta is-soft">
            <I n="calendar" s={16} />
            הוסף ליומן
          </span>
        </div>
      </div>
    </Frame>
  );
}

const MOSAIC = ["work-1.jpg", "work-2.jpg", "work-3.jpg", "work-4.jpg", "work-5.jpg", "work-6.jpg", "work-2.jpg", "work-4.jpg", "work-1.jpg"];

export function MineScreen() {
  return (
    <Frame className="rx-mine">
      <div className="rx-mosaic">
        {MOSAIC.map((src, i) => (
          <img key={i} src={"/assets/imagery/" + src} alt="" />
        ))}
      </div>
      <Status />
      <span className="rx-mine-logo" dir="ltr">
        <img src="/assets/brand/tori-app-icon.png" alt="" />
        <img src="/assets/brand/tori-wordmark.png" alt="" />
      </span>
      <div className="rx-sheet rx-mine-sheet">
        <span className="rx-handle" />
        <div className="rx-mine-head">
          <b>התורים שלי</b>
          <span>
            <I n="clock" s={18} />
          </span>
        </div>
        <span className="rx-mine-day">מחר</span>
        <div className="rx-appt">
          <div className="rx-appt-top">
            <span>16 באוקטובר</span>
            <span className="is-ok">מאושר</span>
          </div>
          <div className="rx-appt-body">
            <img src={STAFF.photo} alt="" />
            <span>
              <b>לק גל</b>
              <small>{STAFF.name}</small>
            </span>
            <strong>11:30</strong>
          </div>
          <div className="rx-appt-btns">
            <span className="is-swap">
              <I n="swap" s={13} />
              החלף
            </span>
            <span className="is-cancel">
              <I n="x" s={13} w={2.6} />
              ביטול
            </span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/** The customer home screen with the team as real faces, like the app. */
export function CustomerHome() {
  return (
    <HomeScreen
      user="רון"
      staff={["אליאן", "יעל", "מאיה", "מיכל", "נועה", "נופר"]}
      staffPhotos={[1, 2, 3, 4, 5, 6].map((n) => PHOTO + n + ".webp")}
    />
  );
}
